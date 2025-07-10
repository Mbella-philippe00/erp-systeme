"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/utils/currency"
import { useData } from "@/contexts/data-context"
import { CashFlowChart } from "@/components/charts/cash-flow-chart"
import { BankAccountModal } from "@/components/modals/bank-account-modal"
import { TransactionModal } from "@/components/modals/transaction-modal"
import { ReportTemplate } from "@/components/report-template"

export default function TreasuryPage() {
  const { bankAccounts, cashTransactions } = useData()
  const [showBankAccountModal, setShowBankAccountModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedAccount, setSelectedAccount] = useState("all")

  // Filtrer les transactions
  const filteredTransactions = cashTransactions
    .filter((transaction) => {
      // Filtre par période
      const transactionDate = new Date(transaction.date)
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

      let matchesPeriod = true
      if (selectedPeriod === "current-month") {
        matchesPeriod = transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth
      } else if (selectedPeriod === "current-year") {
        matchesPeriod = transactionDate >= firstDayOfYear
      } else if (selectedPeriod === "previous-month") {
        const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        matchesPeriod = transactionDate >= firstDayOfPrevMonth && transactionDate <= lastDayOfPrevMonth
      }

      // Filtre par compte
      const matchesAccount = selectedAccount === "all" || transaction.accountId === selectedAccount

      return matchesPeriod && matchesAccount
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calcul des totaux
  const totalInflow = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.type === "inflow" ? transaction.amount : 0),
    0,
  )
  const totalOutflow = filteredTransactions.reduce(
    (sum, transaction) => sum + (transaction.type === "outflow" ? transaction.amount : 0),
    0,
  )
  const netCashFlow = totalInflow - totalOutflow

  // Calcul des soldes des comptes bancaires
  const accountBalances = bankAccounts.map((account) => {
    const accountTransactions = cashTransactions.filter((transaction) => transaction.accountId === account.id)
    const inflows = accountTransactions.reduce(
      (sum, transaction) => sum + (transaction.type === "inflow" ? transaction.amount : 0),
      0,
    )
    const outflows = accountTransactions.reduce(
      (sum, transaction) => sum + (transaction.type === "outflow" ? transaction.amount : 0),
      0,
    )
    const balance = account.initialBalance + inflows - outflows
    return { ...account, balance }
  })

  // Données pour le graphique de flux de trésorerie
  const cashFlowData = [
    { month: "Jan", inflow: 0, outflow: 0 },
    { month: "Fév", inflow: 0, outflow: 0 },
    { month: "Mar", inflow: 0, outflow: 0 },
    { month: "Avr", inflow: 0, outflow: 0 },
    { month: "Mai", inflow: 0, outflow: 0 },
    { month: "Jun", inflow: 0, outflow:0 },
    { month: "Jul", inflow: 0, outflow: 0 },
    { month: "Aoû", inflow: 0, outflow: 0 },
    { month: "Sep", inflow: 0, outflow: 0 },
    { month: "Oct", inflow: 0, outflow: 0 },
    { month: "Nov", inflow: 0, outflow: 0 },
    { month: "Déc", inflow: 0, outflow: 0 },
  ]

  // Prévisions de trésorerie
  const forecastData = [
    { month: "Jan", forecast: 0, actual: 0 },
    { month: "Fév", forecast: 0, actual: 0 },
    { month: "Mar", forecast: 0, actual: 0 },
    { month: "Avr", forecast: 0, actual: 0 },
    { month: "Mai", forecast: 0, actual: 0 },
    { month: "Jun", forecast: 0, actual: 0 },
    { month: "Jul", forecast: 0, actual: 0 },
    { month: "Aoû", forecast: 0, actual: 0 },
    { month: "Sep", forecast: 0, actual: 0 },
    { month: "Oct", forecast: 0, actual: 0 },
    { month: "Nov", forecast: 0, actual: 0 },
    { month: "Déc", forecast: 0, actual: 0 },
  ]

  // Total de trésorerie disponible
  const totalCash = accountBalances.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trésorerie</h1>
          <p className="text-muted-foreground">Gestion des flux de trésorerie et des comptes bancaires</p>
        </div>
        <ReportTemplate onExport={(templateId) => {
          const message = templateId 
            ? `Rapport de trésorerie exporté avec le modèle ${templateId}` 
            : "Rapport de trésorerie exporté avec le modèle par défaut"
          alert(message)
        }} moduleTitle="Trésorerie" />
        <div className="flex space-x-2">
          <Button onClick={() => setShowTransactionModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle transaction
          </Button>
          <Button variant="outline" onClick={() => setShowBankAccountModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau compte
          </Button>
        </div>
      </div>

      {/* Métriques de trésorerie */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trésorerie disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCash)}</div>
            <p className="text-xs text-muted-foreground">Tous comptes confondus</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalInflow)}</div>
            <p className="text-xs text-muted-foreground">Période sélectionnée</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOutflow)}</div>
            <p className="text-xs text-muted-foreground">Période sélectionnée</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Flux net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netCashFlow)}
            </div>
            <div className="flex items-center text-xs">
              {netCashFlow >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              <span className={netCashFlow >= 0 ? "text-green-600" : "text-red-600"}>
                {netCashFlow >= 0 ? "Excédent" : "Déficit"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Comptes bancaires</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cashflow">Flux de trésorerie</TabsTrigger>
          <TabsTrigger value="forecast">Prévisions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comptes bancaires</CardTitle>
              <CardDescription>Suivi des soldes de tous les comptes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Banque</TableHead>
                    <TableHead>Numéro de compte</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Solde initial</TableHead>
                    <TableHead className="text-right">Entrées</TableHead>
                    <TableHead className="text-right">Sorties</TableHead>
                    <TableHead className="text-right">Solde actuel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountBalances.map((account) => {
                    const accountTransactions = cashTransactions.filter(
                      (transaction) => transaction.accountId === account.id,
                    )
                    const inflows = accountTransactions.reduce(
                      (sum, transaction) => sum + (transaction.type === "inflow" ? transaction.amount : 0),
                      0,
                    )
                    const outflows = accountTransactions.reduce(
                      (sum, transaction) => sum + (transaction.type === "outflow" ? transaction.amount : 0),
                      0,
                    )

                    return (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">{account.bankName}</TableCell>
                        <TableCell>{account.accountNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(account.initialBalance)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(inflows)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(outflows)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(account.balance)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <tfoot>
                  <tr>
                    <td colSpan={6} className="py-2 px-4 font-medium text-right">
                      Total:
                    </td>
                    <td className="py-2 px-4 font-medium text-right">{formatCurrency(totalCash)}</td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions de trésorerie</CardTitle>
              <CardDescription>Historique des mouvements de trésorerie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="w-[200px]">
                  <Label htmlFor="period" className="mb-2 block">
                    Période
                  </Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger id="period" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current-month">Mois courant</SelectItem>
                      <SelectItem value="previous-month">Mois précédent</SelectItem>
                      <SelectItem value="current-year">Année courante</SelectItem>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[250px]">
                  <Label htmlFor="account" className="mb-2 block">
                    Compte
                  </Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger id="account" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les comptes</SelectItem>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bankName} - {account.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        Aucune transaction trouvée pour cette période
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                      const account = bankAccounts.find((a) => a.id === transaction.accountId)
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>
                            {account?.bankName} - {account?.accountNumber.slice(-4)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.category}</Badge>
                          </TableCell>
                          <TableCell>{transaction.reference}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={transaction.type === "inflow" ? "default" : "destructive"}
                              className={
                                transaction.type === "inflow"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {transaction.type === "inflow" ? "Entrée" : "Sortie"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td colSpan={5} className="py-2 px-4 font-medium text-right">
                      Total:
                    </td>
                    <td className="py-2 px-4 font-medium text-right">{formatCurrency(netCashFlow)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des flux de trésorerie</CardTitle>
              <CardDescription>Évolution mensuelle des entrées et sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <CashFlowChart data={cashFlowData} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détail des flux par mois</CardTitle>
              <CardDescription>Analyse mensuelle des entrées et sorties</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mois</TableHead>
                    <TableHead className="text-right">Entrées</TableHead>
                    <TableHead className="text-right">Sorties</TableHead>
                    <TableHead className="text-right">Flux net</TableHead>
                    <TableHead className="text-right">Évolution</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashFlowData.map((month, index) => {
                    const netFlow = month.inflow - month.outflow
                    const prevMonth = cashFlowData[index - 1]
                    const prevNetFlow = prevMonth ? prevMonth.inflow - prevMonth.outflow : 0
                    const growth = prevMonth ? ((netFlow - prevNetFlow) / prevNetFlow) * 100 : 0

                    return (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month} 2025</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(month.inflow)}</TableCell>
                        <TableCell className="text-right text-red-600">{formatCurrency(month.outflow)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${netFlow >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(netFlow)}
                        </TableCell>
                        <TableCell className="text-right">
                          {index > 0 && (
                            <div
                              className={`flex items-center justify-end ${growth >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {growth >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(growth).toFixed(1)}%
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prévisions de trésorerie</CardTitle>
              <CardDescription>Projections et réalisations des flux de trésorerie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-80">
                  <div className="relative h-full">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                      {/* Grille */}
                      {[0, 25, 50, 75, 100].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={200 - y * 2}
                          x2="400"
                          y2={200 - y * 2}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}

                      {/* Ligne de prévision */}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeDasharray="5,5"
                        points={forecastData
                          .map((item, index) => {
                            const x = (index / (forecastData.length - 1)) * 400
                            const maxForecast = Math.max(...forecastData.map((d) => d.forecast))
                            const y = 200 - (item.forecast / maxForecast) * 180
                            return `${x},${y}`
                          })
                          .join(" ")}
                      />

                      {/* Ligne de réalisation */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        points={forecastData
                          .filter((item) => item.actual > 0)
                          .map((item, index) => {
                            const itemIndex = forecastData.findIndex((d) => d.month === item.month)
                            const x = (itemIndex / (forecastData.length - 1)) * 400
                            const maxForecast = Math.max(...forecastData.map((d) => d.forecast))
                            const y = 200 - (item.actual / maxForecast) * 180
                            return `${x},${y}`
                          })
                          .join(" ")}
                      />

                      {/* Points de prévision */}
                      {forecastData.map((item, index) => {
                        const x = (index / (forecastData.length - 1)) * 400
                        const maxForecast = Math.max(...forecastData.map((d) => d.forecast))
                        const y = 200 - (item.forecast / maxForecast) * 180
                        return <circle key={`forecast-${index}`} cx={x} cy={y} r="4" fill="#3b82f6" />
                      })}

                      {/* Points de réalisation */}
                      {forecastData
                        .filter((item) => item.actual > 0)
                        .map((item, index) => {
                          const itemIndex = forecastData.findIndex((d) => d.month === item.month)
                          const x = (itemIndex / (forecastData.length - 1)) * 400
                          const maxForecast = Math.max(...forecastData.map((d) => d.forecast))
                          const y = 200 - (item.actual / maxForecast) * 180
                          return <circle key={`actual-${index}`} cx={x} cy={y} r="4" fill="#10b981" />
                        })}
                    </svg>

                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                      {forecastData.map((item, index) => (
                        <span key={index}>{item.month}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-8">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm">Prévision</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm">Réalisation</span>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mois</TableHead>
                      <TableHead className="text-right">Prévision</TableHead>
                      <TableHead className="text-right">Réalisation</TableHead>
                      <TableHead className="text-right">Écart</TableHead>
                      <TableHead className="text-right">% Atteinte</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecastData.map((item) => {
                      const variance = item.actual - item.forecast
                      const achievementRate = item.actual > 0 ? (item.actual / item.forecast) * 100 : 0

                      return (
                        <TableRow key={item.month}>
                          <TableCell className="font-medium">{item.month} 2024</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.forecast)}</TableCell>
                          <TableCell className="text-right">
                            {item.actual > 0 ? formatCurrency(item.actual) : "-"}
                          </TableCell>
                          <TableCell
                            className={`text-right ${
                              item.actual > 0
                                ? variance >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {item.actual > 0 ? (
                              <>
                                {variance >= 0 ? "+" : ""}
                                {formatCurrency(variance)}
                              </>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.actual > 0 ? (
                              <div className="flex items-center justify-end">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      achievementRate >= 100
                                        ? "bg-green-500"
                                        : achievementRate >= 80
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                    }`}
                                    style={{ width: `${Math.min(achievementRate, 100)}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-sm ${
                                    achievementRate >= 100
                                      ? "text-green-600"
                                      : achievementRate >= 80
                                        ? "text-yellow-600"
                                        : "text-red-600"
                                  }`}
                                >
                                  {achievementRate.toFixed(0)}%
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <CardTitle>Alerte de trésorerie</CardTitle>
                  <CardDescription>Prévisions de trésorerie critiques</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Seuil de trésorerie minimum</h3>
                    <p className="text-sm text-muted-foreground">Niveau d'alerte: 0</p>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Attention
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Trésorerie actuelle:</span>
                    <span className="font-medium">{formatCurrency(totalCash)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Prévision à 30 jours:</span>
                    <span className="font-medium">{formatCurrency(totalCash - 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Prévision à 60 jours:</span>
                    <span className="font-medium text-amber-600">{formatCurrency(totalCash - 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Prévision à 90 jours:</span>
                    <span className="font-medium text-red-600">{formatCurrency(totalCash - 0)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-amber-700">
                    <strong>Recommandation:</strong> Surveillez attentivement les sorties de trésorerie des 60 prochains
                    jours. Envisagez de reporter certaines dépenses non essentielles ou d'accélérer les encaissements.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BankAccountModal open={showBankAccountModal} onOpenChange={setShowBankAccountModal} />
      <TransactionModal open={showTransactionModal} onOpenChange={setShowTransactionModal} />
    </div>
  )
}
