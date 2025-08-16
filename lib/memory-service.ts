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
  increment,
} from "firebase/firestore"
import { db } from "./firebase"
import { MuralService } from "./mural-service"

export interface Memory {
  id: string
  muralId: string
  coupleId: string
  type: "photo" | "music" | "note" | "mixed"
  title: string
  description?: string
  content: MemoryContent
  position: { x: number; y: number }
  author: string
  createdAt: Date
  updatedAt: Date
  isVisible: boolean
}

export interface MemoryContent {
  text?: string
  images?: string[] // URLs das imagens - será implementado com storage
  music?: {
    title: string
    artist?: string
    url?: string // URL do arquivo de música
    spotifyUrl?: string
    youtubeUrl?: string
  }
  backgroundColor?: string
  textColor?: string
}

export interface CreateMemoryData {
  muralId: string
  type: Memory["type"]
  title: string
  description?: string
  content: MemoryContent
  position: { x: number; y: number }
  author: string
}

export class MemoryService {
  private static convertTimestampsToDate(data: any): any {
    const converted = { ...data }

    // Convert Firestore Timestamps to Date objects
    if (converted.createdAt && typeof converted.createdAt.toDate === "function") {
      converted.createdAt = converted.createdAt.toDate()
    }
    if (converted.updatedAt && typeof converted.updatedAt.toDate === "function") {
      converted.updatedAt = converted.updatedAt.toDate()
    }

    return converted
  }

  static async createMemory(coupleId: string, memoryData: CreateMemoryData): Promise<string> {
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const memory: Memory = {
      id: memoryId,
      coupleId,
      ...memoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVisible: true,
    }

    await setDoc(doc(db, "memories", memoryId), memory)

    // Incrementar contador de memórias no mural
    await MuralService.updateMural(memoryData.muralId, {
      memoryCount: increment(1),
    })

    return memoryId
  }

  static async getMemoriesByMural(muralId: string): Promise<Memory[]> {
    const q = query(
      collection(db, "memories"),
      where("muralId", "==", muralId),
      where("isVisible", "==", true),
      orderBy("createdAt", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => this.convertTimestampsToDate({ id: doc.id, ...doc.data() }) as Memory)
  }

  static async getMemory(memoryId: string): Promise<Memory | null> {
    const docRef = doc(db, "memories", memoryId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return this.convertTimestampsToDate({ id: docSnap.id, ...docSnap.data() }) as Memory
    }
    return null
  }

  static async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<void> {
    const docRef = doc(db, "memories", memoryId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    })
  }

  static async deleteMemory(memoryId: string): Promise<void> {
    const memory = await this.getMemory(memoryId)
    if (memory) {
      // Decrementar contador de memórias no mural
      await MuralService.updateMural(memory.muralId, {
        memoryCount: increment(-1),
      })
    }

    await deleteDoc(doc(db, "memories", memoryId))
  }

  static async getMemoriesByCouple(coupleId: string): Promise<Memory[]> {
    const q = query(
      collection(db, "memories"),
      where("coupleId", "==", coupleId),
      where("isVisible", "==", true),
      orderBy("createdAt", "desc"),
    )

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => this.convertTimestampsToDate({ id: doc.id, ...doc.data() }) as Memory)
  }

  // Função preparada para upload de imagens (será implementada depois)
  static async uploadImage(file: File, memoryId: string): Promise<string> {
    // TODO: Implementar upload para Firebase Storage
    // Por enquanto retorna uma URL placeholder
    console.log(`[v0] Preparado para upload de imagem para memória ${memoryId}:`, file.name)
    return `/placeholder.svg?height=400&width=600&query=memory-image-${file.name}`
  }

  // Função preparada para upload de música (será implementada depois)
  static async uploadMusic(file: File, memoryId: string): Promise<string> {
    // TODO: Implementar upload para Firebase Storage
    // Por enquanto retorna uma URL placeholder
    console.log(`[v0] Preparado para upload de música para memória ${memoryId}:`, file.name)
    return `/placeholder-music-${file.name}.mp3`
  }

  // Gerar posição aleatória para nova memória
  static generateRandomPosition(): { x: number; y: number } {
    return {
      x: Math.random() * 60 + 20, // Entre 20% e 80%
      y: Math.random() * 50 + 25, // Entre 25% e 75%
    }
  }
}
