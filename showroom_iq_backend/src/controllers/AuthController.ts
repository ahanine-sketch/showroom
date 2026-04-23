import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_12345';

export class AuthController {
  /**
   * Register a new user (Usually done by Owner or Admin).
   */
  static async register(req: Request, res: Response) {
    try {
      const { fullName, email, password, role, showroomId } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          passwordHash: hashedPassword,
          role: role || 'COMMERCIAL',
          showroomId: showroomId || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Login user and return JWT.
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, mobile, password } = req.body;

      let user;
      if (email) {
        user = await prisma.user.findUnique({ where: { email } });
      } else if (mobile) {
        // Try searching by phone exactly as entered or with +212 if it starts with 0
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: mobile },
              { phone: mobile.startsWith('0') ? '+212' + mobile.substring(1) : mobile },
              { phone: mobile.startsWith('+212') ? '0' + mobile.substring(4) : mobile }
            ]
          }
        });
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
      }

      if (user.status === 'BLOCKED') {
        return res.status(403).json({ success: false, message: 'Votre compte est bloqué. Veuillez contacter l\'administrateur.' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, showroomId: user.showroomId },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
