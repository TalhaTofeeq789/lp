# Backend API Integration for Authentication

The frontend now calls your backend API instead of accessing Firebase directly. Here's the API structure your backend needs to implement:

## Firebase Credentials (Backend Only)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC7-xHHI-ip1uThgqc67DRh8ZgWPQZuVgI",
  authDomain: "lp-optimization-97f9f.firebaseapp.com",
  projectId: "lp-optimization-97f9f",
  storageBucket: "lp-optimization-97f9f.firebasestorage.app",
  messagingSenderId: "574348961810",
  appId: "1:574348961810:web:5d3e2602de988c549fd0cb",
  measurementId: "G-84HXXPN77N"
};
```

## Required API Endpoints

### 1. Sign In Endpoint
**POST** `/api/auth/signin`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Success Response (200):**
```json
{
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com", 
    "displayName": "User Name"
  },
  "token": "jwt-token-here"
}
```

**Error Response (400/401):**
```json
{
  "message": "Invalid credentials"
}
```

### 2. Sign Out Endpoint
**POST** `/api/auth/signout`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Success Response (200):**
```json
{
  "message": "Signed out successfully"
}
```

### 3. Verify Token Endpoint (Optional)
**POST** `/api/auth/verify`

**Headers:**
```
Authorization: Bearer jwt-token-here
```

**Success Response (200):**
```json
{
  "valid": true,
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "User Name"
  }
}
```

**Error Response (401):**
```json
{
  "valid": false,
  "message": "Invalid token"
}
```

## Backend Implementation Guide

### 1. Install Dependencies
```bash
npm install firebase-admin express jsonwebtoken cors helmet
npm install -D @types/jsonwebtoken
```

### 2. Initialize Firebase Admin (Node.js/Express example)
```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin with your credentials
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "lp-optimization-97f9f",
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  })
});
```

### 3. Authentication Routes Example
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const router = express.Router();

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use Firebase Admin to verify user
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Create JWT token
    const token = jwt.sign(
      { uid: userRecord.uid, email: userRecord.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || null
      },
      token
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Sign Out
router.post('/signout', (req, res) => {
  // In stateless JWT, we just confirm the request
  // Token invalidation can be handled client-side
  res.json({ message: 'Signed out successfully' });
});

// Verify Token
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Optionally verify with Firebase
    const userRecord = await admin.auth().getUser(decoded.uid);
    
    res.json({
      valid: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || null
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;
```

## Environment Variables (Backend)
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@lp-optimization-97f9f.iam.gserviceaccount.com"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

## Frontend Configuration
The frontend expects the backend at: `http://localhost:3000/api`

To change this, update the `API_BASE_URL` in `services/auth.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## Security Notes
1. ✅ Firebase credentials are now server-side only
2. ✅ JWT tokens are used for client authentication
3. ✅ All sensitive operations happen on the backend
4. ✅ CORS should be configured properly
5. ✅ Use HTTPS in production
6. ✅ Implement rate limiting for auth endpoints

## Testing the Integration
1. Set up your backend with the required endpoints
2. Update `API_BASE_URL` in the frontend
3. Create a user in Firebase Console (Authentication section)
4. Test login with the created user credentials

The frontend will automatically handle:
- ✅ Token storage in localStorage
- ✅ Automatic logout on token expiry
- ✅ Error message display
- ✅ Loading states during authentication
