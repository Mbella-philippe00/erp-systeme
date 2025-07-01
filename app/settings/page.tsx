"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, ImageIcon, User, Shield, Bell, Palette } from "lucide-react"
import { useCompany } from "@/contexts/company-context"
import { useAuth } from "@/contexts/auth-context"
import { useAppSettings } from "@/contexts/app-settings-context"
import { LogoModal } from "@/components/modals/logo-modal"
import { CompanyInfoModal } from "@/components/modals/company-info-modal"
import { LoginBackgroundModal } from "@/components/modals/login-background-modal"

export default function SettingsPage() {
  const { companyInfo } = useCompany()
  const { user } = useAuth()
  const { settings } = useAppSettings()
  const [showLogoModal, setShowLogoModal] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(false)
  const [showLoginBackgroundModal, setShowLoginBackgroundModal] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les paramètres de votre application</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList>
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations de l'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Informations de l'entreprise
                </CardTitle>
                <CardDescription>Gérez les informations de base de votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Nom de l'entreprise</div>
                  <div className="text-sm text-muted-foreground">{companyInfo.name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Adresse</div>
                  <div className="text-sm text-muted-foreground">{companyInfo.address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Téléphone</div>
                    <div className="text-sm text-muted-foreground">{companyInfo.phone}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">{companyInfo.email}</div>
                  </div>
                </div>
                <Button onClick={() => setShowCompanyModal(true)} className="w-full">
                  Modifier les informations
                </Button>
              </CardContent>
            </Card>

            {/* Logo de l'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Logo de l'entreprise
                </CardTitle>
                <CardDescription>Téléchargez et gérez le logo de votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyInfo.logo ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <img
                        src={companyInfo.logo || "/placeholder.svg"}
                        alt="Logo entreprise"
                        className="max-h-24 max-w-full object-contain"
                      />
                    </div>
                    <Badge variant="outline" className="w-fit">
                      Logo configuré
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Aucun logo configuré</p>
                    </div>
                  </div>
                )}
                <Button onClick={() => setShowLogoModal(true)} className="w-full">
                  {companyInfo.logo ? "Modifier le logo" : "Ajouter un logo"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Image de fond de connexion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Page de connexion
                </CardTitle>
                <CardDescription>Personnalisez l'apparence de votre page de connexion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.loginBackgroundImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={settings.loginBackgroundImage || "/placeholder.svg"}
                        alt="Arrière-plan de connexion"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-medium">Aperçu</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      Image personnalisée
                    </Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Arrière-plan par défaut</p>
                    </div>
                  </div>
                )}
                <Button onClick={() => setShowLoginBackgroundModal(true)} className="w-full">
                  {settings.loginBackgroundImage ? "Modifier l'arrière-plan" : "Ajouter un arrière-plan"}
                </Button>
              </CardContent>
            </Card>

            {/* Thème */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Thème de l'application
                </CardTitle>
                <CardDescription>Le thème est géré via le bouton dans la sidebar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center text-muted-foreground">
                  <Palette className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Utilisez le bouton thème dans la sidebar pour basculer entre les modes clair et sombre</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profil utilisateur
              </CardTitle>
              <CardDescription>Gérez vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Nom</div>
                <div className="text-sm text-muted-foreground">{user?.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Rôle</div>
                <Badge variant="outline">{user?.role}</Badge>
              </div>
              <Button className="w-full" disabled>
                Modifier le profil (Bientôt disponible)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Sécurité
              </CardTitle>
              <CardDescription>Gérez vos paramètres de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Authentification à deux facteurs</div>
                    <div className="text-sm text-muted-foreground">Sécurisez votre compte avec 2FA</div>
                  </div>
                  <Button variant="outline" disabled>
                    Configurer
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Changer le mot de passe</div>
                    <div className="text-sm text-muted-foreground">Modifiez votre mot de passe</div>
                  </div>
                  <Button variant="outline" disabled>
                    Modifier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configurez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Notifications par email</div>
                    <div className="text-sm text-muted-foreground">Recevez des notifications par email</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Notifications push</div>
                    <div className="text-sm text-muted-foreground">Recevez des notifications dans le navigateur</div>
                  </div>
                  <input type="checkbox" className="rounded" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <LogoModal open={showLogoModal} onOpenChange={setShowLogoModal} />
      <CompanyInfoModal open={showCompanyModal} onOpenChange={setShowCompanyModal} />
      <LoginBackgroundModal open={showLoginBackgroundModal} onOpenChange={setShowLoginBackgroundModal} />
    </div>
  )
}
