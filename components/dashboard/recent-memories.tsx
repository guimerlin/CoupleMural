"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ImageIcon, Music, MessageCircle, Calendar, Play, Eye } from "lucide-react"
import { MemoryService, type Memory } from "@/lib/memory-service"
import { MemoryViewer } from "../memory/memory-viewer"
import { CreateMemoryDialog } from "../memory/create-memory-dialog"
import type { Mural } from "@/lib/mural-service"

interface RecentMemoriesProps {
  mural?: Mural | null
}

export function RecentMemories({ mural }: RecentMemoriesProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadMemories = async () => {
    if (!mural) {
      setMemories([])
      return
    }

    setLoading(true)
    try {
      const muralMemories = await MemoryService.getMemoriesByMural(mural.id)
      setMemories(muralMemories.slice(0, 6)) // Mostrar apenas as 6 mais recentes
    } catch (error) {
      console.error("Erro ao carregar memórias:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemories()
  }, [mural])

  const handleMemoryCreated = () => {
    loadMemories()
  }

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case "photo":
        return <ImageIcon className="w-5 h-5" />
      case "music":
        return <Music className="w-5 h-5" />
      case "note":
        return <MessageCircle className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

  const getMemoryTypeLabel = (type: string) => {
    switch (type) {
      case "photo":
        return "Foto"
      case "music":
        return "Música"
      case "note":
        return "Nota"
      default:
        return "Memória"
    }
  }

  const getMemoryColor = (type: string) => {
    switch (type) {
      case "photo":
        return "bg-blue-100 text-blue-800"
      case "music":
        return "bg-purple-100 text-purple-800"
      case "note":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  if (!mural) {
    return (
      <Card className="gradient-card border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-serif font-medium text-foreground mb-2">Selecione um mural</h3>
          <p className="text-muted-foreground">Escolham um mural para ver suas memórias</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="gradient-card border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (memories.length === 0) {
    return (
      <Card className="gradient-card border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-serif font-medium text-foreground mb-2">Nenhuma memória ainda</h3>
          <p className="text-muted-foreground mb-6">Comecem a criar suas primeiras memórias especiais juntos!</p>
          <CreateMemoryDialog
            mural={mural}
            onMemoryCreated={handleMemoryCreated}
            trigger={
              <Button className="gradient-romantic hover:opacity-90 transition-opacity">Criar primeira memória</Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memories.map((memory) => (
          <Card key={memory.id} className="gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getMemoryIcon(memory.type)}
                  <Badge variant="secondary" className={getMemoryColor(memory.type)}>
                    {getMemoryTypeLabel(memory.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {memory.createdAt.toLocaleDateString("pt-BR")}
                </div>
              </div>
              <CardTitle className="text-lg font-serif line-clamp-2">{memory.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {memory.description || memory.content.text?.substring(0, 100) + "..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Por {memory.author}</span>
                  {memory.content.images && memory.content.images.length > 0 && (
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {memory.content.images.length}
                    </div>
                  )}
                  {memory.content.music && (
                    <div className="flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span>Com música</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {memory.content.music && (
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setSelectedMemory(memory)
                      setViewerOpen(true)
                    }}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Memory Viewer */}
      <MemoryViewer memory={selectedMemory} open={viewerOpen} onOpenChange={setViewerOpen} />
    </>
  )
}
