import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

import auth from '../middleware/auth.js'

const router = express.Router();

// AUTH

function createToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name
  };
}

router.post('/register', async (req, res, next) => {
  const { email, name, password } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      },
    });

    res.status(201).json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ error: 'User already exists' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// USER PROFILE

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user) return res.status(401).json({ error: 'No user found' });

    res.status(200).json({
      user: serializeUser(user)
    })
  } catch (error) {
    next(error)
  }
})

router.patch('/me', auth, async (req, res, next) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body

    const data = {}

    if (name) data.name = name
    if (email) data.email = email
    if (newPassword) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      })
      // Incorrect password
      if (!await bcrypt.compare(currentPassword, user.passwordHash)) {
        return res.status(400).json({ error: 'Incorrect password' });
      }

      data.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (!Object.keys(data).length === 0) return res.status(401).json({ error: 'No fields to update' });

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data
    });

    res.status(200).json({ user: serializeUser(updatedUser) })

  } catch (error) {
    next(error)
  }
})

export default router;
