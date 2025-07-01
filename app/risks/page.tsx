"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Shield, TrendingUp, Plus, ChevronUp, ChevronDown } from "lucide-react"

export default function RisksPage() {
  const risks = [
    {
      id: "RISK-001",
      title: "Risque de liquidité",
      category: "Financier",
      severity: "Élevé",
      probability: "Moyenne",
      impact: "Élevé",
      status: "Actif",
      owner: "Directeur Financier",
    },
    {
      id: "RISK-002",
      title: "Perte de personnel clé",
      category: "RH",
      severity: "Moyen",
      probability: "Faible",
      impact: "Élevé",
      status: "Surveillé",
      owner: "DRH",
    },
    {
      id: "RISK-003",
      title: "Cyberattaque",
      category: "IT",
      severity: "Élevé",
      probability: "Moyenne",
      impact: "Très élevé",
      status: "Actif",
      owner: "DSI",
    },
  ]

  const kpis = [
    { name: "Efficacité opérationnelle", value: 87, target: 90, trend: "+2%" },
    { name: "Satisfaction client", value: 92, target: 95, trend: "+5%" },
    { name: "Rentabilité", value: 78, target: 80, trend: "+3%" },
    { name: "Innovation", value: 65, target: 75, trend: "-1%" },
  ]

  const [efficiencyData, setEfficiencyData] = useState([
    {
      id: 1,
      metric: "Temps de réponse",
      current: 24,
      target: 20,
      unit: "heures",
      progress: 83,
      trend: "amélioration"
    },
    {
      id: 2,
      metric: "Taux de résolution",
      current: 85,
      target: 95,
      unit: "%",
      progress: 89,
      trend: "stable"
    },
    {
      id: 3,
      metric: "Coût de mitigation",
      current: 250000,
      target: 200000,
      unit: "FCFA",
      progress: 75,
      trend: "détérioration"
    }
  ])

  const [dashboardData, setDashboardData] = useState({
    risquesCritiques: { total: 5, nouveaux: 2, resolus: 1 },
    performance: { score: 85, evolution: "+3%" },
    actions: { enCours: 12, planifiees: 8, terminees: 15 }
  })

  const handleMetricUpdate = (id: number, type: 'increase' | 'decrease') => {
    setEfficiencyData(prev => prev.map(item => {
      if (item.id === id) {
        const change = type === 'increase' ? 1 : -1
        const newCurrent = item.current + change
        return {
          ...item,
          current: newCurrent,
          progress: Math.round((newCurrent / item.target) * 100),
          trend: newCurrent > item.current ? 'amélioration' : 'détérioration'
        }
      }
      return item
    }))
  }

  const updateDashboardMetric = (category: keyof typeof dashboardData, metric: string, change: number) => {
    setDashboardData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [metric]: prev[category][metric] + change
      }
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des risques</h1>
          <p className="text-muted-foreground">Suivi des risques, performance et amélioration de l'efficacité</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau risque
          </Button>
        </div>
      </div>

      {/* Métriques de risques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risques actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-xs text-muted-foreground">+2 ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risques élevés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">Nécessitent attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Risques maîtrisés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">15</div>
            <p className="text-xs text-green-600">+3 ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score de risque global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72/100</div>
            <p className="text-xs text-green-600">+5 points</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">Registre des risques</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="efficiency">Efficacité</TabsTrigger>
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Registre des risques
              </CardTitle>
              <CardDescription>Identification et suivi des risques organisationnels</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Risque</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Sévérité</TableHead>
                    <TableHead>Probabilité</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Responsable</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">{risk.id}</TableCell>
                      <TableCell>{risk.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{risk.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            risk.severity === "Élevé"
                              ? "destructive"
                              : risk.severity === "Moyen"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {risk.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{risk.probability}</TableCell>
                      <TableCell>{risk.impact}</TableCell>
                      <TableCell>
                        <Badge variant={risk.status === "Actif" ? "destructive" : "secondary"}>{risk.status}</Badge>
                      </TableCell>
                      <TableCell>{risk.owner}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Suivi de la performance
              </CardTitle>
              <CardDescription>Indicateurs clés de performance (KPI)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {kpis.map((kpi, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{kpi.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Objectif: {kpi.target}% • Tendance: {kpi.trend}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{kpi.value}%</div>
                      </div>
                    </div>
                    <Progress value={kpi.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Amélioration de l'efficacité
              </CardTitle>
              <CardDescription>Suivi des indicateurs d'efficacité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {efficiencyData.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.metric}</div>
                        <div className="text-sm text-muted-foreground">
                          Objectif: {item.target} {item.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {item.current.toLocaleString()} {item.unit}
                        </div>
                        <div className={`text-sm ${item.trend === 'amélioration' ? 'text-green-600' : 
                          item.trend === 'stable' ? 'text-blue-600' : 'text-red-600'}`}>
                          {item.trend}
                        </div>
                      </div>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMetricUpdate(item.id, 'decrease')}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMetricUpdate(item.id, 'increase')}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Risques critiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.risquesCritiques.total}</div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Nouveaux</span>
                    <span className="font-medium">{dashboardData.risquesCritiques.nouveaux}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Résolus</span>
                    <span className="font-medium text-green-600">
                      {dashboardData.risquesCritiques.resolus}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Performance globale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.performance.score}%</div>
                <p className="text-xs text-green-600">{dashboardData.performance.evolution}</p>
                <Progress value={dashboardData.performance.score} className="mt-4 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>En cours</span>
                    <span className="font-medium">{dashboardData.actions.enCours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Planifiées</span>
                    <span className="font-medium">{dashboardData.actions.planifiees}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Terminées</span>
                    <span className="font-medium text-green-600">
                      {dashboardData.actions.terminees}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tableau de bord des risques</CardTitle>
              <CardDescription>Vue d'ensemble des métriques de risque</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Tableau de bord interactif en cours de développement...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
