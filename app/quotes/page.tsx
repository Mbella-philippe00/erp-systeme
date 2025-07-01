"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calculator, Download, Save } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { useCompany } from "@/contexts/company-context"

export default function QuotesPage() {
  const { clients, addQuote, quotes } = useData()
  const { companyInfo } = useCompany()
  const [quoteItems, setQuoteItems] = useState([{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }])
  const [quoteInfo, setQuoteInfo] = useState({
    client: "",
    description: "",
    validityPeriod: "30",
    paymentTerms: "30",
    deliveryTime: "",
  })

  const addItem = () => {
    const newId = Math.max(...quoteItems.map((item) => item.id)) + 1
    setQuoteItems([...quoteItems, { id: newId, description: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (id: number) => {
    if (quoteItems.length > 1) {
      setQuoteItems(quoteItems.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: number, field: string, value: any) => {
    setQuoteItems(
      quoteItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const subtotal = quoteItems.reduce((sum, item) => sum + item.total, 0)
  const taxRate = 0.2 // 20% TVA
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleSaveQuote = () => {
    if (quoteInfo.client && quoteItems.some((item) => item.description && item.quantity > 0 && item.unitPrice > 0)) {
      addQuote({
        client: quoteInfo.client,
        items: quoteItems,
        subtotal,
        tax,
        total,
        validityPeriod: quoteInfo.validityPeriod,
        paymentTerms: quoteInfo.paymentTerms,
        deliveryTime: quoteInfo.deliveryTime,
        date: new Date().toISOString().split("T")[0],
        status: "Brouillon",
      })

      // Reset form
      setQuoteItems([{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }])
      setQuoteInfo({
        client: "",
        description: "",
        validityPeriod: "30",
        paymentTerms: "30",
        deliveryTime: "",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calcul de devis</h1>
          <p className="text-muted-foreground">Module de calcul automatique de devis</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveQuote} disabled={!quoteInfo.client || subtotal === 0}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire de devis */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations du devis</CardTitle>
              <CardDescription>Détails généraux du devis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quoteNumber">Numéro de devis</Label>
                  <Input id="quoteNumber" placeholder="DEV-2024-001" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={new Date().toISOString().split("T")[0]} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={quoteInfo.client}
                  onValueChange={(value) => setQuoteInfo((prev) => ({ ...prev, client: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.name}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description du projet</Label>
                <Textarea
                  id="description"
                  placeholder="Description détaillée du projet..."
                  value={quoteInfo.description}
                  onChange={(e) => setQuoteInfo((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Aperçu en-tête de devis</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {companyInfo.logo && (
                        <img
                          src={companyInfo.logo || "/placeholder.svg"}
                          alt="Logo"
                          className="h-12 w-12 object-contain"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{companyInfo.name}</h3>
                        <p className="text-sm text-gray-600">{companyInfo.address}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">DEVIS</p>
                      <p className="text-xs text-gray-600">DEV-{Date.now()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Articles du devis</CardTitle>
                  <CardDescription>Détail des prestations et produits</CardDescription>
                </div>
                <Button onClick={addItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-24">Quantité</TableHead>
                    <TableHead className="w-32">Prix unitaire</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Description de l'article"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">€{item.total.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>
                        {quoteItems.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Liste des devis sauvegardés */}
          {quotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Devis sauvegardés</CardTitle>
                <CardDescription>Historique des devis créés</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Devis</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.id}</TableCell>
                        <TableCell>{quote.client}</TableCell>
                        <TableCell>€{quote.total.toFixed(2)}</TableCell>
                        <TableCell>{quote.date}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded">{quote.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Résumé du devis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Calcul automatique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Sous-total HT:</span>
                <span className="font-medium">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (20%):</span>
                <span className="font-medium">€{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total TTC:</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="validityPeriod">Validité du devis</Label>
                <Select
                  value={quoteInfo.validityPeriod}
                  onValueChange={(value) => setQuoteInfo((prev) => ({ ...prev, validityPeriod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 jours</SelectItem>
                    <SelectItem value="30">30 jours</SelectItem>
                    <SelectItem value="60">60 jours</SelectItem>
                    <SelectItem value="90">90 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                <Select
                  value={quoteInfo.paymentTerms}
                  onValueChange={(value) => setQuoteInfo((prev) => ({ ...prev, paymentTerms: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immédiat</SelectItem>
                    <SelectItem value="15">15 jours net</SelectItem>
                    <SelectItem value="30">30 jours net</SelectItem>
                    <SelectItem value="45">45 jours net</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Délai de livraison</Label>
                <Input
                  id="deliveryTime"
                  placeholder="ex: 2-3 semaines"
                  value={quoteInfo.deliveryTime}
                  onChange={(e) => setQuoteInfo((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleSaveQuote} disabled={!quoteInfo.client || subtotal === 0}>
                Enregistrer le devis
              </Button>
              <Button variant="outline" className="w-full" disabled={subtotal === 0}>
                Envoyer par email
              </Button>
              <Button variant="outline" className="w-full" disabled={subtotal === 0}>
                Convertir en facture
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
