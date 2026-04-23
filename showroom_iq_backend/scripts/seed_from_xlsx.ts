import { PrismaClient, Role } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';

const prisma = new PrismaClient();

function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let normalized = phone.trim().replace(/[\s-]/g, '');
  
  if (normalized.startsWith('+212')) return normalized;
  
  if (normalized.startsWith('0') && normalized.length === 10) {
    return '+212' + normalized.substring(1);
  }
  
  if (normalized.length === 9 && (normalized.startsWith('6') || normalized.startsWith('7'))) {
    return '+212' + normalized;
  }

  if (normalized.startsWith('212') && normalized.length === 12) {
    return '+' + normalized;
  }

  if (normalized.startsWith('00212')) {
    return '+' + normalized.substring(2);
  }
  
  return normalized;
}

async function main() {
  const filePath = path.join(__dirname, '../../Commerciaux_updated.xlsx');
  const workbook = xlsx.readFile(filePath);
  
  // Clean up existing data
  console.log('Cleaning up existing staff and showrooms...');
  await prisma.user.deleteMany({ where: { role: { in: [Role.ADMIN, Role.COMMERCIAL] } } });
  await prisma.showroom.deleteMany({});
  
  // 1. Process Owners
  console.log('Processing Owners...');
  const ownerSheet = workbook.Sheets['Owners'];
  const owners: any[] = xlsx.utils.sheet_to_json(ownerSheet);
  const passwordHash = await bcrypt.hash('p12345@@', 10);

  for (const owner of owners) {
    const fullName = (owner['Nom & Prénom'] || `${owner['Prénom']} ${owner['Nom']}`).trim();
    const email = (owner['Email'] || `${fullName.toLowerCase().replace(/\s+/g, '.')}@showroomiq.com`).trim();
    const rawPhone = owner['Téléphone']?.toString().trim();
    const phone = normalizePhone(rawPhone);

    await prisma.user.upsert({
      where: { email },
      update: { 
        fullName, 
        phone, 
        role: Role.OWNER,
        passwordHash, // Ensure password is updated
      },
      create: { fullName, email, phone, passwordHash, role: Role.OWNER },
    });
    console.log(`Upserted Owner: ${fullName}`);
  }

  // 2. Process Showrooms and Staff
  console.log('Processing Showrooms and Staff...');
  const dataSheet = workbook.Sheets['Feuil1'];
  const rawStaff: any[] = xlsx.utils.sheet_to_json(dataSheet);

  // First pass: Fill down Emplacement and collect data
  let currentEmplacement = '';
  const staff = rawStaff.map(s => {
    const person = { ...s };
    if (person['Emplacement']) {
      currentEmplacement = person['Emplacement'].trim();
    }
    person._emplacementRaw = person['Emplacement'];
    person.Emplacement = currentEmplacement || person['Emplacement'];
    return person;
  });

  // Refinement: If an Admin has no explicit Emplacement, but is a manager for someone who has, use that.
  for (const person of staff) {
    if (!person._emplacementRaw && person['Rôle'] === 'ADMIN') {
      // Find someone who has this person as Chef d'équipe and has an Emplacement
      const subordinate = staff.find(s => s["Chef d'équipe "]?.trim() === person['Nom & Prénom']?.trim() && s._emplacementRaw);
      if (subordinate) {
        console.log(`Inferring showroom for ${person['Nom & Prénom']}: ${subordinate._emplacementRaw}`);
        person.Emplacement = subordinate._emplacementRaw.trim();
      }
    }
  }

  // Extract unique showrooms
  const showroomNames = Array.from(new Set(staff.map(s => s.Emplacement).filter(Boolean)));
  const showroomMap = new Map<string, string>();

  for (const name of showroomNames as string[]) {
    const showroom = await prisma.showroom.create({
      data: {
        name,
        city: name.split(' ').pop(),
      },
    });
    showroomMap.set(name, showroom.id);
    console.log(`Created Showroom: ${name}`);
  }

  // Process Users
  for (const person of staff) {
    const fullName = person['Nom & Prénom']?.trim();
    if (!fullName) continue;

    const email = (person['Email'] || `${fullName.toLowerCase().replace(/\s+/g, '.')}@showroomiq.com`).trim();
    const rawPhone = person['Téléphone']?.toString().trim();
    const phone = normalizePhone(rawPhone);
    const roleStr = person['Rôle']?.trim();
    const role = roleStr === 'ADMIN' ? Role.ADMIN : Role.COMMERCIAL;
    const showroomName = person.Emplacement?.trim();
    const showroomId = showroomName ? showroomMap.get(showroomName) : null;

    await prisma.user.upsert({
      where: { email },
      update: {
        fullName,
        phone,
        role,
        showroomId, // This will update to the latest showroom seen in the Excel
      },
      create: {
        fullName,
        email,
        phone,
        passwordHash,
        role,
        showroomId,
      },
    });
    console.log(`Upserted ${role}: ${fullName} (${showroomName})`);
  }

  // 3. Assign Managers to Showrooms (Admins)
  console.log('Assigning Managers to Showrooms...');
  const usersInDb = await prisma.user.findMany({ where: { role: Role.ADMIN } });
  
  for (const person of staff) {
    if (person['Rôle'] === 'ADMIN') {
      const showroomName = person.Emplacement?.trim();
      const showroomId = showroomMap.get(showroomName);
      if (showroomId) {
        const email = (person['Email'] || `${person['Nom & Prénom'].toLowerCase().replace(/\s+/g, '.')}@showroomiq.com`).trim();
        const user = usersInDb.find(u => u.email === email);
        if (user) {
          await prisma.showroom.update({
            where: { id: showroomId },
            data: { managerId: user.id }
          });
          console.log(`Assigned ${user.fullName} as manager of ${showroomName}`);
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
