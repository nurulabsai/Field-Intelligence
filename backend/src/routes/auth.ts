import express from 'express';
import { generateToken } from '../middleware/auth.js';
import { supabase } from '../lib/supabase.js';
import { isSupabaseConfigured } from '../config/env.js';
import { z } from 'zod';

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = data.user;
    const token = generateToken({
      id: user.id,
      email: user.email ?? email,
      role: (user.user_metadata?.role as string) ?? 'auditor',
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email ?? email,
        name: (user.user_metadata?.full_name as string) ?? '',
        role: (user.user_metadata?.role as string) ?? 'auditor',
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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    if (!isSupabaseConfigured() || !supabase) {
      return res.status(503).json({ error: 'Authentication service not configured' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: 'auditor' },
      },
    });

    if (error) {
      // Supabase returns specific error codes
      if (error.message.includes('already registered')) {
        return res.status(400).json({ error: 'User already exists' });
      }
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Registration failed' });
    }

    const token = generateToken({
      id: data.user.id,
      email,
      role: 'auditor',
    });

    res.status(201).json({
      token,
      user: { id: data.user.id, email, name, role: 'auditor' },
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
