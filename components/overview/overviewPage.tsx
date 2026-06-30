"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionUser } from "@/hooks/useSessionUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Truck,
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Warehouse,
  AlertTriangle,
  RefreshCw,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Gift,
  Search,
  Bell,
  HelpCircle,
  User,
  Menu,
  X,
  Home,
  ClipboardList,
  MapPin,
  Settings,
  BarChart,
  ChevronRight,
  LogOut,
  Youtube,
  Newspaper,
  Smartphone,
} from "lucide-react";
import {
  getBookings,
  getBookingStats,
  getAllDispatches,
  getStockRegister,
} from "@/services/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { format } from "date-fns";

// Types
interface BookingStats {
  active: { count: number; totalFreight: number };
  cancelled: { count: number; totalFreight: number };
}

interface BookingRecord {
  _id: string;
  grNo: string;
  bookingFrom: string;
  destination: string;
  consignorName: string;
  consigneeName: string;
  totalFreight: number;
  bookingDate: string;
  status: string;
}

interface DispatchRecord {
  _id: string;
  dispatchId: string;
  branchName: string;
  dispatchedTo: string;
  dispatchDate: string;
  status: string;
  noOfItems: number;
}

interface StockItem {
  itemName: string;
  unitType: string;
  stockInHand: number;
}

// Menu items (if sidebar is internal)
const menuItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard/overview" },
  { label: "Item Purchase", icon: ClipboardList, href: "/dashboard/inventory/purchase" },
  { label: "Stock Register", icon: Package, href: "/dashboard/inventory/stock-register" },
  { label: "Stock Issue", icon: Package, href: "/dashboard/inventory/stock-issue" },
  { label: "Booking Computerized", icon: FileText, href: "/dashboard/booking/computerized-grl" },
  { label: "Booking Manual", icon: FileText, href: "/dashboard/booking/manual-grl" },
  { label: "Item Despatch", icon: Truck, href: "/dashboard/inventory/dispatch" },
  { label: "Despatch Receive", icon: CheckCircle, href: "/dashboard/inventory/despatch-receive" },
  { label: "Local Manifest", icon: MapPin, href: "/dashboard/inventory/local-manifest" },
];

const quickLinks = [
  { label: "Apply For Leave", icon: Calendar, href: "#" },
  { label: "Loan Status", icon: TrendingUp, href: "#" },
  { label: "Apply For Loan", icon: Gift, href: "#" },
  { label: "View Attendance", icon: Users, href: "#" },
];

export default function Overview() {
  const router = useRouter();
  const user = useSessionUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Data States
  const [stats, setStats] = useState<BookingStats>({
    active: { count: 0, totalFreight: 0 },
    cancelled: { count: 0, totalFreight: 0 },
  });
  const [recentBookings, setRecentBookings] = useState<BookingRecord[]>([]);
  const [recentDispatches, setRecentDispatches] = useState<DispatchRecord[]>([]);
  const [pendingDeliveries, setPendingDeliveries] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [searchGr, setSearchGr] = useState("");
  const [searchVehicle, setSearchVehicle] = useState("");
  const [searchManifest, setSearchManifest] = useState("");
  const [searchDrs, setSearchDrs] = useState("");
  const [searchMR, setSearchMR] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set current date
  useEffect(() => {
    const now = new Date();
    setCurrentDate(format(now, "dd-MM-yyyy"));
  }, []);

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await getBookingStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      const bookingsRes = await getBookings({ status: 'active', limit: 5 });
      if (bookingsRes.success) {
        setRecentBookings(bookingsRes.data || []);
      }

      const dispatchRes = await getAllDispatches();
      const dispatches = Array.isArray(dispatchRes) ? dispatchRes : dispatchRes?.data || [];
      setRecentDispatches(dispatches.slice(0, 5));

      const pending = dispatches.filter(
        (d: any) => d.status !== "Received" && d.status !== "Cancelled"
      );
      setPendingDeliveries(pending.length);

      const stockRes = await getStockRegister("ALL", new Date().toISOString());
      const stockData = Array.isArray(stockRes) ? stockRes : stockRes?.data || [];
      const total = stockData.reduce((sum: number, item: any) => sum + (item.stockInHand || 0), 0);
      setTotalStock(total);

      const lowStock = stockData.filter((item: any) => (item.stockInHand || 0) < 10);
      setLowStockItems(lowStock.slice(0, 5));

    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    toast.success("Dashboard refreshed!");
    setRefreshing(false);
  };

  const handleSearchGR = () => {
    if (searchGr.trim()) {
      router.push(`/dashboard/booking/search?gr=${searchGr}`);
    } else {
      toast.error("Please enter GR Number");
    }
  };

  const handleSearchVehicle = () => {
    if (searchVehicle.trim()) {
      toast.success(`Searching for Vehicle: ${searchVehicle}`);
    } else {
      toast.error("Please enter Vehicle Number");
    }
  };

  const handleSearchManifest = () => {
    if (searchManifest.trim()) {
      toast.success(`Searching for Manifest: ${searchManifest}`);
    } else {
      toast.error("Please enter Manifest Number");
    }
  };

  const handleSearchDrs = () => {
    if (searchDrs.trim()) {
      toast.success(`Searching for DRS: ${searchDrs}`);
    } else {
      toast.error("Please enter DRS Number");
    }
  };

  const handleSearchMR = () => {
    if (searchMR.trim()) {
      toast.success(`Searching for MR: ${searchMR}`);
    } else {
      toast.error("Please enter MR Number");
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "received" || s === "delivered")
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0"><CheckCircle className="h-3 w-3 mr-1" /> Received</Badge>;
    if (s === "cancelled")
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
    if (s === "in transit")
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0"><Clock className="h-3 w-3 mr-1" /> In Transit</Badge>;
    if (s === "dispatched")
      return <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0"><Truck className="h-3 w-3 mr-1" /> Dispatched</Badge>;
    if (s === "active")
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Active</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ========================== SIDEBAR ========================== */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-gray-800">CargoCentrix</h1>
            <p className="text-[10px] text-gray-400">v2.0.0.1</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.email?.split('@')[0] || "User"}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.branch || "No Branch"}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <item.icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Quick Links */}
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p>
          <div className="space-y-0.5">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <link.icon className="h-4 w-4" />
                <span className="truncate">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ========================== MAIN CONTENT ========================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-1.5 rounded hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
                <p className="text-xs text-gray-400">{currentDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} className="h-9 w-9 p-0">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-blue-600">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
          {/* ===== COMPANY INFO ===== */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{user.companyName || "GOLDEN ROADWAYS & LOGISTICS PVT LTD"}</h3>
                <p className="text-xs text-gray-400">Version: 2.0.0.1 (Build Date: 29-09-2020)</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Mobile: 9599571439</span>
                <span>|</span>
                <span className="text-blue-600">{user.email || "MAYANK.GRLOGISTICS@GMAIL.COM"}</span>
              </div>
            </div>
          </div>

          {/* ===== KPI CARDS ===== */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Active Bookings</p>
                    <p className="text-2xl font-bold">{stats.active.count}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs opacity-70 mt-1">Freight: ₹{stats.active.totalFreight.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Pending Deliveries</p>
                    <p className="text-2xl font-bold">{pendingDeliveries}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs opacity-70 mt-1">Ready for receive</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Stock In Hand</p>
                    <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <Package className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs opacity-70 mt-1">Total items</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Cancelled Bookings</p>
                    <p className="text-2xl font-bold">{stats.cancelled.count}</p>
                  </div>
                  <div className="bg-white/20 p-2 rounded-full">
                    <XCircle className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs opacity-70 mt-1">Lost: ₹{stats.cancelled.totalFreight.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* ===== SECONDARY METRICS ===== */}
          <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Fleet Utilization</p>
                    <p className="text-xl font-bold">87%</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-gray-400 mt-1">↑ 3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Active Clients</p>
                    <p className="text-xl font-bold">1,247</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-xs text-gray-400 mt-1">↑ 23 new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Warehouse Capacity</p>
                    <p className="text-xl font-bold">73%</p>
                  </div>
                  <Warehouse className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-xs text-gray-400 mt-1">↓ 2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Freight (MTD)</p>
                    <p className="text-xl font-bold text-purple-600">₹{(stats.active.totalFreight + stats.cancelled.totalFreight).toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-gray-400 mt-1">↑ 15% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* ===== TRACKING SECTION (Exactly like GreenTrans) ===== */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">TRACKING</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-medium text-gray-600">GR Tracking</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ENTER GR #"
                      value={searchGr}
                      onChange={(e) => setSearchGr(e.target.value)}
                      className="h-9 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleSearchGR()}
                    />
                    <Button onClick={handleSearchGR} size="sm" className="bg-blue-600 hover:bg-blue-700 h-9">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600">Vehicle Tracking</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ENTER Vehicle #"
                      value={searchVehicle}
                      onChange={(e) => setSearchVehicle(e.target.value)}
                      className="h-9 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleSearchVehicle()}
                    />
                    <Button onClick={handleSearchVehicle} size="sm" className="bg-green-600 hover:bg-green-700 h-9">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600">Track Local Manifest</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ENTER MANIFEST #"
                      value={searchManifest}
                      onChange={(e) => setSearchManifest(e.target.value)}
                      className="h-9 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleSearchManifest()}
                    />
                    <Button onClick={handleSearchManifest} size="sm" className="bg-purple-600 hover:bg-purple-700 h-9">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600">Track Long Route Manifest</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ENTER MANIFEST #"
                      className="h-9 text-sm"
                    />
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600">Track DRS</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ENTER DRS #"
                      value={searchDrs}
                      onChange={(e) => setSearchDrs(e.target.value)}
                      className="h-9 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleSearchDrs()}
                    />
                    <Button onClick={handleSearchDrs} size="sm" className="bg-pink-600 hover:bg-pink-700 h-9">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium text-gray-600">MR Enquiry</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      placeholder="ENTER MR #"
                      value={searchMR}
                      onChange={(e) => setSearchMR(e.target.value)}
                      className="h-9 text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleSearchMR()}
                    />
                    <Button onClick={handleSearchMR} size="sm" className="bg-teal-600 hover:bg-teal-700 h-9">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== RECENT BOOKINGS & DISPATCHES ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Recent Bookings
                </CardTitle>
                <Link href="/dashboard/booking/computerized-grl" className="text-xs text-blue-600 hover:underline flex items-center">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentBookings.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">No recent bookings</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs py-2 px-3">GR #</TableHead>
                          <TableHead className="text-xs py-2 px-3">From</TableHead>
                          <TableHead className="text-xs py-2 px-3">To</TableHead>
                          <TableHead className="text-xs py-2 px-3 text-right">Freight</TableHead>
                          <TableHead className="text-xs py-2 px-3 text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentBookings.map((booking) => (
                          <TableRow key={booking._id} className="hover:bg-gray-50">
                            <TableCell className="font-mono font-medium text-blue-600 text-xs py-2 px-3">{booking.grNo}</TableCell>
                            <TableCell className="text-xs py-2 px-3 truncate max-w-[80px]">{booking.bookingFrom}</TableCell>
                            <TableCell className="text-xs py-2 px-3">{booking.destination}</TableCell>
                            <TableCell className="text-xs py-2 px-3 text-right">₹{booking.totalFreight.toLocaleString()}</TableCell>
                            <TableCell className="text-xs py-2 px-3 text-center">{getStatusBadge(booking.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Truck className="h-4 w-4 text-green-600" />
                  Recent Despatches
                </CardTitle>
                <Link href="/dashboard/inventory/dispatch" className="text-xs text-blue-600 hover:underline flex items-center">
                  View All <ChevronRight className="h-3 w-3" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {recentDispatches.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">No recent dispatches</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs py-2 px-3">Dispatch ID</TableHead>
                          <TableHead className="text-xs py-2 px-3">Branch</TableHead>
                          <TableHead className="text-xs py-2 px-3">To</TableHead>
                          <TableHead className="text-xs py-2 px-3 text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentDispatches.map((dispatch) => (
                          <TableRow key={dispatch._id} className="hover:bg-gray-50">
                            <TableCell className="font-mono font-medium text-blue-600 text-xs py-2 px-3">{dispatch.dispatchId}</TableCell>
                            <TableCell className="text-xs py-2 px-3 truncate max-w-[80px]">{dispatch.branchName}</TableCell>
                            <TableCell className="text-xs py-2 px-3 truncate max-w-[100px]">{dispatch.dispatchedTo}</TableCell>
                            <TableCell className="text-xs py-2 px-3 text-center">{getStatusBadge(dispatch.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ===== LOW STOCK ALERTS ===== */}
          {lowStockItems.length > 0 && (
            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map((item) => (
                    <Badge key={item.itemName} variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1.5 text-xs">
                      {item.itemName}: <span className="font-bold">{item.stockInHand}</span> {item.unitType}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ===== TECHNICAL SUPPORT (GreenTrans Style) ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">MY HELP DESK</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="text-sm font-medium">REPORT A PROBLEM</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-red-600">
                  <Youtube className="h-5 w-5" />
                  <span className="text-sm font-medium">You Tube</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Newspaper className="h-5 w-5" />
                  <span className="text-sm font-medium">NEWS AND EVENTS</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ===== WHAT'S NEW (GreenTrans Style) ===== */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">WHAT'S NEW IN VERSION</p>
                  <p className="text-xs text-blue-600">Go to Settings to activate Windows</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ===== QUICK LINKS ===== */}
          <div className="flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Button key={link.label} variant="outline" size="sm" className="text-xs h-8">
                <Link href={link.href}>
                  <link.icon className="h-3 w-3 mr-1" /> {link.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* ===== FOOTER ===== */}
          <div className="text-[10px] md:text-xs text-gray-400 border-t pt-4 text-center">
            Company: {user.companyName || "Golden Roadways & Logistics Pvt Ltd"} | Version: 2.0.0.1 | Build Date: 29-09-2020
          </div>
        </main>
      </div>

      {/* ========================== MOBILE OVERLAY ========================== */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}