import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Mural {
  id: string
  coupleId: string
  name: string
  description?: string
  theme: "romantic" | "adventure" | "memories" | "custom"
  backgroundColor: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  memoryCount: number
}

export interface MuralTheme {
  id: string
  name: string
  description: string
  backgroundColor: string
  accentColor: string
  preview: string
}

export const muralThemes: MuralTheme[] = [
  {
    id: "romantic",
    name: "Romântico",
    description: "Tons suaves e românticos para suas memórias de amor",
    backgroundColor: "linear-gradient(135deg, #fffbeb 0%, #fed7aa 50%, #fdba74 100%)",
    accentColor: "#ea580c",
    preview: "💕",
  },
  {
    id: "adventure",
    name: "Aventura",
    description: "Cores vibrantes para suas aventuras juntos",
    backgroundColor: "linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 50%, #6ee7b7 100%)",
    accentColor: "#059669",
    preview: "🌟",
  },
  {
    id: "memories",
    name: "Memórias",
    description: "Tons nostálgicos para guardar momentos especiais",
    backgroundColor: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)",
    accentColor: "#d97706",
    preview: "📸",
  },
  {
    id: "custom",
    name: "Personalizado",
    description: "Crie seu próprio tema único",
    backgroundColor: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 50%, #d1d5db 100%)",
    accentColor: "#6b7280",
    preview: "🎨",
  },
]

export class MuralService {
  private static convertFirestoreData(data: any): Mural {
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
    } as Mural
  }

  static async createMural(
    coupleId: string,
    muralData: Omit<Mural, "id" | "coupleId" | "createdAt" | "updatedAt" | "memoryCount">,
  ): Promise<string> {
    const muralId = `mural_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const mural: Mural = {
      id: muralId,
      coupleId,
      ...muralData,
      createdAt: new Date(),
      updatedAt: new Date(),
      memoryCount: 0,
    }

    await setDoc(doc(db, "murals", muralId), mural)
    return muralId
  }

  static async getMuralsByCouple(coupleId: string): Promise<Mural[]> {
    const q = query(collection(db, "murals"), where("coupleId", "==", coupleId), orderBy("updatedAt", "desc"))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => this.convertFirestoreData({ id: doc.id, ...doc.data() }))
  }

  static async getMural(muralId: string): Promise<Mural | null> {
    const docRef = doc(db, "murals", muralId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return this.convertFirestoreData({ id: docSnap.id, ...docSnap.data() })
    }
    return null
  }

  static async updateMural(muralId: string, updates: Partial<Mural>): Promise<void> {
    const docRef = doc(db, "murals", muralId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    })
  }

  static async deleteMural(muralId: string): Promise<void> {
    await deleteDoc(doc(db, "murals", muralId))
  }

  static async setActiveMural(coupleId: string, muralId: string): Promise<void> {
    // Desativar todos os murais do casal
    const murals = await this.getMuralsByCouple(coupleId)
    const updatePromises = murals.map((mural) => this.updateMural(mural.id, { isActive: mural.id === muralId }))

    await Promise.all(updatePromises)
  }
}
