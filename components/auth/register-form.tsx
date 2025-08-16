"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail, Lock, Users } from "lucide-react"

interface RegisterFormProps {
  onToggleMode: () => void
}

export function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    coupleName: "",
    partner1Name: "",
    partner2Name: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { signUp } = useAuth()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("[v0] Starting registration process")

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      console.log("[v0] Calling signUp function")
      await signUp(formData.email, formData.password, {
        coupleName: formData.coupleName,
        partner1Name: formData.partner1Name,
        partner2Name: formData.partner2Name,
      })
      console.log("[v0] Registration successful")
    } catch (error: any) {
      console.error("[v0] Registration error:", error)
      let errorMessage = "Erro ao criar conta"

      if (error.code === "auth/configuration-not-found") {
        errorMessage =
          "⚠️ Firebase Authentication não configurado!\n\nPara resolver:\n1. Acesse console.firebase.google.com\n2. Selecione seu projeto\n3. Vá em Authentication > Sign-in method\n4. Habilite Email/Password"
      } else if (error.message && error.message.includes("Firebase Authentication não está configurado")) {
        errorMessage = error.message
      } else if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está sendo usado"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido"
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Senha muito fraca"
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erro de conexão. Verifique sua internet"
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md gradient-card border-0 shadow-xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 gradient-romantic rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-serif text-foreground">Criem sua conta!</CardTitle>
        <CardDescription className="text-muted-foreground">
          Comecem a construir suas memórias especiais juntos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coupleName" className="text-sm font-medium">
              Nome do Casal
            </Label>
            <div className="relative">
              <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="coupleName"
                placeholder="João & Maria"
                value={formData.coupleName}
                onChange={(e) => handleChange("coupleName", e.target.value)}
                className="pl-10 bg-input border-border"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="partner1Name" className="text-sm font-medium">
                Primeiro Nome
              </Label>
              <Input
                id="partner1Name"
                placeholder="João"
                value={formData.partner1Name}
                onChange={(e) => handleChange("partner1Name", e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partner2Name" className="text-sm font-medium">
                Segundo Nome
              </Label>
              <Input
                id="partner2Name"
                placeholder="Maria"
                value={formData.partner2Name}
                onChange={(e) => handleChange("partner2Name", e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="casal@email.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
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
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 bg-input border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="pl-10 bg-input border-border"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm text-center whitespace-pre-line bg-destructive/10 p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full gradient-romantic hover:opacity-90 transition-opacity"
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta do casal"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já têm uma conta?{" "}
            <button onClick={onToggleMode} className="text-primary hover:text-primary/80 font-medium transition-colors">
              Fazer login
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
