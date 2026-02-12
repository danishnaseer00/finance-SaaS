const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../config/jwt');
const { verifyGoogleToken } = require('../config/firebase');

// Helper to safely get auth providers (handles null/undefined for legacy users)
const getProviders = (user) => user?.authProviders || [];
const hasProvider = (user, provider) => getProviders(user).includes(provider);

const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists with Google but no password, allow setting password (account linking)
      if (hasProvider(existingUser, 'google') && !hasProvider(existingUser, 'password')) {
        const passwordHash = await bcrypt.hash(password, 12);
        const currentProviders = getProviders(existingUser);
        
        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            passwordHash,
            name: name || existingUser.name,
            authProviders: [...currentProviders, 'password'],
          },
          select: {
            id: true,
            email: true,
            name: true,
            authProviders: true,
            createdAt: true,
          },
        });

        const token = generateToken(updatedUser.id);

        return res.status(200).json({
          message: 'Password added to your account. You can now sign in with either method.',
          user: updatedUser,
          token,
          accountLinked: true,
        });
      }

      return res.status(409).json({ error: 'Email already registered. Please sign in instead.' });
    }

    // Hash password with stronger salt rounds
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with password provider
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        authProviders: ['password'],
      },
      select: {
        id: true,
        email: true,
        name: true,
        authProviders: true,
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

    // Check if user has password auth enabled
    if (!hasProvider(user, 'password') || !user.passwordHash) {
      // User signed up with Google only
      return res.status(401).json({ 
        error: 'This account uses Google sign-in. Please use Google to log in, or set a password first.',
        requiresPasswordSetup: true,
        hasGoogle: hasProvider(user, 'google'),
      });
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
        authProviders: user.authProviders,
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
        authProviders: true,
        emailVerified: true,
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
        authProviders: true,
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

    // Ensure Google email is verified
    if (googleUser.email_verified === false) {
      return res.status(400).json({ 
        error: 'Google email must be verified before linking accounts.' 
      });
    }

    // Check if user exists by email
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    let accountLinked = false;

    if (user) {
      // User exists - handle account linking
      if (user.googleId && user.googleId !== googleUser.uid) {
        // Different Google account trying to access same email
        return res.status(409).json({ 
          error: 'This email is linked to a different Google account.' 
        });
      }

      if (!user.googleId) {
        // User registered with email/password, link Google account
        const currentProviders = getProviders(user);
        user = await prisma.user.update({
          where: { email: googleUser.email },
          data: {
            googleId: googleUser.uid,
            emailVerified: true,
            authProviders: currentProviders.includes('google') 
              ? currentProviders 
              : [...currentProviders, 'google'],
          },
        });
        accountLinked = true;
      }
    } else {
      // Create new user with Google provider
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.uid,
          emailVerified: true,
          authProviders: ['google'],
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: accountLinked 
        ? 'Google account linked successfully! You can now sign in with either method.'
        : 'Google authentication successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        authProviders: user.authProviders,
      },
      token,
      accountLinked,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    next(error);
  }
};

// Set password for Google-only users
const setPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (hasProvider(user, 'password')) {
      return res.status(400).json({ error: 'Password already set. Use change password instead.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const currentProviders = getProviders(user);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        authProviders: [...currentProviders, 'password'],
      },
      select: {
        id: true,
        email: true,
        name: true,
        authProviders: true,
      },
    });

    res.json({
      message: 'Password set successfully. You can now sign in with email/password.',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Get linked providers for a user
const getAuthProviders = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        authProviders: true,
        emailVerified: true,
      },
    });

    res.json({
      providers: user.authProviders || [],
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  googleAuth,
  setPassword,
  getAuthProviders,
};
