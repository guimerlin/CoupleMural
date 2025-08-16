"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

let Heart, Mail, Lock
try {
  const lucide = require("lucide-react")
  Heart = lucide.Heart
  Mail = lucide.Mail
  Lock = lucide.Lock
} catch (error) {
  // Fallback components quando lucide-react não está disponível
  Heart = () => <span style={{ fontSize: "2rem" }}>💕</span>
  Mail = () => <span style={{ fontSize: "1rem" }}>📧</span>
  Lock = () => <span style={{ fontSize: "1rem" }}>🔒</span>
}

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await signIn(email, password)
    } catch (error) {
      setError("Email ou senha incorretos")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md gradient-card border-0 shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 gradient-romantic rounded-full flex items-center justify-center">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-serif text-foreground">Bem-vindos de volta!</CardTitle>
        <CardDescription className="text-muted-foreground">
          Entre na sua conta para acessar suas memórias especiais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-input border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-input border-border"
                required
              />
            </div>
          </div>

          {error && <div className="text-destructive text-sm text-center">{error}</div>}

          <Button
            type="submit"
            className="w-full gradient-romantic hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não têm uma conta?{" "}
            <button onClick={onToggleMode} className="text-primary hover:text-primary/80 font-medium transition-colors">
              Criar conta do casal
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
