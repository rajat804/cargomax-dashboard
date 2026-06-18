"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  DollarSign,
  ShieldCheck,
  BoxesIcon,
  Network,
  ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";
import { getStorageJSON, isAuthenticated } from "@/utils/storage";

// Available modules
const AVAILABLE_MODULES = [
  { id: "Operations", name: "Operations", icon: ClipboardList },
  { id: "Accounts", name: "Accounts", icon: DollarSign },
  { id: "Administrator", name: "Administrator", icon: ShieldCheck },
  { id: "Inventory", name: "Inventory", icon: BoxesIcon },
  { id: "Network", name: "Network", icon: Network },
];

// Module icons mapping
const MODULE_ICONS: Record<string, any> = {
  Operations: ClipboardList,
  Accounts: DollarSign,
  Administrator: ShieldCheck,
  Inventory: BoxesIcon,
  Network: Network,
};

// User type
interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  branchCode: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  modules?: string[];
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    branch: "",
    branchCode: "",
    modules: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.replace("/auth/login");
        return;
      }

      const userData = getStorageJSON("user");
      if (userData) {
        setCurrentUser(userData);
        if (userData.role === "admin" || userData.role === "superadmin") {
          setIsAdmin(true);
        } else {
          toast.error("Access denied. Admin rights required.");
          router.push("/dashboard/overview");
        }
      }
    };

    checkAuth();
  }, [router]);

  // Fetch users
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      
      const response = await fetch("http://localhost:5000/api/auth/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle edit
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "user",
      branch: user.branch || "",
      branchCode: user.branchCode || "",
      modules: user.modules || AVAILABLE_MODULES.map((m) => m.id),
    });
    setIsEditModalOpen(true);
  };

  const handleModuleToggle = (moduleId: string) => {
    setEditFormData((prev) => {
      const modules = prev.modules || [];
      if (modules.includes(moduleId)) {
        return { ...prev, modules: modules.filter((m) => m !== moduleId) };
      } else {
        return { ...prev, modules: [...modules, moduleId] };
      }
    });
  };

  const handleEditSubmit = async () => {
    if (!editingUser) return;

    try {
      setEditLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");

      // Clean data
      const cleanData = {
        name: editFormData.name?.trim() || "",
        email: editFormData.email?.trim() || "",
        phone: editFormData.phone?.trim() || "",
        role: editFormData.role || "user",
        branch: editFormData.branch?.trim() || "",
        branchCode: editFormData.branchCode?.trim() || "",
      };

      // Update user profile
      const profileResponse = await fetch(`http://localhost:5000/api/auth/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanData),
      });

      const profileData = await profileResponse.json();

      if (!profileData.success) {
        toast.error(profileData.message || "Failed to update user");
        return;
      }

      // Update user modules
      const modulesResponse = await fetch(`http://localhost:5000/api/auth/users/${editingUser._id}/modules`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modules: editFormData.modules || [],
        }),
      });

      const modulesData = await modulesResponse.json();

      if (modulesData.success) {
        toast.success("User updated successfully");
        setIsEditModalOpen(false);
        fetchUsers();
      } else {
        toast.error(modulesData.message || "Failed to update modules");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;

    try {
      setDeleteLoading(true);
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/auth/users/${deletingUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/auth/users/${user._id}/toggle-status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`User ${user.isActive ? "deactivated" : "activated"} successfully`);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to toggle user status");
      }
    } catch (error: any) {
      console.error("Error toggling user status:", error);
      toast.error(error.message || "Failed to toggle user status");
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    if (role === "admin" || role === "superadmin") {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Admin</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">User</Badge>;
  };

  // Get status badge
  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Inactive</Badge>;
  };

  // Get module badges
  const getModuleBadges = (modules: string[] = []) => {
    if (!modules || modules.length === 0) {
      return <span className="text-xs text-muted-foreground">No modules</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {modules.map((module) => {
          const Icon = MODULE_ICONS[module];
          return (
            <Badge key={module} variant="outline" className="text-xs flex items-center gap-1">
              {Icon && <Icon className="h-3 w-3" />}
              {module}
            </Badge>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage all users and their module permissions
          </p>
        </div>
        <Button onClick={() => router.push("/auth/register")}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Total {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Modules</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.branch || "-"}</TableCell>
                      <TableCell className="max-w-[200px]">
                        {getModuleBadges(user.modules)}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(user)}
                              className={user.isActive ? "text-orange-600" : "text-green-600"}
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User - Module Access</DialogTitle>
            <DialogDescription>
              Update user information and select which modules they can access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-branch">Branch</Label>
                <Input
                  id="edit-branch"
                  value={editFormData.branch}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, branch: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-branchCode">Branch Code</Label>
                <Input
                  id="edit-branchCode"
                  value={editFormData.branchCode}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, branchCode: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Module Access Section */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Module Access</Label>
                <span className="text-sm text-muted-foreground">
                  Select modules this user can access
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_MODULES.map((module) => {
                  const Icon = module.icon;
                  const isChecked = (editFormData.modules || []).includes(module.id);
                  return (
                    <div
                      key={module.id}
                      className={`
                        flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer
                        ${isChecked 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={() => handleModuleToggle(module.id)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                        className="h-5 w-5"
                      />
                      <Icon className={`h-5 w-5 ${isChecked ? 'text-primary' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isChecked ? 'text-primary' : 'text-gray-600'}`}>
                        {module.name}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {editFormData.modules?.length || 0} of {AVAILABLE_MODULES.length} modules selected
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete user{" "}
              <span className="font-semibold">{deletingUser?.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}