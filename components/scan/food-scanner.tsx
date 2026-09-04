'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Upload, X, Sparkles, Loader2, RotateCcw, ImageIcon, KeyRound } from 'lucide-react'
import { Card, Label, Textarea } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { ReviewModal, type ReviewPayload } from './review-modal'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import { analyzeFoodImage, GeminiError } from '@/lib/gemini'
import { fileToDataUrl } from '@/lib/helpers'

export function FoodScanner({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { data } = useStore()
  const toast = useToast()
  const hasKey = !!data.settings.apiKey

  const [image, setImage] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraOn, setCameraOn] = useState(false)
  const [review, setReview] = useState<ReviewPayload | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  useEffect(() => () => stopCamera(), [])

  const startCamera = async () => {
    setImage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      setCameraOn(true)
      // wait for element to mount
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      })
    } catch {
      toast.error('Camera unavailable', 'Grant camera access or upload a photo instead.')
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setImage(canvas.toDataURL('image/jpeg', 0.85))
    stopCamera()
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Not an image', 'Please choose an image file.')
      return
    }
    try {
      const url = await fileToDataUrl(file)
      stopCamera()
      setImage(url)
    } catch {
      toast.error('Could not read file')
    }
    e.target.value = ''
  }

  const analyze = async () => {
    if (!hasKey) {
      toast.warning('API key needed', 'Add your Gemini key in Settings to scan meals.')
      onOpenSettings()
      return
    }
    if (!image) return
    setLoading(true)
    try {
      const analysis = await analyzeFoodImage(data.settings.apiKey, image, note.trim() || undefined)
      setReview({ analysis, image, note: note.trim() || undefined })
    } catch (err) {
      const msg = err instanceof GeminiError ? err.message : 'Something went wrong analyzing the image.'
      toast.error('Scan failed', msg)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setImage(null)
    setNote('')
    stopCamera()
  }

  return (
    <div className="flex flex-col gap-4">
      {!hasKey && (
        <Card className="flex items-center gap-3 border-warning/40 bg-warning/10 p-4">
          <KeyRound className="size-5 shrink-0 text-warning" />
          <div className="flex-1 text-sm">
            <p className="font-medium">No Gemini API key set</p>
            <p className="text-muted-foreground">Add your key to enable AI food scanning.</p>
          </div>
          <Button size="sm" variant="outline" onClick={onOpenSettings}>
            Add key
          </Button>
        </Card>
      )}

      <Card className="overflow-hidden">
        {/* Preview area */}
        <div className="relative flex aspect-[4/3] items-center justify-center bg-muted">
          {cameraOn ? (
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          ) : image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image || '/placeholder.svg'} alt="Meal to analyze" className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="size-10" />
              <p className="text-sm">Capture or upload a photo of your meal</p>
            </div>
          )}

          {(image || cameraOn) && (
            <button
              onClick={reset}
              className="absolute right-3 top-3 rounded-full bg-foreground/60 p-1.5 text-background transition-colors hover:bg-foreground/80"
              aria-label="Clear image"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          {cameraOn ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={stopCamera}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button onClick={capture}>
                <Camera className="size-4" />
                Capture
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={startCamera}>
                <Camera className="size-4" />
                {image ? 'Retake' : 'Camera'}
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="size-4" />
                Upload
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />

          <div>
            <Label htmlFor="scan-note">Context note (optional)</Label>
            <Textarea
              id="scan-note"
              value={note}
              placeholder='e.g. "Cooked in 1 tbsp olive oil" or "Half portion eaten"'
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button size="lg" disabled={!image || loading} onClick={analyze}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Analyze with AI
              </>
            )}
          </Button>
          {image && !loading && (
            <Button variant="ghost" size="sm" onClick={reset} className="mx-auto">
              <RotateCcw className="size-3.5" />
              Start over
            </Button>
          )}
        </div>
      </Card>

      <ReviewModal payload={review} onClose={() => setReview(null)} />
    </div>
  )
}
