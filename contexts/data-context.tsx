"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { convertEurToXAF } from "@/utils/currency"

// Types de données
interface Invoice {
  id: string
  client: string
  amount: number
  status: "Payée" | "En attente" | "En retard"
  date: string
}

interface Employee {
  id: string
  name: string
  position: string
  department: string
  salary: number
  status: "Actif" | "Congé" | "Inactif"
  startDate: string
}

interface Opportunity {
  id: string
  client: string
  value: number
  stage: "Prospection" | "Qualification" | "Proposition" | "Négociation" | "Fermée"
  probability: number
  closeDate: string
}

interface Client {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  value: number
  status: "Actif" | "Prospect" | "Inactif"
}

interface Risk {
  id: string
  title: string
  category: string
  severity: "Faible" | "Moyen" | "Élevé" | "Critique"
  probability: "Faible" | "Moyenne" | "Élevée"
  impact: "Faible" | "Moyen" | "Élevé" | "Très élevé"
  status: "Actif" | "Surveillé" | "Fermé"
  owner: string
}

interface Quote {
  id: string
  client: string
  items: Array<{
    id: number
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  validityPeriod: string
  paymentTerms: string
  deliveryTime: string
  date: string
  status: "Brouillon" | "Envoyé" | "Accepté" | "Refusé"
}

// Types for accounting
interface Account {
  id: string
  number: string
  name: string
  type: "asset" | "liability" | "equity" | "revenue" | "expense"
}

interface AccountingEntry {
  id: string
  date: string
  reference: string
  description: string
  accountId: string
  amount: number
  type: "debit" | "credit"
}

// Types for treasury
interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  type: "current" | "savings" | "term"
  currency: string
  initialBalance: number
  description?: string
}

interface CashTransaction {
  id: string
  date: string
  description: string
  accountId: string
  category: string
  reference: string
  amount: number
  type: "inflow" | "outflow"
}

// Types for project management
interface Project {
  id: string
  name: string
  client: string
  description?: string
  status: "en-cours" | "en-pause" | "terminé" | "annulé"
  startDate: string
  endDate: string
  budget: number
  spent?: number
}

interface Task {
  id: string
  projectId: string
  name: string
  description?: string
  status: "à-faire" | "en-cours" | "terminé" | "annulé"
  priority: "basse" | "moyenne" | "haute"
  assignedTo?: string
  dueDate: string
  estimatedHours?: number
  actualHours?: number
}

interface ProjectMember {
  id: string
  projectId: string
  name: string
  role: string
  email?: string
  joinDate: string
}

interface DataContextType {
  // Invoices
  invoices: Invoice[]
  addInvoice: (invoice: Omit<Invoice, "id">) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  // Employees
  employees: Employee[]
  addEmployee: (employee: Omit<Employee, "id">) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // Opportunities
  opportunities: Opportunity[]
  addOpportunity: (opportunity: Omit<Opportunity, "id">) => void
  updateOpportunity: (id: string, opportunity: Partial<Opportunity>) => void
  deleteOpportunity: (id: string) => void

  // Clients
  clients: Client[]
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void

  // Risks
  risks: Risk[]
  addRisk: (risk: Omit<Risk, "id">) => void
  updateRisk: (id: string, risk: Partial<Risk>) => void
  deleteRisk: (id: string) => void

  // Quotes
  quotes: Quote[]
  addQuote: (quote: Omit<Quote, "id">) => void
  updateQuote: (id: string, quote: Partial<Quote>) => void
  deleteQuote: (id: string) => void

  // Accounting
  accounts: Account[]
  accountingEntries: AccountingEntry[]
  addAccount: (account: Omit<Account, "id">) => void
  updateAccount: (id: string, account: Partial<Account>) => void
  deleteAccount: (id: string) => void
  addAccountingEntry: (entry: Omit<AccountingEntry, "id">) => void
  updateAccountingEntry: (id: string, entry: Partial<AccountingEntry>) => void
  deleteAccountingEntry: (id: string) => void

  // Treasury
  bankAccounts: BankAccount[]
  cashTransactions: CashTransaction[]
  addBankAccount: (account: Omit<BankAccount, "id">) => void
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void
  deleteBankAccount: (id: string) => void
  addCashTransaction: (transaction: Omit<CashTransaction, "id">) => void
  updateCashTransaction: (id: string, transaction: Partial<CashTransaction>) => void
  deleteCashTransaction: (id: string) => void

  // Projects
  projects: Project[]
  addProject: (project: Omit<Project, "id">) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, "id">) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Project Members
  projectMembers: ProjectMember[]
  addProjectMember: (member: Omit<ProjectMember, "id">) => void
  updateProjectMember: (id: string, member: Partial<ProjectMember>) => void
  deleteProjectMember: (id: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // États initiaux avec données de démonstration en francs CFA
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "", client: "", amount: convertEurToXAF(0), status: "Payée", date: "" },
    {
      id: "",
      client: "",
      amount: convertEurToXAF(0),
      status: "En attente",
      date: "",
    },
    {
      id: "",
      client: "",
      amount: convertEurToXAF(0),
      status: "En retard",
      date: "",
    },
  ])

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "",
      name: "",
      position: "",
      department: "",
      salary: convertEurToXAF(0),
      status: "Actif",
      startDate: "",
    },
    {
      id: "",
      name: "",
      position: "",
      department: "",
      salary: convertEurToXAF(0),
      status: "Actif",
      startDate: "",
    },
    {
      id: "",
      name: "",
      position: "C",
      department: "",
      salary: convertEurToXAF(0),
      status: "Congé",
      startDate: "",
    },
  ])

  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: "",
      client: "",
      value: convertEurToXAF(0),
      stage: "Négociation",
      probability: 0,
      closeDate: "",
    },
    {
      id: "",
      client: "",
      value: convertEurToXAF(0),
      stage: "Proposition",
      probability: 0,
      closeDate: "",
    },
  ])

  const [clients, setClients] = useState<Client[]>([
    {
      id: "",
      name: "",
      contact: "",
      email: "",
      phone: "",
      value: convertEurToXAF(0),
      status: "Actif",
    },
    {
      id: "",
      name: "",
      contact: "",
      email: "",
      phone: "",
      value: convertEurToXAF(0),
      status: "Prospect",
    },
  ])

  const [risks, setRisks] = useState<Risk[]>([
    {
      id: "",
      title: "",
      category: "",
      severity: "Élevé",
      probability: "Moyenne",
      impact: "Élevé",
      status: "Actif",
      owner: "",
    },
    {
      id: "",
      title: "",
      category: "",
      severity: "Moyen",
      probability: "Faible",
      impact: "Élevé",
      status: "Surveillé",
      owner: "",
    },
  ])

  const [quotes, setQuotes] = useState<Quote[]>([])

  // États pour la comptabilité
  const [accounts, setAccounts] = useState<Account[]>([
    { id: "ACC-001", number: "512000", name: "Banque", type: "asset" },
    { id: "ACC-002", number: "401000", name: "Fournisseurs", type: "liability" },
    { id: "ACC-003", number: "411000", name: "Clients", type: "asset" },
    { id: "ACC-004", number: "707000", name: "Ventes de marchandises", type: "revenue" },
    { id: "ACC-005", number: "607000", name: "Achats de marchandises", type: "expense" },
    { id: "ACC-006", number: "101000", name: "Capital", type: "equity" },
    { id: "ACC-007", number: "531000", name: "Caisse", type: "asset" },
    { id: "ACC-008", number: "601000", name: "Achats de matières premières", type: "expense" },
    { id: "ACC-009", number: "701000", name: "Ventes de produits finis", type: "revenue" },
    { id: "ACC-010", number: "641000", name: "Charges de personnel", type: "expense" },
  ])

  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([
    {
      id: "",
      date: "2024-01-05",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "debit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "credit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "debit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "credit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "debit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "credit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "debit",
    },
    {
      id: "",
      date: "",
      reference: "",
      description: "",
      accountId: "",
      amount: 0,
      type: "credit",
    },
  ])

  // États pour la trésorerie
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "",
      bankName: "",
      accountNumber: "",
      type: "current",
      currency: "XAF",
      initialBalance: 0,
      description: "Compte principal",
    },
    {
      id: "",
      bankName: "",
      accountNumber: "",
      type: "savings",
      currency: "XAF",
      initialBalance: 0,
      description: "Compte d'épargne",
    },
  ])

  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([
    {
      id: "",
      date: "",
      description: "",
      accountId: "",
      category: "Vente",
      reference: "",
      amount: 0,
      type: "inflow",
    },
    {
      id: "",
      date: "",
      description: "",
      accountId: "",
      category: "Achat",
      reference: "",
      amount: 0,
      type: "outflow",
    },
    {
      id: "",
      date: "",
      description: "",
      accountId: "",
      category: "Salaire",
      reference: "",
      amount: 0,
      type: "outflow",
    },
    {
      id: "",
      date: "",
      description: "",
      accountId: "",
      category: "Vente",
      reference: "",
      amount: 0,
      type: "inflow",
    },
    {
      id: "",
      date: "",
      description: "",
      accountId: "",
      category: "Transfert",
      reference: "",
      amount: 0,
      type: "outflow",
    },
    {
      id: "",
      date: "",
      description: "",
      accountId: "",
      category: "",
      reference: "",
      amount: 0,
      type: "inflow",
    },
  ])

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "",
      name: "",
      client: "",
      description: "",
      status: "en-cours",
      startDate: "",
      endDate: "",
      budget: convertEurToXAF(0),
      spent: convertEurToXAF(0),
    },
    {
      id: "",
      name: "",
      client: "",
      description: "",
      status: "en-cours",
      startDate: "",
      endDate: "",
      budget: convertEurToXAF(0),
      spent: convertEurToXAF(0),
    },
    {
      id: "",
      name: "",
      client: "",
      description: "",
      status: "terminé",
      startDate: "",
      endDate: "",
      budget: convertEurToXAF(0),
      spent: convertEurToXAF(0),
    },
  ])

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "",
      projectId: "",
      name: "",
      description: "",
      status: "terminé",
      priority: "haute",
      assignedTo: "",
      dueDate: "",
      estimatedHours: 0,
      actualHours: 0,
    },
    {
      id: "",
      projectId: "",
      name: "Développement frontend",
      description: "Intégration des maquettes en code HTML/CSS/JS",
      status: "en-cours",
      priority: "haute",
      assignedTo: "MEMBER-002",
      dueDate: "2024-02-28",
      estimatedHours: 0,
      actualHours: 0,
    },
    {
      id: "",
      projectId: "",
      name: "",
      description: "",
      status: "à-faire",
      priority: "moyenne",
      assignedTo: "",
      dueDate: "",
      estimatedHours: 0,
    },
    {
      id: "",
      projectId: "",
      name: "",
      description: "Définir l'architecture technique de l'application mobile",
      status: "terminé",
      priority: "haute",
      assignedTo: "MEMBER-001",
      dueDate: "",
      estimatedHours: 0,
      actualHours: 0,
    },
    {
      id: "",
      projectId: "",
      name: "",
      description: "",
      status: "en-cours",
      priority: "haute",
      assignedTo: "",
      dueDate: "",
      estimatedHours: 0,
      actualHours: 0,
    },
  ])

  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([
    {
      id: "",
      projectId: "",
      name: "",
      role: "",
      email: "",
      joinDate: "",
    },
    {
      id: "",
      projectId: "",
      name: "",
      role: "",
      email: "",
      joinDate: "",
    },
    {
      id: "",
      projectId: "",
      name: "",
      role: "",
      email: "",
      joinDate: "",
    },
    {
      id: "",
      projectId: "",
      name: "",
      role: "",
      email: "",
      joinDate: "",
    },
    {
      id: "",
      projectId: "",
      name: "",
      role: "",
      email: "",
      joinDate: "",
    },
  ])

  // Fonctions utilitaires
  const generateId = (prefix: string) => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `${prefix}-${timestamp}-${random}`
  }

  // Fonctions pour les factures
  const addInvoice = (invoice: Omit<Invoice, "id">) => {
    const newInvoice = { ...invoice, id: generateId("INV") }
    setInvoices((prev) => [...prev, newInvoice])
    toast({ title: "Facture créée", description: `Facture ${newInvoice.id} créée avec succès` })
  }

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...invoice } : inv)))
    toast({ title: "Facture mise à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    toast({ title: "Facture supprimée", description: "La facture a été supprimée avec succès" })
  }

  // Fonctions pour les employés
  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = { ...employee, id: generateId("EMP") }
    setEmployees((prev) => [...prev, newEmployee])
    toast({ title: "Employé ajouté", description: `${newEmployee.name} a été ajouté avec succès` })
  }

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...employee } : emp)))
    toast({ title: "Employé mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id))
    toast({ title: "Employé supprimé", description: "L'employé a été supprimé avec succès" })
  }

  // Fonctions pour les opportunités
  const addOpportunity = (opportunity: Omit<Opportunity, "id">) => {
    const newOpportunity = { ...opportunity, id: generateId("OPP") }
    setOpportunities((prev) => [...prev, newOpportunity])
    toast({ title: "Opportunité créée", description: "Nouvelle opportunité ajoutée au pipeline" })
  }

  const updateOpportunity = (id: string, opportunity: Partial<Opportunity>) => {
    setOpportunities((prev) => prev.map((opp) => (opp.id === id ? { ...opp, ...opportunity } : opp)))
    toast({ title: "Opportunité mise à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteOpportunity = (id: string) => {
    setOpportunities((prev) => prev.filter((opp) => opp.id !== id))
    toast({ title: "Opportunité supprimée", description: "L'opportunité a été supprimée" })
  }

  // Fonctions pour les clients
  const addClient = (client: Omit<Client, "id">) => {
    const newClient = { ...client, id: generateId("CLI") }
    setClients((prev) => [...prev, newClient])
    toast({ title: "Client ajouté", description: `${newClient.name} a été ajouté à la base clients` })
  }

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients((prev) => prev.map((cli) => (cli.id === id ? { ...cli, ...client } : cli)))
    toast({ title: "Client mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((cli) => cli.id !== id))
    toast({ title: "Client supprimé", description: "Le client a été supprimé" })
  }

  // Fonctions pour les risques
  const addRisk = (risk: Omit<Risk, "id">) => {
    const newRisk = { ...risk, id: generateId("RISK") }
    setRisks((prev) => [...prev, newRisk])
    toast({ title: "Risque ajouté", description: "Nouveau risque ajouté au registre" })
  }

  const updateRisk = (id: string, risk: Partial<Risk>) => {
    setRisks((prev) => prev.map((r) => (r.id === id ? { ...r, ...risk } : r)))
    toast({ title: "Risque mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteRisk = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id))
    toast({ title: "Risque supprimé", description: "Le risque a été supprimé" })
  }

  // Fonctions pour les devis
  const addQuote = (quote: Omit<Quote, "id">) => {
    const newQuote = { ...quote, id: generateId("QUO") }
    setQuotes((prev) => [...prev, newQuote])
    toast({ title: "Devis créé", description: `Devis ${newQuote.id} créé avec succès` })
  }

  const updateQuote = (id: string, quote: Partial<Quote>) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...quote } : q)))
    toast({ title: "Devis mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id))
    toast({ title: "Devis supprimé", description: "Le devis a été supprimé" })
  }

  // Fonctions pour la comptabilité
  const addAccount = (account: Omit<Account, "id">) => {
    const newAccount = { ...account, id: generateId("ACC") }
    setAccounts((prev) => [...prev, newAccount])
    toast({ title: "Compte ajouté", description: `Compte ${newAccount.number} ajouté avec succès` })
  }

  const updateAccount = (id: string, account: Partial<Account>) => {
    setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...account } : acc)))
    toast({ title: "Compte mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id))
    toast({ title: "Compte supprimé", description: "Le compte a été supprimé avec succès" })
  }

  const addAccountingEntry = (entry: Omit<AccountingEntry, "id">) => {
    const newEntry = { ...entry, id: generateId("ENT") }
    setAccountingEntries((prev) => [...prev, newEntry])
    toast({ title: "Écriture ajoutée", description: `Écriture ${newEntry.id} ajoutée avec succès` })
  }

  const updateAccountingEntry = (id: string, entry: Partial<AccountingEntry>) => {
    setAccountingEntries((prev) => prev.map((ent) => (ent.id === id ? { ...ent, ...entry } : ent)))
    toast({ title: "Écriture mise à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteAccountingEntry = (id: string) => {
    setAccountingEntries((prev) => prev.filter((ent) => ent.id !== id))
    toast({ title: "Écriture supprimée", description: "L'écriture a été supprimée avec succès" })
  }

  // Fonctions pour la trésorerie
  const addBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = { ...account, id: generateId("BA") }
    setBankAccounts((prev) => [...prev, newAccount])
    toast({ title: "Compte bancaire ajouté", description: `Compte ${newAccount.bankName} ajouté avec succès` })
  }

  const updateBankAccount = (id: string, account: Partial<BankAccount>) => {
    setBankAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...account } : acc)))
    toast({ title: "Compte bancaire mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((acc) => acc.id !== id))
    toast({ title: "Compte bancaire supprimé", description: "Le compte a été supprimé avec succès" })
  }

  const addCashTransaction = (transaction: Omit<CashTransaction, "id">) => {
    const newTransaction = { ...transaction, id: generateId("TR") }
    setCashTransactions((prev) => [...prev, newTransaction])
    toast({ title: "Transaction ajoutée", description: `Transaction ${newTransaction.id} ajoutée avec succès` })
  }

  const updateCashTransaction = (id: string, transaction: Partial<CashTransaction>) => {
    setCashTransactions((prev) => prev.map((tr) => (tr.id === id ? { ...tr, ...transaction } : tr)))
    toast({ title: "Transaction mise à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteCashTransaction = (id: string) => {
    setCashTransactions((prev) => prev.filter((tr) => tr.id !== id))
    toast({ title: "Transaction supprimée", description: "La transaction a été supprimée avec succès" })
  }

  // Fonctions pour les projets
  const addProject = (project: Omit<Project, "id">) => {
    const newProject = { ...project, id: generateId("PROJ") }
    setProjects((prev) => [...prev, newProject])
    toast({ title: "Projet créé", description: `Projet ${newProject.name} créé avec succès` })
  }

  const updateProject = (id: string, project: Partial<Project>) => {
    setProjects((prev) => prev.map((proj) => (proj.id === id ? { ...proj, ...project } : proj)))
    toast({ title: "Projet mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id))
    // Supprimer aussi les tâches et membres associés
    setTasks((prev) => prev.filter((task) => task.projectId !== id))
    setProjectMembers((prev) => prev.filter((member) => member.projectId !== id))
    toast({ title: "Projet supprimé", description: "Le projet et ses données associées ont été supprimés" })
  }

  // Fonctions pour les tâches
  const addTask = (task: Omit<Task, "id">) => {
    const newTask = { ...task, id: generateId("TASK") }
    setTasks((prev) => [...prev, newTask])
    toast({ title: "Tâche créée", description: `Tâche ${newTask.name} créée avec succès` })
  }

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)))
    toast({ title: "Tâche mise à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    toast({ title: "Tâche supprimée", description: "La tâche a été supprimée avec succès" })
  }

  // Fonctions pour les membres de projet
  const addProjectMember = (member: Omit<ProjectMember, "id">) => {
    const newMember = { ...member, id: generateId("MEMBER") }
    setProjectMembers((prev) => [...prev, newMember])
    toast({ title: "Membre ajouté", description: `${newMember.name} a été ajouté au projet` })
  }

  const updateProjectMember = (id: string, member: Partial<ProjectMember>) => {
    setProjectMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...member } : m)))
    toast({ title: "Membre mis à jour", description: "Les modifications ont été sauvegardées" })
  }

  const deleteProjectMember = (id: string) => {
    setProjectMembers((prev) => prev.filter((m) => m.id !== id))
    toast({ title: "Membre supprimé", description: "Le membre a été retiré du projet" })
  }

  return (
    <DataContext.Provider
      value={{
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        opportunities,
        addOpportunity,
        updateOpportunity,
        deleteOpportunity,
        clients,
        addClient,
        updateClient,
        deleteClient,
        risks,
        addRisk,
        updateRisk,
        deleteRisk,
        quotes,
        addQuote,
        updateQuote,
        deleteQuote,
        accounts,
        accountingEntries,
        addAccount,
        updateAccount,
        deleteAccount,
        addAccountingEntry,
        updateAccountingEntry,
        deleteAccountingEntry,
        bankAccounts,
        cashTransactions,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        addCashTransaction,
        updateCashTransaction,
        deleteCashTransaction,
        projects,
        addProject,
        updateProject,
        deleteProject,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        projectMembers,
        addProjectMember,
        updateProjectMember,
        deleteProjectMember,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
