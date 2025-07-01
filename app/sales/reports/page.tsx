"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, TrendingUp, TrendingDown, DollarSign, Users, Target, BarChart3 } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { formatCurrency } from "@/utils/currency"
import { SalesChart } from "@/components/charts/sales-chart"
import { ConversionChart } from "@/components/charts/conversion-chart"
import { TopClientsChart } from "@/components/charts/top-clients-chart"

export default function SalesReportsPage() {
  const { opportunities, clients, invoices } = useData()
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedYear, setSelectedYear] = useState("2025")

  // Calculs des métriques de ventes
  const totalRevenue = invoices.filter((inv) => inv.status === "Payée").reduce((sum, inv) => sum + inv.amount, 0)
  const totalOpportunities = opportunities.reduce((sum, opp) => sum + opp.value, 0)
  const averageDealSize = totalRevenue / invoices.filter((inv) => inv.status === "Payée").length || 0
  const conversionRate = (invoices.filter((inv) => inv.status === "Payée").length / opportunities.length) * 100 || 0

  // Données mensuelles simulées
  const monthlyData = [
    { month: "Jan", revenue: 0, opportunities: 12, deals: 8, conversion: 0 },
    { month: "Fév", revenue: 0, opportunities: 15, deals: 10, conversion: 0 },
    { month: "Mar", revenue: 0, opportunities: 18, deals: 12, conversion: 0 },
    { month: "Avr", revenue: 0, opportunities: 16, deals: 11, conversion: 0 },
    { month: "Mai", revenue: 0, opportunities: 20, deals: 14, conversion:  0},
    { month: "Jun", revenue: 0, opportunities: 22, deals: 16, conversion: 0 },
    { month: "Jul", revenue: 0, opportunities: 25, deals: 18, conversion: 0 },
    { month: "Aoû", revenue: 0, opportunities: 24, deals: 17, conversion: 0 },
    { month: "Sep", revenue: 0, opportunities: 28, deals: 20, conversion: 0 },
    { month: "Oct", revenue: 0, opportunities: 30, deals: 22, conversion: 0 },
    { month: "Nov", revenue: 0, opportunities: 32, deals: 24, conversion: 0 },
    { month: "Déc", revenue: 0, opportunities: 35, deals: 26, conversion: 0 },
  ]

  // Performance par commercial (simulé)
  const salesPerformance = [
    { name: "", revenue: 0, deals: 28, conversion: 78, target: 0 },
    { name: "", revenue: 0, deals: 22, conversion: 71, target: 0 },
    { name: "", revenue: 0, deals: 19, conversion: 68, target: 0 },
    { name: "", revenue: 0, deals: 16, conversion: 64, target: 0 },
    { name: "", revenue: 0, deals: 14, conversion: 62, target: 0 },
  ]

  // Top clients par revenus
  const topClients = [
    { name: "", revenue: 0, deals: 8, lastDeal: "2024-01-15" },
    { name: "", revenue: 0, deals: 6, lastDeal: "2024-01-20" },
    { name: "", revenue: 0, deals: 5, lastDeal: "2024-01-18" },
    { name: "", revenue: 0, deals: 4, lastDeal: "2024-01-22" },
    { name: "", revenue: 0, deals: 3, lastDeal: "2024-01-25" },
  ]

  // Analyse par secteur
  const sectorAnalysis = [
    { sector: "Technologie", revenue: 0, percentage: 35, deals: 28 },
    { sector: "Finance", revenue: 0, percentage: 25, deals: 20 },
    { sector: "Industrie", revenue: 0, percentage: 20, deals: 16 },
    { sector: "Commerce", revenue: 0, percentage: 15, deals: 12 },
    { sector: "Services", revenue: 0, percentage: 5, deals: 4 },
  ]

  const exportReport = () => {
    // Simulation d'export PDF
    alert("Rapport exporté en PDF (fonctionnalité simulée)")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapport de ventes</h1>
          <p className="text-muted-foreground">Analyse complète des performances commerciales</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semaine</SelectItem>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2025</SelectItem>
              <SelectItem value="2023">2024</SelectItem>
              <SelectItem value="2022">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              Chiffre d'affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4" />
              Taille moyenne des deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDealSize)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0% vs période précédente
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Nouveaux clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0 vs période précédente
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="sectors">Secteurs</TabsTrigger>
          <TabsTrigger value="forecast">Prévisions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Graphique des ventes mensuelles */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des ventes</CardTitle>
                <CardDescription>Chiffre d'affaires mensuel en FCFA</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesChart data={monthlyData} />
              </CardContent>
            </Card>

            {/* Graphique de conversion */}
            <Card>
              <CardHeader>
                <CardTitle>Taux de conversion</CardTitle>
                <CardDescription>Évolution du taux de conversion mensuel</CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionChart data={monthlyData} />
              </CardContent>
            </Card>
          </div>

          {/* Résumé mensuel */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé mensuel détaillé</CardTitle>
              <CardDescription>Performance mois par mois</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead>Chiffre d'affaires</TableHead>
                    <TableHead>Opportunités</TableHead>
                    <TableHead>Deals fermés</TableHead>
                    <TableHead>Taux conversion</TableHead>
                    <TableHead>Évolution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month, index) => {
                    const prevMonth = monthlyData[index - 1]
                    const growth = prevMonth ? ((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0
                    return (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month} 2025</TableCell>
                        <TableCell>{formatCurrency(month.revenue)}</TableCell>
                        <TableCell>{month.opportunities}</TableCell>
                        <TableCell>{month.deals}</TableCell>
                        <TableCell>{month.conversion}%</TableCell>
                        <TableCell>
                          <div className={`flex items-center ${growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {growth >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {Math.abs(growth).toFixed(1)}%
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance par commercial</CardTitle>
              <CardDescription>Classement des commerciaux par chiffre d'affaires</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commercial</TableHead>
                    <TableHead>Chiffre d'affaires</TableHead>
                    <TableHead>Deals fermés</TableHead>
                    <TableHead>Taux conversion</TableHead>
                    <TableHead>Objectif</TableHead>
                    <TableHead>Atteinte objectif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPerformance.map((person, index) => {
                    const achievementRate = (person.revenue / person.target) * 100
                    return (
                      <TableRow key={person.name}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">{person.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(person.revenue)}</TableCell>
                        <TableCell>{person.deals}</TableCell>
                        <TableCell>{person.conversion}%</TableCell>
                        <TableCell>{formatCurrency(person.target)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${achievementRate >= 100 ? "bg-green-500" : achievementRate >= 80 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${Math.min(achievementRate, 100)}%` }}
                              />
                            </div>
                            <span
                              className={`text-sm font-medium ${achievementRate >= 100 ? "text-green-600" : achievementRate >= 80 ? "text-yellow-600" : "text-red-600"}`}
                            >
                              {achievementRate.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 clients</CardTitle>
                <CardDescription>Classement par chiffre d'affaires généré</CardDescription>
              </CardHeader>
              <CardContent>
                <TopClientsChart data={topClients} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détails des top clients</CardTitle>
                <CardDescription>Informations détaillées</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>CA généré</TableHead>
                      <TableHead>Nb deals</TableHead>
                      <TableHead>Dernier deal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topClients.map((client, index) => (
                      <TableRow key={client.name}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">{client.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(client.revenue)}</TableCell>
                        <TableCell>{client.deals}</TableCell>
                        <TableCell>{client.lastDeal}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse par secteur d'activité</CardTitle>
              <CardDescription>Répartition du chiffre d'affaires par secteur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectorAnalysis.map((sector) => (
                  <div key={sector.sector} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{sector.sector}</span>
                        <Badge variant="outline">{sector.deals} deals</Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(sector.revenue)}</div>
                        <div className="text-sm text-muted-foreground">{sector.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${sector.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prévisions de ventes</CardTitle>
              <CardDescription>Projections basées sur les tendances actuelles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Prévision Q1 2025</Label>
                  <div className="text-2xl font-bold text-blue-600">{formatCurrency(0)}</div>
                  <p className="text-sm text-muted-foreground">Basé sur la tendance actuelle</p>
                </div>
                <div className="space-y-2">
                  <Label>Objectif Q1 2025</Label>
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(0)}</div>
                  <p className="text-sm text-muted-foreground">Objectif fixé</p>
                </div>
                <div className="space-y-2">
                  <Label>Probabilité d'atteinte</Label>
                  <div className="text-2xl font-bold text-orange-600">0%</div>
                  <p className="text-sm text-muted-foreground">Dépassement probable</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
