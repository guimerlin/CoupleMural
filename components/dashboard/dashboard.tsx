"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Plus, Music, ImageIcon, MessageCircle, LogOut, Settings } from "lucide-react"
import { MuralCanvas } from "./mural-canvas"
import { RecentMemories } from "./recent-memories"
import { MuralSelector } from "../mural/mural-selector"
import { CreateMemoryDialog } from "../memory/create-memory-dialog"
import { MusicPlayer } from "../music/music-player"
import type { Mural } from "@/lib/mural-service"

export function Dashboard() {
  const { coupleProfile, logout } = useAuth()
  const [activeView, setActiveView] = useState<"mural" | "memories" | "settings">("mural")
  const [currentMural, setCurrentMural] = useState<Mural | null>(null)

  if (!coupleProfile) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando perfil do casal...</p>
        </div>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-romantic shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Nome do Casal */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-white">{coupleProfile.coupleName}</h1>
                <p className="text-white/80 text-sm">
                  {coupleProfile.partner1Name} & {coupleProfile.partner2Name}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveView("mural")}
                className={`text-white/80 hover:text-white transition-colors ${
                  activeView === "mural" ? "text-white font-medium" : ""
                }`}
              >
                Mural
              </button>
              <button
                onClick={() => setActiveView("memories")}
                className={`text-white/80 hover:text-white transition-colors ${
                  activeView === "memories" ? "text-white font-medium" : ""
                }`}
              >
                Memórias
              </button>
              <button
                onClick={() => setActiveView("settings")}
                className={`text-white/80 hover:text-white transition-colors ${
                  activeView === "settings" ? "text-white font-medium" : ""
                }`}
              >
                Configurações
              </button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white/20 text-white text-xs">
                    {getInitials(coupleProfile.partner1Name)}
                  </AvatarFallback>
                </Avatar>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white/20 text-white text-xs">
                    {getInitials(coupleProfile.partner2Name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "mural" && (
          <div className="space-y-8">
            <MuralSelector onMuralChange={setCurrentMural} />

            {currentMural && (
              <>
                <div className="flex flex-wrap gap-4">
                  <CreateMemoryDialog
                    mural={currentMural}
                    trigger={
                      <Button className="gradient-romantic hover:opacity-90 transition-opacity">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Memória
                      </Button>
                    }
                  />
                  <CreateMemoryDialog
                    mural={currentMural}
                    trigger={
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Adicionar Foto
                      </Button>
                    }
                  />
                  <CreateMemoryDialog
                    mural={currentMural}
                    trigger={
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                      >
                        <Music className="w-4 h-4 mr-2" />
                        Adicionar Música
                      </Button>
                    }
                  />
                  <CreateMemoryDialog
                    mural={currentMural}
                    trigger={
                      <Button
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Escrever Nota
                      </Button>
                    }
                  />
                </div>

                <MuralCanvas mural={currentMural} />
              </>
            )}
          </div>
        )}

        {activeView === "memories" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-foreground">Suas Memórias</h2>
              {currentMural && (
                <CreateMemoryDialog
                  mural={currentMural}
                  trigger={
                    <Button className="gradient-romantic hover:opacity-90 transition-opacity">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Memória
                    </Button>
                  }
                />
              )}
            </div>
            <RecentMemories mural={currentMural} />
          </div>
        )}

        {activeView === "settings" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-serif font-bold text-foreground">Configurações</h2>
            <Card className="gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Perfil do Casal
                </CardTitle>
                <CardDescription>Gerenciem as informações da conta de vocês</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nome do Casal</label>
                    <p className="text-muted-foreground">{coupleProfile.coupleName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Data de Criação</label>
                    <p className="text-muted-foreground">{coupleProfile.createdAt.toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Primeiro Parceiro</label>
                    <p className="text-muted-foreground">{coupleProfile.partner1Name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Segundo Parceiro</label>
                    <p className="text-muted-foreground">{coupleProfile.partner2Name}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                    Editar Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <MusicPlayer />
    </div>
  )
}
