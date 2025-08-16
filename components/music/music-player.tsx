"use client"

import { useState } from "react"
import { useMusicPlayer } from "@/lib/music-player-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Heart,
  Minimize2,
  Maximize2,
  List,
} from "lucide-react"

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isLoading,
    playlist,
    togglePlay,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
  } = useMusicPlayer()

  const [isMinimized, setIsMinimized] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.7)
      setIsMuted(false)
    } else {
      setVolume(0)
      setIsMuted(true)
    }
  }

  const handleProgressChange = (value: number[]) => {
    seekTo(value[0])
  }

  if (!currentTrack) {
    return null
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="gradient-card border-0 shadow-xl">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={togglePlay}
                disabled={isLoading}
                className="gradient-romantic hover:opacity-90 transition-opacity w-10 h-10 p-0 rounded-full"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate max-w-[120px]">{currentTrack.title}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {currentTrack.artist || currentTrack.memoryTitle}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(false)} className="w-8 h-8 p-0">
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <Card className="gradient-card border-0 shadow-2xl rounded-t-xl rounded-b-none">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 gradient-romantic rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-medium text-foreground truncate">{currentTrack.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {currentTrack.artist || `Da memória: ${currentTrack.memoryTitle}`}
                </p>
              </div>
              <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                <Heart className="w-3 h-3 mr-1" />
                Memória
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowPlaylist(!showPlaylist)} className="w-8 h-8 p-0">
                <List className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(true)} className="w-8 h-8 p-0">
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleProgressChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={previousTrack}
                disabled={playlist.length <= 1}
                className="w-8 h-8 p-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                size="lg"
                onClick={togglePlay}
                disabled={isLoading}
                className="gradient-romantic hover:opacity-90 transition-opacity w-12 h-12 p-0 rounded-full"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={nextTrack}
                disabled={playlist.length <= 1}
                className="w-8 h-8 p-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <Button size="sm" variant="ghost" onClick={toggleMute} className="w-8 h-8 p-0">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Slider value={[volume]} max={1} step={0.1} onValueChange={handleVolumeChange} className="flex-1" />
            </div>

            {/* External Links */}
            <div className="flex items-center gap-2">
              {currentTrack.spotifyUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(currentTrack.spotifyUrl, "_blank")}
                  className="border-green-500 text-green-700 hover:bg-green-50"
                >
                  Spotify
                </Button>
              )}
              {currentTrack.youtubeUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(currentTrack.youtubeUrl, "_blank")}
                  className="border-red-500 text-red-700 hover:bg-red-50"
                >
                  YouTube
                </Button>
              )}
            </div>
          </div>

          {/* Playlist */}
          {showPlaylist && playlist.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <h5 className="font-medium text-foreground mb-2">Playlist ({playlist.length} músicas)</h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {playlist.map((track, index) => (
                  <div
                    key={track.id}
                    className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer hover:bg-muted/50 transition-colors ${
                      track.id === currentTrack.id ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                    onClick={() => {
                      // Implementar seleção de música da playlist
                      console.log("[v0] Selecionando música da playlist:", track.title)
                    }}
                  >
                    <span className="w-4 text-xs">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{track.title}</p>
                      <p className="text-xs opacity-75 truncate">{track.artist || track.memoryTitle}</p>
                    </div>
                    {track.id === currentTrack.id && (
                      <div className="w-4 h-4 gradient-romantic rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
