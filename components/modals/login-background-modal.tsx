"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { useAppSettings } from "@/contexts/app-settings-context"

interface LoginBackgroundModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginBackgroundModal({ open, onOpenChange }: LoginBackgroundModalProps) {
  const { settings, uploadLoginBackground, removeLoginBackground } = useAppSettings()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      await uploadLoginBackground(selectedFile)
      onOpenChange(false)
      setSelectedFile(null)
      setPreviewUrl("")
    } catch (error) {
      console.error("Erreur lors de l'upload:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveBackground = () => {
    removeLoginBackground()
    onOpenChange(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Image de fond - Page de connexion</DialogTitle>
          <DialogDescription>
            Personnalisez l'arrière-plan de votre page de connexion (PNG, JPG - Max 10MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image actuelle */}
          {settings.loginBackgroundImage && !selectedFile && (
            <div className="space-y-2">
              <Label>Image actuelle</Label>
              <div className="relative">
                <img
                  src={settings.loginBackgroundImage || "/placeholder.svg"}
                  alt="Arrière-plan actuel"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Aperçu</span>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveBackground} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Supprimer l'image de fond
              </Button>
            </div>
          )}

          {/* Zone de téléchargement */}
          <div className="space-y-2">
            <Label>Nouvelle image de fond</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <div className="space-y-2">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Aperçu"
                    className="w-full h-32 object-cover rounded mx-auto"
                  />
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Cliquez pour sélectionner</p>
                    <p className="text-xs text-gray-500">ou glissez-déposez votre image ici</p>
                  </div>
                </div>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setSelectedFile(null)
                setPreviewUrl("")
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Appliquer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
