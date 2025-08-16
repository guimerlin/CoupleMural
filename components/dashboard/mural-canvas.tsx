"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Plus, ImageIcon, Music, MessageCircle } from "lucide-react"
import { CreateMemoryDialog } from "../memory/create-memory-dialog"
import { MemoryViewer } from "../memory/memory-viewer"
import { MemoryService, type Memory } from "@/lib/memory-service"
import type { Mural } from "@/lib/mural-service"

interface MuralCanvasProps {
  mural?: Mural | null
}

export function MuralCanvas({ mural }: MuralCanvasProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadMemories = async () => {
    if (!mural) return

    setLoading(true)
    try {
      const muralMemories = await MemoryService.getMemoriesByMural(mural.id)
      setMemories(muralMemories)
    } catch (error) {
      console.error("Erro ao carregar memórias:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemories()
  }, [mural])

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory)
    setViewerOpen(true)
  }

  const handleMemoryCreated = () => {
    loadMemories() // Recarregar memórias após criar nova
  }

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <ImageIcon className="w-4 h-4" />
      case "music":
        return <Music className="w-4 h-4" />
      case "note":
        return <MessageCircle className="w-4 h-4" />
      default:
        return <Heart className="w-4 h-4" />
    }
  }

  const getMemoryColor = (type: string) => {
    switch (type) {
      case "photo":
        return "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
      case "music":
        return "bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200"
      case "note":
        return "bg-pink-100 border-pink-300 text-pink-700 hover:bg-pink-200"
      default:
        return "bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
    }
  }

  if (!mural) {
    return null
  }

  return (
    <>
      <Card className="gradient-card border-0 shadow-lg min-h-[600px]">
        <CardContent className="p-8">
          <div
            className="relative w-full h-full min-h-[500px] rounded-lg overflow-hidden"
            style={{ background: mural.backgroundColor }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-20 h-20 gradient-romantic rounded-full blur-xl"></div>
              <div className="absolute top-32 right-20 w-16 h-16 bg-secondary/30 rounded-full blur-lg"></div>
              <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-accent/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-32 right-10 w-18 h-18 gradient-romantic rounded-full blur-lg"></div>
            </div>

            {/* Mural Title */}
            <div className="absolute top-6 left-6 right-6 text-center">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-2">{mural.name}</h3>
              <p className="text-muted-foreground">
                {mural.description || "Cliquem nas memórias para visualizar ou adicionem novas"}
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 gradient-romantic rounded-full mx-auto mb-2 animate-pulse"></div>
                  <p className="text-muted-foreground">Carregando memórias...</p>
                </div>
              </div>
            )}

            {/* Memory Items */}
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200"
                style={{
                  left: `${memory.position.x}%`,
                  top: `${memory.position.y}%`,
                }}
                onClick={() => handleMemoryClick(memory)}
              >
                <div
                  className={`p-3 rounded-lg border-2 shadow-lg backdrop-blur-sm transition-colors ${getMemoryColor(memory.type)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getMemoryIcon(memory.type)}
                    <span className="text-xs font-medium line-clamp-1 max-w-[120px]">{memory.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs opacity-75">{memory.createdAt.toLocaleDateString("pt-BR")}</p>
                    <p className="text-xs opacity-75">{memory.author}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Memory Button */}
            <div className="absolute bottom-6 right-6">
              <CreateMemoryDialog
                mural={mural}
                onMemoryCreated={handleMemoryCreated}
                trigger={
                  <Button
                    size="lg"
                    className="gradient-romantic hover:opacity-90 transition-opacity rounded-full w-14 h-14 p-0 shadow-lg"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                }
              />
            </div>

            {/* Empty State Message */}
            {!loading && memories.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-serif font-medium text-foreground mb-2">Seu mural está vazio</h4>
                  <p className="text-muted-foreground mb-4">Comecem a adicionar suas memórias especiais!</p>
                  <CreateMemoryDialog
                    mural={mural}
                    onMemoryCreated={handleMemoryCreated}
                    trigger={
                      <Button className="gradient-romantic hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar primeira memória
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Memory Viewer */}
      <MemoryViewer memory={selectedMemory} open={viewerOpen} onOpenChange={setViewerOpen} />
    </>
  )
}
