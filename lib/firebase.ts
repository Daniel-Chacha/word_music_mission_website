import { getApps, initializeApp, cert, type App } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  )
}

let app: App | undefined

/**
 * Initialisation is deferred rather than done at module scope, so importing
 * this file with no credentials is harmless. That is what lets the shop render
 * when Firebase is unconfigured instead of throwing at build time.
 */
function getApp(): App {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase Admin credentials are not configured')
  }
  if (app) return app

  const existing = getApps()
  if (existing.length > 0) {
    app = existing[0]
    return app
  }

  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Hosting providers store the key with literal \n; restore real newlines.
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
  })
  return app
}

export function getDb(): Firestore {
  return getFirestore(getApp())
}
