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
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .loading-fallback {
              min-height: 100vh;
              background: linear-gradient(135deg, #fffbeb 0%, #fed7aa 50%, #fdba74 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .loading-spinner {
              width: 4rem;
              height: 4rem;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%);
              border-radius: 50%;
              margin: 0 auto 1rem auto;
              animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
            .loading-text {
              color: #6b7280;
              text-align: center;
            }
          `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <MusicPlayerProvider>{children}</MusicPlayerProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
