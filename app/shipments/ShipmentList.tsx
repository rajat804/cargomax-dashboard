"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BASE_URI = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:4000";

interface Shipment {
    _id: string;
    trackingId: string;
    shipmentNumber?: string;
    customer: string;
    carrier: string;
    originWarehouse?: { name: string; code?: string };
    destinationVendor?: { companyName: string };
    type: string;
    priority: string;
    weight: number;
    items: number;
    value: number;
    status: string;
}

export default function ShipmentList() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortField, setSortField] = useState<keyof Shipment | "trackingId">("trackingId");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [editModal, setEditModal] = useState(false);
    const [editShipment, setEditShipment] = useState<any>(null);
    const [selectedShipment, setSelectedShipment] = useState<any>(null);
    const [openModal, setOpenModal] = useState(false);

    // Fetch Shipments from Backend
    const fetchShipments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URI}/api/shipments`);
            setShipments(res.data.data || []);
        } catch (error) {
            console.error("Failed to fetch shipments:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load shipments from server",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    // Sorting
    const handleSort = (field: keyof Shipment | "trackingId") => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // Filter & Sort Data
    const filteredShipments = [...shipments]
        .filter((shipment) =>
            shipment.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shipment.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let valA: any = a[sortField as keyof Shipment];
            let valB: any = b[sortField as keyof Shipment];

            if (sortField === "trackingId") {
                valA = a.trackingId || "";
                valB = b.trackingId || "";
            }

            if (typeof valA === "string" && typeof valB === "string") {
                return sortDirection === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return sortDirection === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
        });

    // Pagination
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
    const paginatedShipments = filteredShipments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const toggleSelectAll = () => {
        if (selectedShipments.length === paginatedShipments.length) {
            setSelectedShipments([]);
        } else {
            setSelectedShipments(paginatedShipments.map((s) => s._id));
        }
    };

    const toggleSelectShipment = (id: string) => {
        if (selectedShipments.includes(id)) {
            setSelectedShipments(selectedShipments.filter((sid) => sid !== id));
        } else {
            setSelectedShipments([...selectedShipments, id]);
        }
    };

    const handleViewShipment = async (shipment: Shipment) => {

        try {

            const res = await fetch(`${BASE_URI}/api/shipments/${shipment._id}`);

            const data = await res.json();

            if (data.success) {
                setSelectedShipment(data.data);
                setOpenModal(true);
            }

        } catch (error) {
            console.log(error);
        }

    };

    const handleEditShipment = (shipment: Shipment) => {

        setEditShipment(shipment);
        setEditModal(true);

    };
    const handleUpdateShipment = async () => {
        // Validation
        if (!editShipment.customer || !editShipment.carrier || !editShipment.type || !editShipment.priority) {
            toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Please fill all required fields"
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put(`${BASE_URI}/api/shipments/${editShipment._id}`, {
                customer: editShipment.customer,
                carrier: editShipment.carrier,
                type: editShipment.type,
                priority: editShipment.priority,
                weight: Number(editShipment.weight) || 0,
                items: Number(editShipment.items) || 0,
                value: Number(editShipment.value) || 0,
                status: editShipment.status,
                notes: editShipment.notes || ''
            });

            toast({
                title: "✅ Success",
                description: "Shipment updated successfully!"
            });

            setEditModal(false);

            // Refresh the shipments list
            fetchShipments(); // Your function to fetch shipments

        } catch (error: any) {   // ← Fixed: Added type 'any'
            console.error("Submit Error:", error);
            toast({
                variant: "destructive",
                title: "❌ Failed to Create Shipment",
                description: error.response?.data?.message || 
                            error.message || 
                            "Something went wrong on server",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteShipment = async (shipment: Shipment) => {

        const confirmDelete = confirm("Delete this shipment?");

        if (!confirmDelete) return;

        try {

            const res = await fetch(`${BASE_URI}/api/shipments/${shipment._id}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (data.success) {
                alert("Shipment Deleted");
                fetchShipments();
            }

        } catch (error) {

            console.log(error);

        }

    };

    const getStatusBadge = (status: string) => {
        const colors: any = {
            pending: "bg-yellow-100 text-yellow-800",
            "in-transit": "bg-blue-100 text-blue-800",
            delivered: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };
        return (
            <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
                {status?.toUpperCase()}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const colors: any = {
            express: "bg-red-100 text-red-700",
            standard: "bg-blue-100 text-blue-700",
            economy: "bg-gray-100 text-gray-700",
        };
        return (
            <Badge className={colors[priority] || ""}>
                {priority?.toUpperCase()}
            </Badge>
        );
    };

    if (loading) {
        return <div className="text-center py-12">Loading shipments...</div>;
    }

    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle>Shipment List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="rounded-md border overflow-auto">
                    <Table className="whitespace-nowrap min-w-[1000px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Checkbox
                                        checked={
                                            selectedShipments.length === paginatedShipments.length &&
                                            paginatedShipments.length > 0
                                        }
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("trackingId")}
                                >
                                    Tracking ID
                                    {sortField === "trackingId" && (
                                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => handleSort("customer")}
                                >
                                    Customer
                                    {sortField === "customer" && (
                                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                                    )}
                                </TableHead>
                                <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                                <TableHead className="hidden md:table-cell">Vendor</TableHead>
                                <TableHead className="hidden lg:table-cell">Type</TableHead>
                                <TableHead className="hidden lg:table-cell">Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[80px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedShipments.length > 0 ? (
                                paginatedShipments.map((shipment) => (
                                    <TableRow key={shipment._id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedShipments.includes(shipment._id)}
                                                onCheckedChange={() => toggleSelectShipment(shipment._id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">
                                            <div>Shipment: {shipment.shipmentNumber}</div>
                                            <div className="text-sm text-gray-500">
                                                Tracking: {shipment.trackingId}
                                            </div>
                                        </TableCell>
                                        <TableCell>{shipment.customer}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {shipment.originWarehouse?.name || "N/A"}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {shipment.destinationVendor?.companyName || "N/A"}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell capitalize">
                                            {shipment.type}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {getPriorityBadge(shipment.priority)}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(shipment.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewShipment(shipment)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEditShipment(shipment)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteShipment(shipment)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        No shipments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {filteredShipments.length > 0 && (
                    <div className="flex flex-wrap gap-3 items-center justify-between px-4 py-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                            {Math.min(currentPage * itemsPerPage, filteredShipments.length)} of{" "}
                            {filteredShipments.length} shipments
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {openModal && selectedShipment && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300" onClick={() => setOpenModal(false)}>
                        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-in slide-in-from-bottom-10 duration-300" onClick={(e) => e.stopPropagation()}>

                            {/* Hero Header with Pattern */}
                            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-t-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl -ml-24 -mb-24"></div>

                                <div className="relative px-8 py-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-blue-100 text-sm font-medium tracking-wide">SHIPMENT DETAILS</p>
                                                    <h2 className="text-2xl font-bold text-white mt-1">{selectedShipment.shipmentNumber}</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setOpenModal(false)}
                                            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Tracking Info */}
                                    <div className="mt-6 flex flex-wrap gap-6 items-center">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                                            <p className="text-blue-100 text-xs">TRACKING ID</p>
                                            <p className="text-white font-mono font-semibold text-lg">{selectedShipment.trackingId}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                            <span className="text-white text-sm font-medium">Active Tracking</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-8">
                                {/* Status & Priority Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-600 text-xs font-semibold uppercase tracking-wider">Current Status</p>
                                                <p className="text-2xl font-bold text-green-700 mt-1 capitalize">{selectedShipment.status}</p>
                                            </div>
                                            <div className="bg-green-500 rounded-full p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-600 text-xs font-semibold uppercase tracking-wider">Priority Level</p>
                                                <p className="text-2xl font-bold text-orange-700 mt-1 capitalize">{selectedShipment.priority}</p>
                                            </div>
                                            <div className="bg-orange-500 rounded-full p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-purple-600 text-xs font-semibold uppercase tracking-wider">Shipment Type</p>
                                                <p className="text-2xl font-bold text-purple-700 mt-1 capitalize">{selectedShipment.type}</p>
                                            </div>
                                            <div className="bg-purple-500 rounded-full p-2">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Information Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    {/* Left Column */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Customer Information
                                            </h3>
                                            <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Customer Name</span>
                                                    <span className="font-semibold text-gray-900">{selectedShipment.customer}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Carrier</span>
                                                    <span className="font-semibold text-gray-900">{selectedShipment.carrier}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                Shipment Details
                                            </h3>
                                            <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Weight</span>
                                                    <span className="font-semibold text-gray-900">{selectedShipment.weight} kg</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Items</span>
                                                    <span className="font-semibold text-gray-900">{selectedShipment.items} units</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Total Value</span>
                                                    <span className="font-bold text-2xl text-green-600">₹{selectedShipment.value?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Timeline */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Timeline
                                            </h3>
                                            <div className="bg-gray-50 rounded-2xl p-5">
                                                <div className="relative">
                                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                                    <div className="space-y-6 relative">
                                                        <div className="flex items-start gap-3">
                                                            <div className="relative z-10 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-900">Shipment Created</p>
                                                                <p className="text-sm text-gray-500">{new Date(selectedShipment.createdAt).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                        {selectedShipment.status === 'in-transit' && (
                                                            <div className="flex items-start gap-3">
                                                                <div className="relative z-10 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-900">In Transit</p>
                                                                    <p className="text-sm text-gray-500">Shipment is on the way</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {selectedShipment.status === 'delivered' && (
                                                            <div className="flex items-start gap-3">
                                                                <div className="relative z-10 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-gray-900">Delivered</p>
                                                                    <p className="text-sm text-gray-500">Successfully delivered</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Section with Map Style */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Route Information
                                    </h3>
                                    <div className="relative">
                                        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 w-0.5 h-32 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block"></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 hover:shadow-lg transition-all duration-300">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-blue-500 rounded-full p-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Origin Warehouse</p>
                                                        <p className="font-bold text-gray-900 text-lg mt-1">{selectedShipment.originWarehouse?.name}</p>
                                                        <p className="text-gray-600 text-sm mt-2">{selectedShipment.originWarehouse?.city}, {selectedShipment.originWarehouse?.state}</p>
                                                        <p className="text-gray-500 text-xs mt-1">{selectedShipment.originWarehouse?.address}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 hover:shadow-lg transition-all duration-300">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-purple-500 rounded-full p-2">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Destination Vendor</p>
                                                        <p className="font-bold text-gray-900 text-lg mt-1">{selectedShipment.destinationVendor?.companyName}</p>
                                                        <p className="text-gray-600 text-sm mt-2">{selectedShipment.destinationVendor?.city}, {selectedShipment.destinationVendor?.state}</p>
                                                        <p className="text-gray-500 text-xs mt-1">{selectedShipment.destinationVendor?.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info if available */}
                                {selectedShipment.notes && (
                                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-amber-500 rounded-full p-2">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Additional Notes</p>
                                                <p className="text-gray-700 mt-1">{selectedShipment.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 rounded-b-3xl flex flex-wrap justify-end gap-3">
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="px-6 py-2.5 bg-white hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-all duration-200 border border-gray-300"
                                >
                                    Close
                                </button>
                                {/* <button
                                    onClick={() => window.print()}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Details
                                </button> */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedShipment.trackingId);
                                        toast({ title: "Copied!", description: "Tracking ID copied to clipboard" });
                                    }}
                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                    Copy Tracking ID
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {editModal && editShipment && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">

                            {/* Header with Gradient */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-4 sticky top-0 z-10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Edit Shipment</h2>
                                        <p className="text-blue-100 text-sm mt-1">Update shipment #{editShipment.shipmentNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => setEditModal(false)}
                                        className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-6">

                                {/* Basic Information Section */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.customer || ''}
                                                onChange={(e) => setEditShipment({ ...editShipment, customer: e.target.value })}
                                                placeholder="Enter customer name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Carrier *</label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.carrier || ''}
                                                onChange={(e) => setEditShipment({ ...editShipment, carrier: e.target.value })}
                                            >
                                                <option value="">Select Carrier</option>
                                                <option value="cargomax">CargoMax Express</option>
                                                <option value="fasttrack">FastTrack Logistics</option>
                                                <option value="airspeed">AirSpeed Cargo</option>
                                                <option value="oceanwave">OceanWave Freight</option>
                                                <option value="raillink">RailLink Transport</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipment Type & Priority */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Shipment Configuration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Shipment Type *</label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.type || ''}
                                                onChange={(e) => setEditShipment({ ...editShipment, type: e.target.value })}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="road">Road</option>
                                                <option value="air">Air</option>
                                                <option value="sea">Sea</option>
                                                <option value="rail">Rail</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                                            <select
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.priority || ''}
                                                onChange={(e) => setEditShipment({ ...editShipment, priority: e.target.value })}
                                            >
                                                <option value="">Select Priority</option>
                                                <option value="express">Express</option>
                                                <option value="standard">Standard</option>
                                                <option value="economy">Economy</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipment Details */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Shipment Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.weight || 0}
                                                onChange={(e) => setEditShipment({ ...editShipment, weight: e.target.value })}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Items Count</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.items || 0}
                                                onChange={(e) => setEditShipment({ ...editShipment, items: e.target.value })}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Value (₹)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                value={editShipment.value || 0}
                                                onChange={(e) => setEditShipment({ ...editShipment, value: e.target.value })}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Status
                                    </h3>
                                    <div>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            value={editShipment.status || 'pending'}
                                            onChange={(e) => setEditShipment({ ...editShipment, status: e.target.value })}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-transit">In Transit</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Additional Notes
                                    </h3>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        value={editShipment.notes || ''}
                                        onChange={(e) => setEditShipment({ ...editShipment, notes: e.target.value })}
                                        placeholder="Add any additional notes about this shipment..."
                                    />
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3 sticky bottom-0">
                                <button
                                    onClick={() => setEditModal(false)}
                                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateShipment}
                                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Update Shipment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}