"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/contexts/data-context"

interface BankAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BankAccountModal({ open, onOpenChange }: BankAccountModalProps) {
  const { addBankAccount } = useData()
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    type: "current" as "current" | "savings" | "term",
    currency: "XAF",
    initialBalance: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.bankName && formData.accountNumber && formData.initialBalance) {
      addBankAccount({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        type: formData.type,
        currency: formData.currency,
        initialBalance: Number.parseFloat(formData.initialBalance),
        description: formData.description,
      })
      setFormData({
        bankName: "",
        accountNumber: "",
        type: "current",
        currency: "XAF",
        initialBalance: "",
        description: "",
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau compte bancaire</DialogTitle>
          <DialogDescription>Ajouter un nouveau compte bancaire</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Nom de la banque</Label>
            <Input
              id="bankName"
              placeholder="Ex: "
              value={formData.bankName}
              onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Numéro de compte</Label>
            <Input
              id="accountNumber"
              placeholder="Ex: 12345678901234"
              value={formData.accountNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de compte</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Compte courant</SelectItem>
                  <SelectItem value="savings">Compte d'épargne</SelectItem>
                  <SelectItem value="term">Dépôt à terme</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="USD">Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialBalance">Solde initial (FCFA)</Label>
            <Input
              id="initialBalance"
              type="number"
              step="1"
              placeholder="Ex: 0"
              value={formData.initialBalance}
              onChange={(e) => setFormData((prev) => ({ ...prev, initialBalance: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Input
              id="description"
              placeholder="Description du compte"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter le compte</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
