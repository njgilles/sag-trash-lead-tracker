import * as admin from 'firebase-admin'

/**
 * Initialize Firebase Admin SDK for server-side operations
 * Uses singleton pattern to prevent "app already exists" errors in serverless environments
 *
 * Note: Admin SDK bypasses Firestore security rules and should only be used in API routes
 */

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!privateKey || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
    throw new Error(
      'Missing Firebase Admin credentials. Required env vars: FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID'
    )
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  })
}

export default admin.app()
