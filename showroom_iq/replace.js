const fs = require('fs');
let content = fs.readFileSync('/Users/mac/Desktop/Sketch APPS/Sketch performance/showroom_iq/src/app/owner/showrooms/page.tsx', 'utf8');

// Replacements in texts
content = content.replace(/Nos Showrooms/g, 'Nos Magasins');
content = content.replace(/AJOUTER SHOWROOM/g, 'AJOUTER UN MAGASIN');
content = content.replace(/Total Showrooms/g, 'Total Magasins');
content = content.replace(/Chargement des showrooms\.\.\./g, 'Chargement des magasins...');
content = content.replace(/Aucun showroom trouvé/g, 'Aucun magasin trouvé');
content = content.replace(/ajouter un nouveau showroom/g, 'ajouter un nouveau magasin');
content = content.replace(/Nom du Showroom/g, 'Nom du Magasin');
content = content.replace(/Ex: Showroom Agadir/g, 'Ex: Magasin Agadir');
content = content.replace(/Créer le Showroom/g, 'Sauvegarder');
content = content.replace(/Supprimer le showroom/g, 'Supprimer le magasin');
content = content.replace(/définitivement ce showroom \?/g, 'définitivement ce magasin ?');
content = content.replace(/Showroom supprimé/g, 'Magasin supprimé');

// Replace handleCreate with handleSave logic
const handleCreatePattern = /const handleCreate = async \(\) => \{[\s\S]*?catch \(error\) \{\s*toast\.error\('Erreur réseau'\);\s*\}\s*\};/;
const handleSaveStr = `const handleSave = async () => {
    if (!formData.name) {
      toast.error('Le nom du magasin est requis');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const payload = {
        ...formData,
        commercialIds: selectedCommercials.map(c => c.id)
      };

      const url = drawerMode === 'edit' && editId 
        ? \`http://localhost:3001/api/showrooms/\${editId}\` 
        : 'http://localhost:3001/api/showrooms';
      
      const method = drawerMode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\` 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(\`Magasin \${drawerMode === 'edit' ? 'mis à jour' : 'créé'} avec succès\`);
        setDrawerMode(null);
        setEditId(null);
        fetchShowrooms();
        // Reset form
        setFormData({
          name: '', city: '', location: '', managerId: '',
          commercialIds: [], targets: { conservative: '', likely: '', exceed: '' }
        });
        setSelectedCommercials([]);
        setManagerQuery('');
        setSelectedManager(null);
      } else {
        toast.error(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
  };`;

content = content.replace(handleCreatePattern, handleSaveStr);

// Replace button onClick={handleCreate} -> onClick={handleSave}
content = content.replace(/onClick=\{handleCreate\}/g, 'onClick={handleSave}');

// Replace drawer header text dynamically
content = content.replace(
  /Ajouter Showroom/g,
  "{drawerMode === 'edit' ? 'Modifier Magasin' : 'Ajouter Magasin'}"
);
content = content.replace(
  /Configuration Showroom/g,
  "Configuration Magasin"
);

// Replace interface Showroom
const interfacePattern = /interface Showroom \{[\s\S]*?status: string;\n\}/;
const newInterface = `interface Showroom {
  id: string;
  name: string;
  location: string;
  city: string;
  manager: {
    id?: string;
    name: string;
    avatar: string;
  } | null;
  commercials: {
    id: string;
    fullName: string;
  }[];
  targets: {
    conservative: number | null;
    likely: number | null;
    exceed: number | null;
  } | null;
  performance: number;
  score: number;
  status: string;
}`;
content = content.replace(interfacePattern, newInterface);

const statesPattern = /const \[drawerMode, setDrawerMode\] = useState\<'add' \| 'edit' \| null\>\(null\);/;
const newStates = `const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null);\n  const [editId, setEditId] = useState<string | null>(null);`;
content = content.replace(statesPattern, newStates);

fs.writeFileSync('/Users/mac/Desktop/Sketch APPS/Sketch performance/showroom_iq/src/app/owner/showrooms/page.tsx', content);
console.log('Replacements done in file.');
