// app/vendor-directory/page.tsx
"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDownUp,
  ArrowUpDown,
  Building,
  Building2,
  Calendar,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Star,
  Trash2,
  UserPlus,
  X,
  Check,
  Upload,
  Paperclip,
  Mail,
  IndianRupee,
  Plus,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:5000";

// Types
interface Vendor {
  _id: string;
  vendorId: string;
  name: string;
  category: string;
  status: string;
  rating: number;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  location: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  gstNumber?: string;
  panNumber?: string;
  contractValue: number;
  contractStartDate: string;
  contractExpiry: string;
  lastDelivery?: string;
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: string;
  paymentTerms: string;
  tags: string[];
  notes: string;
  contracts: any[];
  currency: string;
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

export default function VendorDirectoryPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isContractViewOpen, setIsContractViewOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState([
    { title: "Total Vendors", value: "0", change: "+0", changeType: "increase" },
    { title: "Active Contracts", value: "0", change: "+0", changeType: "increase" },
    { title: "Avg. Performance", value: "0%", change: "+0%", changeType: "increase" },
    { title: "Contract Value", value: "₹0", change: "+0", changeType: "increase" },
  ]);

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    name: "",
    category: "Transportation",
    status: "Active",
    contactPerson: "",
    email: "",
    phone: "",
    alternatePhone: "",
    location: "",
    gstNumber: "",
    panNumber: "",
    contractValue: 0,
    contractStartDate: "",
    contractExpiry: "",
    paymentTerms: "Net 30",
    tags: [] as string[],
    notes: "",
  });

  // Edit vendor form state
  const [editVendor, setEditVendor] = useState<any>(null);

  // Fetch vendors from API
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/vendor-directory/all`);
      const data = await response.json();
      
      if (data.success) {
        setVendors(data.data);
        setPerformanceMetrics([
          { title: "Total Vendors", value: data.stats.total.toString(), change: "+0", changeType: "increase" },
          { title: "Active Contracts", value: data.stats.active.toString(), change: "+0", changeType: "increase" },
          { title: "Avg. Performance", value: `${Math.round(data.stats.avgRating * 20)}%`, change: "+0%", changeType: "increase" },
          { title: "Contract Value", value: formatINR(data.stats.totalContractValue), change: "+0", changeType: "increase" },
        ]);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast({ title: "Error", description: "Failed to connect to server", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      searchTerm === "" ||
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || vendor.status === selectedStatus;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "premium" && vendor.tags?.includes("Premium")) ||
      (activeTab === "international" && vendor.tags?.includes("International")) ||
      (activeTab === "domestic" && vendor.tags?.includes("Domestic"));

    return matchesSearch && matchesCategory && matchesStatus && matchesTab;
  });

  // Sort vendors - Fixed version
const sortedVendors = sortConfig
  ? [...filteredVendors].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof Vendor];
      let bValue = b[sortConfig.key as keyof Vendor];
      
      // Handle different data types for comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    })
  : filteredVendors;

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setActiveTab("all");
    setSortConfig(null);
  };

  const getSortDirectionIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortConfig.direction === "ascending" ? <ArrowDownUp className="ml-2 h-4 w-4" /> : <ArrowDownUp className="ml-2 h-4 w-4 rotate-180" />;
  };

  const handleViewProfile = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsProfileOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setEditVendor({ ...vendor, tags: [...vendor.tags] });
    setIsEditVendorOpen(true);
  };

  // const handleViewContract = (vendor: Vendor) => {
  //   setSelectedVendor(vendor);
  //   setIsContractViewOpen(true);
  // };

  const handleAddNewVendor = () => {
    setIsAddVendorOpen(true);
    setNewVendor({
      name: "",
      category: "Transportation",
      status: "Active",
      contactPerson: "",
      email: "",
      phone: "",
      alternatePhone: "",
      location: "",
      gstNumber: "",
      panNumber: "",
      contractValue: 0,
      contractStartDate: "",
      contractExpiry: "",
      paymentTerms: "Net 30",
      tags: [],
      notes: "",
    });
  };

  const handleNewVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewVendor((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditVendor((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNewVendorSelectChange = (name: string, value: string) => {
    setNewVendor((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditVendorSelectChange = (name: string, value: string) => {
    setEditVendor((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleNewVendorTagToggle = (tag: string) => {
    setNewVendor((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleEditVendorTagToggle = (tag: string) => {
    setEditVendor((prev: any) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t: string) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSubmitNewVendor = async () => {
    try {
      const response = await fetch(`${API_URL}/api/vendor-directory/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVendor),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Vendor added successfully!" });
        setIsAddVendorOpen(false);
        fetchVendors();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add vendor", variant: "destructive" });
    }
  };

  const handleSubmitEditVendor = async () => {
    if (!editVendor) return;
    try {
      const response = await fetch(`${API_URL}/api/vendor-directory/update/${editVendor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editVendor),
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Vendor updated successfully!" });
        setIsEditVendorOpen(false);
        fetchVendors();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update vendor", variant: "destructive" });
    }
  };

  const handleDeleteVendor = async () => {
    if (!selectedVendor) return;
    try {
      const response = await fetch(`${API_URL}/api/vendor-directory/delete/${selectedVendor._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Vendor deleted successfully!" });
        setIsDeleteDialogOpen(false);
        setSelectedVendor(null);
        fetchVendors();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete vendor", variant: "destructive" });
    }
  };

  const handleFileUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const availableTags = ["International", "Domestic", "Premium", "Express", "Certified", "Eco-friendly", "Refrigerated", "Hazmat", "Bulk", "Same-day", "24/7 Support", "ISO Certified", "GST Registered"];

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        {/* Metrics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <Badge variant={metric.changeType === "increase" ? "default" : "destructive"} className="text-xs">
                    {metric.change}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-3xl font-bold">{metric.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Vendor Directory</CardTitle>
                <CardDescription>Manage your vendors, view performance metrics, and track contracts</CardDescription>
              </div>
              <Button className="w-full md:w-auto" onClick={handleAddNewVendor}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Vendor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="w-full sm:w-auto flex flex-wrap h-full justify-start">
                <TabsTrigger value="all">All Vendors</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
                <TabsTrigger value="international">International</TabsTrigger>
                <TabsTrigger value="domestic">Domestic</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search vendors..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                    <SelectItem value="Maritime">Maritime</SelectItem>
                    <SelectItem value="Air Freight">Air Freight</SelectItem>
                    <SelectItem value="Trucking">Trucking</SelectItem>
                    <SelectItem value="Warehousing">Warehousing</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters} className="shrink-0">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Vendors Table */}
            {loading ? (
              <div className="text-center py-12">Loading vendors...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"><Checkbox /></TableHead>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead className="min-w-[180px] cursor-pointer" onClick={() => requestSort("name")}>
                        Vendor Name {getSortDirectionIcon("name")}
                      </TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort("rating")}>
                        Rating {getSortDirectionIcon("rating")}
                      </TableHead>
                      <TableHead>Contact Person</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contract Value</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort("contractExpiry")}>
                        Contract Expiry {getSortDirectionIcon("contractExpiry")}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedVendors.length > 0 ? (
                      sortedVendors.map((vendor) => (
                        <TableRow key={vendor._id}>
                          <TableCell><Checkbox /></TableCell>
                          <TableCell className="font-medium">{vendor.vendorId}</TableCell>
                          <TableCell>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {vendor.tags?.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
                              ))}
                              {vendor.tags?.length > 2 && <span className="text-xs text-muted-foreground">+{vendor.tags.length - 2}</span>}
                            </div>
                          </TableCell>
                          <TableCell>{vendor.category}</TableCell>
                          <TableCell>
                            <Badge variant={vendor.status === "Active" ? "default" : vendor.status === "Inactive" ? "destructive" : "secondary"}>
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center"><Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" /><span>{vendor.rating || 0}</span></div>
                          </TableCell>
                          <TableCell>
                            <div>{vendor.contactPerson}</div>
                            <div className="text-xs text-muted-foreground">{vendor.email}</div>
                          </TableCell>
                          <TableCell>{vendor.location}</TableCell>
                          <TableCell className="font-medium text-green-600">{formatINR(vendor.contractValue)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                              <span>{new Date(vendor.contractExpiry).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewProfile(vendor)}><Eye className="mr-2 h-4 w-4" />View Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditVendor(vendor)}><Edit className="mr-2 h-4 w-4" />Edit Details</DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => handleViewContract(vendor)}><FileText className="mr-2 h-4 w-4" />View Contract</DropdownMenuItem> */}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedVendor(vendor); setIsDeleteDialogOpen(true); }}>
                                  <Trash2 className="mr-2 h-4 w-4" />Delete Vendor
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={11} className="h-24 text-center">No vendors found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-muted-foreground">Showing <strong>{sortedVendors.length}</strong> of <strong>{vendors.length}</strong> vendors</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
                <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Advanced Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Profile Dialog */}
      {selectedVendor && isProfileOpen && (
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vendor Profile - {selectedVendor.name}</DialogTitle>
              <DialogDescription>Detailed information about {selectedVendor.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"><Building2 className="h-8 w-8 text-primary" /></div>
                  <div><h3 className="text-lg font-semibold">{selectedVendor.name}</h3><p className="text-sm text-muted-foreground">{selectedVendor.vendorId} • {selectedVendor.category}</p></div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span>{selectedVendor.location}</span></div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedVendor.phone}</span></div>
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedVendor.email}</span></div>
                    {selectedVendor.gstNumber && <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span>GST: {selectedVendor.gstNumber}</span></div>}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Contract Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Contract Value:</span><span className="font-semibold text-green-600">{formatINR(selectedVendor.contractValue)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Start Date:</span><span>{new Date(selectedVendor.contractStartDate).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Expiry Date:</span><span>{new Date(selectedVendor.contractExpiry).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Payment Terms:</span><span>{selectedVendor.paymentTerms}</span></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div><div className="mb-1 flex justify-between"><span className="text-sm">On-Time Delivery</span><span>{selectedVendor.onTimeDelivery}%</span></div><div className="h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-green-500" style={{ width: `${selectedVendor.onTimeDelivery}%` }}></div></div></div>
                    <div><div className="mb-1 flex justify-between"><span className="text-sm">Quality Score</span><span>{selectedVendor.qualityScore}/5</span></div><div className="h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${(selectedVendor.qualityScore / 5) * 100}%` }}></div></div></div>
                    <div className="flex justify-between"><span className="text-sm">Response Time</span><span>{selectedVendor.responseTime}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Rating</span><div className="flex items-center"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" /><span>{selectedVendor.rating}/5</span></div></div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Services & Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.tags?.map((tag, index) => (<Badge key={index} variant="secondary">{tag}</Badge>))}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="mb-2 font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedVendor.notes || "No additional notes"}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProfileOpen(false)}>Close</Button>
              <Button onClick={() => { setIsProfileOpen(false); handleEditVendor(selectedVendor); }}><Edit className="mr-2 h-4 w-4" />Edit Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Vendor Dialog */}
      {editVendor && isEditVendorOpen && (
        <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vendor - {editVendor.name}</DialogTitle>
              <DialogDescription>Update the details for this vendor</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Vendor Name *</Label><Input name="name" value={editVendor.name} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Category</Label><Select value={editVendor.category} onValueChange={(v) => handleEditVendorSelectChange("category", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Transportation">Transportation</SelectItem><SelectItem value="Courier">Courier</SelectItem><SelectItem value="Maritime">Maritime</SelectItem><SelectItem value="Air Freight">Air Freight</SelectItem><SelectItem value="Trucking">Trucking</SelectItem><SelectItem value="Warehousing">Warehousing</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Contact Person *</Label><Input name="contactPerson" value={editVendor.contactPerson} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Email *</Label><Input name="email" type="email" value={editVendor.email} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Phone *</Label><Input name="phone" value={editVendor.phone} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Location *</Label><Input name="location" value={editVendor.location} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Contract Value (₹)</Label><Input name="contractValue" type="number" value={editVendor.contractValue} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Contract Start Date</Label><Input name="contractStartDate" type="date" value={editVendor.contractStartDate?.split('T')[0]} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Contract Expiry</Label><Input name="contractExpiry" type="date" value={editVendor.contractExpiry?.split('T')[0]} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Payment Terms</Label><Select value={editVendor.paymentTerms} onValueChange={(v) => handleEditVendorSelectChange("paymentTerms", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem><SelectItem value="Net 60">Net 60</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={editVendor.status} onValueChange={(v) => handleEditVendorSelectChange("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Under Review">Under Review</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Rating</Label><Input name="rating" type="number" step="0.1" min="0" max="5" value={editVendor.rating} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>On-Time Delivery %</Label><Input name="onTimeDelivery" type="number" min="0" max="100" value={editVendor.onTimeDelivery} onChange={handleEditVendorChange} /></div>
              <div className="space-y-2"><Label>Quality Score</Label><Input name="qualityScore" type="number" step="0.1" min="0" max="5" value={editVendor.qualityScore} onChange={handleEditVendorChange} /></div>
              <div className="md:col-span-2 space-y-2"><Label>Tags</Label><div className="flex flex-wrap gap-2">{availableTags.map((tag) => (<Badge key={tag} variant={editVendor.tags?.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => handleEditVendorTagToggle(tag)}>{tag}{editVendor.tags?.includes(tag) ? <X className="ml-1 h-3 w-3" /> : <Plus className="ml-1 h-3 w-3" />}</Badge>))}</div></div>
              <div className="md:col-span-2 space-y-2"><Label>Notes</Label><Textarea name="notes" value={editVendor.notes} onChange={handleEditVendorChange} rows={3} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsEditVendorOpen(false)}>Cancel</Button><Button onClick={handleSubmitEditVendor}>Save Changes</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Contract Dialog */}
      {selectedVendor && isContractViewOpen && (
        <Dialog open={isContractViewOpen} onOpenChange={setIsContractViewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contract Documents - {selectedVendor.name}</DialogTitle>
              <DialogDescription>View and manage contract documents for this vendor</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="rounded-lg border">
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                    <div><h4 className="font-medium">Master Service Agreement</h4><p className="text-sm text-muted-foreground">Contract-{selectedVendor.vendorId}-MSA.pdf</p></div>
                  </div>
                  <div className="flex gap-2"><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View</Button><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button></div>
                </div>
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                    <div><h4 className="font-medium">Service Level Agreement</h4><p className="text-sm text-muted-foreground">Contract-{selectedVendor.vendorId}-SLA.pdf</p></div>
                  </div>
                  <div className="flex gap-2"><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View</Button><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button></div>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
                    <div><h4 className="font-medium">Rate Card</h4><p className="text-sm text-muted-foreground">Contract-{selectedVendor.vendorId}-Rates.pdf</p></div>
                  </div>
                  <div className="flex gap-2"><Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View</Button><Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button></div>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-medium">Contract Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Contract Value:</span><div className="font-semibold text-green-600">{formatINR(selectedVendor.contractValue)}</div></div>
                  <div><span className="text-muted-foreground">Start Date:</span><div>{new Date(selectedVendor.contractStartDate).toLocaleDateString()}</div></div>
                  <div><span className="text-muted-foreground">Expiry Date:</span><div>{new Date(selectedVendor.contractExpiry).toLocaleDateString()}</div></div>
                  <div><span className="text-muted-foreground">Payment Terms:</span><div>{selectedVendor.paymentTerms}</div></div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleFileUploadClick}><Paperclip className="mr-2 h-4 w-4" />Attach New Document</Button>
                <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,.doc,.docx" />
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsContractViewOpen(false)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add New Vendor Dialog */}
      {isAddVendorOpen && (
        <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Vendor</DialogTitle><DialogDescription>Enter the details for the new vendor</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Vendor Name *</Label><Input name="name" value={newVendor.name} onChange={handleNewVendorChange} placeholder="Enter vendor name" /></div>
              <div className="space-y-2"><Label>Category</Label><Select value={newVendor.category} onValueChange={(v) => handleNewVendorSelectChange("category", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Transportation">Transportation</SelectItem><SelectItem value="Courier">Courier</SelectItem><SelectItem value="Maritime">Maritime</SelectItem><SelectItem value="Air Freight">Air Freight</SelectItem><SelectItem value="Trucking">Trucking</SelectItem><SelectItem value="Warehousing">Warehousing</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Contact Person *</Label><Input name="contactPerson" value={newVendor.contactPerson} onChange={handleNewVendorChange} placeholder="Enter contact person" /></div>
              <div className="space-y-2"><Label>Email *</Label><Input name="email" type="email" value={newVendor.email} onChange={handleNewVendorChange} placeholder="Enter email" /></div>
              <div className="space-y-2"><Label>Phone *</Label><Input name="phone" value={newVendor.phone} onChange={handleNewVendorChange} placeholder="Enter phone" /></div>
              <div className="space-y-2"><Label>Location *</Label><Input name="location" value={newVendor.location} onChange={handleNewVendorChange} placeholder="Enter location" /></div>
              <div className="space-y-2"><Label>Contract Value (₹)</Label><Input name="contractValue" type="number" value={newVendor.contractValue} onChange={handleNewVendorChange} placeholder="Enter contract value" /></div>
              <div className="space-y-2"><Label>Contract Start Date *</Label><Input name="contractStartDate" type="date" value={newVendor.contractStartDate} onChange={handleNewVendorChange} /></div>
              <div className="space-y-2"><Label>Contract Expiry *</Label><Input name="contractExpiry" type="date" value={newVendor.contractExpiry} onChange={handleNewVendorChange} /></div>
              <div className="space-y-2"><Label>Payment Terms</Label><Select value={newVendor.paymentTerms} onValueChange={(v) => handleNewVendorSelectChange("paymentTerms", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Net 15">Net 15</SelectItem><SelectItem value="Net 30">Net 30</SelectItem><SelectItem value="Net 45">Net 45</SelectItem><SelectItem value="Net 60">Net 60</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>GST Number</Label><Input name="gstNumber" value={newVendor.gstNumber} onChange={handleNewVendorChange} placeholder="Enter GST number" /></div>
              <div className="space-y-2"><Label>PAN Number</Label><Input name="panNumber" value={newVendor.panNumber} onChange={handleNewVendorChange} placeholder="Enter PAN number" /></div>
              <div className="md:col-span-2 space-y-2"><Label>Tags</Label><div className="flex flex-wrap gap-2">{availableTags.map((tag) => (<Badge key={tag} variant={newVendor.tags.includes(tag) ? "default" : "outline"} className="cursor-pointer" onClick={() => handleNewVendorTagToggle(tag)}>{tag}{newVendor.tags.includes(tag) ? <X className="ml-1 h-3 w-3" /> : <Plus className="ml-1 h-3 w-3" />}</Badge>))}</div></div>
              <div className="md:col-span-2 space-y-2"><Label>Notes</Label><Textarea name="notes" value={newVendor.notes} onChange={handleNewVendorChange} placeholder="Additional notes..." rows={3} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsAddVendorOpen(false)}>Cancel</Button><Button onClick={handleSubmitNewVendor}>Add Vendor</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedVendor && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the vendor "{selectedVendor.name}". This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteVendor} className="bg-destructive">Delete Vendor</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}