import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';
import { z } from 'zod';

const router = express.Router();

// Simple in-memory user store (Replace with database in production)
const users = new Map([
  ['demo@nuruos.com', {
    id: '1',
    email: 'demo@nuruos.com',
    password: '$2a$10$XYZ...', // hashed password
    name: 'Demo Auditor',
    role: 'auditor'
  }]
]);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = users.get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(100),
});

// POST /api/auth/register (optional - for creating users)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = Date.now().toString();

    users.set(email, {
      id: userId,
      email,
      password: hashedPassword,
      name,
      role: 'auditor',
    });

    const token = generateToken({
      id: userId,
      email,
      role: 'auditor',
    });

    res.status(201).json({
      token,
      user: { id: userId, email, name, role: 'auditor' },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('[Auth] Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
