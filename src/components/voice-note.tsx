import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext; // Add legacy webkitAudioContext
  }
}

interface VoiceNoteProps {
  audioBlob: Blob
}

export const VoiceNote: React.FC<VoiceNoteProps> = ({ audioBlob }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const startTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const context = new (window.AudioContext || (window).webkitAudioContext)()
    setAudioContext(context)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const audioBuffer = await context.decodeAudioData(arrayBuffer)
        setAudioBuffer(audioBuffer)
        setDuration(audioBuffer.duration)
      } catch (error) {
        console.error('Error decoding audio data:', error)
      }
    }
    reader.readAsArrayBuffer(audioBlob)

    return () => {
      context.close()
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [audioBlob])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !audioBuffer) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const data = audioBuffer.getChannelData(0)
    const step = Math.ceil(data.length / 40)
    const amp = height / 2

    ctx.clearRect(0, 0, width, height)

    const barWidth = 3
    const gap = 4
    let x = 0

    for (let i = 0; i < 40; i++) {
      let min = 1.0
      let max = -1.0
      
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j]
        if (datum < min) min = datum
        if (datum > max) max = datum
      }

      const magnitude = Math.max(Math.abs(min), Math.abs(max))
      const barHeight = magnitude * amp * 0.8

      const progress = currentTime / duration
      const isActive = i / 40 <= progress

      ctx.fillStyle = isActive ? '#EC4899' : '#EC4899' + '4D'
      ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight)
      x += barWidth + gap
    }
  }, [audioBuffer, currentTime, duration, canvasRef])

  useEffect(() => {
    drawWaveform()
  }, [currentTime, audioBuffer, drawWaveform])

  const updatePlaybackTime = () => {
    if (!audioContext || !startTimeRef.current) return
    
    setCurrentTime(audioContext.currentTime - startTimeRef.current)
    animationFrameRef.current = requestAnimationFrame(updatePlaybackTime)
  }

  const togglePlayPause = async () => {
    if (!audioContext || !audioBuffer) return

    if (isPlaying) {
      sourceNodeRef.current?.stop()
      setIsPlaying(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    } else {
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      sourceNodeRef.current = source

      startTimeRef.current = audioContext.currentTime - currentTime
      source.start(0, currentTime)
      setIsPlaying(true)
      
      source.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }

      updatePlaybackTime()
    }
  }

  return (
    <div className="bg-white rounded-full shadow-lg hover:shadow-2xl p-3 flex items-center gap-4 border-stone-300 w-[300px] z-50">
      <button
        onClick={togglePlayPause}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
          ${isPlaying 
            ? 'bg-pink-500 text-white hover:bg-pink-600' 
            : 'bg-pink-500 text-white hover:bg-pink-600'
          }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1">
        <canvas
          ref={canvasRef}
          width={160}
          height={40}
          className="w-full"
        />
      </div>

      <div className="text-sm text-gray-500 p-2 tabular-nums">
        {formatTime(duration)}
      </div>
    </div>
  )
}

