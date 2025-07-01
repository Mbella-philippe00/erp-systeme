"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { useCompany } from "@/contexts/company-context"

interface LogoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoModal({ open, onOpenChange }: LogoModalProps) {
  const { companyInfo, updateCompanyInfo } = useCompany()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image")
        return
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier est trop volumineux. Taille maximum : 5MB")
        return
      }

      setSelectedFile(file)

      // Créer une URL de prévisualisation
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
      // Simuler l'upload (dans un vrai projet, vous uploaderiez vers un serveur)
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string
        updateCompanyInfo({ logo: logoUrl })
        onOpenChange(false)
        setSelectedFile(null)
        setPreviewUrl("")
      }
      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Erreur lors de l'upload:", error)
      alert("Erreur lors de l'upload du logo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    updateCompanyInfo({ logo: "" })
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
          <DialogTitle>Logo de l'entreprise</DialogTitle>
          <DialogDescription>Téléchargez le logo de votre entreprise (PNG, JPG, SVG - Max 5MB)</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Logo actuel */}
          {companyInfo.logo && !selectedFile && (
            <div className="space-y-2">
              <Label>Logo actuel</Label>
              <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                <img
                  src={companyInfo.logo || "/placeholder.svg"}
                  alt="Logo entreprise"
                  className="max-h-20 max-w-full object-contain"
                />
              </div>
              <Button variant="outline" size="sm" onClick={handleRemoveLogo} className="w-full">
                <X className="mr-2 h-4 w-4" />
                Supprimer le logo
              </Button>
            </div>
          )}

          {/* Zone de téléchargement */}
          <div className="space-y-2">
            <Label>Nouveau logo</Label>
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
                    className="max-h-20 max-w-full object-contain mx-auto"
                  />
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Cliquez pour sélectionner</p>
                    <p className="text-xs text-gray-500">ou glissez-déposez votre fichier ici</p>
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
                  Télécharger
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
