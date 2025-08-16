"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { MuralService, muralThemes, type MuralTheme } from "@/lib/mural-service"
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
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Heart, Check } from "lucide-react"

interface CreateMuralDialogProps {
  onMuralCreated?: (muralId: string) => void
  trigger?: React.ReactNode
}

export function CreateMuralDialog({ onMuralCreated, trigger }: CreateMuralDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    theme: "romantic" as const,
  })
  const [selectedTheme, setSelectedTheme] = useState<MuralTheme>(muralThemes[0])

  const { coupleProfile } = useAuth()

  const handleThemeSelect = (theme: MuralTheme) => {
    setSelectedTheme(theme)
    setFormData((prev) => ({ ...prev, theme: theme.id as any }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupleProfile) return

    setLoading(true)
    try {
      const muralId = await MuralService.createMural(coupleProfile.id, {
        name: formData.name,
        description: formData.description,
        theme: formData.theme,
        backgroundColor: selectedTheme.backgroundColor,
        isActive: true,
      })

      // Definir como mural ativo
      await MuralService.setActiveMural(coupleProfile.id, muralId)

      setOpen(false)
      setFormData({ name: "", description: "", theme: "romantic" })
      onMuralCreated?.(muralId)
    } catch (error) {
      console.error("Erro ao criar mural:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-romantic hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Mural
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] gradient-card border-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Criar Novo Mural
          </DialogTitle>
          <DialogDescription>Criem um espaço especial para guardar suas memórias mais preciosas</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Mural</Label>
              <Input
                id="name"
                placeholder="Nossa História de Amor"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Um lugar para guardar nossos momentos mais especiais..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-input border-border resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <Label>Escolha um Tema</Label>
              <div className="grid grid-cols-2 gap-3">
                {muralThemes.map((theme) => (
                  <Card
                    key={theme.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTheme.id === theme.id ? "ring-2 ring-primary shadow-lg" : "hover:shadow-sm"
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <CardContent className="p-4">
                      <div
                        className="w-full h-16 rounded-lg mb-3 flex items-center justify-center text-2xl relative"
                        style={{ background: theme.backgroundColor }}
                      >
                        {theme.preview}
                        {selectedTheme.id === theme.id && (
                          <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{theme.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="gradient-romantic hover:opacity-90 transition-opacity"
            >
              {loading ? "Criando..." : "Criar Mural"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
