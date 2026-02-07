const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');
const { verifyGoogleToken } = require('../config/firebase');

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Registration successful',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    // Verify the Google ID token
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      // User exists - check if they registered with Google
      if (!user.googleId) {
        // User registered with email/password, don't allow Google sign-in
        return res.status(409).json({ 
          error: 'This email is already registered. Please sign in with your email and password.' 
        });
      }
      
      // User has Google account linked, verify it's the same Google account
      if (user.googleId !== googleUser.uid) {
        return res.status(409).json({ 
          error: 'This email is linked to a different Google account.' 
        });
      }
    } else {
      // Create new user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          passwordHash: '', // No password for Google users
          googleId: googleUser.uid,
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, googleAuth };
