import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, DollarSign, FileText, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard-stats"

export default function Dashboard() {
  const recentActivities = [
    {
      type: "Vente",
      description: "",
      amount: "",
      time: "",
    },
    { type: "RH", description: "", amount: "", time: "" },
    {
      type: "Finance",
      description: "",
      amount: "",
      time: "",
    },
    { type: "Devis", description: "Devis généré pour projet immobilier", amount: "", time: "" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre entreprise</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Statistiques principales */}
      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Activités récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
            <CardDescription>Dernières actions dans le système</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{activity.type}</Badge>
                    <span className="text-sm font-medium">{activity.description}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.amount && <span className="text-sm font-semibold text-green-600">{activity.amount}</span>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/quotes">
                  <Target className="h-6 w-6 mb-2" />
                  Nouveau devis
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/finance">
                  <DollarSign className="h-6 w-6 mb-2" />
                  Créer facture
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/hr">
                  <Users className="h-6 w-6 mb-2" />
                  Gestion RH
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex-col">
                <Link href="/real-estate">
                  <FileText className="h-6 w-6 mb-2" />
                  Évaluation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
