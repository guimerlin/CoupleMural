"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { MuralService, type Mural } from "@/lib/mural-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CreateMuralDialog } from "./create-mural-dialog"
import { Heart, Plus, Calendar, ImageIcon } from "lucide-react"

interface MuralSelectorProps {
  onMuralChange?: (mural: Mural | null) => void
}

export function MuralSelector({ onMuralChange }: MuralSelectorProps) {
  const [murals, setMurals] = useState<Mural[]>([])
  const [activeMural, setActiveMural] = useState<Mural | null>(null)
  const [loading, setLoading] = useState(true)

  const { coupleProfile } = useAuth()

  const loadMurals = async () => {
    if (!coupleProfile) return

    try {
      const couplesMurals = await MuralService.getMuralsByCouple(coupleProfile.id)
      setMurals(couplesMurals)

      const active = couplesMurals.find((m) => m.isActive) || couplesMurals[0] || null
      setActiveMural(active)
      onMuralChange?.(active)
    } catch (error) {
      console.error("Erro ao carregar murais:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMurals()
  }, [coupleProfile])

  const handleMuralSelect = async (muralId: string) => {
    if (!coupleProfile) return

    const selectedMural = murals.find((m) => m.id === muralId)
    if (!selectedMural) return

    try {
      await MuralService.setActiveMural(coupleProfile.id, muralId)
      setActiveMural(selectedMural)
      onMuralChange?.(selectedMural)

      // Atualizar lista local
      setMurals((prev) => prev.map((m) => ({ ...m, isActive: m.id === muralId })))
    } catch (error) {
      console.error("Erro ao selecionar mural:", error)
    }
  }

  const handleMuralCreated = (muralId: string) => {
    loadMurals() // Recarregar lista após criar novo mural
  }

  if (loading) {
    return (
      <Card className="gradient-card border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (murals.length === 0) {
    return (
      <Card className="gradient-card border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-serif font-medium text-foreground mb-2">Nenhum mural criado ainda</h3>
          <p className="text-muted-foreground mb-6">
            Criem seu primeiro mural para começar a guardar suas memórias especiais!
          </p>
          <CreateMuralDialog onMuralCreated={handleMuralCreated} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gradient-card border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-serif font-medium text-foreground">Mural Ativo</h3>
            <p className="text-sm text-muted-foreground">Escolham qual mural visualizar</p>
          </div>
          <CreateMuralDialog
            onMuralCreated={handleMuralCreated}
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            }
          />
        </div>

        <div className="space-y-4">
          <Select value={activeMural?.id || ""} onValueChange={handleMuralSelect}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Selecione um mural" />
            </SelectTrigger>
            <SelectContent>
              {murals.map((mural) => (
                <SelectItem key={mural.id} value={mural.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ background: mural.backgroundColor }} />
                    {mural.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeMural && (
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground">{activeMural.name}</h4>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  {activeMural.memoryCount}
                </div>
              </div>
              {activeMural.description && (
                <p className="text-sm text-muted-foreground mb-2">{activeMural.description}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                Criado em {activeMural.createdAt.toLocaleDateString("pt-BR")}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
