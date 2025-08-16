"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { MemoryService, type CreateMemoryData, type MemoryContent } from "@/lib/memory-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Heart, ImageIcon, Music, MessageCircle, Upload, Link } from "lucide-react"
import type { Mural } from "@/lib/mural-service"

interface CreateMemoryDialogProps {
  mural: Mural
  onMemoryCreated?: (memoryId: string) => void
  trigger?: React.ReactNode
}

export function CreateMemoryDialog({ mural, onMemoryCreated, trigger }: CreateMemoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"photo" | "music" | "note">("note")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    author: "",
  })

  const [content, setContent] = useState<MemoryContent>({
    text: "",
    images: [],
    music: undefined,
    backgroundColor: "#ffffff",
    textColor: "#000000",
  })

  const { coupleProfile } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupleProfile) return

    setLoading(true)
    try {
      const cleanContent: MemoryContent = {
        text: content.text || "",
        images: content.images || [],
        backgroundColor: content.backgroundColor || "#ffffff",
        textColor: content.textColor || "#000000",
      }

      // Só adicionar música se houver dados válidos
      if (activeTab === "music" && content.music && (content.music.title || content.music.url)) {
        cleanContent.music = {
          title: content.music.title || "",
          url: content.music.url || "",
          ...(content.music.artist && { artist: content.music.artist }),
          ...(content.music.spotifyUrl && { spotifyUrl: content.music.spotifyUrl }),
        }
      }

      const memoryData: CreateMemoryData = {
        muralId: mural.id,
        type: activeTab,
        title: formData.title,
        description: formData.description,
        content: cleanContent,
        position: MemoryService.generateRandomPosition(),
        author: formData.author || coupleProfile.partner1Name,
      }

      const memoryId = await MemoryService.createMemory(coupleProfile.id, memoryData)

      setOpen(false)
      resetForm()
      onMemoryCreated?.(memoryId)
    } catch (error) {
      console.error("Erro ao criar memória:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", author: "" })
    setContent({
      text: "",
      images: [],
      music: undefined,
      backgroundColor: "#ffffff",
      textColor: "#000000",
    })
    setActiveTab("note")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Preparado para upload real - por enquanto simula
    const uploadPromises = Array.from(files).map(async (file) => {
      const url = await MemoryService.uploadImage(file, "temp")
      return url
    })

    const imageUrls = await Promise.all(uploadPromises)
    setContent((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...imageUrls],
    }))
  }

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preparado para upload real - por enquanto simula
    const url = await MemoryService.uploadMusic(file, "temp")
    setContent((prev) => ({
      ...prev,
      music: {
        title: file.name.replace(/\.[^/.]+$/, ""),
        url,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-romantic hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            Nova Memória
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] gradient-card border-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Criar Nova Memória
          </DialogTitle>
          <DialogDescription>Adicionem uma nova memória especial ao mural "{mural.name}"</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Memória</Label>
                <Input
                  id="title"
                  placeholder="Nossa primeira viagem juntos"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-input border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  placeholder={coupleProfile?.partner1Name}
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Conte mais sobre essa memória especial..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-input border-border resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Tipo de Memória */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="note" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Nota
              </TabsTrigger>
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Foto
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                Música
              </TabsTrigger>
            </TabsList>

            <TabsContent value="note" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteText">Sua Mensagem</Label>
                <Textarea
                  id="noteText"
                  placeholder="Escreva sua mensagem de amor, pensamento ou lembrança..."
                  value={content.text || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, text: e.target.value }))}
                  className="bg-input border-border resize-none min-h-[120px]"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.backgroundColor}
                      onChange={(e) => setContent((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-10 h-10 rounded border border-border"
                    />
                    <Input
                      value={content.backgroundColor}
                      onChange={(e) => setContent((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cor do Texto</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={content.textColor}
                      onChange={(e) => setContent((prev) => ({ ...prev, textColor: e.target.value }))}
                      className="w-10 h-10 rounded border border-border"
                    />
                    <Input
                      value={content.textColor}
                      onChange={(e) => setContent((prev) => ({ ...prev, textColor: e.target.value }))}
                      className="bg-input border-border"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photo" className="space-y-4">
              <div className="space-y-2">
                <Label>Adicionar Fotos</Label>
                <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para adicionar fotos ou arraste aqui</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 10MB cada</p>
                    </label>
                  </CardContent>
                </Card>

                {content.images && content.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {content.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() =>
                            setContent((prev) => ({
                              ...prev,
                              images: prev.images?.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoCaption">Legenda das Fotos</Label>
                <Textarea
                  id="photoCaption"
                  placeholder="Descreva essas fotos especiais..."
                  value={content.text || ""}
                  onChange={(e) => setContent((prev) => ({ ...prev, text: e.target.value }))}
                  className="bg-input border-border resize-none"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Adicionar Música</Label>
                  <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-6 text-center">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleMusicUpload}
                        className="hidden"
                        id="music-upload"
                      />
                      <label htmlFor="music-upload" className="cursor-pointer">
                        <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Clique para adicionar arquivo de música</p>
                        <p className="text-xs text-muted-foreground mt-1">MP3, WAV até 50MB</p>
                      </label>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="musicTitle">Título da Música</Label>
                    <Input
                      id="musicTitle"
                      placeholder="Nossa música especial"
                      value={content.music?.title || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          music: {
                            title: "",
                            url: "",
                            ...prev.music,
                            title: e.target.value,
                          },
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="musicArtist">Artista</Label>
                    <Input
                      id="musicArtist"
                      placeholder="Nome do artista"
                      value={content.music?.artist || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          music: {
                            title: "",
                            url: "",
                            ...prev.music,
                            artist: e.target.value,
                          },
                        }))
                      }
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="musicSpotify">Link do Spotify (opcional)</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="musicSpotify"
                      placeholder="https://open.spotify.com/track/..."
                      value={content.music?.spotifyUrl || ""}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          music: {
                            title: "",
                            url: "",
                            ...prev.music,
                            spotifyUrl: e.target.value,
                          },
                        }))
                      }
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="musicDescription">Por que essa música é especial?</Label>
                  <Textarea
                    id="musicDescription"
                    placeholder="Conte a história por trás dessa música..."
                    value={content.text || ""}
                    onChange={(e) => setContent((prev) => ({ ...prev, text: e.target.value }))}
                    className="bg-input border-border resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="gradient-romantic hover:opacity-90 transition-opacity"
            >
              {loading ? "Criando..." : "Criar Memória"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
