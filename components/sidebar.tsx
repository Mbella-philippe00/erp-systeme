"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Shield,
  Calculator,
  Building,
  LogOut,
  Settings,
  FolderKanban,
} from "lucide-react"
import { useCompany } from "@/contexts/company-context"
import { LogoModal } from "@/components/modals/logo-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

const navigation = [
  {
    name: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Finance & Comptabilité",
    href: "/finance",
    icon: DollarSign,
  },
  {
    name: "Ressources Humaines",
    href: "/hr",
    icon: Users,
  },
  {
    name: "Ventes & CRM",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Gestion de projets",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Gestion des risques",
    href: "/risks",
    icon: Shield,
  },
  {
    name: "Calcul de devis",
    href: "/quotes",
    icon: Calculator,
  },
  {
    name: "Évaluation immobilière",
    href: "/real-estate",
    icon: Building,
  },
  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { companyInfo } = useCompany()
  const [showLogoModal, setShowLogoModal] = useState(false)

  return (
    <div className="w-64 border-r bg-muted/40">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            {companyInfo.logo ? (
              <img src={companyInfo.logo || "/placeholder.svg"} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <TrendingUp className="h-6 w-6" />
            )}
            <span className="truncate">{companyInfo.name}</span>
          </Link>
          <div className="ml-auto flex items-center space-x-1">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setShowLogoModal(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", pathname === item.href && "bg-secondary")}
                >
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>

        {/* Profil utilisateur */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
        <LogoModal open={showLogoModal} onOpenChange={setShowLogoModal} />
      </div>
    </div>
  )
}
