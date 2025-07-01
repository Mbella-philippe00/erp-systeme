"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, Phone, Mail, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function SalesPage() {
  const opportunities = [
    {
      id: "",
      client: "",
      value: "",
      stage: "",
      probability: "",
      closeDate: "",
    },
    {
      id: "",
      client: "",
      value: "",
      stage: "",
      probability: "",
      closeDate: "",
    },
    {
      id: "",
      client: " ",
      value: "",
      stage: "",
      probability: "",
      closeDate: "",
    },
  ]

  const clients = [
    {
      id: "",
      name: "",
      contact: "",
      email: "",
      phone: "",
      value: "",
      status: "",
    },
    {
      id: "",
      name: "",
      contact: "",
      email: "",
      phone: "",
      value: "",
      status: "",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ventes & CRM</h1>
          <p className="text-muted-foreground">Gestion des ventes et relations clients</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/sales/reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              Rapport de ventes
            </Link>
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle opportunité
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exporter données
          </Button>
        </div>
      </div>

      {/* Métriques ventes */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-green-600">+0.0% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventes fermées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 FCFA</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-green-600">+0% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux prospects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Cette semaine</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="activities">Activités</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunités commerciales</CardTitle>
              <CardDescription>Suivi du pipeline de ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Étape</TableHead>
                    <TableHead>Probabilité</TableHead>
                    <TableHead>Date de clôture</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {opportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell className="font-medium">{opp.id}</TableCell>
                      <TableCell>{opp.client}</TableCell>
                      <TableCell className="font-semibold text-green-600">{opp.value}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            opp.stage === "Négociation"
                              ? "default"
                              : opp.stage === "Proposition"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {opp.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{opp.probability}</TableCell>
                      <TableCell>{opp.closeDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base clients</CardTitle>
              <CardDescription>Gestion des relations clients</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Coordonnées</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{client.contact}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {client.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{client.value}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === "Actif" ? "default" : "secondary"}>{client.status}</Badge>
                      </TableCell>
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
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activités commerciales</CardTitle>
              <CardDescription>Suivi des actions commerciales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle activité
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Assigné à</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {activity.type === "Appel" ? <Phone className="h-4 w-4 mr-1" /> :
                           activity.type === "Email" ? <Mail className="h-4 w-4 mr-1" /> :
                           <BarChart3 className="h-4 w-4 mr-1" />}
                          {activity.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.client}</TableCell>
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            activity.status === "Complété" ? "secondary" :
                            activity.status === "En attente" ? "destructive" : "default"
                          }
                        >
                          {activity.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{activity.assignedTo}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Modifier
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de ventes</CardTitle>
              <CardDescription>Analyses et statistiques de performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button asChild size="lg">
                  <Link href="/sales/reports">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Accéder au rapport complet
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Consultez les analyses détaillées, graphiques et statistiques de performance
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Ajouter après les clients
const activities = [
  {
    id: "ACT-001",
    type: "Appel",
    client: "Client A",
    description: "Suivi proposition commerciale",
    date: "2024-03-20",
    status: "Complété",
    assignedTo: "Commercial 1"
  },
  {
    id: "ACT-002",
    type: "Réunion",
    client: "Client B",
    description: "Présentation produit",
    date: "2024-03-21",
    status: "Planifié",
    assignedTo: "Commercial 2"
  },
  {
    id: "ACT-003",
    type: "Email",
    client: "Client C",
    description: "Envoi documentation",
    date: "2024-03-19",
    status: "En attente",
    assignedTo: "Commercial 1"
  }
]
