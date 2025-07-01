"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Download, BarChart3, FileText, Calculator, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useData } from "@/contexts/data-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/currency"
import { useState } from "react"
import { InvoiceModal } from "@/components/modals/invoice-modal"
import { AccountingEntryModal } from "@/components/modals/accounting-entry-modal"
import { TransactionModal } from "@/components/modals/transaction-modal"
import { CashFlowChart } from "@/components/charts/cash-flow-chart"

export default function FinancePage() {
  const { invoices = [], accountingEntries = [], bankAccounts = [], cashTransactions = [] } = useData()
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showAccountingEntryModal, setShowAccountingEntryModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  // Calculs des métriques
  const monthlyRevenue = invoices.filter((inv) => inv.status === "Payée").reduce((sum, inv) => sum + inv.amount, 0)
  const monthlyExpenses = 0 // Simulation en FCFA
  const netProfit = monthlyRevenue - monthlyExpenses
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0

  // Calcul de la trésorerie totale
  const totalCash = bankAccounts.reduce((sum, account) => {
    const accountTransactions = cashTransactions.filter((transaction) => transaction.accountId === account.id) || []
    const inflows = accountTransactions.reduce(
      (sum, transaction) => sum + (transaction.type === "inflow" ? transaction.amount : 0),
      0,
    )
    const outflows = accountTransactions.reduce(
      (sum, transaction) => sum + (transaction.type === "outflow" ? transaction.amount : 0),
      0,
    )
    return sum + account.initialBalance + inflows - outflows
  }, 0)

  // Données pour le graphique de flux de trésorerie (derniers 6 mois)
  const cashFlowData = [
    { month: "Août", inflow: 0, outflow: 0 },
    { month: "Sept", inflow: 0, outflow: 0 },
    { month: "Oct", inflow: 0, outflow: 0 },
    { month: "Nov", inflow: 0, outflow: 0 },
    { month: "Déc", inflow: 0, outflow: 0 },
    { month: "Jan", inflow: 0, outflow: 0 },
  ]

  const expenses = [
    {
      id: "",
      description: "",
      amount: 0,
      category: "",
      date: "",
    },
    {
      id: "",
      description: "",
      amount: 0,
      category: "",
      date: "",
    },
    { id: "", description: "", amount: 0, category: "", date: "" },
  ]

  // Récentes écritures comptables
  const recentEntries = accountingEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Récentes transactions de trésorerie
  const recentTransactions = cashTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance & Comptabilité</h1>
          <p className="text-muted-foreground">Gestion financière et comptabilité générale</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/finance/accounting">
              <BookOpen className="mr-2 h-4 w-4" />
              Comptabilité
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/finance/treasury">
              <BookOpen className="mr-2 h-4 w-4" />
              Trésorerie
            </Link>
          </Button>
          <Button onClick={() => setShowInvoiceModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      {/* Métriques financières */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenus du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-green-600">+0% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dépenses du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-red-600">+0% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bénéfice net</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netProfit)}</div>
            <div className="flex items-center text-xs">
              <span className={profitMargin >= 0 ? "text-green-600" : "text-red-600"}>
                Marge: {profitMargin.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCash)}</div>
            <p className="text-xs text-muted-foreground">Solde actuel</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de flux de trésorerie */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des flux de trésorerie</CardTitle>
          <CardDescription>Évolution des entrées et sorties sur les 6 derniers mois</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <CashFlowChart data={cashFlowData} />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild variant="ghost" size="sm">
            <Link href="/finance/treasury">
              Voir détails complets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          <TabsTrigger value="accounting">Comptabilité</TabsTrigger>
          <TabsTrigger value="treasury">Trésorerie</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Factures clients</CardTitle>
                <CardDescription>Gestion des factures et paiements</CardDescription>
              </div>
              <Button onClick={() => setShowInvoiceModal(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle facture
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Facture</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Aucune facture trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.client}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "Payée"
                                ? "default"
                                : invoice.status === "En retard"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Total: {invoices.length} facture{invoices.length !== 1 ? "s" : ""}
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Dépenses</CardTitle>
                <CardDescription>Suivi des dépenses et charges</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle dépense
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Dépense</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{expense.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Total: {expenses.length} dépense{expenses.length !== 1 ? "s" : ""}
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Écritures comptables récentes</CardTitle>
                  <CardDescription>Dernières écritures du journal</CardDescription>
                </div>
                <Button onClick={() => setShowAccountingEntryModal(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle écriture
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Aucune écriture trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell className="font-medium">{entry.description}</TableCell>
                          <TableCell>
                            <Badge variant={entry.type === "debit" ? "default" : "secondary"}>
                              {entry.type === "debit" ? "Débit" : "Crédit"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/finance/accounting">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Accéder au module de comptabilité
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités comptables</CardTitle>
                <CardDescription>Outils de gestion comptable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild variant="outline" className="h-24 flex-col">
                    <Link href="/finance/accounting">
                      <FileText className="h-8 w-8 mb-2" />
                      Grand livre
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24 flex-col">
                    <Link href="/finance/accounting?tab=balance">
                      <Calculator className="h-8 w-8 mb-2" />
                      Balance
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24 flex-col">
                    <Link href="/finance/accounting?tab=statements">
                      <BarChart3 className="h-8 w-8 mb-2" />
                      États financiers
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-24 flex-col">
                    <Link href="/finance/accounting?tab=journal">
                      <BookOpen className="h-8 w-8 mb-2" />
                      Journal
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Transactions récentes</CardTitle>
                  <CardDescription>Derniers mouvements de trésorerie</CardDescription>
                </div>
                <Button onClick={() => setShowTransactionModal(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle transaction
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Aucune transaction trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
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
                          <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/finance/treasury">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Accéder au module de trésorerie
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comptes bancaires</CardTitle>
                <CardDescription>Aperçu des soldes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bankAccounts.map((account) => {
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
                    const balance = account.initialBalance + inflows - outflows

                    return (
                      <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{account.bankName}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.accountNumber.slice(0, 4)}...{account.accountNumber.slice(-4)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(balance)}
                          </div>
                          <div className="text-xs text-muted-foreground">{account.type}</div>
                        </div>
                      </div>
                    )
                  })}

                  {bankAccounts.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">Aucun compte bancaire trouvé</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link href="/finance/treasury">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Gérer les comptes bancaires
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <InvoiceModal open={showInvoiceModal} onOpenChange={setShowInvoiceModal} />
      <AccountingEntryModal open={showAccountingEntryModal} onOpenChange={setShowAccountingEntryModal} />
      <TransactionModal open={showTransactionModal} onOpenChange={setShowTransactionModal} />
    </div>
  )
}
