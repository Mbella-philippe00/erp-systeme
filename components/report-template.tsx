"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Download } from "lucide-react"

interface ReportTemplateProps {
  onExport: (templateId: string | null) => void
  moduleTitle: string
}

export function ReportTemplate({ onExport, moduleTitle }: ReportTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.match(/\.(docx|pdf)$/)) {
        toast({
          title: "Format non supporté",
          description: "Veuillez télécharger un fichier .docx ou .pdf",
          variant: "destructive",
        })
        return
      }
      setTemplateFile(file)
      const templateId = `template-${Date.now()}`
      setSelectedTemplate(templateId)
      toast({
        title: "Modèle téléchargé",
        description: `Le modèle ${file.name} a été téléchargé avec succès`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="template">Modèle de rapport {moduleTitle}</Label>
          <Input
            id="template"
            type="file"
            accept=".docx,.pdf"
            onChange={handleTemplateUpload}
          />
        </div>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => onExport(selectedTemplate)}
          disabled={!selectedTemplate}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>
    </div>
  )
}
