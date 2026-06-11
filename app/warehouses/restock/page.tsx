// app/restock/page.tsx
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  ChevronDown,
  Clock,
  Download,
  FileText,
  MoreHorizontal,
  Package,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Truck,
  Warehouse,
  X,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:5000";

// Types
interface RestockRequest {
  _id: string;
  requestId: string;
  itemName: string;
  warehouse: string;
  warehouseId?: string;
  warehouseName?: string;
  currentStock: number;
  minThreshold: number;
  requestedQuantity: number;
  unitPrice: number;
  totalCost: number;
  status: string;
  priority: string;
  requestedBy: string;
  requestDate: string;
  expectedDelivery: string;
  vendor: string;
  vendorId?: string;
  vendorName?: string;
  notes: string;
  approvalNotes?: string;
  rejectionReason?: string;
  trackingNumber?: string;
  currency: string;
}

interface Warehouse {
  _id: string;
  name: string;
  code: string;
  location: string;
}

interface Vendor {
  _id: string;
  name: string;
  vendorId: string;
  category: string;
  rating: number;
}

// Format currency in INR
const formatINR = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function RestockRequestsPage() {
  const [requests, setRequests] = useState<RestockRequest[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestockRequest | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof RestockRequest;
    direction: "ascending" | "descending";
  } | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    itemName: "",
    warehouseId: "",
    currentStock: 0,
    minThreshold: 0,
    requestedQuantity: 0,
    unitPrice: 0,
    priority: "Medium",
    requestedBy: "",
    expectedDelivery: "",
    vendorId: "",
    notes: "",
  });

  // Fetch Warehouses from backend
  useEffect(() => {
    axios.get(`${API_URL}/api/warehouses`)
      .then(res => setWarehouses(res.data.data || []))
      .catch(err => console.error("Error fetching warehouses:", err));
  }, []);

  // Fetch Vendors from VendorDirectory
  useEffect(() => {
    axios.get(`${API_URL}/api/vendor-directory/all`)
      .then(res => setVendors(res.data.data || []))
      .catch(err => console.error("Error fetching vendors:", err));
  }, []);

  // Fetch all restock requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/restock/all`);
      if (response.data.success) {
        setRequests(response.data.data);
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({ title: "Error", description: "Failed to fetch requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      request.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.warehouseName || request.warehouse)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.vendorName || request.vendor)?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    const matchesPriority = selectedPriority === "all" || request.priority === selectedPriority;
    const matchesWarehouse = selectedWarehouse === "all" || request.warehouseId === selectedWarehouse;
    const matchesTab =
      selectedTab === "all" ||
      (selectedTab === "pending" && request.status === "Pending Approval") ||
      (selectedTab === "approved" && request.status === "Approved") ||
      (selectedTab === "inTransit" && request.status === "In Transit") ||
      (selectedTab === "delivered" && request.status === "Delivered") ||
      (selectedTab === "critical" && request.priority === "Critical");

    return matchesSearch && matchesStatus && matchesPriority && matchesWarehouse && matchesTab;
  });

  // Sort requests - FIXED VERSION
const sortedRequests = sortConfig
  ? [...filteredRequests].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof RestockRequest];
      let bValue = b[sortConfig.key as keyof RestockRequest];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Convert to string for comparison if they are different types
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aStr > bStr) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    })
  : filteredRequests;

    

  // Request counts
  const pendingCount = requests.filter(r => r.status === "Pending Approval").length;
  const approvedCount = requests.filter(r => r.status === "Approved").length;
  const inTransitCount = requests.filter(r => r.status === "In Transit").length;
  const deliveredCount = requests.filter(r => r.status === "Delivered").length;
  const criticalCount = requests.filter(r => r.priority === "Critical").length;
  
  const pendingValue = requests.filter(r => r.status === "Pending Approval").reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const approvedValue = requests.filter(r => r.status === "Approved" || r.status === "In Transit").reduce((sum, r) => sum + (r.totalCost || 0), 0);

  const requestSort = (key: keyof RestockRequest) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortDirectionIcon = (key: keyof RestockRequest) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === "ascending" ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4 rotate-180" />;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedWarehouse("all");
    setSelectedTab("all");
    setSortConfig(null);
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      warehouseId: "",
      currentStock: 0,
      minThreshold: 0,
      requestedQuantity: 0,
      unitPrice: 0,
      priority: "Medium",
      requestedBy: "",
      expectedDelivery: "",
      vendorId: "",
      notes: "",
    });
  };

  // Create new request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedWarehouseObj = warehouses.find(w => w._id === formData.warehouseId);
    const selectedVendorObj = vendors.find(v => v._id === formData.vendorId);
    
    const requestData = {
      itemName: formData.itemName,
      warehouseId: formData.warehouseId,
      warehouse: selectedWarehouseObj?.name || "",
      currentStock: formData.currentStock,
      minThreshold: formData.minThreshold,
      requestedQuantity: formData.requestedQuantity,
      unitPrice: formData.unitPrice,
      priority: formData.priority,
      requestedBy: formData.requestedBy,
      expectedDelivery: formData.expectedDelivery,
      vendorId: formData.vendorId,
      vendor: selectedVendorObj?.name || "",
      notes: formData.notes,
    };
    
    try {
      const response = await axios.post(`${API_URL}/api/restock/create`, requestData);
      if (response.data.success) {
        toast({ title: "Success", description: "Restock request created successfully!" });
        setIsCreateDialogOpen(false);
        fetchRequests();
        resetForm();
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to create request", variant: "destructive" });
    }
  };

  // Update request
  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    try {
      const response = await axios.put(`${API_URL}/api/restock/update/${selectedRequest._id}`, selectedRequest);
      if (response.data.success) {
        toast({ title: "Success", description: "Request updated successfully!" });
        setIsEditDialogOpen(false);
        fetchRequests();
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to update request", variant: "destructive" });
    }
  };

  // Approve request
  const handleApproveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    try {
      const response = await axios.put(`${API_URL}/api/restock/approve/${selectedRequest._id}`, {
        approvalNotes: approvalNotes,
        approvedBy: "Admin"
      });
      if (response.data.success) {
        toast({ title: "Success", description: "Request approved successfully!" });
        setIsApproveDialogOpen(false);
        fetchRequests();
        setApprovalNotes("");
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to approve request", variant: "destructive" });
    }
  };

  // Reject request
  const handleRejectRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      toast({ title: "Error", description: "Please provide a reason for rejection", variant: "destructive" });
      return;
    }
    
    try {
      const response = await axios.put(`${API_URL}/api/restock/reject/${selectedRequest._id}`, {
        rejectionReason: rejectionReason,
        approvedBy: "Admin"
      });
      if (response.data.success) {
        toast({ title: "Success", description: "Request rejected!" });
        setIsRejectDialogOpen(false);
        fetchRequests();
        setRejectionReason("");
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to reject request", variant: "destructive" });
    }
  };

  // Delete request
  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      const response = await axios.delete(`${API_URL}/api/restock/delete/${selectedRequest._id}`);
      if (response.data.success) {
        toast({ title: "Success", description: "Request deleted successfully!" });
        setIsDeleteDialogOpen(false);
        fetchRequests();
        setSelectedRequest(null);
      } else {
        toast({ title: "Error", description: response.data.message, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.message || "Failed to delete request", variant: "destructive" });
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Pending Approval": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>;
      case "Approved": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case "In Transit": return <Badge className="bg-purple-100 text-purple-800 border-purple-200">In Transit</Badge>;
      case "Delivered": return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>;
      case "Rejected": return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical": return <Badge className="bg-red-500 hover:bg-red-600 text-white">Critical</Badge>;
      case "High": return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">High</Badge>;
      case "Medium": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Medium</Badge>;
      case "Low": return <Badge className="bg-green-500 hover:bg-green-600 text-white">Low</Badge>;
      default: return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Restock Requests</h1>
          <p className="text-muted-foreground">Manage inventory restock requests across all warehouses</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Request
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <div className="p-2 bg-red-100 rounded-full"><AlertCircle className="h-4 w-4 text-red-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Value: {formatINR(pendingValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved & In Transit</CardTitle>
            <div className="p-2 bg-green-100 rounded-full"><Truck className="h-4 w-4 text-green-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount + inTransitCount}</div>
            <p className="text-xs text-muted-foreground">Value: {formatINR(approvedValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <div className="p-2 bg-orange-100 rounded-full"><Package className="h-4 w-4 text-orange-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-muted-foreground">Completed deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Requests</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full"><Clock className="h-4 w-4 text-blue-500" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex flex-wrap gap-2 flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <TabsList className="flex flex-wrap gap-2 h-full justify-start">
              <TabsTrigger value="all">All Requests ({requests.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
              <TabsTrigger value="inTransit">In Transit ({inTransitCount})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({deliveredCount})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export<ChevronDown className="h-4 w-4 ml-2" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Export as CSV</DropdownMenuItem>
                <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />Export as Excel</DropdownMenuItem>
                <DropdownMenuItem><Printer className="h-4 w-4 mr-2" />Print</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap justify-between gap-2 mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-8 w-80" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by warehouse" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((wh) => (<SelectItem key={wh._id} value={wh._id}>{wh.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={clearFilters}><RefreshCw className="mr-2 h-4 w-4" />Reset</Button>
            </div>
          </div>

          {/* Restock Requests Table */}
          <TabsContent value={selectedTab} className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]"><Checkbox /></TableHead>
                      <TableHead className="w-[100px] cursor-pointer" onClick={() => requestSort("requestId")}>ID {getSortDirectionIcon("requestId")}</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort("itemName")}>Item {getSortDirectionIcon("itemName")}</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Requested Qty</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Request Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={11} className="h-24 text-center">Loading...</TableCell></TableRow>
                    ) : sortedRequests.length === 0 ? (
                      <TableRow><TableCell colSpan={11} className="h-24 text-center">No restock requests found.</TableCell></TableRow>
                    ) : (
                      sortedRequests.map((request) => (
                        <TableRow key={request._id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell className="font-medium">{request.requestId}</TableCell>
                          <TableCell>{request.itemName}</TableCell>
                          <TableCell><div className="flex items-center gap-2"><Warehouse className="h-4 w-4" /><span>{request.warehouseName || request.warehouse}</span></div></TableCell>
                          <TableCell className="text-right">{request.currentStock}</TableCell>
                          <TableCell className="text-right">{request.requestedQuantity}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">{formatINR(request.totalCost)}</TableCell>
                          <TableCell>{renderStatusBadge(request.status)}</TableCell>
                          <TableCell>{renderPriorityBadge(request.priority)}</TableCell>
                          <TableCell className="text-right">{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => { setSelectedRequest(request); setIsViewDialogOpen(true); }}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedRequest(request); setIsEditDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit Request</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {request.status === "Pending Approval" && (
                                  <>
                                    <DropdownMenuItem onClick={() => { setSelectedRequest(request); setIsApproveDialogOpen(true); }}><Check className="mr-2 h-4 w-4 text-green-600" />Approve</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setSelectedRequest(request); setIsRejectDialogOpen(true); }}><X className="mr-2 h-4 w-4 text-red-600" />Reject</DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedRequest(request); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">Showing {sortedRequests.length} of {requests.length} requests</div>
                <Button variant="outline" size="sm" onClick={fetchRequests}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Restock Request</DialogTitle>
            <DialogDescription>Fill out the form below to create a new restock request.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRequest}>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Item Name *</Label><Input value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Warehouse *</Label>
                <Select value={formData.warehouseId} onValueChange={(v) => setFormData({...formData, warehouseId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>{warehouses.map((wh) => (<SelectItem key={wh._id} value={wh._id}>{wh.name} ({wh.code})</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Current Stock</Label><Input type="number" min="0" value={formData.currentStock} onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} /></div>
              <div className="space-y-2"><Label>Minimum Threshold</Label><Input type="number" min="0" value={formData.minThreshold} onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})} /></div>
              <div className="space-y-2"><Label>Requested Quantity *</Label><Input type="number" min="1" value={formData.requestedQuantity} onChange={(e) => setFormData({...formData, requestedQuantity: parseInt(e.target.value) || 0})} required /></div>
              <div className="space-y-2"><Label>Unit Price (₹) *</Label><Input type="number" min="0" step="0.01" value={formData.unitPrice} onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})} required /></div>
              <div className="space-y-2"><Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Critical">Critical</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Vendor *</Label>
                <Select value={formData.vendorId} onValueChange={(v) => setFormData({...formData, vendorId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                  <SelectContent>{vendors.map((v) => (<SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Requested By *</Label><Input value={formData.requestedBy} onChange={(e) => setFormData({...formData, requestedBy: e.target.value})} required /></div>
              <div className="space-y-2"><Label>Expected Delivery *</Label><Input type="date" value={formData.expectedDelivery} onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})} required /></div>
              <div className="md:col-span-2 space-y-2"><Label>Notes</Label><Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button type="submit">Create Request</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      {selectedRequest && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Request - {selectedRequest.requestId}</DialogTitle><DialogDescription>Update the details of this restock request.</DialogDescription></DialogHeader>
            <form onSubmit={handleUpdateRequest}>
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Item Name</Label><Input value={selectedRequest.itemName} onChange={(e) => setSelectedRequest({...selectedRequest, itemName: e.target.value})} /></div>
                <div className="space-y-2"><Label>Current Stock</Label><Input type="number" value={selectedRequest.currentStock} onChange={(e) => setSelectedRequest({...selectedRequest, currentStock: parseInt(e.target.value) || 0})} /></div>
                <div className="space-y-2"><Label>Minimum Threshold</Label><Input type="number" value={selectedRequest.minThreshold} onChange={(e) => setSelectedRequest({...selectedRequest, minThreshold: parseInt(e.target.value) || 0})} /></div>
                <div className="space-y-2"><Label>Requested Quantity</Label><Input type="number" value={selectedRequest.requestedQuantity} onChange={(e) => setSelectedRequest({...selectedRequest, requestedQuantity: parseInt(e.target.value) || 0})} /></div>
                <div className="space-y-2"><Label>Unit Price (₹)</Label><Input type="number" step="0.01" value={selectedRequest.unitPrice} onChange={(e) => setSelectedRequest({...selectedRequest, unitPrice: parseFloat(e.target.value) || 0})} /></div>
                <div className="space-y-2"><Label>Priority</Label>
                  <Select value={selectedRequest.priority} onValueChange={(v) => setSelectedRequest({...selectedRequest, priority: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Critical">Critical</SelectItem><SelectItem value="High">High</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Low">Low</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Status</Label>
                  <Select value={selectedRequest.status} onValueChange={(v) => setSelectedRequest({...selectedRequest, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Pending Approval">Pending Approval</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="In Transit">In Transit</SelectItem><SelectItem value="Delivered">Delivered</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Expected Delivery</Label><Input type="date" value={selectedRequest.expectedDelivery?.split('T')[0]} onChange={(e) => setSelectedRequest({...selectedRequest, expectedDelivery: e.target.value})} /></div>
                <div className="md:col-span-2 space-y-2"><Label>Notes</Label><Textarea value={selectedRequest.notes} onChange={(e) => setSelectedRequest({...selectedRequest, notes: e.target.value})} rows={3} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Approve Dialog */}
      {selectedRequest && (
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Approve Request - {selectedRequest.requestId}</DialogTitle></DialogHeader>
            <form onSubmit={handleApproveRequest}>
              <div className="space-y-4 py-4">
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between"><span>Item:</span><span>{selectedRequest.itemName}</span></div>
                  <div className="flex justify-between"><span>Quantity:</span><span>{selectedRequest.requestedQuantity}</span></div>
                  <div className="flex justify-between"><span>Total Cost:</span><span className="font-bold text-green-600">{formatINR(selectedRequest.totalCost)}</span></div>
                </div>
                <div className="space-y-2"><Label>Approval Notes (Optional)</Label><Textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} rows={3} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-green-600 hover:bg-green-700">Approve Request</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      {selectedRequest && (
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reject Request - {selectedRequest.requestId}</DialogTitle></DialogHeader>
            <form onSubmit={handleRejectRequest}>
              <div className="space-y-4 py-4">
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between"><span>Item:</span><span>{selectedRequest.itemName}</span></div>
                  <div className="flex justify-between"><span>Requested By:</span><span>{selectedRequest.requestedBy}</span></div>
                  <div className="flex justify-between"><span>Total Cost:</span><span>{formatINR(selectedRequest.totalCost)}</span></div>
                </div>
                <div className="space-y-2"><Label>Rejection Reason *</Label>
                  <Select value={rejectionReason} onValueChange={setRejectionReason}>
                    <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget-constraints">Budget Constraints</SelectItem>
                      <SelectItem value="alternative-supplier">Alternative Supplier Available</SelectItem>
                      <SelectItem value="quantity-excessive">Requested Quantity Too High</SelectItem>
                      <SelectItem value="timing-inappropriate">Inappropriate Timing</SelectItem>
                      <SelectItem value="duplicate-request">Duplicate Request</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button><Button type="submit" variant="destructive">Reject Request</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* View Dialog */}
      {selectedRequest && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Request Details - {selectedRequest.requestId}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div><Label>Item Name</Label><p className="font-medium">{selectedRequest.itemName}</p></div>
              <div><Label>Warehouse</Label><p>{selectedRequest.warehouseName || selectedRequest.warehouse}</p></div>
              <div><Label>Current Stock</Label><p>{selectedRequest.currentStock}</p></div>
              <div><Label>Minimum Threshold</Label><p>{selectedRequest.minThreshold}</p></div>
              <div><Label>Requested Quantity</Label><p>{selectedRequest.requestedQuantity}</p></div>
              <div><Label>Unit Price</Label><p>{formatINR(selectedRequest.unitPrice)}</p></div>
              <div><Label>Total Cost</Label><p className="font-bold text-green-600">{formatINR(selectedRequest.totalCost)}</p></div>
              <div><Label>Vendor</Label><p>{selectedRequest.vendorName || selectedRequest.vendor}</p></div>
              <div><Label>Requested By</Label><p>{selectedRequest.requestedBy}</p></div>
              <div><Label>Request Date</Label><p>{new Date(selectedRequest.requestDate).toLocaleDateString()}</p></div>
              <div><Label>Expected Delivery</Label><p>{new Date(selectedRequest.expectedDelivery).toLocaleDateString()}</p></div>
              <div><Label>Status</Label><p>{renderStatusBadge(selectedRequest.status)}</p></div>
              <div><Label>Priority</Label><p>{renderPriorityBadge(selectedRequest.priority)}</p></div>
              <div className="md:col-span-2"><Label>Notes</Label><p className="text-muted-foreground">{selectedRequest.notes || "No notes"}</p></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this restock request. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRequest} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}