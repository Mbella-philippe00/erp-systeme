"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, UserPlus, Trash2, Edit } from "lucide-react"
import { useData } from "@/contexts/data-context"
import { EmployeeModal } from "@/components/modals/employee-modal"

export default function HRPage() {
  const { employees, updateEmployee, deleteEmployee } = useData()
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  
  // États pour les nouvelles fonctionnalités
  const [attendance, setAttendance] = useState([
    {
      id: "1",
      employeeId: "EMP001",
      date: "2024-01-15",
      status: "Présent",
      arrivalTime: "09:00",
      departureTime: "18:00"
    }
  ])

  const [performances, setPerformances] = useState([
    {
      id: "1",
      employeeId: "EMP001",
      period: "2024-Q1",
      objectives: ["Augmenter les ventes de 10%", "Former 2 nouveaux employés"],
      rating: 4.5,
      comments: "Excellent travail et leadership"
    }
  ])

  const [talents, setTalents] = useState([
    {
      id: "1",
      employeeId: "EMP001",
      skills: ["Leadership", "Gestion de projet", "Communication"],
      certifications: ["PMP", "SCRUM Master"],
      developmentPlan: "Formation en management avancé prévue pour Q2 2024"
    }
  ])

  const payroll = [
    {
      month: "Janvier 2024",
      employees: employees.length,
      totalAmount: `€${employees.reduce((sum, emp) => sum + emp.salary, 0).toLocaleString("fr-FR")}`,
      status: "Traité",
    },
    { month: "Décembre 2023", employees: employees.length - 1, totalAmount: "€876,200", status: "Traité" },
    { month: "Novembre 2023", employees: employees.length - 2, totalAmount: "€869,800", status: "Traité" },
  ]

  const activeEmployees = employees.filter((emp) => emp.status === "Actif").length
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0)
  const absenteeismRate = 3.2 // Simulation
  const newHires = 8 // Simulation

  const handleStatusChange = (employeeId: string, newStatus: "Actif" | "Congé" | "Inactif") => {
    updateEmployee(employeeId, { status: newStatus })
  }

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      deleteEmployee(employeeId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ressources Humaines</h1>
          <p className="text-muted-foreground">Gestion des employés, paies et performances</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowEmployeeModal(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvel employé
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Rapport RH
          </Button>
        </div>
      </div>

      {/* Métriques RH */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employés actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-green-600">+3 ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Masse salariale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSalary.toLocaleString("fr-FR")}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux d'absentéisme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absenteeismRate}%</div>
            <p className="text-xs text-green-600">-0.5% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux recrutements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newHires}</div>
            <p className="text-xs text-muted-foreground">Ce mois</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employés</TabsTrigger>
          <TabsTrigger value="payroll">Paies</TabsTrigger>
          <TabsTrigger value="attendance">Présences</TabsTrigger>
          <TabsTrigger value="performance">Performances</TabsTrigger>
          <TabsTrigger value="talents">Talents</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste des employés</CardTitle>
              <CardDescription>Gestion des informations employés</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Salaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'embauche</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                          <AvatarFallback>
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{employee.department}</Badge>
                      </TableCell>
                      <TableCell>€{employee.salary.toLocaleString("fr-FR")}</TableCell>
                      <TableCell>
                        <select
                          value={employee.status}
                          onChange={(e) => handleStatusChange(employee.id, e.target.value as any)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="Actif">Actif</option>
                          <option value="Congé">Congé</option>
                          <option value="Inactif">Inactif</option>
                        </select>
                      </TableCell>
                      <TableCell>{employee.startDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des paies</CardTitle>
              <CardDescription>Historique et traitement des paies</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Période</TableHead>
                    <TableHead>Nombre d'employés</TableHead>
                    <TableHead>Montant total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.map((period, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{period.month}</TableCell>
                      <TableCell>{period.employees}</TableCell>
                      <TableCell>{period.totalAmount}</TableCell>
                      <TableCell>
                        <Badge variant="default">{period.status}</Badge>
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

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des présences</CardTitle>
              <CardDescription>Suivi des présences et absences</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Arrivée</TableHead>
                    <TableHead>Départ</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{employees.find(e => e.id === record.employeeId)?.name}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "Présent" ? "default" : "destructive"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.arrivalTime}</TableCell>
                      <TableCell>{record.departureTime}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évaluation des performances</CardTitle>
              <CardDescription>Suivi des objectifs et évaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Objectifs</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Commentaires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performances.map((perf) => (
                    <TableRow key={perf.id}>
                      <TableCell>{employees.find(e => e.id === perf.employeeId)?.name}</TableCell>
                      <TableCell>{perf.period}</TableCell>
                      <TableCell>
                        <ul className="list-disc list-inside">
                          {perf.objectives.map((obj, i) => (
                            <li key={i} className="text-sm">{obj}</li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>{perf.rating}/5</TableCell>
                      <TableCell>{perf.comments}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="talents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des talents</CardTitle>
              <CardDescription>Compétences et plan de développement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead>Compétences</TableHead>
                    <TableHead>Certifications</TableHead>
                    <TableHead>Plan de développement</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {talents.map((talent) => (
                    <TableRow key={talent.id}>
                      <TableCell>{employees.find(e => e.id === talent.employeeId)?.name}</TableCell>
                      <TableCell>
                        {talent.skills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="mr-1">
                            {skill}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {talent.certifications.map((cert, i) => (
                          <Badge key={i} variant="secondary" className="mr-1">
                            {cert}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>{talent.developmentPlan}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EmployeeModal open={showEmployeeModal} onOpenChange={setShowEmployeeModal} />
    </div>
  )
}
