"use client"

import type React from "react"

import { createContext, useContext, useState, useRef, useEffect } from "react"

interface Track {
  id: string
  title: string
  artist?: string
  url?: string
  spotifyUrl?: string
  youtubeUrl?: string
  memoryId: string
  memoryTitle: string
}

interface MusicPlayerContextType {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  isLoading: boolean
  playlist: Track[]
  playTrack: (track: Track) => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  seekTo: (time: number) => void
  nextTrack: () => void
  previousTrack: () => void
  addToPlaylist: (track: Track) => void
  removeFromPlaylist: (trackId: string) => void
  clearPlaylist: () => void
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined)

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.7)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [playlist, setPlaylist] = useState<Track[]>([])

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleEnded = () => {
      setIsPlaying(false)
      nextTrack()
    }
    const handleError = () => {
      setIsLoading(false)
      console.log("[v0] Erro ao carregar música:", currentTrack?.title)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.pause()
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const playTrack = (track: Track) => {
    if (!audioRef.current) return

    console.log("[v0] Tocando música:", track.title)

    setCurrentTrack(track)
    setIsLoading(true)

    // Se não tem URL de arquivo, simular reprodução
    if (!track.url) {
      console.log("[v0] Simulando reprodução de música (sem arquivo de áudio)")
      setIsLoading(false)
      setIsPlaying(true)
      setDuration(180) // 3 minutos simulados

      // Simular progresso da música
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 180) {
            clearInterval(interval)
            setIsPlaying(false)
            nextTrack()
            return 0
          }
          return prev + 1
        })
      }, 1000)

      return
    }

    audioRef.current.src = track.url
    audioRef.current.load()
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true)
      })
      .catch((error) => {
        console.error("Erro ao reproduzir música:", error)
        setIsLoading(false)
      })
  }

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      console.log("[v0] Música pausada:", currentTrack.title)
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
          console.log("[v0] Música retomada:", currentTrack.title)
        })
        .catch((error) => {
          console.error("Erro ao retomar música:", error)
        })
    }
  }

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume)
    console.log("[v0] Volume alterado para:", Math.round(newVolume * 100) + "%")
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
      console.log("[v0] Música avançada para:", Math.round(time) + "s")
    }
  }

  const nextTrack = () => {
    if (playlist.length === 0) return

    const currentIndex = playlist.findIndex((track) => track.id === currentTrack?.id)
    const nextIndex = (currentIndex + 1) % playlist.length
    playTrack(playlist[nextIndex])
  }

  const previousTrack = () => {
    if (playlist.length === 0) return

    const currentIndex = playlist.findIndex((track) => track.id === currentTrack?.id)
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    playTrack(playlist[prevIndex])
  }

  const addToPlaylist = (track: Track) => {
    setPlaylist((prev) => {
      const exists = prev.find((t) => t.id === track.id)
      if (exists) return prev
      console.log("[v0] Música adicionada à playlist:", track.title)
      return [...prev, track]
    })
  }

  const removeFromPlaylist = (trackId: string) => {
    setPlaylist((prev) => {
      const filtered = prev.filter((t) => t.id !== trackId)
      console.log("[v0] Música removida da playlist")
      return filtered
    })
  }

  const clearPlaylist = () => {
    setPlaylist([])
    console.log("[v0] Playlist limpa")
  }

  const value = {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    playlist,
    playTrack,
    togglePlay,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
  }

  return <MusicPlayerContext.Provider value={value}>{children}</MusicPlayerContext.Provider>
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (context === undefined) {
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider")
  }
  return context
}
