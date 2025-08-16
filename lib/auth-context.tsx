"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

interface CoupleProfile {
  id: string
  coupleName: string
  partner1Name: string
  partner2Name: string
  createdAt: Date
  muralId?: string
}

interface AuthContextType {
  user: User | null
  coupleProfile: CoupleProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, coupleData: Omit<CoupleProfile, "id" | "createdAt">) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Buscar perfil do casal
        const coupleDoc = await getDoc(doc(db, "couples", user.uid))
        if (coupleDoc.exists()) {
          setCoupleProfile({ id: coupleDoc.id, ...coupleDoc.data() } as CoupleProfile)
        }
      } else {
        setCoupleProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, coupleData: Omit<CoupleProfile, "id" | "createdAt">) => {
    try {
      console.log("[v0] Creating user with email:", email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log("[v0] User created successfully:", userCredential.user.uid)

      // Criar perfil do casal no Firestore
      const coupleProfile: CoupleProfile = {
        id: userCredential.user.uid,
        ...coupleData,
        createdAt: new Date(),
      }

      console.log("[v0] Creating couple profile in Firestore")
      await setDoc(doc(db, "couples", userCredential.user.uid), coupleProfile)
      console.log("[v0] Couple profile created successfully")

      setCoupleProfile(coupleProfile)
    } catch (error: any) {
      console.error("[v0] SignUp error:", error)
      if (error.code === "auth/configuration-not-found") {
        throw new Error(
          "Firebase Authentication não está configurado. Acesse o Console do Firebase, vá em Authentication > Sign-in method e habilite Email/Password.",
        )
      }
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    coupleProfile,
    loading,
    signIn,
    signUp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
