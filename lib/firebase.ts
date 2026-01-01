import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyCQJPmrs2uqaapaGOWUpFtItBFYKEDmw_4",
  authDomain: "oodaengine-900ed.firebaseapp.com",
  projectId: "oodaengine-900ed",
  storageBucket: "oodaengine-900ed.firebasestorage.app",
  messagingSenderId: "291054343174",
  appId: "1:291054343174:web:384f2bae5f52f087419f87",
  measurementId: "G-923TN98XP3",
}

let app: FirebaseApp
let auth: Auth

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)

  if (typeof window !== "undefined" && auth) {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Firebase persistence error:", error)
    })
  }
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw error
}

export { auth, app }
export default app
