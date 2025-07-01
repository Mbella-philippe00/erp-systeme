"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

interface CompanyInfo {
  name: string
  logo: string
  address: string
  phone: string
  email: string
  website: string
  siret: string
}

interface CompanyContextType {
  companyInfo: CompanyInfo
  updateCompanyInfo: (info: Partial<CompanyInfo>) => void
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "KEDIBUILD",
    logo: "",
    address: "Deïdo, 768 Rue Frédéric Ekwalla Essaka, 1721 Rue Kotto, BP : 5335, Douala - Cameroun",
    phone: "+237 233 416 504 ",
    email: "contact@groupe-kedibuild.com",
    website: "www.groupe-kedibuild.com",
    siret: "CM-YAO-2024-B-12345",
  })

  // Charger les informations depuis le localStorage au démarrage
  useEffect(() => {
    const savedCompanyInfo = localStorage.getItem("companyInfo")
    if (savedCompanyInfo) {
      setCompanyInfo(JSON.parse(savedCompanyInfo))
    }
  }, [])

  const updateCompanyInfo = (info: Partial<CompanyInfo>) => {
    const updatedInfo = { ...companyInfo, ...info }
    setCompanyInfo(updatedInfo)
    localStorage.setItem("companyInfo", JSON.stringify(updatedInfo))

    if (info.logo !== undefined) {
      if (info.logo) {
        toast({ title: "Logo mis à jour", description: "Le logo de l'entreprise a été mis à jour avec succès" })
      } else {
        toast({ title: "Logo supprimé", description: "Le logo de l'entreprise a été supprimé" })
      }
    } else {
      toast({
        title: "Informations mises à jour",
        description: "Les informations de l'entreprise ont été sauvegardées",
      })
    }
  }

  return <CompanyContext.Provider value={{ companyInfo, updateCompanyInfo }}>{children}</CompanyContext.Provider>
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return context
}
