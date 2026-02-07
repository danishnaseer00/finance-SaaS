const admin = require('firebase-admin');

// Initialize Firebase Admin
let firebaseAdmin = null;

try {
  // Check if we have a service account JSON in environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized with service account');
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // For development: Initialize with project ID
    // Note: Full token verification requires service account
    firebaseAdmin = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log('Firebase Admin initialized with project ID');
  }
} catch (error) {
  console.warn('Firebase Admin initialization warning:', error.message);
}

const verifyGoogleToken = async (idToken) => {
  // If Firebase Admin is properly configured with service account, use it
  if (firebaseAdmin && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email?.split('@')[0],
        picture: decodedToken.picture,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid Google token');
    }
  }
  
  // Fallback: Decode the JWT without full verification (for development only)
  // In production, use service account for proper verification
  try {
    const base64Payload = idToken.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    // Basic validation
    if (!payload.email || !payload.sub) {
      throw new Error('Invalid token payload');
    }
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired');
    }
    
    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name || payload.email?.split('@')[0],
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Token decode error:', error);
    throw new Error('Invalid Google token');
  }
};

module.exports = {
  firebaseAdmin,
  verifyGoogleToken,
};
