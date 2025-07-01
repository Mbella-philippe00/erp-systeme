"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Plus, Search, ArrowUpDown } from "lucide-react"
import { formatCurrency } from "@/utils/currency"
import { AccountingEntryModal } from "@/components/modals/accounting-entry-modal"
import { useData } from "@/contexts/data-context"

export default function AccountingPage() {
  const { accountingEntries, accounts } = useData()
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterAccount, setFilterAccount] = useState("all")

  // Filtrer les écritures comptables
  const filteredEntries = accountingEntries
    .filter((entry) => {
      // Filtre par période
      const entryDate = new Date(entry.date)
      const now = new Date()
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1)

      let matchesPeriod = true
      if (selectedPeriod === "current-month") {
        matchesPeriod = entryDate >= firstDayOfMonth && entryDate <= lastDayOfMonth
      } else if (selectedPeriod === "current-year") {
        matchesPeriod = entryDate >= firstDayOfYear
      } else if (selectedPeriod === "previous-month") {
        const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        matchesPeriod = entryDate >= firstDayOfPrevMonth && entryDate <= lastDayOfPrevMonth
      }

      // Filtre par recherche
      const matchesSearch =
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtre par compte
      const matchesAccount = filterAccount === "all" || entry.accountId === filterAccount

      return matchesPeriod && matchesSearch && matchesAccount
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA
    })

  // Calcul des totaux
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + (entry.type === "debit" ? entry.amount : 0), 0)
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + (entry.type === "credit" ? entry.amount : 0), 0)
  const balance = totalDebit - totalCredit

  // Calcul des soldes par compte
  const accountBalances = accounts.map((account) => {
    const accountEntries = accountingEntries.filter((entry) => entry.accountId === account.id)
    const debit = accountEntries.reduce((sum, entry) => sum + (entry.type === "debit" ? entry.amount : 0), 0)
    const credit = accountEntries.reduce((sum, entry) => sum + (entry.type === "credit" ? entry.amount : 0), 0)
    const balance = account.type === "asset" || account.type === "expense" ? debit - credit : credit - debit
    return { ...account, balance }
  })

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comptabilité</h1>
          <p className="text-muted-foreground">Gestion des écritures comptables et du grand livre</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowEntryModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle écriture
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques comptables */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total débits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebit)}</div>
            <p className="text-xs text-muted-foreground">Période sélectionnée</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total crédits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredit)}</div>
            <p className="text-xs text-muted-foreground">Période sélectionnée</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(Math.abs(balance))}
            </div>
            <p className="text-xs text-muted-foreground">{balance >= 0 ? "Excédent" : "Déficit"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Écritures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
            <p className="text-xs text-muted-foreground">Période sélectionnée</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="journal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="ledger">Grand livre</TabsTrigger>
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="statements">États financiers</TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Journal des écritures</CardTitle>
              <CardDescription>Toutes les transactions comptables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search" className="mb-2 block">
                    Rechercher
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Rechercher..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-[180px]">
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
                <div className="w-[200px]">
                  <Label htmlFor="account" className="mb-2 block">
                    Compte
                  </Label>
                  <Select value={filterAccount} onValueChange={setFilterAccount}>
                    <SelectTrigger id="account" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les comptes</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.number} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto font-medium"
                        onClick={toggleSortDirection}
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead className="text-right">Débit</TableHead>
                    <TableHead className="text-right">Crédit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Aucune écriture trouvée pour cette période
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEntries.map((entry) => {
                      const account = accounts.find((a) => a.id === entry.accountId)
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.date}</TableCell>
                          <TableCell>{entry.reference}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {account?.number} - {account?.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.type === "debit" ? formatCurrency(entry.amount) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.type === "credit" ? formatCurrency(entry.amount) : "-"}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-2 px-4 font-medium text-right">
                      Total:
                    </td>
                    <td className="py-2 px-4 font-medium text-right">{formatCurrency(totalDebit)}</td>
                    <td className="py-2 px-4 font-medium text-right">{formatCurrency(totalCredit)}</td>
                  </tr>
                </tfoot>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grand livre</CardTitle>
              <CardDescription>Détail des mouvements par compte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {accounts.map((account) => {
                  const accountEntries = accountingEntries.filter((entry) => entry.accountId === account.id)
                  if (accountEntries.length === 0) return null

                  const totalDebit = accountEntries.reduce(
                    (sum, entry) => sum + (entry.type === "debit" ? entry.amount : 0),
                    0,
                  )
                  const totalCredit = accountEntries.reduce(
                    (sum, entry) => sum + (entry.type === "credit" ? entry.amount : 0),
                    0,
                  )
                  const balance =
                    account.type === "asset" || account.type === "expense"
                      ? totalDebit - totalCredit
                      : totalCredit - totalDebit

                  return (
                    <div key={account.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {account.number} - {account.name}
                        </h3>
                        <Badge variant="outline">{account.type}</Badge>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Date</TableHead>
                            <TableHead>Référence</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Débit</TableHead>
                            <TableHead className="text-right">Crédit</TableHead>
                            <TableHead className="text-right">Solde</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountEntries
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((entry, index) => {
                              // Calcul du solde cumulé
                              const entriesUntilNow = accountEntries
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .slice(0, index + 1)
                              const cumulativeDebit = entriesUntilNow.reduce(
                                (sum, e) => sum + (e.type === "debit" ? e.amount : 0),
                                0,
                              )
                              const cumulativeCredit = entriesUntilNow.reduce(
                                (sum, e) => sum + (e.type === "credit" ? e.amount : 0),
                                0,
                              )
                              const cumulativeBalance =
                                account.type === "asset" || account.type === "expense"
                                  ? cumulativeDebit - cumulativeCredit
                                  : cumulativeCredit - cumulativeDebit

                              return (
                                <TableRow key={entry.id}>
                                  <TableCell>{entry.date}</TableCell>
                                  <TableCell>{entry.reference}</TableCell>
                                  <TableCell>{entry.description}</TableCell>
                                  <TableCell className="text-right">
                                    {entry.type === "debit" ? formatCurrency(entry.amount) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {entry.type === "credit" ? formatCurrency(entry.amount) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {formatCurrency(cumulativeBalance)}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="py-2 px-4 font-medium text-right">
                              Total:
                            </td>
                            <td className="py-2 px-4 font-medium text-right">{formatCurrency(totalDebit)}</td>
                            <td className="py-2 px-4 font-medium text-right">{formatCurrency(totalCredit)}</td>
                            <td className="py-2 px-4 font-medium text-right">{formatCurrency(balance)}</td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Balance des comptes</CardTitle>
              <CardDescription>Soldes de tous les comptes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Débit</TableHead>
                    <TableHead className="text-right">Crédit</TableHead>
                    <TableHead className="text-right">Solde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountBalances.map((account) => {
                    const accountEntries = accountingEntries.filter((entry) => entry.accountId === account.id)
                    const totalDebit = accountEntries.reduce(
                      (sum, entry) => sum + (entry.type === "debit" ? entry.amount : 0),
                      0,
                    )
                    const totalCredit = accountEntries.reduce(
                      (sum, entry) => sum + (entry.type === "credit" ? entry.amount : 0),
                      0,
                    )

                    return (
                      <TableRow key={account.id}>
                        <TableCell>{account.number}</TableCell>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{account.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${account.balance >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {formatCurrency(Math.abs(account.balance))}
                          {account.balance < 0 ? " (Créditeur)" : " (Débiteur)"}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compte de résultat</CardTitle>
                <CardDescription>Revenus et dépenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Revenus */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Revenus</h3>
                    <Table>
                      <TableBody>
                        {accountBalances
                          .filter((account) => account.type === "revenue")
                          .map((account) => (
                            <TableRow key={account.id}>
                              <TableCell>{account.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell className="font-bold">Total des revenus</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              accountBalances
                                .filter((account) => account.type === "revenue")
                                .reduce((sum, account) => sum + account.balance, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Dépenses */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Dépenses</h3>
                    <Table>
                      <TableBody>
                        {accountBalances
                          .filter((account) => account.type === "expense")
                          .map((account) => (
                            <TableRow key={account.id}>
                              <TableCell>{account.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell className="font-bold">Total des dépenses</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              accountBalances
                                .filter((account) => account.type === "expense")
                                .reduce((sum, account) => sum + account.balance, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Résultat net */}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Résultat net</span>
                      <span className="text-lg font-bold">
                        {formatCurrency(
                          accountBalances
                            .filter((account) => account.type === "revenue")
                            .reduce((sum, account) => sum + account.balance, 0) -
                            accountBalances
                              .filter((account) => account.type === "expense")
                              .reduce((sum, account) => sum + account.balance, 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bilan</CardTitle>
                <CardDescription>Actifs, passifs et capitaux propres</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Actifs */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Actifs</h3>
                    <Table>
                      <TableBody>
                        {accountBalances
                          .filter((account) => account.type === "asset")
                          .map((account) => (
                            <TableRow key={account.id}>
                              <TableCell>{account.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell className="font-bold">Total des actifs</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              accountBalances
                                .filter((account) => account.type === "asset")
                                .reduce((sum, account) => sum + account.balance, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Passifs */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Passifs</h3>
                    <Table>
                      <TableBody>
                        {accountBalances
                          .filter((account) => account.type === "liability")
                          .map((account) => (
                            <TableRow key={account.id}>
                              <TableCell>{account.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell className="font-bold">Total des passifs</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              accountBalances
                                .filter((account) => account.type === "liability")
                                .reduce((sum, account) => sum + account.balance, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Capitaux propres */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Capitaux propres</h3>
                    <Table>
                      <TableBody>
                        {accountBalances
                          .filter((account) => account.type === "equity")
                          .map((account) => (
                            <TableRow key={account.id}>
                              <TableCell>{account.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(account.balance)}</TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell className="font-bold">Total des capitaux propres</TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(
                              accountBalances
                                .filter((account) => account.type === "equity")
                                .reduce((sum, account) => sum + account.balance, 0),
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AccountingEntryModal open={showEntryModal} onOpenChange={setShowEntryModal} />
    </div>
  )
}
