"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  Edit,
  Eye,
  FileText,
  History,
  Loader2,
  MoreHorizontal,
  Package,
  PackagePlus,
  Printer,
  RefreshCw,
  Search,
  ShoppingCart,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:4000";

interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  manager?: string;
  capacity?: number;
  status?: string;
  type?: string;
}

interface InventoryItem {
  _id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  warehouseId?: string;
  quantity: number;
  unitPrice: number;
  reorderPoint: number;
  description?: string;
  storageLocation?: string;
  expiryDate?: string;
  trackExpiry: boolean;
  supplier?: string;
  status: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  stockLevel?: string;
  totalValue?: number;
}

interface InventoryHistory {
  _id: string;
  action: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reference: string;
  performedBy: string;
  notes: string;
  status: string;
  createdAt: string;
}

export default function InventoryLevelsPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemHistory, setItemHistory] = useState<InventoryHistory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Dialog states
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [viewHistoryOpen, setViewHistoryOpen] = useState(false);
  const [restockItemOpen, setRestockItemOpen] = useState(false);
  const [transferItemOpen, setTransferItemOpen] = useState(false);
  const [deleteItemOpen, setDeleteItemOpen] = useState(false);
  const [addItemOpen, setAddItemOpen] = useState(false);

  // Form states
  const [restockForm, setRestockForm] = useState({
    quantity: 0,
    unitCost: 0,
    supplier: "",
    purchaseOrder: "",
    notes: "",
  });
  const [transferForm, setTransferForm] = useState({
    quantity: 0,
    toWarehouse: "",
    reason: "",
    priority: "normal",
    notes: "",
  });
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);
  const [newItemForm, setNewItemForm] = useState({
    sku: "",
    name: "",
    category: "",
    warehouse: "",
    quantity: 0,
    unitPrice: 0,
    reorderPoint: 50,
    description: "",
    storageLocation: "",
    expiryDate: "",
    trackExpiry: false,
    supplier: "",
  });

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/shipments/warehouses`);
      const data = await response.json();
      if (data.success) {
        setWarehouses(data.data);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [inventoryRes, statsRes, lowStockRes, expiringRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory/all`),
        fetch(`${API_URL}/api/inventory/stats`),
        fetch(`${API_URL}/api/inventory/low-stock`),
        fetch(`${API_URL}/api/inventory/expiring`),
      ]);

      const inventoryData = await inventoryRes.json();
      const statsData = await statsRes.json();
      const lowStockData = await lowStockRes.json();
      const expiringData = await expiringRes.json();

      if (inventoryData.success) {
        const items = inventoryData.data;
        const itemsWithStockLevel = items.map((item: InventoryItem) => ({
          ...item,
          stockLevel: getStockLevel(item.quantity, item.reorderPoint),
          totalValue: item.quantity * item.unitPrice,
        }));
        setInventoryItems(itemsWithStockLevel);
        setFilteredItems(itemsWithStockLevel);
      }
      if (statsData.success) setStats(statsData.data);
      if (lowStockData.success) setLowStockItems(lowStockData.data);
      if (expiringData.success) setExpiringItems(expiringData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
    fetchData();
  }, []);

  // Filter items
  useEffect(() => {
    let filtered = [...inventoryItems];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (warehouseFilter !== "all") {
      filtered = filtered.filter((item) => item.warehouse === warehouseFilter);
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.stockLevel === statusFilter);
    }

    setFilteredItems(filtered);
  }, [searchTerm, warehouseFilter, categoryFilter, statusFilter, inventoryItems]);

  const getStockLevel = (quantity: number, reorderPoint: number): string => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < reorderPoint) return "Low Stock";
    if (quantity > reorderPoint * 3) return "Overstock";
    return "In Stock";
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "In Stock":
        return "bg-green-100 text-green-700";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-700";
      case "Out of Stock":
        return "bg-red-100 text-red-700";
      case "Overstock":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const showAlert = (message: string, type: "success" | "error" = "success") => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessMessage("");
    }, 3000);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/inventory/${selectedItem?._id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restockForm),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Item restocked successfully!");
        setRestockItemOpen(false);
        fetchData();
        setRestockForm({ quantity: 0, unitCost: 0, supplier: "", purchaseOrder: "", notes: "" });
      } else {
        showAlert(data.message || "Failed to restock item", "error");
      }
    } catch (error) {
      showAlert("Network error!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/inventory/${selectedItem?._id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transferForm),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Item transferred successfully!");
        setTransferItemOpen(false);
        fetchData();
        setTransferForm({ quantity: 0, toWarehouse: "", reason: "", priority: "normal", notes: "" });
      } else {
        showAlert(data.message || "Failed to transfer item", "error");
      }
    } catch (error) {
      showAlert("Network error!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/inventory/delete/${selectedItem?._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Item deleted successfully!");
        setDeleteItemOpen(false);
        fetchData();
      } else {
        showAlert(data.message || "Failed to delete item", "error");
      }
    } catch (error) {
      showAlert("Network error!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/inventory/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItemForm),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Item created successfully!");
        setAddItemOpen(false);
        fetchData();
        setNewItemForm({
          sku: "", name: "", category: "", warehouse: "", quantity: 0, unitPrice: 0,
          reorderPoint: 50, description: "", storageLocation: "", expiryDate: "", trackExpiry: false, supplier: "",
        });
      } else {
        showAlert(data.message || "Failed to create item", "error");
      }
    } catch (error) {
      showAlert("Network error!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/inventory/update/${selectedItem?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Item updated successfully!");
        setEditItemOpen(false);
        fetchData();
      } else {
        showAlert(data.message || "Failed to update item", "error");
      }
    } catch (error) {
      showAlert("Network error!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchHistory = async (itemId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/inventory/${itemId}/history`);
      const data = await response.json();
      if (data.success) setItemHistory(data.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleItemAction = (action: string, item: InventoryItem) => {
    setSelectedItem(item);
    switch (action) {
      case "viewDetails":
        setViewDetailsOpen(true);
        break;
      case "editItem":
        setEditForm(item);
        setEditItemOpen(true);
        break;
      case "viewHistory":
        fetchHistory(item._id);
        setViewHistoryOpen(true);
        break;
      case "restockItem":
        setRestockItemOpen(true);
        break;
      case "transferItem":
        setTransferItemOpen(true);
        break;
      case "deleteItem":
        setDeleteItemOpen(true);
        break;
      default:
        break;
    }
  };

  const categories = [...new Set(inventoryItems.map((item) => item.category))];
  const warehouseNames = warehouses.map(w => w.name);
  const warehouseOptions = warehouses.map(w => ({ value: w.name, label: w.name }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const inventoryValueByCategory = categories.map((cat) => ({
    name: cat,
    value: inventoryItems.filter((i) => i.category === cat).reduce((sum, i) => sum + (i.totalValue || 0), 0),
  }));

  const warehouseData = warehouseNames.map((w) => ({
    warehouse: w,
    count: inventoryItems.filter((i) => i.warehouse === w).length,
  }));

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Success Alert */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <div className="rounded-lg bg-green-50 border border-green-500 p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
              <button onClick={() => setShowSuccess(false)} className="ml-auto">
                <X className="h-4 w-4 text-green-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Levels</h1>
        <p className="text-muted-foreground">Monitor and manage inventory across all warehouse locations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold">{stats.totalItems.toLocaleString()}</h3>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                <h3 className="text-2xl font-bold">{stats.lowStockItems}</h3>
              </div>
              <div className="rounded-full bg-amber-500/10 p-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Value</p>
                <h3 className="text-2xl font-bold">${(stats.totalValue / 1000000).toFixed(2)}M</h3>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <ShoppingCart className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                <h3 className="text-2xl font-bold">{stats.outOfStockItems}</h3>
              </div>
              <div className="rounded-full bg-red-500/10 p-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all-inventory" className="w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <TabsList className="flex flex-wrap gap-2 h-full sm:w-max justify-start">
            <TabsTrigger value="all-inventory">All Inventory</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="expiring">Expiring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PackagePlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Inventory</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Inventory Item</DialogTitle>
                  <DialogDescription>Enter the details for the new inventory item.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateItem}>
                  <div className="grid gap-4 py-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Item Name *</Label>
                        <Input value={newItemForm.name} onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })} required />
                      </div>
                      <div className="grid gap-2">
                        <Label>SKU *</Label>
                        <Input value={newItemForm.sku} onChange={(e) => setNewItemForm({ ...newItemForm, sku: e.target.value.toUpperCase() })} required />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Category *</Label>
                        <Select value={newItemForm.category} onValueChange={(v) => setNewItemForm({ ...newItemForm, category: v })}>
                          <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Clothing">Clothing</SelectItem>
                            <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                            <SelectItem value="Automotive">Automotive</SelectItem>
                            <SelectItem value="Home Goods">Home Goods</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Warehouse *</Label>
                        <Select value={newItemForm.warehouse} onValueChange={(v) => setNewItemForm({ ...newItemForm, warehouse: v })}>
                          <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                          <SelectContent>
                            {warehouses.map((w) => (
                              <SelectItem key={w._id} value={w.name}>{w.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label>Quantity</Label>
                        <Input type="number" value={newItemForm.quantity} onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseInt(e.target.value) || 0 })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Unit Price ($)</Label>
                        <Input type="number" step="0.01" value={newItemForm.unitPrice} onChange={(e) => setNewItemForm({ ...newItemForm, unitPrice: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Reorder Point</Label>
                        <Input type="number" value={newItemForm.reorderPoint} onChange={(e) => setNewItemForm({ ...newItemForm, reorderPoint: parseInt(e.target.value) || 50 })} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Description</Label>
                      <Textarea value={newItemForm.description} onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Storage Location</Label>
                        <Input value={newItemForm.storageLocation} onChange={(e) => setNewItemForm({ ...newItemForm, storageLocation: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Supplier</Label>
                        <Input value={newItemForm.supplier} onChange={(e) => setNewItemForm({ ...newItemForm, supplier: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={newItemForm.trackExpiry} onCheckedChange={(c) => setNewItemForm({ ...newItemForm, trackExpiry: c })} />
                      <Label>Track expiration date</Label>
                    </div>
                    {newItemForm.trackExpiry && (
                      <div className="grid gap-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" value={newItemForm.expiryDate} onChange={(e) => setNewItemForm({ ...newItemForm, expiryDate: e.target.value })} />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setAddItemOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Item"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="my-4 flex gap-4 flex-wrap justify-between">
          <div className="relative w-full min-w-[280px] max-w-[500px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search inventory..." className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Warehouse" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w._id} value={w.name}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Stock Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                <SelectItem value="Overstock">Overstock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* All Inventory Tab */}
        <TabsContent value="all-inventory" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Inventory Items</CardTitle>
              <CardDescription>Showing {filteredItems.length} of {inventoryItems.length} items</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead><TableHead>Item Name</TableHead><TableHead>Category</TableHead>
                        <TableHead>Warehouse</TableHead><TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Stock Level</TableHead><TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total Value</TableHead><TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell><div className="flex items-center gap-2"><Warehouse className="h-4 w-4" />{item.warehouse}</div></TableCell>
                          <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={getStockLevelColor(item.stockLevel || "")}>{item.stockLevel}</Badge>
                          </TableCell>
                          <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleItemAction("viewDetails", item)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleItemAction("editItem", item)}><Edit className="mr-2 h-4 w-4" />Edit Item</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleItemAction("viewHistory", item)}><History className="mr-2 h-4 w-4" />View History</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleItemAction("restockItem", item)}><RefreshCw className="mr-2 h-4 w-4" />Restock Item</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleItemAction("transferItem", item)}><Truck className="mr-2 h-4 w-4" />Transfer Item</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleItemAction("deleteItem", item)}><Trash2 className="mr-2 h-4 w-4" />Delete Item</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Stock Tab */}
        <TabsContent value="low-stock" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Low Stock Items</CardTitle><CardDescription>Items below reorder point</CardDescription></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>SKU</TableHead><TableHead>Item Name</TableHead><TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Current Qty</TableHead><TableHead className="text-right">Reorder Point</TableHead>
                      <TableHead className="text-right">Stock Level</TableHead><TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.reorderPoint}</TableCell>
                        <TableCell className="text-right"><Badge variant="destructive">Low Stock</Badge></TableCell>
                        <TableCell><Button size="sm" onClick={() => handleItemAction("restockItem", item)}>Restock</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiring Tab */}
        <TabsContent value="expiring" className="mt-0">
          <Card>
            <CardHeader><CardTitle>Expiring Inventory</CardTitle><CardDescription>Items expiring within 90 days</CardDescription></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>SKU</TableHead><TableHead>Item Name</TableHead><TableHead>Category</TableHead>
                      <TableHead>Warehouse</TableHead><TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.expiryDate ? format(new Date(item.expiryDate), "dd MMM yyyy") : "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Inventory Value by Category</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={inventoryValueByCategory} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent! * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                      {inventoryValueByCategory.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `$${(v / 1000000).toFixed(2)}M`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Inventory by Warehouse</CardTitle></CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={warehouseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="warehouse" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Item Details</DialogTitle><DialogDescription>{selectedItem?.name}</DialogDescription></DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-muted-foreground">SKU</p><p className="font-mono">{selectedItem.sku}</p></div>
                <div><p className="text-sm text-muted-foreground">Category</p><p>{selectedItem.category}</p></div>
                <div><p className="text-sm text-muted-foreground">Warehouse</p><p>{selectedItem.warehouse}</p></div>
                <div><p className="text-sm text-muted-foreground">Storage Location</p><p>{selectedItem.storageLocation || "N/A"}</p></div>
                <div><p className="text-sm text-muted-foreground">Quantity</p><p>{selectedItem.quantity.toLocaleString()}</p></div>
                <div><p className="text-sm text-muted-foreground">Unit Price</p><p>${selectedItem.unitPrice.toFixed(2)}</p></div>
                <div><p className="text-sm text-muted-foreground">Total Value</p><p>${((selectedItem.totalValue || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></div>
                <div><p className="text-sm text-muted-foreground">Stock Level</p><Badge className={getStockLevelColor(selectedItem.stockLevel || "")}>{selectedItem.stockLevel}</Badge></div>
              </div>
              <div><p className="text-sm text-muted-foreground">Description</p><p className="text-sm">{selectedItem.description || "No description"}</p></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editItemOpen} onOpenChange={setEditItemOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Item</DialogTitle><DialogDescription>Update {selectedItem?.name}</DialogDescription></DialogHeader>
          {editForm && (
            <form onSubmit={handleUpdateItem}>
              <div className="grid gap-4 py-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Item Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                  <div><Label>SKU</Label><Input value={editForm.sku} disabled /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Category</Label><Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Electronics">Electronics</SelectItem><SelectItem value="Clothing">Clothing</SelectItem><SelectItem value="Food & Beverage">Food & Beverage</SelectItem><SelectItem value="Automotive">Automotive</SelectItem><SelectItem value="Home Goods">Home Goods</SelectItem></SelectContent></Select></div>
                  <div><Label>Warehouse</Label><Select value={editForm.warehouse} onValueChange={(v) => setEditForm({ ...editForm, warehouse: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{warehouses.map((w) => (<SelectItem key={w._id} value={w.name}>{w.name}</SelectItem>))}</SelectContent></Select></div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div><Label>Quantity</Label><Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 0 })} /></div>
                  <div><Label>Unit Price</Label><Input type="number" step="0.01" value={editForm.unitPrice} onChange={(e) => setEditForm({ ...editForm, unitPrice: parseFloat(e.target.value) || 0 })} /></div>
                  <div><Label>Reorder Point</Label><Input type="number" value={editForm.reorderPoint} onChange={(e) => setEditForm({ ...editForm, reorderPoint: parseInt(e.target.value) || 0 })} /></div>
                </div>
                <div><Label>Description</Label><Textarea value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" type="button" onClick={() => setEditItemOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View History Dialog */}
      <Dialog open={viewHistoryOpen} onOpenChange={setViewHistoryOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Item History</DialogTitle><DialogDescription>{selectedItem?.name}</DialogDescription></DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {itemHistory.map((h) => (
                <div key={h._id} className="rounded-lg border p-3">
                  <div className="flex justify-between items-start">
                    <div><p className="font-medium capitalize">{h.action}</p><p className="text-sm text-muted-foreground">{h.notes}</p></div>
                    <span className="text-xs text-muted-foreground">{format(new Date(h.createdAt), "dd MMM yyyy")}</span>
                  </div>
                  <div className="mt-2 text-sm"><span className="font-medium">Quantity:</span> {h.quantity} units</div>
                </div>
              ))}
              {itemHistory.length === 0 && <p className="text-center text-muted-foreground py-8">No history found</p>}
            </div>
          </ScrollArea>
          <DialogFooter><Button variant="outline" onClick={() => setViewHistoryOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockItemOpen} onOpenChange={setRestockItemOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Restock Item</DialogTitle><DialogDescription>Add inventory for {selectedItem?.name}</DialogDescription></DialogHeader>
          <form onSubmit={handleRestock}>
            <div className="grid gap-4 py-4">
              <div><Label>Quantity to Add *</Label><Input type="number" required value={restockForm.quantity} onChange={(e) => setRestockForm({ ...restockForm, quantity: parseInt(e.target.value) })} /></div>
              <div><Label>Unit Cost ($)</Label><Input type="number" step="0.01" value={restockForm.unitCost} onChange={(e) => setRestockForm({ ...restockForm, unitCost: parseFloat(e.target.value) })} /></div>
              <div><Label>Supplier</Label><Input value={restockForm.supplier} onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })} /></div>
              <div><Label>Purchase Order #</Label><Input value={restockForm.purchaseOrder} onChange={(e) => setRestockForm({ ...restockForm, purchaseOrder: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={restockForm.notes} onChange={(e) => setRestockForm({ ...restockForm, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setRestockItemOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirm Restock"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferItemOpen} onOpenChange={setTransferItemOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Transfer Item</DialogTitle><DialogDescription>Transfer {selectedItem?.name} to another warehouse</DialogDescription></DialogHeader>
          <form onSubmit={handleTransfer}>
            <div className="grid gap-4 py-4">
              <div><Label>Quantity to Transfer *</Label><Input type="number" required max={selectedItem?.quantity} value={transferForm.quantity} onChange={(e) => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) })} /></div>
              <div><Label>To Warehouse *</Label>
                <Select value={transferForm.toWarehouse} onValueChange={(v) => setTransferForm({ ...transferForm, toWarehouse: v })}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(w => w.name !== selectedItem?.warehouse).map((w) => (
                      <SelectItem key={w._id} value={w.name}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Reason</Label><Select value={transferForm.reason} onValueChange={(v) => setTransferForm({ ...transferForm, reason: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rebalance">Stock Rebalancing</SelectItem><SelectItem value="demand">High Demand</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              <div><Label>Priority</Label><RadioGroup value={transferForm.priority} onValueChange={(v) => setTransferForm({ ...transferForm, priority: v })} className="flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="low" id="low" /><Label htmlFor="low">Low</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="normal" id="normal" /><Label htmlFor="normal">Normal</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="high" id="high" /><Label htmlFor="high">High</Label></div></RadioGroup></div>
              <div><Label>Notes</Label><Textarea value={transferForm.notes} onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="outline" type="button" onClick={() => setTransferItemOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initiate Transfer"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteItemOpen} onOpenChange={setDeleteItemOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Delete Item</DialogTitle><DialogDescription>Are you sure you want to delete {selectedItem?.name}?</DialogDescription></DialogHeader>
          <div className="py-4"><div className="rounded-lg border border-red-200 bg-red-50 p-4"><div className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-500" /><div><h3 className="font-medium text-red-800">Warning</h3><p className="text-sm text-red-700">This action cannot be undone.</p></div></div></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteItemOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Item"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}