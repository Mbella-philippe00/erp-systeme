"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData } from "@/contexts/data-context"

interface EmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EmployeeModal({ open, onOpenChange }: EmployeeModalProps) {
  const { addEmployee } = useData()
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    salary: "",
    status: "Actif" as const,
    startDate: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.position && formData.department && formData.salary) {
      addEmployee({
        name: formData.name,
        position: formData.position,
        department: formData.department,
        salary: Number.parseFloat(formData.salary),
        status: formData.status,
        startDate: formData.startDate,
      })
      setFormData({
        name: "",
        position: "",
        department: "",
        salary: "",
        status: "Actif",
        startDate: new Date().toISOString().split("T")[0],
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel employé</DialogTitle>
          <DialogDescription>Ajouter un nouvel employé à l'équipe</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Poste</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Département</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RH">RH</SelectItem>
                <SelectItem value="Management">Management</SelectItem>
                <SelectItem value="Etudes et Conseils">Etudes et Conseils</SelectItem>
                <SelectItem value="Operations Financière">Operations Financière</SelectItem>
                <SelectItem value="Génie Civil">Génie Civil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salaire (XAF)</Label>
            <Input
              id="salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Date d'embauche</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter l'employé</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
