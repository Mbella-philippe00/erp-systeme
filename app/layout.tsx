import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { DataProvider } from "@/contexts/data-context"
import { CompanyProvider } from "@/contexts/company-context"
import { AppSettingsProvider } from "@/contexts/app-settings-context"
import { Toaster } from "@/components/ui/toaster"
import { AppContent } from "@/components/app-content"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ERP System - Gestion d'entreprise",
  description: "Système de gestion intégré pour votre entreprise",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="erp-theme-preference"
        >
          <AppSettingsProvider>
            <AuthProvider>
              <CompanyProvider>
                <DataProvider>
                  <AppContent>{children}</AppContent>
                  <Toaster />
                </DataProvider>
              </CompanyProvider>
            </AuthProvider>
          </AppSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
