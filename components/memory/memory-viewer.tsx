"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Heart,
  ImageIcon,
  Music,
  MessageCircle,
  Calendar,
  User,
  Play,
  Pause,
  Volume2,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"
import { useMusicPlayer } from "@/lib/music-player-context"
import type { Memory } from "@/lib/memory-service"

interface MemoryViewerProps {
  memory: Memory | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (memory: Memory) => void
  onDelete?: (memory: Memory) => void
}

export function MemoryViewer({ memory, open, onOpenChange, onEdit, onDelete }: MemoryViewerProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay, addToPlaylist } = useMusicPlayer()

  if (!memory) return null

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

  const handlePlayMusic = () => {
    if (!memory.content.music) return

    const track = {
      id: memory.id,
      title: memory.content.music.title,
      artist: memory.content.music.artist,
      url: memory.content.music.url,
      spotifyUrl: memory.content.music.spotifyUrl,
      youtubeUrl: memory.content.music.youtubeUrl,
      memoryId: memory.id,
      memoryTitle: memory.title,
    }

    // Se é a música atual, apenas toggle play/pause
    if (currentTrack?.id === memory.id) {
      togglePlay()
    } else {
      // Tocar nova música
      playTrack(track)
      addToPlaylist(track)
    }
  }

  const isCurrentTrack = currentTrack?.id === memory.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] gradient-card border-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getMemoryIcon(memory.type)}
              <div>
                <DialogTitle className="text-2xl font-serif">{memory.title}</DialogTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className={getMemoryColor(memory.type)}>
                    {getMemoryTypeLabel(memory.type)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="w-3 h-3" />
                    {memory.author}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {memory.createdAt.toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(memory)}
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(memory)}
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {memory.description && (
            <div>
              <h4 className="font-medium text-foreground mb-2">Descrição</h4>
              <p className="text-muted-foreground">{memory.description}</p>
            </div>
          )}

          {/* Conteúdo baseado no tipo */}
          {memory.type === "note" && memory.content.text && (
            <Card
              className="border-0 shadow-lg"
              style={{
                backgroundColor: memory.content.backgroundColor || "#ffffff",
                color: memory.content.textColor || "#000000",
              }}
            >
              <CardContent className="p-6">
                <div className="whitespace-pre-wrap text-base leading-relaxed">{memory.content.text}</div>
              </CardContent>
            </Card>
          )}

          {memory.type === "photo" && (
            <div className="space-y-4">
              {memory.content.images && memory.content.images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memory.content.images.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Foto ${index + 1} - ${memory.title}`}
                        className="w-full h-64 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              )}
              {memory.content.text && (
                <Card className="gradient-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground mb-2">Legenda</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{memory.content.text}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {memory.type === "music" && (
            <div className="space-y-4">
              {memory.content.music && (
                <Card className="gradient-card border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-serif font-medium text-foreground">{memory.content.music.title}</h4>
                        {memory.content.music.artist && (
                          <p className="text-muted-foreground">por {memory.content.music.artist}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={handlePlayMusic}
                          className={`transition-all ${
                            isCurrentTrack && isPlaying
                              ? "gradient-romantic hover:opacity-90"
                              : "gradient-romantic hover:opacity-90"
                          }`}
                        >
                          {isCurrentTrack && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (memory.content.music) {
                              const track = {
                                id: memory.id,
                                title: memory.content.music.title,
                                artist: memory.content.music.artist,
                                url: memory.content.music.url,
                                spotifyUrl: memory.content.music.spotifyUrl,
                                youtubeUrl: memory.content.music.youtubeUrl,
                                memoryId: memory.id,
                                memoryTitle: memory.title,
                              }
                              addToPlaylist(track)
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Status da música atual */}
                    {isCurrentTrack && (
                      <div className="mb-4 p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 gradient-romantic rounded-full animate-pulse" />
                          <span className="text-sm text-primary font-medium">
                            {isPlaying ? "Tocando agora" : "Pausada"}
                          </span>
                        </div>
                      </div>
                    )}

                    {memory.content.music.spotifyUrl && (
                      <div className="mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(memory.content.music?.spotifyUrl, "_blank")}
                          className="border-green-500 text-green-700 hover:bg-green-50"
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Abrir no Spotify
                        </Button>
                      </div>
                    )}

                    {/* Placeholder para visualização da música */}
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                      <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {memory.content.music.url ? "Arquivo de música carregado" : "Use o player global para ouvir"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {memory.content.text && (
                <Card className="gradient-card border-0 shadow-lg">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground mb-2">História da Música</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{memory.content.text}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
