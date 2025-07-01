"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign, FileText, AlertTriangle } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { formatCurrency } from "@/utils/currency"

export function DashboardStats() {
  const { invoices, employees, risks } = useData()

  // Calculs des statistiques
  const totalRevenue = invoices.filter((inv) => inv.status === "Payée").reduce((sum, inv) => sum + inv.amount, 0)

  const activeEmployees = employees.filter((emp) => emp.status === "Actif").length
  const pendingInvoices = invoices.filter((inv) => inv.status === "En attente").length
  const activeRisks = risks.filter((risk) => risk.status === "Actif").length

  const stats = [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(totalRevenue),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Employés actifs",
      value: activeEmployees.toString(),
      change: "+3",
      trend: "up",
      icon: Users,
    },
    {
      title: "Factures en attente",
      value: pendingInvoices.toString(),
      change: "-5",
      trend: "down",
      icon: FileText,
    },
    {
      title: "Risques identifiés",
      value: activeRisks.toString(),
      change: "+2",
      trend: "up",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span className="ml-1">par rapport au mois dernier</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
