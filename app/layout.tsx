import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { MusicPlayerProvider } from "@/lib/music-player-context"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Mural do Amor - Memórias de Casal",
  description: "Crie e compartilhe memórias especiais com seu amor",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <MusicPlayerProvider>{children}</MusicPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
