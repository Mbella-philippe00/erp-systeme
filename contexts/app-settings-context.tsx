"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"

interface AppSettings {
  loginBackgroundImage: string
}

interface AppSettingsContextType {
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  uploadLoginBackground: (file: File) => Promise<void>
  removeLoginBackground: () => void
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const { theme } = useTheme()

  const [settings, setSettings] = useState<AppSettings>({
    loginBackgroundImage: "",
  })

  // Charger les paramètres depuis le localStorage au démarrage
  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem("appSettings", JSON.stringify(updatedSettings))

    toast({
      title: "Paramètres mis à jour",
      description: "Les paramètres ont été sauvegardés avec succès",
    })
  }

  const uploadLoginBackground = async (file: File) => {
    try {
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        throw new Error("Veuillez sélectionner un fichier image")
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Le fichier est trop volumineux. Taille maximum : 10MB")
      }

      // Convertir en base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        updateSettings({ loginBackgroundImage: imageUrl })
        toast({
          title: "Image de fond mise à jour",
          description: "L'image de fond de la page de connexion a été mise à jour",
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du téléchargement",
        variant: "destructive",
      })
    }
  }

  const removeLoginBackground = () => {
    updateSettings({ loginBackgroundImage: "" })
    toast({
      title: "Image supprimée",
      description: "L'image de fond a été supprimée",
    })
  }

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        uploadLoginBackground,
        removeLoginBackground,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  )
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext)
  if (context === undefined) {
    throw new Error("useAppSettings must be used within an AppSettingsProvider")
  }
  return context
}
