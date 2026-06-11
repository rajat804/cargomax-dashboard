"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Download,
  MapPin,
  Calendar,
  DollarSign,
  Weight,
  Box,
  Phone,
  Mail,
  User,
  Shield,
  Save,
  X,
  Plus,
  Minus,
  PenSquare,
} from "lucide-react";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:4000";

// INR Constants
const BASE_RATE_INR = 125; // ₹125 per kg
const EXPRESS_FEE_INR = 1245; // ₹1245
const OVERNIGHT_FEE_INR = 2905; // ₹2905
const INSURANCE_RATE = 0.01; // 1% of value
const SIGNATURE_FEE_INR = 415; // ₹415
const TEMP_CONTROL_FEE_INR = 2075; // ₹2075
const FRAGILE_FEE_INR = 830; // ₹830
const BASE_SHIPPING_INR = 1245; // ₹1245

interface Shipment {
  _id: string;
  trackingId: string;
  shipmentType: string;
  priority: string;
  pickupDate: string;
  deliveryDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  estimatedCost: number;
  totalWeight: number;
  totalValue: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  specialInstructions?: string;
  insuranceRequired: boolean;
  signatureRequired: boolean;
  temperatureControlled: boolean;
  fragile: boolean;
  carrier: string;
  service: string;
  originAddress: {
    company: string;
    contactName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
  destinationAddress: {
    company: string;
    contactName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
    category: string;
    hazardous: boolean;
  }>;
}

interface EditShipmentData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shipmentType: string;
  priority: string;
  pickupDate: string;
  deliveryDate: string;
  specialInstructions: string;
  insuranceRequired: boolean;
  signatureRequired: boolean;
  temperatureControlled: boolean;
  fragile: boolean;
  carrier: string;
  service: string;
  status: string;
  estimatedCost: number;
  originAddress: {
    company: string;
    contactName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
  destinationAddress: {
    company: string;
    contactName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
  };
  items: Array<any>;
}

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<EditShipmentData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shipmentType: "standard",
    priority: "standard",
    pickupDate: "",
    deliveryDate: "",
    specialInstructions: "",
    insuranceRequired: false,
    signatureRequired: false,
    temperatureControlled: false,
    fragile: false,
    carrier: "",
    service: "",
    status: "pending",
    estimatedCost: 0,
    originAddress: {
      company: "",
      contactName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "IN",
      phone: "",
      email: "",
    },
    destinationAddress: {
      company: "",
      contactName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "IN",
      phone: "",
      email: "",
    },
    items: [],
  });

  // Format currency in INR
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fetch all shipments
  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/createshipments/all`);
      const data = await response.json();

      if (data.success) {
        setShipments(data.data);
        setFilteredShipments(data.data);
      } else {
        console.error("Failed to fetch shipments:", data.message);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  // Search and filter
  useEffect(() => {
    let filtered = shipments;

    if (searchTerm) {
      filtered = filtered.filter(
        (shipment) =>
          (shipment.trackingId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (shipment.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (shipment.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((shipment) => shipment.status === statusFilter);
    }

    setFilteredShipments(filtered);
  }, [searchTerm, statusFilter, shipments]);

  // Delete shipment
  const deleteShipment = async (id: string) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      try {
        const response = await fetch(`${API_URL}/api/createshipments/delete/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();

        if (data.success) {
          alert("✅ Shipment deleted successfully!");
          fetchShipments();
        } else {
          alert("❌ Failed to delete shipment: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting shipment:", error);
        alert("❌ Network error! Failed to delete shipment.");
      }
    }
  };

  // Open Edit Modal
  const openEditModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setEditForm({
      customerName: shipment.customerName || "",
      customerEmail: shipment.customerEmail || "",
      customerPhone: shipment.customerPhone || "",
      shipmentType: shipment.shipmentType || "standard",
      priority: shipment.priority || "standard",
      pickupDate: shipment.pickupDate || "",
      deliveryDate: shipment.deliveryDate || "",
      specialInstructions: shipment.specialInstructions || "",
      insuranceRequired: shipment.insuranceRequired || false,
      signatureRequired: shipment.signatureRequired || false,
      temperatureControlled: shipment.temperatureControlled || false,
      fragile: shipment.fragile || false,
      carrier: shipment.carrier || "",
      service: shipment.service || "",
      status: shipment.status || "pending",
      estimatedCost: shipment.estimatedCost || 0,
      originAddress: {
        company: shipment.originAddress?.company || "",
        contactName: shipment.originAddress?.contactName || "",
        address1: shipment.originAddress?.address1 || "",
        address2: shipment.originAddress?.address2 || "",
        city: shipment.originAddress?.city || "",
        state: shipment.originAddress?.state || "",
        zipCode: shipment.originAddress?.zipCode || "",
        country: shipment.originAddress?.country || "IN",
        phone: shipment.originAddress?.phone || "",
        email: shipment.originAddress?.email || "",
      },
      destinationAddress: {
        company: shipment.destinationAddress?.company || "",
        contactName: shipment.destinationAddress?.contactName || "",
        address1: shipment.destinationAddress?.address1 || "",
        address2: shipment.destinationAddress?.address2 || "",
        city: shipment.destinationAddress?.city || "",
        state: shipment.destinationAddress?.state || "",
        zipCode: shipment.destinationAddress?.zipCode || "",
        country: shipment.destinationAddress?.country || "IN",
        phone: shipment.destinationAddress?.phone || "",
        email: shipment.destinationAddress?.email || "",
      },
      items: shipment.items?.map(item => ({
        ...item,
        quantity: item.quantity || 1,
        weight: item.weight || 0,
        value: item.value || 0,
        dimensions: {
          length: item.dimensions?.length || 0,
          width: item.dimensions?.width || 0,
          height: item.dimensions?.height || 0,
        }
      })) || [],
    });
    setShowEditModal(true);
  };

  // Update shipment
  const updateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/createshipments/update/${selectedShipment?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        alert("✅ Shipment updated successfully!");
        setShowEditModal(false);
        fetchShipments();
      } else {
        alert("❌ Failed to update shipment: " + data.message);
      }
    } catch (error) {
      console.error("Error updating shipment:", error);
      alert("❌ Network error! Failed to update shipment.");
    } finally {
      setEditLoading(false);
    }
  };

  // Calculate total cost breakdown in INR
  const calculateTotalCost = (shipment: Shipment) => {
    const totalWeight = shipment.totalWeight || 0;
    const totalValue = shipment.totalValue || 0;
    
    const weightCharge = totalWeight * BASE_RATE_INR;
    let priorityCharge = 0;
    if (shipment.priority === "express") priorityCharge = EXPRESS_FEE_INR;
    if (shipment.priority === "overnight") priorityCharge = OVERNIGHT_FEE_INR;

    const insuranceCharge = shipment.insuranceRequired ? totalValue * INSURANCE_RATE : 0;
    const signatureCharge = shipment.signatureRequired ? SIGNATURE_FEE_INR : 0;
    const temperatureCharge = shipment.temperatureControlled ? TEMP_CONTROL_FEE_INR : 0;
    const fragileCharge = shipment.fragile ? FRAGILE_FEE_INR : 0;

    const total = BASE_SHIPPING_INR + weightCharge + priorityCharge + insuranceCharge +
      signatureCharge + temperatureCharge + fragileCharge;

    return {
      baseShipping: BASE_SHIPPING_INR,
      weightCharge: weightCharge,
      priorityCharge: priorityCharge,
      insuranceCharge: insuranceCharge,
      signatureCharge: signatureCharge,
      temperatureCharge: temperatureCharge,
      fragileCharge: fragileCharge,
      total: total
    };
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white">⏳ Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-500 text-white">✅ Confirmed</Badge>;
      case "in_transit":
        return <Badge className="bg-purple-500 text-white">🚚 In Transit</Badge>;
      case "delivered":
        return <Badge className="bg-green-500 text-white">📦 Delivered</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 text-white">❌ Cancelled</Badge>;
      case "draft":
        return <Badge className="bg-gray-500 text-white">📝 Draft</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "express":
        return <Badge className="bg-red-100 text-red-700 border border-red-200">🚀 Express</Badge>;
      case "overnight":
        return <Badge className="bg-orange-100 text-orange-700 border border-orange-200">🌙 Overnight</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-700 border border-blue-200">📦 Standard</Badge>;
    }
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter((s) => s.status === "pending").length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    delivered: shipments.filter((s) => s.status === "delivered").length,
  };

  // Calculate totals for edit form
  const calculateEditTotalWeight = () => {
    return editForm.items?.reduce((sum, item) => sum + ((item?.weight || 0) * (item?.quantity || 0)), 0) || 0;
  };

  const calculateEditTotalValue = () => {
    return editForm.items?.reduce((sum, item) => sum + ((item?.value || 0) * (item?.quantity || 0)), 0) || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">📦 All Shipments</h1>
              <p className="text-blue-200 mt-1">Manage and track all your shipments</p>
            </div>
            <Button
              onClick={fetchShipments}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Shipments</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Pending</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">In Transit</p>
                  <p className="text-3xl font-bold">{stats.inTransit}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Delivered</p>
                  <p className="text-3xl font-bold">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Tracking ID, Customer Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="draft">Draft</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shipments Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading shipments...</p>
                </div>
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No shipments found</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Tracking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>From → To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment._id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm font-medium">
                          {shipment.trackingId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{shipment.customerName}</p>
                            <p className="text-xs text-gray-500">{shipment.customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{shipment.shipmentType}</TableCell>
                        <TableCell>{getPriorityBadge(shipment.priority)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{shipment.originAddress?.city || "N/A"}</p>
                            <p className="text-gray-400 text-xs">→</p>
                            <p>{shipment.destinationAddress?.city || "N/A"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatINR(shipment.estimatedCost || 0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {shipment.createdAt ? format(new Date(shipment.createdAt), "dd MMM yyyy") : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedShipment(shipment);
                                setShowDetailsModal(true);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(shipment)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteShipment(shipment._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-[900px] max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Shipment Details</h2>
                  <p className="text-blue-200 text-sm">Tracking ID: {selectedShipment.trackingId}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    {getStatusBadge(selectedShipment.status)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    {getPriorityBadge(selectedShipment.priority)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipment Type</p>
                    <Badge variant="outline" className="capitalize">{selectedShipment.shipmentType}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Created On</p>
                  <p className="text-sm font-medium">
                    {selectedShipment.createdAt ? format(new Date(selectedShipment.createdAt), "dd MMM yyyy, hh:mm a") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedShipment.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedShipment.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedShipment.customerPhone}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-blue-50/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Origin Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Company:</span> {selectedShipment.originAddress?.company}</p>
                    <p><span className="font-medium">Contact:</span> {selectedShipment.originAddress?.contactName}</p>
                    <p><span className="font-medium">Address:</span> {selectedShipment.originAddress?.address1}</p>
                    {selectedShipment.originAddress?.address2 && <p>{selectedShipment.originAddress.address2}</p>}
                    <p><span className="font-medium">City:</span> {selectedShipment.originAddress?.city}</p>
                    <p><span className="font-medium">State/PIN:</span> {selectedShipment.originAddress?.state} - {selectedShipment.originAddress?.zipCode}</p>
                    <p><span className="font-medium">Phone:</span> {selectedShipment.originAddress?.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedShipment.originAddress?.email}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-purple-50/30">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Destination Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Company:</span> {selectedShipment.destinationAddress?.company}</p>
                    <p><span className="font-medium">Contact:</span> {selectedShipment.destinationAddress?.contactName}</p>
                    <p><span className="font-medium">Address:</span> {selectedShipment.destinationAddress?.address1}</p>
                    {selectedShipment.destinationAddress?.address2 && <p>{selectedShipment.destinationAddress.address2}</p>}
                    <p><span className="font-medium">City:</span> {selectedShipment.destinationAddress?.city}</p>
                    <p><span className="font-medium">State/PIN:</span> {selectedShipment.destinationAddress?.state} - {selectedShipment.destinationAddress?.zipCode}</p>
                    <p><span className="font-medium">Phone:</span> {selectedShipment.destinationAddress?.phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedShipment.destinationAddress?.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    Pickup Date
                  </h3>
                  <p>{selectedShipment.pickupDate ? format(new Date(selectedShipment.pickupDate), "dd MMM yyyy") : "N/A"}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Delivery Date
                  </h3>
                  <p>{selectedShipment.deliveryDate ? format(new Date(selectedShipment.deliveryDate), "dd MMM yyyy") : "Not specified"}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Box className="h-5 w-5 text-purple-600" />
                  Items ({selectedShipment.totalItems || 0})
                </h3>
                <div className="space-y-3">
                  {selectedShipment.items?.map((item, index) => (
                    <div key={index} className="border-b last:border-0 pb-3 last:pb-0">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="font-medium">{item.description}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p>{item.quantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p>{item.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Value</p>
                          <p>{formatINR(item.value)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="capitalize">{item.category}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Dimensions</p>
                          <p>{item.dimensions?.length}×{item.dimensions?.width}×{item.dimensions?.height} cm</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Hazardous</p>
                          {item.hazardous ? <Badge className="bg-red-100 text-red-700">⚠️ Hazardous Material</Badge> : <Badge variant="outline">Not Hazardous</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Special Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedShipment.insuranceRequired && <Badge className="bg-green-100 text-green-700">✅ Insurance Coverage</Badge>}
                  {selectedShipment.signatureRequired && <Badge className="bg-blue-100 text-blue-700">✍️ Signature Required</Badge>}
                  {selectedShipment.temperatureControlled && <Badge className="bg-cyan-100 text-cyan-700">🌡️ Temperature Controlled</Badge>}
                  {selectedShipment.fragile && <Badge className="bg-yellow-100 text-yellow-700">📦 Fragile Handling</Badge>}
                </div>
                {selectedShipment.carrier && (
                  <div className="mt-3 pt-3 border-t">
                    <p><span className="font-medium">Carrier:</span> {selectedShipment.carrier?.toUpperCase()}</p>
                    <p><span className="font-medium">Service Level:</span> {selectedShipment.service}</p>
                  </div>
                )}
                {selectedShipment.specialInstructions && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-medium">Special Instructions:</p>
                    <p className="text-sm text-gray-600">{selectedShipment.specialInstructions}</p>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Cost Breakdown (INR)
                </h3>
                {(() => {
                  const costs = calculateTotalCost(selectedShipment);
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Base Shipping:</span>
                        <span>{formatINR(costs.baseShipping)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Weight Charge ({(selectedShipment.totalWeight || 0).toFixed(2)} kg × ₹{BASE_RATE_INR}/kg):</span>
                        <span>{formatINR(costs.weightCharge)}</span>
                      </div>
                      {(costs.priorityCharge || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>{selectedShipment.priority === "express" ? "Express Service:" : "Overnight Service:"}</span>
                          <span>{formatINR(costs.priorityCharge)}</span>
                        </div>
                      )}
                      {(costs.insuranceCharge || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Insurance ({formatINR(selectedShipment.totalValue || 0)} × 1%):</span>
                          <span>{formatINR(costs.insuranceCharge)}</span>
                        </div>
                      )}
                      {(costs.signatureCharge || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Signature Service:</span>
                          <span>{formatINR(costs.signatureCharge)}</span>
                        </div>
                      )}
                      {(costs.temperatureCharge || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Temperature Control:</span>
                          <span>{formatINR(costs.temperatureCharge)}</span>
                        </div>
                      )}
                      {(costs.fragileCharge || 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Fragile Handling:</span>
                          <span>{formatINR(costs.fragileCharge)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total Estimated Cost:</span>
                          <span className="text-green-600">{formatINR(costs.total)}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">*GST @ 18% will be applied extra</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Weight className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Total Weight</p>
                  <p className="font-bold">{(selectedShipment.totalWeight || 0).toFixed(2)} kg</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="font-bold">{formatINR(selectedShipment.totalValue || 0)}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Box className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Total Items</p>
                  <p className="font-bold">{selectedShipment.totalItems || 0}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Truck className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Estimated Cost</p>
                  <p className="font-bold text-green-600">{formatINR(selectedShipment.estimatedCost || 0)}</p>
                </div>
              </div>
            </div>

            <div className="border-t p-4 rounded-b-xl bg-gray-50 flex justify-end gap-3 sticky bottom-0">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                setShowDetailsModal(false);
                openEditModal(selectedShipment);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Shipment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedShipment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-[1100px] max-h-[90vh] overflow-y-auto shadow-2xl mx-4">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Edit Shipment</h2>
                  <p className="text-green-200 text-sm">Tracking ID: {selectedShipment.trackingId}</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={updateShipment} className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-700">
                  <User className="h-5 w-5" /> Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Customer Name *</Label>
                    <Input value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Customer Email *</Label>
                    <Input type="email" value={editForm.customerEmail} onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Customer Phone *</Label>
                    <Input value={editForm.customerPhone} onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })} required className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-purple-700">
                  <Package className="h-5 w-5" /> Shipment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Shipment Type *</Label>
                    <Select value={editForm.shipmentType} onValueChange={(value) => setEditForm({ ...editForm, shipmentType: value })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">📦 Standard Package</SelectItem>
                        <SelectItem value="document">📄 Document Envelope</SelectItem>
                        <SelectItem value="freight">🚛 Freight/Pallet</SelectItem>
                        <SelectItem value="bulk">🏭 Bulk Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority *</Label>
                    <Select value={editForm.priority} onValueChange={(value) => setEditForm({ ...editForm, priority: value })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">📦 Standard</SelectItem>
                        <SelectItem value="express">🚀 Express</SelectItem>
                        <SelectItem value="overnight">🌙 Overnight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Draft</SelectItem>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="confirmed">✅ Confirmed</SelectItem>
                        <SelectItem value="in_transit">🚚 In Transit</SelectItem>
                        <SelectItem value="delivered">📦 Delivered</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Carrier</Label>
                    <Select value={editForm.carrier} onValueChange={(value) => setEditForm({ ...editForm, carrier: value })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select carrier" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bluedart">Blue Dart</SelectItem>
                        <SelectItem value="delhivery">Delhivery</SelectItem>
                        <SelectItem value="dtdc">DTDC</SelectItem>
                        <SelectItem value="fedex">FedEx India</SelectItem>
                        <SelectItem value="dhl">DHL India</SelectItem>
                        <SelectItem value="xpressbees">XpressBees</SelectItem>
                        <SelectItem value="cargomax">CargoMax</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Service Level</Label>
                    <Select value={editForm.service} onValueChange={(value) => setEditForm({ ...editForm, service: value })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ground">Ground (3-5 days)</SelectItem>
                        <SelectItem value="air">Air (2-3 days)</SelectItem>
                        <SelectItem value="express">Express (1-2 days)</SelectItem>
                        <SelectItem value="overnight">Overnight</SelectItem>
                        <SelectItem value="same-day">Same Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-orange-700">
                  <Calendar className="h-5 w-5" /> Shipping Dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Pickup Date *</Label>
                    <Input type="date" value={editForm.pickupDate ? editForm.pickupDate.split('T')[0] : ''} onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })} required className="mt-1" />
                  </div>
                  <div>
                    <Label>Delivery Date</Label>
                    <Input type="date" value={editForm.deliveryDate ? editForm.deliveryDate.split('T')[0] : ''} onChange={(e) => setEditForm({ ...editForm, deliveryDate: e.target.value })} className="mt-1" />
                  </div>
                </div>
              </div>

              {/* Origin Address */}
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-green-700">
                  <MapPin className="h-5 w-5" /> Origin Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Company *</Label><Input value={editForm.originAddress?.company || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, company: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Contact Name *</Label><Input value={editForm.originAddress?.contactName || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, contactName: e.target.value } })} required className="mt-1" /></div>
                  <div className="md:col-span-2"><Label>Address Line 1 *</Label><Input value={editForm.originAddress?.address1 || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, address1: e.target.value } })} required className="mt-1" /></div>
                  <div className="md:col-span-2"><Label>Address Line 2</Label><Input value={editForm.originAddress?.address2 || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, address2: e.target.value } })} className="mt-1" /></div>
                  <div><Label>City *</Label><Input value={editForm.originAddress?.city || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, city: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>State *</Label><Input value={editForm.originAddress?.state || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, state: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>PIN Code *</Label><Input value={editForm.originAddress?.zipCode || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, zipCode: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Country *</Label><Input value={editForm.originAddress?.country || 'IN'} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, country: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Phone *</Label><Input value={editForm.originAddress?.phone || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, phone: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Email *</Label><Input type="email" value={editForm.originAddress?.email || ''} onChange={(e) => setEditForm({ ...editForm, originAddress: { ...editForm.originAddress, email: e.target.value } })} required className="mt-1" /></div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-700">
                  <MapPin className="h-5 w-5" /> Destination Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Company *</Label><Input value={editForm.destinationAddress?.company || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, company: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Contact Name *</Label><Input value={editForm.destinationAddress?.contactName || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, contactName: e.target.value } })} required className="mt-1" /></div>
                  <div className="md:col-span-2"><Label>Address Line 1 *</Label><Input value={editForm.destinationAddress?.address1 || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, address1: e.target.value } })} required className="mt-1" /></div>
                  <div className="md:col-span-2"><Label>Address Line 2</Label><Input value={editForm.destinationAddress?.address2 || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, address2: e.target.value } })} className="mt-1" /></div>
                  <div><Label>City *</Label><Input value={editForm.destinationAddress?.city || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, city: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>State *</Label><Input value={editForm.destinationAddress?.state || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, state: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>PIN Code *</Label><Input value={editForm.destinationAddress?.zipCode || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, zipCode: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Country *</Label><Input value={editForm.destinationAddress?.country || 'IN'} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, country: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Phone *</Label><Input value={editForm.destinationAddress?.phone || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, phone: e.target.value } })} required className="mt-1" /></div>
                  <div><Label>Email *</Label><Input type="email" value={editForm.destinationAddress?.email || ''} onChange={(e) => setEditForm({ ...editForm, destinationAddress: { ...editForm.destinationAddress, email: e.target.value } })} required className="mt-1" /></div>
                </div>
              </div>

              {/* Items */}
              <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-indigo-700">
                  <Box className="h-5 w-5" /> Items ({editForm.items?.length || 0})
                </h3>
                {editForm.items?.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4 bg-white">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {editForm.items.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          const newItems = [...editForm.items];
                          newItems.splice(index, 1);
                          setEditForm({ ...editForm, items: newItems });
                        }}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2"><Label>Description *</Label><Input value={item.description} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].description = e.target.value; setEditForm({ ...editForm, items: newItems }); }} required className="mt-1" /></div>
                      <div><Label>Quantity *</Label><Input type="number" min="1" value={item.quantity || 1} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].quantity = parseInt(e.target.value) || 1; setEditForm({ ...editForm, items: newItems }); }} required className="mt-1" /></div>
                      <div><Label>Weight (kg) *</Label><Input type="number" step="0.1" min="0" value={item.weight || 0} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].weight = parseFloat(e.target.value) || 0; setEditForm({ ...editForm, items: newItems }); }} required className="mt-1" /></div>
                      <div><Label>Value (₹) *</Label><Input type="number" step="1" min="0" value={item.value || 0} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].value = parseFloat(e.target.value) || 0; setEditForm({ ...editForm, items: newItems }); }} required className="mt-1" /></div>
                      <div><Label>Category</Label><Select value={item.category} onValueChange={(value) => { const newItems = [...editForm.items]; newItems[index].category = value; setEditForm({ ...editForm, items: newItems }); }}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">General Merchandise</SelectItem><SelectItem value="electronics">Electronics</SelectItem><SelectItem value="clothing">Clothing</SelectItem><SelectItem value="books">Books</SelectItem><SelectItem value="food">Food & Beverages</SelectItem><SelectItem value="medical">Medical Supplies</SelectItem><SelectItem value="automotive">Automotive Parts</SelectItem></SelectContent></Select></div>
                      <div className="flex items-center space-x-2 pt-6"><input type="checkbox" id={`hazardous-${index}`} checked={item.hazardous || false} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].hazardous = e.target.checked; setEditForm({ ...editForm, items: newItems }); }} className="h-4 w-4 rounded border-gray-300" /><Label htmlFor={`hazardous-${index}`}>Hazardous Material</Label></div>
                    </div>
                    <div className="mt-4"><Label>Dimensions (cm)</Label><div className="grid grid-cols-3 gap-2 mt-1"><Input type="number" step="0.1" placeholder="Length" value={item.dimensions?.length || 0} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].dimensions = { ...newItems[index].dimensions, length: parseFloat(e.target.value) || 0 }; setEditForm({ ...editForm, items: newItems }); }} /><Input type="number" step="0.1" placeholder="Width" value={item.dimensions?.width || 0} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].dimensions = { ...newItems[index].dimensions, width: parseFloat(e.target.value) || 0 }; setEditForm({ ...editForm, items: newItems }); }} /><Input type="number" step="0.1" placeholder="Height" value={item.dimensions?.height || 0} onChange={(e) => { const newItems = [...editForm.items]; newItems[index].dimensions = { ...newItems[index].dimensions, height: parseFloat(e.target.value) || 0 }; setEditForm({ ...editForm, items: newItems }); }} /></div></div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => { setEditForm({ ...editForm, items: [...editForm.items, { description: "", quantity: 1, weight: 0, dimensions: { length: 0, width: 0, height: 0 }, value: 0, category: "general", hazardous: false }] }); }} className="w-full mt-2"><Plus className="h-4 w-4 mr-2" />Add Another Item</Button>
              </div>

              {/* Special Services */}
              <div className="border-2 border-teal-200 rounded-lg p-4 bg-teal-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-teal-700"><Shield className="h-5 w-5" /> Special Services</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg"><Label>Insurance Coverage (1% of value)</Label><Switch checked={editForm.insuranceRequired} onCheckedChange={(checked) => setEditForm({ ...editForm, insuranceRequired: checked })} /></div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg"><Label>Signature Required (+{formatINR(SIGNATURE_FEE_INR)})</Label><Switch checked={editForm.signatureRequired} onCheckedChange={(checked) => setEditForm({ ...editForm, signatureRequired: checked })} /></div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg"><Label>Temperature Controlled (+{formatINR(TEMP_CONTROL_FEE_INR)})</Label><Switch checked={editForm.temperatureControlled} onCheckedChange={(checked) => setEditForm({ ...editForm, temperatureControlled: checked })} /></div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg"><Label>Fragile Handling (+{formatINR(FRAGILE_FEE_INR)})</Label><Switch checked={editForm.fragile} onCheckedChange={(checked) => setEditForm({ ...editForm, fragile: checked })} /></div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-yellow-700"><PenSquare className="h-5 w-5" /> Special Instructions</h3>
                <Textarea value={editForm.specialInstructions || ''} onChange={(e) => setEditForm({ ...editForm, specialInstructions: e.target.value })} placeholder="Enter any special handling instructions..." rows={4} className="mt-1" />
              </div>

              {/* Cost Summary */}
              <div className="border-2 border-pink-200 rounded-lg p-4 bg-pink-50/30">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-pink-700"><DollarSign className="h-5 w-5" /> Cost Summary (INR)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg"><Weight className="h-5 w-5 text-blue-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Total Weight</p><p className="font-bold">{calculateEditTotalWeight().toFixed(2)} kg</p></div>
                  <div className="text-center p-3 bg-white rounded-lg"><DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Total Value</p><p className="font-bold">{formatINR(calculateEditTotalValue())}</p></div>
                  <div className="text-center p-3 bg-white rounded-lg"><Box className="h-5 w-5 text-purple-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Total Items</p><p className="font-bold">{editForm.items?.length || 0}</p></div>
                  <div className="text-center p-3 bg-white rounded-lg"><Truck className="h-5 w-5 text-orange-600 mx-auto mb-1" /><p className="text-xs text-gray-500">Estimated Cost</p><p className="font-bold text-green-600">{formatINR(editForm.estimatedCost || 0)}</p></div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" disabled={editLoading} className="bg-green-600 hover:bg-green-700"><Save className="h-4 w-4 mr-2" />{editLoading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}