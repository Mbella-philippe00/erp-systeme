"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Building, Calculator, TrendingUp } from "lucide-react"
import { cameroonCities, neighborhoods } from "@/utils/cities"
import { formatCurrency } from "@/utils/currency"

export default function RealEstatePage() {
  const [propertyType, setPropertyType] = useState("")
  const [surface, setSurface] = useState("")
  const [city, setCity] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [rooms, setRooms] = useState("")
  const [condition, setCondition] = useState("")
  const [estimatedValue, setEstimatedValue] = useState(0)

  const calculateEstimate = () => {
    // Simulation d'un calcul d'évaluation immobilière pour le Cameroun
    const basePrice = 0 // Prix de base par m² en FCFA

    // Ajustements selon la ville
    const cityMultipliers: { [key: string]: number } = {
      Yaoundé: 1.2,
      Douala: 1.3,
      Bafoussam: 0.8,
      Garoua: 0.7,
      Bamenda: 0.9,
      Limbe: 1.1,
      Kribi: 1.0,
    }

    // Ajustements selon le type de bien
    const typeMultipliers = {
      apartment: 1.0,
      house: 1.2,
      commercial: 1.5,
      land: 0.3,
    }

    // Ajustements selon l'état
    const conditionMultipliers = {
      excellent: 1.2,
      good: 1.0,
      average: 0.8,
      poor: 0.6,
    }

    // Ajustements selon le quartier
    const neighborhoodMultipliers: { [key: string]: number } = {
      Bastos: 1.5,
      Melen: 1.2,
      Akwa: 1.4,
      Bonanjo: 1.3,
      "Centre-ville": 1.1,
      Résidentiel: 1.0,
    }

    const cityMultiplier = cityMultipliers[city] || 1.0
    const typeMultiplier = typeMultipliers[propertyType as keyof typeof typeMultipliers] || 1.0
    const conditionMultiplier = conditionMultipliers[condition as keyof typeof conditionMultipliers] || 1.0
    const neighborhoodMultiplier = neighborhoodMultipliers[neighborhood] || 1.0

    const estimate =
      Number.parseFloat(surface) *
      basePrice *
      cityMultiplier *
      typeMultiplier *
      conditionMultiplier *
      neighborhoodMultiplier
    setEstimatedValue(Math.round(estimate))
  }

  const recentEvaluations = [
    {
      id: "",
      address: "",
      type: "",
      surface: "",
      value: formatCurrency(0),
      date: "",
    },
    {
      id: "",
      address: "",
      type: "",
      surface: "",
      value: formatCurrency(0),
      date: "",
    },
    {
      id: "",
      address: "",
      type: "",
      surface: "",
      value: formatCurrency(0),
      date: "",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Évaluation immobilière</h1>
          <p className="text-muted-foreground">Module d'évaluation automatique de biens immobiliers au Cameroun</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulaire d'évaluation */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Informations du bien
              </CardTitle>
              <CardDescription>Saisissez les caractéristiques du bien à évaluer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Type de bien</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Appartement</SelectItem>
                      <SelectItem value="house">Maison</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Terrain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="85"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameroonCities.map((cityItem) => (
                        <SelectItem key={cityItem.name} value={cityItem.name}>
                          {cityItem.name} ({cityItem.region})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Quartier</Label>
                  <Select value={neighborhood} onValueChange={setNeighborhood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un quartier" />
                    </SelectTrigger>
                    <SelectContent>
                      {neighborhoods.map((hood) => (
                        <SelectItem key={hood} value={hood}>
                          {hood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rooms">Nombre de pièces</Label>
                  <Select value={rooms} onValueChange={setRooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nombre de pièces" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 pièce</SelectItem>
                      <SelectItem value="2">2 pièces</SelectItem>
                      <SelectItem value="3">3 pièces</SelectItem>
                      <SelectItem value="4">4 pièces</SelectItem>
                      <SelectItem value="5">5 pièces et +</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">État du bien</Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger>
                      <SelectValue placeholder="État général" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Bon</SelectItem>
                      <SelectItem value="average">Moyen</SelectItem>
                      <SelectItem value="poor">À rénover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description complémentaire</Label>
                <Textarea
                  id="description"
                  placeholder="Informations supplémentaires (parking, balcon, cave, sécurité, etc.)"
                  rows={3}
                />
              </div>

              <Button
                onClick={calculateEstimate}
                className="w-full"
                disabled={!propertyType || !surface || !condition || !city}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculer l'estimation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évaluations récentes</CardTitle>
              <CardDescription>Historique des dernières évaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{evaluation.address}</div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{evaluation.type}</Badge>
                        <span>{evaluation.surface}</span>
                        <span>•</span>
                        <span>{evaluation.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{evaluation.value}</div>
                      <Button variant="ghost" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résultat de l'évaluation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Estimation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {estimatedValue > 0 ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(estimatedValue)}</div>
                    <p className="text-sm text-muted-foreground">Estimation de valeur</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fourchette basse:</span>
                      <span>{formatCurrency(Math.round(estimatedValue * 0.9))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fourchette haute:</span>
                      <span>{formatCurrency(Math.round(estimatedValue * 1.1))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Prix au m²:</span>
                      <span>
                        {surface ? formatCurrency(Math.round(estimatedValue / Number.parseFloat(surface))) : "0 FCFA"}
                        /m²
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Remplissez le formulaire pour obtenir une estimation</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Facteurs d'évaluation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Localisation (ville):</span>
                <Badge variant="outline">Très important</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quartier:</span>
                <Badge variant="outline">Très important</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Surface:</span>
                <Badge variant="outline">Important</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>État du bien:</span>
                <Badge variant="outline">Important</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Type de bien:</span>
                <Badge variant="outline">Modéré</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Marché local:</span>
                <Badge variant="outline">Important</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" disabled={estimatedValue === 0}>
                Générer rapport PDF
              </Button>
              <Button variant="outline" className="w-full" disabled={estimatedValue === 0}>
                Envoyer par email
              </Button>
              <Button variant="outline" className="w-full" disabled={estimatedValue === 0}>
                Sauvegarder évaluation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
