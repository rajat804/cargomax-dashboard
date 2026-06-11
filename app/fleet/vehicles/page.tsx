"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Truck,
  Car,
  Package,
  Forklift,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  Wrench,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Edit,
  Trash2,
  Eye,
  FileText,
  X,
  BarChart,
  ChevronDown,
  Printer,
} from "lucide-react";
import Link from "next/link";

// Mock data for vehicles
const mockVehicles = [
  {
    id: "TRK-001",
    type: "truck",
    make: "Freightliner",
    model: "Cascadia",
    year: 2022,
    vin: "1FUJGHDV8NLAA1234",
    licensePlate: "TRK-001-NY",
    status: "active",
    driver: "John Smith",
    driverId: "DRV-001",
    location: "New York, NY",
    coordinates: [-74.006, 40.7128],
    mileage: 45892,
    fuelLevel: 85,
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
    maintenanceDue: false,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-11-30",
    capacity: "26,000 lbs",
    currentLoad: "18,500 lbs",
    utilization: 71,
    alerts: [],
    documents: ["Registration", "Insurance", "Inspection"],
    notes: "Regular maintenance completed. Good condition.",
  },
  {
    id: "TRK-002",
    type: "truck",
    make: "Kenworth",
    model: "T680",
    year: 2021,
    vin: "1XKYDP9X5MJ123456",
    licensePlate: "TRK-002-IL",
    status: "maintenance",
    driver: "Sarah Johnson",
    driverId: "DRV-002",
    location: "Chicago, IL",
    coordinates: [-87.6298, 41.8781],
    mileage: 78541,
    fuelLevel: 42,
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    maintenanceDue: true,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-10-15",
    capacity: "26,000 lbs",
    currentLoad: "0 lbs",
    utilization: 0,
    alerts: ["Maintenance Due", "Low Fuel"],
    documents: ["Registration", "Insurance"],
    notes: "Scheduled for brake inspection and oil change.",
  },
  {
    id: "VAN-001",
    type: "van",
    make: "Mercedes-Benz",
    model: "Sprinter",
    year: 2023,
    vin: "WD3PE8CC5NP123456",
    licensePlate: "VAN-001-CA",
    status: "active",
    driver: "Michael Brown",
    driverId: "DRV-003",
    location: "Los Angeles, CA",
    coordinates: [-118.2437, 34.0522],
    mileage: 32145,
    fuelLevel: 72,
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    maintenanceDue: false,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-09-30",
    capacity: "3,500 lbs",
    currentLoad: "2,100 lbs",
    utilization: 60,
    alerts: [],
    documents: ["Registration", "Insurance", "Inspection"],
    notes: "Excellent condition. Recently serviced.",
  },
  {
    id: "CAR-001",
    type: "car",
    make: "Toyota",
    model: "Camry",
    year: 2022,
    vin: "4T1C11AK5NU123456",
    licensePlate: "CAR-001-TX",
    status: "available",
    driver: "Unassigned",
    driverId: null,
    location: "Houston, TX",
    coordinates: [-95.3698, 29.7604],
    mileage: 12567,
    fuelLevel: 90,
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-04-05",
    maintenanceDue: false,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-08-15",
    capacity: "500 lbs",
    currentLoad: "0 lbs",
    utilization: 0,
    alerts: [],
    documents: ["Registration", "Insurance", "Inspection"],
    notes: "Available for assignment. Good fuel economy.",
  },
  {
    id: "TRK-003",
    type: "truck",
    make: "Volvo",
    model: "VNL",
    year: 2020,
    vin: "4V4NC9EH5LN123456",
    licensePlate: "TRK-003-FL",
    status: "active",
    driver: "David Wilson",
    driverId: "DRV-004",
    location: "Miami, FL",
    coordinates: [-80.1918, 25.7617],
    mileage: 56789,
    fuelLevel: 65,
    lastMaintenance: "2024-01-25",
    nextMaintenance: "2024-04-25",
    maintenanceDue: false,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-07-20",
    capacity: "26,000 lbs",
    currentLoad: "22,000 lbs",
    utilization: 85,
    alerts: ["High Utilization"],
    documents: ["Registration", "Insurance", "Inspection"],
    notes: "High-performing vehicle. Regular long-haul routes.",
  },
  {
    id: "FRK-001",
    type: "forklift",
    make: "Toyota",
    model: "8FGU25",
    year: 2019,
    vin: "TY8FGU25123456789",
    licensePlate: "FRK-001-IL",
    status: "outOfService",
    driver: "Unassigned",
    driverId: null,
    location: "Chicago, IL",
    coordinates: [-87.6298, 41.8781],
    mileage: 8765,
    fuelLevel: 20,
    lastMaintenance: "2024-01-02",
    nextMaintenance: "2024-04-02",
    maintenanceDue: true,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-06-30",
    capacity: "5,000 lbs",
    currentLoad: "0 lbs",
    utilization: 0,
    alerts: ["Out of Service", "Maintenance Due", "Low Fuel"],
    documents: ["Registration", "Insurance"],
    notes: "Hydraulic system repair needed. Parts on order.",
  },
  {
    id: "VAN-002",
    type: "van",
    make: "Ford",
    model: "Transit",
    year: 2021,
    vin: "1FTBW2CM5MKA12345",
    licensePlate: "VAN-002-WA",
    status: "active",
    driver: "Emily Davis",
    driverId: "DRV-005",
    location: "Seattle, WA",
    coordinates: [-122.3321, 47.6062],
    mileage: 28976,
    fuelLevel: 78,
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-04-12",
    maintenanceDue: false,
    insuranceExpiry: "2024-12-31",
    registrationExpiry: "2024-05-15",
    capacity: "4,650 lbs",
    currentLoad: "3,200 lbs",
    utilization: 69,
    alerts: [],
    documents: ["Registration", "Insurance", "Inspection"],
    notes: "Reliable vehicle for urban deliveries.",
  },
];

const vehicleTypeIcons = {
  truck: Truck,
  van: Package,
  car: Car,
  forklift: Forklift,
};

const statusConfig = {
  active: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900",
    label: "Active",
  },
  maintenance: {
    icon: Wrench,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900",
    label: "Maintenance",
  },
  available: {
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    label: "Available",
  },
  outOfService: {
    icon: Ban,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900",
    label: "Out of Service",
  },
};

export default function VehicleListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleType, setVehicleType] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showEditVehicle, setShowEditVehicle] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter vehicles based on search and filters
  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = vehicleType === "all" || vehicle.type === vehicleType;
    const matchesStatus = status === "all" || vehicle.status === status;
    const matchesLocation =
      location === "all" || vehicle.location.includes(location);

    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  // Calculate fleet statistics
  const fleetStats = {
    total: mockVehicles.length,
    active: mockVehicles.filter((v) => v.status === "active").length,
    maintenance: mockVehicles.filter((v) => v.status === "maintenance").length,
    available: mockVehicles.filter((v) => v.status === "available").length,
    outOfService: mockVehicles.filter((v) => v.status === "outOfService")
      .length,
    avgUtilization: Math.round(
      mockVehicles.reduce((acc, v) => acc + v.utilization, 0) /
        mockVehicles.length
    ),
    totalAlerts: mockVehicles.reduce((acc, v) => acc + v.alerts.length, 0),
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setVehicleType("all");
    setStatus("all");
    setLocation("all");
  };

  const toggleVehicle = (vehicleId: string) => {
    setSelectedVehicles((prev) =>
      prev.includes(vehicleId)
        ? prev.filter((id) => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const toggleAllVehicles = () => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(filteredVehicles.map((v) => v.id));
    }
  };

  const getVehicleIcon = (type: string) => {
    const Icon =
      vehicleTypeIcons[type as keyof typeof vehicleTypeIcons] || Truck;
    return <Icon className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <Badge
        variant="outline"
        className={`flex items-center gap-1 ${config.bgColor}`}
      >
        <config.icon className={`h-3 w-3 ${config.color}`} />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 70) return "bg-green-500";
    if (level > 30) return "bg-yellow-500";
    return "bg-red-500";
  };

  const hasActiveFilters =
    searchQuery ||
    vehicleType !== "all" ||
    status !== "all" ||
    location !== "all";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle List</h1>
          <p className="text-muted-foreground">
            Manage and monitor your entire fleet with comprehensive vehicle
            information
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[90vh] sm:h-max overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Enter the details for the new vehicle to add it to your fleet.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle-id">Vehicle ID</Label>
                  <Input id="vehicle-id" placeholder="e.g., TRK-004" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle-type">Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="forklift">Forklift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="e.g., Freightliner" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g., Cascadia" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="e.g., 2023" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license-plate">License Plate</Label>
                  <Input id="license-plate" placeholder="e.g., TRK-004-NY" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="vin">VIN</Label>
                  <Input id="vin" placeholder="Vehicle Identification Number" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about the vehicle..."
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddVehicle(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowAddVehicle(false)}>
                  Add Vehicle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Fleet Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Vehicles
                </p>
                <p className="text-2xl font-bold">{fleetStats.total}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Truck className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Active
                </span>
                <span className="font-medium">{fleetStats.active}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Wrench className="h-4 w-4 text-yellow-500 mr-1" />
                  Maintenance
                </span>
                <span className="font-medium">{fleetStats.maintenance}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-500 mr-1" />
                  Available
                </span>
                <span className="font-medium">{fleetStats.available}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Ban className="h-4 w-4 text-red-500 mr-1" />
                  Out of Service
                </span>
                <span className="font-medium">{fleetStats.outOfService}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Fleet Utilization
                </p>
                <p className="text-2xl font-bold">
                  {fleetStats.avgUtilization}%
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <BarChart className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={fleetStats.avgUtilization} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">
                Average capacity utilization across all active vehicles
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold">{fleetStats.totalAlerts}</p>
              </div>
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Maintenance due, low fuel, and other vehicle alerts requiring
                attention
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Maintenance Due
                </p>
                <p className="text-2xl font-bold">
                  {mockVehicles.filter((v) => v.maintenanceDue).length}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <Calendar className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Vehicles requiring scheduled maintenance within the next 30 days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col  xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by vehicle ID, make, model, driver, or license plate..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:w-auto">
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="forklift">Forklift</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="outOfService">Out of Service</SelectItem>
                </SelectContent>
              </Select>

              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Los Angeles">Los Angeles</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Houston">Houston</SelectItem>
                  <SelectItem value="Miami">Miami</SelectItem>
                  <SelectItem value="Seattle">Seattle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchQuery && (
                <Badge variant="secondary" className="rounded-sm">
                  Search: {searchQuery}
                  <button className="ml-1" onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {vehicleType !== "all" && (
                <Badge variant="secondary" className="rounded-sm">
                  Type: {vehicleType}
                  <button
                    className="ml-1"
                    onClick={() => setVehicleType("all")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {status !== "all" && (
                <Badge variant="secondary" className="rounded-sm">
                  Status: {status}
                  <button className="ml-1" onClick={() => setStatus("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {location !== "all" && (
                <Badge variant="secondary" className="rounded-sm">
                  Location: {location}
                  <button className="ml-1" onClick={() => setLocation("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedVehicles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedVehicles.length} vehicle
                  {selectedVehicles.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Assign Driver
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vehicle Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>Fleet Vehicles</CardTitle>
            <CardDescription>
              {filteredVehicles.length} of {mockVehicles.length} vehicles
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as "table" | "cards")}
            >
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "table" ? (
            <div className="rounded-md border overflow-x-auto">
              <Table className="whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          selectedVehicles.length === filteredVehicles.length
                        }
                        onCheckedChange={toggleAllVehicles}
                        aria-label="Select all vehicles"
                      />
                    </TableHead>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="w-[140px]">Type/Model</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Driver
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Location
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Mileage
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Fuel</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Utilization
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={() => toggleVehicle(vehicle.id)}
                          aria-label={`Select ${vehicle.id}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {vehicle.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getVehicleIcon(vehicle.type)}
                          <div className="flex flex-col">
                            <span className="font-medium">{vehicle.make}</span>
                            <span className="text-sm text-muted-foreground">
                              {vehicle.model}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vehicle.driver || "Unassigned"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {vehicle.location}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {vehicle.mileage.toLocaleString()} mi
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getFuelLevelColor(
                                vehicle.fuelLevel
                              )}`}
                              style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                          </div>
                          <span className="text-xs">{vehicle.fuelLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={vehicle.utilization}
                            className="h-2 w-16"
                          />
                          <span className="text-xs">
                            {vehicle.utilization}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {vehicle.alerts.length > 0 && (
                            <Badge
                              variant="destructive"
                              className="mr-2 px-1 min-w-[20px]"
                            >
                              {vehicle.alerts.length}
                            </Badge>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  setShowVehicleDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedVehicle(vehicle);
                                  setShowEditVehicle(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Vehicle
                              </DropdownMenuItem>

                              <DropdownMenuItem>
                                <Link
                                  href="/fleet/drivers"
                                  className="flex gap-2 items-center"
                                >
                                  <User className="h-4 w-4 mr-2" />
                                  Assign Driver
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link
                                  href="/dashboard/map"
                                  className="flex items-center gap-2"
                                >
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Track Location
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Vehicle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={() => toggleVehicle(vehicle.id)}
                          aria-label={`Select ${vehicle.id}`}
                        />
                        {getVehicleIcon(vehicle.type)}
                        <div>
                          <h3 className="font-semibold">{vehicle.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.make} {vehicle.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vehicle.alerts.length > 0 && (
                          <Badge
                            variant="destructive"
                            className="px-1 min-w-[20px]"
                          >
                            {vehicle.alerts.length}
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setShowVehicleDetails(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedVehicle(vehicle);
                                setShowEditVehicle(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Vehicle
                            </DropdownMenuItem>

                            <DropdownMenuItem>
                              <Link
                                href="/fleet/drivers"
                                className="flex gap-2 items-center"
                              >
                                <User className="h-4 w-4 mr-2" />
                                Assign Driver
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link
                                href="/dashboard/map"
                                className="flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4 mr-2" />
                                Track Location
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Vehicle
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Status
                        </span>
                        {getStatusBadge(vehicle.status)}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Driver
                        </span>
                        <span className="text-sm font-medium">
                          {vehicle.driver || "Unassigned"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Location
                        </span>
                        <span className="text-sm font-medium">
                          {vehicle.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Fuel Level
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getFuelLevelColor(
                                vehicle.fuelLevel
                              )}`}
                              style={{ width: `${vehicle.fuelLevel}%` }}
                            />
                          </div>
                          <span className="text-xs">{vehicle.fuelLevel}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Utilization
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={vehicle.utilization}
                            className="h-2 w-16"
                          />
                          <span className="text-xs">
                            {vehicle.utilization}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Mileage
                        </span>
                        <span className="text-sm font-medium">
                          {vehicle.mileage.toLocaleString()} mi
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Details Dialog */}
      <Dialog open={showVehicleDetails} onOpenChange={setShowVehicleDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedVehicle && getVehicleIcon(selectedVehicle.type)}
              Vehicle Details - {selectedVehicle?.id}
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about {selectedVehicle?.make}{" "}
              {selectedVehicle?.model}
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Vehicle Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle ID:</span>
                      <span className="font-medium">{selectedVehicle.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">
                        {selectedVehicle.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Make/Model:</span>
                      <span className="font-medium">
                        {selectedVehicle.make} {selectedVehicle.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year:</span>
                      <span className="font-medium">
                        {selectedVehicle.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">VIN:</span>
                      <span className="font-medium">{selectedVehicle.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        License Plate:
                      </span>
                      <span className="font-medium">
                        {selectedVehicle.licensePlate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Assignment & Location
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver:</span>
                      <span className="font-medium">
                        {selectedVehicle.driver || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current Location:
                      </span>
                      <span className="font-medium">
                        {selectedVehicle.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">
                        {selectedVehicle.capacity}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Current Load:
                      </span>
                      <span className="font-medium">
                        {selectedVehicle.currentLoad}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Utilization:
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={selectedVehicle.utilization}
                          className="h-2 w-20"
                        />
                        <span className="text-sm">
                          {selectedVehicle.utilization}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Operational Status
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mileage:</span>
                      <span className="font-medium">
                        {selectedVehicle.mileage.toLocaleString()} mi
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fuel Level:</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getFuelLevelColor(
                              selectedVehicle.fuelLevel
                            )}`}
                            style={{ width: `${selectedVehicle.fuelLevel}%` }}
                          />
                        </div>
                        <span className="text-sm">
                          {selectedVehicle.fuelLevel}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Maintenance:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedVehicle.lastMaintenance
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Next Maintenance:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedVehicle.nextMaintenance
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Insurance Expiry:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedVehicle.insuranceExpiry
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Registration Expiry:
                      </span>
                      <span className="font-medium">
                        {new Date(
                          selectedVehicle.registrationExpiry
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Alerts & Documents
                  </h3>
                  <div className="space-y-3">
                    {selectedVehicle.alerts.length > 0 ? (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Active Alerts:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedVehicle.alerts.map(
                            (alert: any, index: number) => (
                              <Badge
                                key={index}
                                variant="destructive"
                                className="text-xs"
                              >
                                {alert}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">No active alerts</span>
                      </div>
                    )}

                    <div>
                      <span className="text-sm text-muted-foreground">
                        Documents:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVehicle.documents.map(
                          (doc: any, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {doc}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {selectedVehicle.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowVehicleDetails(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowVehicleDetails(false);
                setShowEditVehicle(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Vehicle Dialog */}
      <Dialog open={showEditVehicle} onOpenChange={setShowEditVehicle}>
        <DialogContent className="max-w-2xl h-[90vh] sm:h-max overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle - {selectedVehicle?.id}</DialogTitle>
            <DialogDescription>
              Update the vehicle information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedVehicle && (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle-id">Vehicle ID</Label>
                <Input id="edit-vehicle-id" defaultValue={selectedVehicle.id} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle-type">Type</Label>
                <Input
                  id="edit-vehicle-type"
                  defaultValue={selectedVehicle.type}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-make">Make</Label>
                <Input id="edit-make" defaultValue={selectedVehicle.make} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input id="edit-model" defaultValue={selectedVehicle.model} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  defaultValue={selectedVehicle.year}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-license-plate">License Plate</Label>
                <Input
                  id="edit-license-plate"
                  defaultValue={selectedVehicle.licensePlate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Input id="edit-status" defaultValue={selectedVehicle.status} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  defaultValue={selectedVehicle.capacity}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-vin">VIN</Label>
                <Input id="edit-vin" defaultValue={selectedVehicle.vin} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  defaultValue={selectedVehicle.notes}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setShowEditVehicle(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditVehicle(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
