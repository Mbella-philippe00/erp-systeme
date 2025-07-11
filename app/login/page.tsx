"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Eye, EyeOff, Github } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAppSettings } from "@/contexts/app-settings-context"
import { supabase } from "@/lib/supabase"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { settings } = useAppSettings()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setIsLoading(true)
  if (email === "mbellacriss@icloud.com" && password === "Blalarlphil2025") {
  login({
    id: "1",
    name: "Administrateur",
    email: "mbellacriss@icloud.com",
    role: "admin",
  });
  router.push("/");
} else if (email === "user@erp.com" && password === "user123") {
  login({
    id: "2",
    name: "Utilisateur",
    email: "user@erp.com",
    role: "user",
  });
  router.push("/");
} else {
  setError("Email ou mot de passe incorrect");
}


  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    setError("Email ou mot de passe incorrect")
  } else {
    router.push("/")
  }

  setIsLoading(false)
}
const handleSignup = async () => {
  setError("")
  setIsLoading(true)

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    setError("Impossible de créer un compte. Veuillez réessayer.")
  } else {
    router.push("/")
  }

  setIsLoading(false)
}



  const handleGoogleLogin = () => {
    // Simulation de connexion Google
    setIsLoading(true)
    setTimeout(() => {
      login({
        id: "3",
        name: "Utilisateur Google",
        email: "user@gmail.com",
        role: "user",
      })
      router.push("/")
    }, 1000)
  }

  const handleGithubLogin = () => {
    // Simulation de connexion GitHub
    setIsLoading(true)
    setTimeout(() => {
      login({
        id: "4",
        name: "Utilisateur GitHub",
        email: "user@github.com",
        role: "user",
      })
      router.push("/")
    }, 1000)
  }

  const backgroundStyle = settings.loginBackgroundImage
    ? {
        backgroundImage: `url(${settings.loginBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {}

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={backgroundStyle}>
      {/* Overlay pour améliorer la lisibilité */}
      {settings.loginBackgroundImage && <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />}

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-background/95">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">KEDIBUILD ERP</CardTitle>
          <CardDescription>Connectez-vous à votre espace de gestion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Boutons de connexion sociale */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </Button>

            <Button variant="outline" className="w-full" onClick={handleGithubLogin} disabled={isLoading}>
              <Github className="mr-2 h-4 w-4" />
              Continuer avec GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
            </div>
          </div>

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* Liens utiles */}
          <div className="text-center space-y-2">
            <Button variant="link" className="text-sm">
              Mot de passe oublié ?
            </Button>
            <div className="text-xs text-muted-foreground">
              Pas encore de compte ?{" "}
             <Button
              variant="link"
              className="text-xs p-0 h-auto"
              onClick={handleSignup}
              disabled={isLoading}
>
               Créer un compte
              </Button>


            </div>
          </div>

          {/* Comptes de test */}
          
        </CardContent>
      </Card>
    </div>
  )
}
