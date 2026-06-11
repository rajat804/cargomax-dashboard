"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Package,
  DollarSign,
  RefreshCw,
  ArrowUpDown,
  X,
  Download,
  Edit,
  Printer,
  Trash2,
  Truck,
  Plane,
  Ship,
  Train,
} from "lucide-react";
import {
  Shipment,
  ShipmentFilters,
  ShipmentStats,
} from "@/components/shipments/types/shipment";
import { ShipmentStatsCard } from "@/components/shipments/shipmentsComponent/shipment-stats-card";
import { ShipmentFiltersComponent } from "@/components/shipments/shipmentsComponent/shipment-filters";
import { ShipmentTableRow } from "@/components/shipments/shipmentsComponent/shipments-table-row";
import { ShipmentCard } from "@/components/shipments/shipmentsComponent/shipment-card";
import { ShipmentTypeIcon } from "@/components/shipments/shipmentsComponent/shipment-type-icon";
import { ShipmentStatusBadge } from "@/components/shipments/shipment-status-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ShipmentForm from "./ShipmentForm";
import ShipmentList from "./ShipmentList";

// Mock data for shipments
const mockShipments: Shipment[] = [
  {
    id: "SH-2024-001",
    trackingNumber: "TRK78901234",
    customer: "Acme Corporation",
    origin: "New York, NY",
    destination: "Los Angeles, CA",
    departureDate: "2024-05-15T08:00:00",
    estimatedArrival: "2024-05-18T16:00:00",
    status: "in-transit",
    priority: "standard",
    type: "road",
    carrier: "CargoMax Express",
    weight: 1250,
    items: 42,
    value: 12500,
    progress: 65,
    lastUpdated: "2024-05-16T14:30:00",
  },
  {
    id: "SH-2024-002",
    trackingNumber: "TRK78901235",
    customer: "Globex Industries",
    origin: "Chicago, IL",
    destination: "Houston, TX",
    departureDate: "2024-05-14T09:30:00",
    estimatedArrival: "2024-05-17T11:00:00",
    status: "in-transit",
    priority: "express",
    type: "road",
    carrier: "CargoMax Express",
    weight: 980,
    items: 28,
    value: 8750,
    progress: 45,
    lastUpdated: "2024-05-16T12:15:00",
  },
  {
    id: "SH-2024-003",
    trackingNumber: "TRK78901236",
    customer: "Wayne Enterprises",
    origin: "Miami, FL",
    destination: "Atlanta, GA",
    departureDate: "2024-05-16T07:15:00",
    estimatedArrival: "2024-05-17T14:30:00",
    status: "pending",
    priority: "standard",
    type: "road",
    carrier: "FastTrack Logistics",
    weight: 750,
    items: 15,
    value: 5200,
    progress: 0,
    lastUpdated: "2024-05-16T07:15:00",
  },
  {
    id: "SH-2024-004",
    trackingNumber: "AIR45678901",
    customer: "Stark Industries",
    origin: "San Francisco, CA",
    destination: "Tokyo, Japan",
    departureDate: "2024-05-13T23:00:00",
    estimatedArrival: "2024-05-15T18:00:00",
    status: "delivered",
    priority: "express",
    type: "air",
    carrier: "AirSpeed Cargo",
    weight: 320,
    items: 8,
    value: 28000,
    progress: 100,
    lastUpdated: "2024-05-15T17:45:00",
  },
  {
    id: "SH-2024-005",
    trackingNumber: "SEA12345678",
    customer: "Oceanic Imports",
    origin: "Shanghai, China",
    destination: "Seattle, WA",
    departureDate: "2024-05-01T08:00:00",
    estimatedArrival: "2024-05-20T10:00:00",
    status: "in-transit",
    priority: "economy",
    type: "sea",
    carrier: "OceanWave Freight",
    weight: 12500,
    items: 350,
    value: 85000,
    progress: 75,
    lastUpdated: "2024-05-16T09:20:00",
  },
];

export default function ShipmentsPage() {
  // State for filters and pagination
  const [filters, setFilters] = useState<ShipmentFilters>({
    searchQuery: "",
    statusFilter: "all",
    typeFilter: "all",
    priorityFilter: "all",
    carrierFilter: "all",
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState("table");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );

  const itemsPerPage = 10;

  // Shipment statistics
  const shipmentStats: ShipmentStats = {
    total: mockShipments.length,
    inTransit: mockShipments.filter((s) => s.status === "in-transit").length,
    delivered: mockShipments.filter((s) => s.status === "delivered").length,
    pending: mockShipments.filter((s) => s.status === "pending").length,
    delayed: mockShipments.filter((s) => s.status === "delayed").length,
    cancelled: mockShipments.filter((s) => s.status === "cancelled").length,
    totalWeight: mockShipments.reduce((sum, s) => sum + s.weight, 0),
    totalValue: mockShipments.reduce((sum, s) => sum + s.value, 0),
    totalItems: mockShipments.reduce((sum, s) => sum + s.items, 0),
  };

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort shipments
  const filteredShipments = mockShipments
    .filter((shipment) => {
      // Search query filter
      if (
        filters.searchQuery &&
        !shipment.id
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !shipment.trackingNumber
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !shipment.customer
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !shipment.origin
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !shipment.destination
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        filters.statusFilter &&
        filters.statusFilter !== "all" &&
        shipment.status !== filters.statusFilter
      ) {
        return false;
      }

      // Type filter
      if (
        filters.typeFilter &&
        filters.typeFilter !== "all" &&
        shipment.type !== filters.typeFilter
      ) {
        return false;
      }

      // Priority filter
      if (
        filters.priorityFilter &&
        filters.priorityFilter !== "all" &&
        shipment.priority !== filters.priorityFilter
      ) {
        return false;
      }

      // Carrier filter
      if (
        filters.carrierFilter &&
        filters.carrierFilter !== "all" &&
        shipment.carrier !== filters.carrierFilter
      ) {
        return false;
      }

      // Date range filter
      if (
        filters.dateRange.from &&
        new Date(shipment.departureDate) < filters.dateRange.from
      ) {
        return false;
      }

      if (filters.dateRange.to) {
        const toDateEnd = new Date(filters.dateRange.to);
        toDateEnd.setHours(23, 59, 59, 999);
        if (new Date(shipment.departureDate) > toDateEnd) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by field
      let comparison = 0;

      switch (sortField) {
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "customer":
          comparison = a.customer.localeCompare(b.customer);
          break;
        case "origin":
          comparison = a.origin.localeCompare(b.origin);
          break;
        case "destination":
          comparison = a.destination.localeCompare(b.destination);
          break;
        case "departureDate":
          comparison =
            new Date(a.departureDate).getTime() -
            new Date(b.departureDate).getTime();
          break;
        case "estimatedArrival":
          comparison =
            new Date(a.estimatedArrival).getTime() -
            new Date(b.estimatedArrival).getTime();
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          comparison = a.priority.localeCompare(b.priority);
          break;
        case "weight":
          comparison = a.weight - b.weight;
          break;
        case "value":
          comparison = a.value - b.value;
          break;
        default:
          comparison = a.id.localeCompare(b.id);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Paginate shipments
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      statusFilter: "all",
      typeFilter: "all",
      priorityFilter: "all",
      carrierFilter: "all",
      dateRange: { from: undefined, to: undefined },
    });
  };

  // Toggle select all shipments
  const toggleSelectAll = () => {
    if (selectedShipments.length === paginatedShipments.length) {
      setSelectedShipments([]);
    } else {
      setSelectedShipments(paginatedShipments.map((s) => s.id));
    }
  };

  // Toggle select shipment
  const toggleSelectShipment = (id: string) => {
    if (selectedShipments.includes(id)) {
      setSelectedShipments(selectedShipments.filter((s) => s !== id));
    } else {
      setSelectedShipments([...selectedShipments, id]);
    }
  };

  // Effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle view shipment details
  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsViewDialogOpen(true);
  };

  // Handle edit shipment
  const handleEditShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsEditDialogOpen(true);
  };

  // Handle duplicate shipment
  const handleDuplicateShipment = (shipment: Shipment) => {
    alert(`Duplicated shipment: ${shipment.id}`);
  };

  // Handle delete shipment
  const handleDeleteShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete shipment
  const confirmDeleteShipment = () => {
    if (!selectedShipment) return;
    setIsDeleteDialogOpen(false);
    setSelectedShipment(null);
    alert(`Deleted shipment: ${selectedShipment.id}`);
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Shipments</h1>
            <p className="text-muted-foreground">
              Manage and track all shipments across your logistics network
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <ShipmentForm />
          </div>
        </div>

        {/* Shipment Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <ShipmentStatsCard stats={shipmentStats} />

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Weight
                  </p>
                  <p className="text-2xl font-bold">
                    {shipmentStats.totalWeight.toLocaleString()} kg
                  </p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Average weight per shipment:{" "}
                  {Math.round(
                    shipmentStats.totalWeight / shipmentStats.total
                  ).toLocaleString()}{" "}
                  kg
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold">
                    ${shipmentStats.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-green-500/10 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Average value per shipment: $
                  {Math.round(
                    shipmentStats.totalValue / shipmentStats.total
                  ).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold">
                    {shipmentStats.totalItems.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Package className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-muted-foreground">
                  Average items per shipment:{" "}
                  {Math.round(
                    shipmentStats.totalItems / shipmentStats.total
                  ).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <ShipmentFiltersComponent
          filters={filters}
          showFilters={showFilters}
          viewMode={viewMode}
          onFiltersChange={(newFilters) =>
            setFilters({ ...filters, ...newFilters })
          }
          onShowFiltersToggle={() => setShowFilters(!showFilters)}
          onViewModeChange={setViewMode}
          onClearFilters={clearFilters}
        />

        {/* Shipments Table View */}
        <ShipmentList />

        {/* Shipments Card View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {paginatedShipments.length > 0 ? (
              paginatedShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onView={handleViewShipment}
                  onEdit={handleEditShipment}
                  onDuplicate={handleDuplicateShipment}
                  onDelete={handleDeleteShipment}
                />
              ))
            ) : (
              <div className="col-span-full flex justify-center p-8">
                <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                  <h3 className="mt-2 text-lg font-semibold">
                    No shipments found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search criteria.
                  </p>
                </div>
              </div>
            )}

            {/* Card View Pagination */}
            {filteredShipments.length > 0 && (
              <div className="col-span-full mt-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
                        let pageNumber;

                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={i}
                            variant={
                              currentPage === pageNumber ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(pageNumber)}
                          >
                            {pageNumber}
                          </Button>
                        );
                      }
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipments Map View */}
        {viewMode === "map" && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Shipment Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative rounded-md overflow-hidden border h-[400px] md:h-[500px] lg:h-[600px] bg-[#f8f9fa] dark:bg-[#111827]">
                {/* Simplified world map for demo */}
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 1000 500"
                  preserveAspectRatio="xMidYMid meet"
                  className="opacity-20 dark:opacity-10"
                >
                  <path
                    d="M215,220 L240,220 L260,200 L280,210 L300,190 L330,190 L350,170 L380,170 L400,150 L430,150 L450,130 L480,130 L500,110 L530,110 L550,130 L580,130 L600,150 L630,150 L650,170 L680,170 L700,190 L730,190 L750,210 L780,210 L800,230 L830,230 L850,250 L880,250 L900,270 L930,270 L950,290 L980,290"
                    fill="none"
                    stroke="#ced4da"
                    strokeWidth="2"
                  />
                  <path
                    d="M215,290 L980,290"
                    fill="none"
                    stroke="#ced4da"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                  <path
                    d="M215,350 L980,350"
                    fill="none"
                    stroke="#ced4da"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                </svg>

                {/* Shipment markers */}
                {paginatedShipments.map((shipment) => {
                  // Simplified coordinates based on origin/destination
                  let x, y;

                  // Very simplified positioning based on location names
                  if (shipment.origin.includes("New York")) {
                    x = 25;
                    y = 30;
                  } else if (shipment.origin.includes("Chicago")) {
                    x = 35;
                    y = 35;
                  } else if (shipment.origin.includes("Los Angeles")) {
                    x = 15;
                    y = 40;
                  } else if (shipment.origin.includes("Miami")) {
                    x = 30;
                    y = 45;
                  } else if (shipment.origin.includes("Shanghai")) {
                    x = 80;
                    y = 35;
                  } else if (shipment.origin.includes("San Francisco")) {
                    x = 15;
                    y = 35;
                  } else {
                    x = 40;
                    y = 40;
                  }

                  // Get status color
                  let color;
                  switch (shipment.status) {
                    case "in-transit":
                      color = "text-blue-500 bg-blue-100 dark:bg-blue-900";
                      break;
                    case "delivered":
                      color = "text-green-500 bg-green-100 dark:bg-green-900";
                      break;
                    case "pending":
                      color =
                        "text-purple-500 bg-purple-100 dark:bg-purple-900";
                      break;
                    case "delayed":
                      color =
                        "text-yellow-500 bg-yellow-100 dark:bg-yellow-900";
                      break;
                    case "cancelled":
                      color = "text-red-500 bg-red-100 dark:bg-red-900";
                      break;
                    default:
                      color = "text-gray-500 bg-gray-100 dark:bg-gray-900";
                  }

                  return (
                    <div
                      key={shipment.id}
                      className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center cursor-pointer transition-all ${color}`}
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                      title={`${shipment.id}: ${shipment.origin} to ${shipment.destination}`}
                    >
                      <ShipmentTypeIcon type={shipment.type} />
                    </div>
                  );
                })}

                {/* Map legend */}
                <div className="absolute bottom-4 right-4 bg-background border rounded-md p-2 shadow-sm">
                  <div className="text-xs font-medium mb-1">
                    Shipment Status
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs">In Transit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-xs">Delivered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs">Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-xs">Delayed</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-xs">Cancelled</span>
                    </div>
                  </div>
                  <div className="border-t my-2"></div>
                  <div className="text-xs font-medium mb-1">Shipment Type</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1">
                      <Truck className="h-3 w-3" />
                      <span className="text-xs">Road</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Plane className="h-3 w-3" />
                      <span className="text-xs">Air</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ship className="h-3 w-3" />
                      <span className="text-xs">Sea</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Train className="h-3 w-3" />
                      <span className="text-xs">Rail</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedShipments.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 z-50 hidden md:flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium">
              {selectedShipments.length} shipments selected
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedShipments([])}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Shipment Dialog */}
      {selectedShipment && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] h-max overflow-y-scroll">
            <DialogHeader>
              <DialogTitle>Shipment Details</DialogTitle>
              <DialogDescription>
                Detailed information about shipment {selectedShipment.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-sm font-medium">Tracking Information</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Tracking Number:
                      </span>
                      <span className="font-medium">
                        {selectedShipment.trackingNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span>
                        <ShipmentStatusBadge status={selectedShipment.status} />
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="flex items-center gap-1 capitalize">
                        <ShipmentTypeIcon type={selectedShipment.type} />
                        {selectedShipment.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carrier:</span>
                      <span>{selectedShipment.carrier}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Customer & Route</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">
                        {selectedShipment.customer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Origin:</span>
                      <span>{selectedShipment.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Destination:
                      </span>
                      <span>{selectedShipment.destination}</span>
                    </div>
                  </div>
                </div>
              </div>
              {selectedShipment.status === "in-transit" && (
                <div className="mt-2">
                  <h3 className="text-sm font-medium mb-2">Progress</h3>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Shipment Progress</span>
                    <span>{selectedShipment.progress}%</span>
                  </div>
                  <Progress value={selectedShipment.progress} className="h-2" />
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleEditShipment(selectedShipment)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Shipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shipment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedShipment && (
              <div className="border rounded-md p-3">
                <div className="font-medium">{selectedShipment.id}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedShipment.trackingNumber}
                </div>
                <div className="text-sm mt-1">{selectedShipment.customer}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedShipment.origin} → {selectedShipment.destination}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteShipment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
