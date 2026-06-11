"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Users, Shield, Settings, Eye, Search } from "lucide-react"
import PageHeader from "@/components/shared/PageHeader"

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive"
  lastLogin: string
}

const permissions: Permission[] = [
  // Dashboard & Overview
  { id: "dashboard.view", name: "View Dashboard", description: "Access to main dashboard", category: "Dashboard" },
  { id: "overview.view", name: "View Overview", description: "Access to overview page", category: "Dashboard" },

  // Shipments
  { id: "shipments.view", name: "View Shipments", description: "View shipment information", category: "Shipments" },
  { id: "shipments.create", name: "Create Shipments", description: "Create new shipments", category: "Shipments" },
  { id: "shipments.edit", name: "Edit Shipments", description: "Modify existing shipments", category: "Shipments" },
  { id: "shipments.delete", name: "Delete Shipments", description: "Remove shipments", category: "Shipments" },
  { id: "shipments.track", name: "Track Shipments", description: "Access shipment tracking", category: "Shipments" },

  // Orders
  { id: "orders.view", name: "View Orders", description: "View order information", category: "Orders" },
  { id: "orders.create", name: "Create Orders", description: "Create new orders", category: "Orders" },
  { id: "orders.edit", name: "Edit Orders", description: "Modify existing orders", category: "Orders" },
  { id: "orders.cancel", name: "Cancel Orders", description: "Cancel orders", category: "Orders" },
  { id: "orders.schedule", name: "Schedule Orders", description: "Schedule order deliveries", category: "Orders" },

  // Fleet Management
  { id: "fleet.view", name: "View Fleet", description: "View fleet information", category: "Fleet" },
  { id: "fleet.manage", name: "Manage Fleet", description: "Manage fleet operations", category: "Fleet" },
  { id: "fleet.maintenance", name: "Fleet Maintenance", description: "Manage vehicle maintenance", category: "Fleet" },
  { id: "drivers.view", name: "View Drivers", description: "View driver information", category: "Fleet" },
  { id: "drivers.manage", name: "Manage Drivers", description: "Manage driver assignments", category: "Fleet" },

  // Warehouses
  { id: "warehouses.view", name: "View Warehouses", description: "View warehouse information", category: "Warehouses" },
  {
    id: "warehouses.manage",
    name: "Manage Warehouses",
    description: "Manage warehouse operations",
    category: "Warehouses",
  },
  { id: "inventory.view", name: "View Inventory", description: "View inventory levels", category: "Warehouses" },
  {
    id: "inventory.manage",
    name: "Manage Inventory",
    description: "Manage inventory operations",
    category: "Warehouses",
  },

  // Clients & Vendors
  { id: "clients.view", name: "View Clients", description: "View client information", category: "Clients" },
  { id: "clients.manage", name: "Manage Clients", description: "Manage client relationships", category: "Clients" },
  { id: "vendors.view", name: "View Vendors", description: "View vendor information", category: "Vendors" },
  { id: "vendors.manage", name: "Manage Vendors", description: "Manage vendor relationships", category: "Vendors" },

  // Reports
  { id: "reports.view", name: "View Reports", description: "Access to reports", category: "Reports" },
  { id: "reports.export", name: "Export Reports", description: "Export report data", category: "Reports" },
  { id: "reports.schedule", name: "Schedule Reports", description: "Schedule automated reports", category: "Reports" },

  // Settings & Administration
  { id: "settings.view", name: "View Settings", description: "Access to settings", category: "Settings" },
  { id: "settings.manage", name: "Manage Settings", description: "Modify system settings", category: "Settings" },
  { id: "users.view", name: "View Users", description: "View user information", category: "Administration" },
  { id: "users.manage", name: "Manage Users", description: "Manage user accounts", category: "Administration" },
  { id: "roles.manage", name: "Manage Roles", description: "Manage roles and permissions", category: "Administration" },
]

const defaultRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all permissions",
    permissions: permissions.map((p) => p.id),
    userCount: 2,
    isSystem: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Fleet Manager",
    description: "Manages fleet operations and drivers",
    permissions: [
      "dashboard.view",
      "overview.view",
      "fleet.view",
      "fleet.manage",
      "fleet.maintenance",
      "drivers.view",
      "drivers.manage",
      "shipments.view",
      "shipments.track",
      "reports.view",
    ],
    userCount: 5,
    isSystem: false,
    createdAt: "2024-01-15",
    updatedAt: "2024-02-10",
  },
  {
    id: "3",
    name: "Warehouse Manager",
    description: "Manages warehouse operations and inventory",
    permissions: [
      "dashboard.view",
      "overview.view",
      "warehouses.view",
      "warehouses.manage",
      "inventory.view",
      "inventory.manage",
      "orders.view",
      "orders.edit",
      "reports.view",
    ],
    userCount: 8,
    isSystem: false,
    createdAt: "2024-01-15",
    updatedAt: "2024-02-05",
  },
  {
    id: "4",
    name: "Operations Coordinator",
    description: "Coordinates shipments and orders",
    permissions: [
      "dashboard.view",
      "overview.view",
      "shipments.view",
      "shipments.create",
      "shipments.edit",
      "shipments.track",
      "orders.view",
      "orders.create",
      "orders.edit",
      "orders.schedule",
    ],
    userCount: 12,
    isSystem: false,
    createdAt: "2024-01-20",
    updatedAt: "2024-02-15",
  },
  {
    id: "5",
    name: "Customer Service",
    description: "Handles customer inquiries and basic operations",
    permissions: [
      "dashboard.view",
      "shipments.view",
      "shipments.track",
      "orders.view",
      "clients.view",
      "clients.manage",
    ],
    userCount: 15,
    isSystem: false,
    createdAt: "2024-01-25",
    updatedAt: "2024-02-08",
  },
  {
    id: "6",
    name: "Viewer",
    description: "Read-only access to most system data",
    permissions: [
      "dashboard.view",
      "overview.view",
      "shipments.view",
      "orders.view",
      "fleet.view",
      "warehouses.view",
      "inventory.view",
      "clients.view",
      "vendors.view",
    ],
    userCount: 25,
    isSystem: false,
    createdAt: "2024-02-01",
    updatedAt: "2024-02-01",
  },
]

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john@cargomax.com",
    role: "Super Admin",
    status: "active",
    lastLogin: "2024-12-28 14:30",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@cargomax.com",
    role: "Fleet Manager",
    status: "active",
    lastLogin: "2024-12-28 13:45",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike@cargomax.com",
    role: "Warehouse Manager",
    status: "active",
    lastLogin: "2024-12-28 12:15",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@cargomax.com",
    role: "Operations Coordinator",
    status: "active",
    lastLogin: "2024-12-28 11:30",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@cargomax.com",
    role: "Customer Service",
    status: "inactive",
    lastLogin: "2024-12-27 16:20",
  },
]

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false)
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  // Form states
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUserRole, setNewUserRole] = useState("")

  const categories = ["all", ...Array.from(new Set(permissions.map((p) => p.category)))]

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || permission.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateRole = () => {
    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      userCount: 0,
      isSystem: false,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setRoles([...roles, role])
    setNewRole({ name: "", description: "", permissions: [] })
    setIsCreateRoleOpen(false)
  }

  const handleEditRole = () => {
    if (!editingRole) return

    setRoles(
      roles.map((role) =>
        role.id === editingRole.id ? { ...editingRole, updatedAt: new Date().toISOString().split("T")[0] } : role,
      ),
    )
    setEditingRole(null)
    setIsEditRoleOpen(false)
  }

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter((role) => role.id !== roleId))
  }

  const handleAssignRole = () => {
    if (!selectedUser || !newUserRole) return

    setUsers(users.map((user) => (user.id === selectedUser.id ? { ...user, role: newUserRole } : user)))

    // Update role user counts
    setRoles(
      roles.map((role) => {
        if (role.name === selectedUser.role) {
          return { ...role, userCount: Math.max(0, role.userCount - 1) }
        }
        if (role.name === newUserRole) {
          return { ...role, userCount: role.userCount + 1 }
        }
        return role
      }),
    )

    setSelectedUser(null)
    setNewUserRole("")
    setIsAssignRoleOpen(false)
  }

  const togglePermission = (
    permissionId: string,
    rolePermissions: string[],
    setPermissions: (permissions: string[]) => void,
  ) => {
    if (rolePermissions.includes(permissionId)) {
      setPermissions(rolePermissions.filter((id) => id !== permissionId))
    } else {
      setPermissions([...rolePermissions, permissionId])
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader pageTitle="Roles & Permissions" pageDes="Manage user roles and system permissions" />

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="flex flex-wrap justify-start sm:w-max h-max">
          <TabsTrigger value="roles">Roles Management</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
          <TabsTrigger value="permissions">Permissions Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                  <DialogDescription>
                    Define a new role with specific permissions for your team members.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role-name">Role Name</Label>
                      <Input
                        id="role-name"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="Enter role name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-description">Description</Label>
                      <Input
                        id="role-description"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                        placeholder="Enter role description"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <Label>Permissions</Label>
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === "all" ? "All Categories" : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                      {categories
                        .filter((cat) => cat !== "all")
                        .map((category) => {
                          const categoryPermissions = filteredPermissions.filter((p) => p.category === category)
                          if (categoryPermissions.length === 0) return null

                          return (
                            <div key={category} className="mb-4">
                              <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                              <div className="space-y-2">
                                {categoryPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`new-${permission.id}`}
                                      checked={newRole.permissions.includes(permission.id)}
                                      onCheckedChange={() =>
                                        togglePermission(permission.id, newRole.permissions, (permissions) =>
                                          setNewRole({ ...newRole, permissions }),
                                        )
                                      }
                                    />
                                    <div className="flex-1">
                                      <Label htmlFor={`new-${permission.id}`} className="text-sm font-medium">
                                        {permission.name}
                                      </Label>
                                      <p className="text-xs text-gray-500">{permission.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole} disabled={!newRole.name.trim()}>
                    Create Role
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {roles
              .filter(
                (role) =>
                  role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  role.description.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <span>{role.name}</span>
                            {role.isSystem && <Badge variant="secondary">System</Badge>}
                          </CardTitle>
                          <CardDescription>{role.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{role.userCount} users</span>
                        </Badge>
                        <Dialog
                          open={isEditRoleOpen && editingRole?.id === role.id}
                          onOpenChange={(open) => {
                            setIsEditRoleOpen(open)
                            if (!open) setEditingRole(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingRole({ ...role })}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Role: {role.name}</DialogTitle>
                              <DialogDescription>Modify role permissions and details.</DialogDescription>
                            </DialogHeader>
                            {editingRole && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-role-name">Role Name</Label>
                                    <Input
                                      id="edit-role-name"
                                      value={editingRole.name}
                                      onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                                      disabled={role.isSystem}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="edit-role-description">Description</Label>
                                    <Input
                                      id="edit-role-description"
                                      value={editingRole.description}
                                      onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                                    />
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <Label>Permissions</Label>
                                  <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                                    {categories
                                      .filter((cat) => cat !== "all")
                                      .map((category) => {
                                        const categoryPermissions = permissions.filter((p) => p.category === category)

                                        return (
                                          <div key={category} className="mb-4">
                                            <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                                            <div className="space-y-2">
                                              {categoryPermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`edit-${permission.id}`}
                                                    checked={editingRole.permissions.includes(permission.id)}
                                                    onCheckedChange={() =>
                                                      togglePermission(
                                                        permission.id,
                                                        editingRole.permissions,
                                                        (permissions) =>
                                                          setEditingRole({ ...editingRole, permissions }),
                                                      )
                                                    }
                                                    disabled={role.isSystem}
                                                  />
                                                  <div className="flex-1">
                                                    <Label
                                                      htmlFor={`edit-${permission.id}`}
                                                      className="text-sm font-medium"
                                                    >
                                                      {permission.name}
                                                    </Label>
                                                    <p className="text-xs text-gray-500">{permission.description}</p>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )
                                      })}
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleEditRole}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        {!role.isSystem && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the "{role.name}" role? This action cannot be undone.
                                  Users with this role will need to be reassigned.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Role
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Permissions:</span>
                        <span className="font-medium">{role.permissions.length} assigned</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 8).map((permissionId) => {
                          const permission = permissions.find((p) => p.id === permissionId)
                          return permission ? (
                            <Badge key={permissionId} variant="secondary" className="text-xs">
                              {permission.name}
                            </Badge>
                          ) : null
                        })}
                        {role.permissions.length > 8 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 8} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {role.createdAt}</span>
                        <span>Updated: {role.updatedAt}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search users..." className="pl-10 w-64" />
              </div>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>Manage user role assignments and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "Super Admin" ? "default" : "secondary"}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{user.lastLogin}</TableCell>
                      <TableCell>
                        <Dialog
                          open={isAssignRoleOpen && selectedUser?.id === user.id}
                          onOpenChange={(open) => {
                            setIsAssignRoleOpen(open)
                            if (!open) {
                              setSelectedUser(null)
                              setNewUserRole("")
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewUserRole(user.role)
                              }}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Assign Role
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Role to {user.name}</DialogTitle>
                              <DialogDescription>
                                Select a new role for this user. This will change their system permissions.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Current Role</Label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <Badge>{user.role}</Badge>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="new-role">New Role</Label>
                                <Select value={newUserRole} onValueChange={setNewUserRole}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {roles.map((role) => (
                                      <SelectItem key={role.id} value={role.name}>
                                        <div className="flex items-center justify-between w-full">
                                          <span>{role.name}</span>
                                          <Badge variant="outline" className="ml-2">
                                            {role.permissions.length} permissions
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {newUserRole && newUserRole !== user.role && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">
                                    This will change the user's permissions from {user.role} to {newUserRole}.
                                  </p>
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAssignRole} disabled={!newUserRole || newUserRole === user.role}>
                                Assign Role
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2 md:gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6">
            {categories
              .filter((cat) => cat !== "all")
              .map((category) => {
                const categoryPermissions = filteredPermissions.filter((p) => p.category === category)
                if (categoryPermissions.length === 0) return null

                return (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <span>{category}</span>
                        <Badge variant="outline">{categoryPermissions.length} permissions</Badge>
                      </CardTitle>
                      <CardDescription>Permissions related to {category.toLowerCase()} functionality</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryPermissions.map((permission) => {
                          const rolesWithPermission = roles.filter((role) => role.permissions.includes(permission.id))

                          return (
                            <div
                              key={permission.id}
                              className="flex flex-wrap gap-2 items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="">
                                <h4 className="font-medium">{permission.name}</h4>
                                <p className="text-sm text-gray-600">{permission.description}</p>
                              </div>
                              <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm text-gray-500">
                                  {rolesWithPermission.length} role{rolesWithPermission.length !== 1 ? "s" : ""}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {rolesWithPermission.slice(0, 3).map((role) => (
                                    <Badge key={role.id} variant="secondary" className="text-xs">
                                      {role.name}
                                    </Badge>
                                  ))}
                                  {rolesWithPermission.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{rolesWithPermission.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
