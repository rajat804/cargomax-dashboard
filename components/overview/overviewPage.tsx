"use client";

import React, { useState, useEffect } from "react";
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
  Smartphone,
  Youtube,
  Newspaper,
  ChevronRight,
  LogOut,
  Home,
  ClipboardList,
  MapPin,
  Settings,
  BarChart,
  Menu,
  X,
} from "lucide-react";
import { MetricCard } from "@/components/overview/metric-card";
import { ActivityFeed } from "@/components/overview/activity-feed";
import { ShipmentChart } from "@/components/overview/shipment-chart";
import { FleetStatus } from "@/components/overview/fleet-status";
import { QuickActions } from "@/components/overview/quick-actions";
import { DeliveryMap } from "@/components/overview/delivery-map";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionUser } from "@/hooks/useSessionUser";
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

const quickLinks = [
  { label: "Apply For Leave", icon: Calendar, href: "#" },
  { label: "Loan Status", icon: TrendingUp, href: "#" },
  { label: "Apply For Loan", icon: Gift, href: "#" },
  { label: "View Attendance", icon: Users, href: "#" },
];

export default function OverviewPage() {
  const user = useSessionUser();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState("");

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
  const [searchLocalManifest, setSearchLocalManifest] = useState("");
  const [searchLongRouteManifest, setSearchLongRouteManifest] = useState("");
  const [searchDrs, setSearchDrs] = useState("");
  const [searchMr, setSearchMr] = useState("");

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

  const handleSearch = (type: string, value: string) => {
    if (value.trim()) {
      toast.success(`Searching for ${type}: ${value}`);
    } else {
      toast.error(`Please enter ${type}`);
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
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-600" />
          <p className="text-gray-500 mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-3 md:p-6 bg-gray-50 min-h-screen">
      {/* ===== COMPANY INFO (GreenTrans Style) ===== */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-gray-800">{user.companyName || "GOLDEN ROADWAYS & LOGISTICS PVT LTD"}</h3>
            <p className="text-xs text-gray-400">Version: 2.0.0.1 (Build Date: 29-09-2020)</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="font-medium text-gray-700">Mobile: <span className="font-normal text-gray-500">9599571439</span></span>
            <span>|</span>
            <span className="font-medium text-gray-700">Email: <span className="font-normal text-blue-600">{user.email || "MAYANK.GRLOGISTICS@GMAIL.COM"}</span></span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Designation: Technical Support
        </div>
      </div>

      {/* ===== PAGE HEADER ===== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-400">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing} className="h-9">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ===== TECHNICAL SUPPORT (GreenTrans Style) ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-medium">MY HELP DESK</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">REPORT A PROBLEM</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Newspaper className="h-5 w-5" />
              <span className="text-sm font-medium">NEWS AND EVENTS</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Bookings"
          value={stats.active.count}
          change={12}
          changeType="increase"
          icon={Truck}
          description="Currently active"
          trend="up"
        />
        <MetricCard
          title="Pending Deliveries"
          value={pendingDeliveries}
          change={-3}
          changeType="decrease"
          icon={Clock}
          description="Ready for receive"
          trend="down"
        />
        <MetricCard
          title="Stock In Hand"
          value={totalStock.toLocaleString()}
          change={5}
          changeType="increase"
          icon={Package}
          description="Total items in stock"
          trend="up"
        />
        <MetricCard
          title="Cancelled Bookings"
          value={stats.cancelled.count}
          change={-2}
          changeType="decrease"
          icon={AlertTriangle}
          description={`Lost: ₹${stats.cancelled.totalFreight.toLocaleString()}`}
          trend="down"
        />
      </div>

      {/* ===== SECONDARY METRICS ===== */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Fleet Utilization"
          value="87%"
          change={3}
          changeType="increase"
          icon={TrendingUp}
          description="Vehicle efficiency"
          trend="up"
        />
        <MetricCard
          title="Active Clients"
          value={1247}
          change={23}
          changeType="increase"
          icon={Users}
          description="Total active clients"
          trend="up"
        />
        <MetricCard
          title="Warehouse Capacity"
          value="73%"
          change={-2}
          changeType="decrease"
          icon={Warehouse}
          description="Average utilization"
          trend="down"
        />
        <MetricCard
          title="Total Freight (MTD)"
          value={`₹${(stats.active.totalFreight + stats.cancelled.totalFreight).toLocaleString()}`}
          change={15}
          changeType="increase"
          icon={DollarSign}
          description="Month to date"
          trend="up"
        />
      </div>

      {/* ===== TRACKING SECTION (GreenTrans Style - 6 Fields) ===== */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">TRACKING</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* GR Tracking */}
            <div>
              <Label className="text-xs font-medium text-gray-600">GR Tracking</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="ENTER GR #"
                  value={searchGr}
                  onChange={(e) => setSearchGr(e.target.value)}
                  className="h-9 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch("GR", searchGr)}
                />
                <Button onClick={() => handleSearch("GR", searchGr)} size="sm" className="bg-blue-600 hover:bg-blue-700 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Vehicle Tracking */}
            <div>
              <Label className="text-xs font-medium text-gray-600">Vehicle Tracking</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="ENTER Vehicle #"
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                  className="h-9 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch("Vehicle", searchVehicle)}
                />
                <Button onClick={() => handleSearch("Vehicle", searchVehicle)} size="sm" className="bg-green-600 hover:bg-green-700 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Track Local Manifest */}
            <div>
              <Label className="text-xs font-medium text-gray-600">Track Local Manifest</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="ENTER MANIFEST #"
                  value={searchLocalManifest}
                  onChange={(e) => setSearchLocalManifest(e.target.value)}
                  className="h-9 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch("Local Manifest", searchLocalManifest)}
                />
                <Button onClick={() => handleSearch("Local Manifest", searchLocalManifest)} size="sm" className="bg-purple-600 hover:bg-purple-700 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Track Long Route Manifest */}
            <div>
              <Label className="text-xs font-medium text-gray-600">Track Long Route Manifest</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="ENTER MANIFEST #"
                  value={searchLongRouteManifest}
                  onChange={(e) => setSearchLongRouteManifest(e.target.value)}
                  className="h-9 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch("Long Route Manifest", searchLongRouteManifest)}
                />
                <Button onClick={() => handleSearch("Long Route Manifest", searchLongRouteManifest)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Track DRS */}
            <div>
              <Label className="text-xs font-medium text-gray-600">Track DRS</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="ENTER DRS #"
                  value={searchDrs}
                  onChange={(e) => setSearchDrs(e.target.value)}
                  className="h-9 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch("DRS", searchDrs)}
                />
                <Button onClick={() => handleSearch("DRS", searchDrs)} size="sm" className="bg-pink-600 hover:bg-pink-700 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* MR Enquiry */}
            <div>
              <Label className="text-xs font-medium text-gray-600">MR Enquiry</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="ENTER MR #"
                  value={searchMr}
                  onChange={(e) => setSearchMr(e.target.value)}
                  className="h-9 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch("MR", searchMr)}
                />
                <Button onClick={() => handleSearch("MR", searchMr)} size="sm" className="bg-teal-600 hover:bg-teal-700 h-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== CHARTS AND ANALYTICS ===== */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <ShipmentChart />
        <FleetStatus />
      </div>

      {/* ===== ACTIVITY AND MAP ===== */}
      <div className="grid gap-4 md:gap-6 grid-cols-12">
        <div className="col-span-12 md:col-span-6 2xl:col-span-8">
          <ActivityFeed />
        </div>
        <div className="col-span-12 md:col-span-6 2xl:col-span-4">
          <DeliveryMap />
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <QuickActions />

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

      // Inside the dashboard content, before the "Whats New" section:
      {/* ===== QUICK LINKS (GreenTrans Style) ===== */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">QUICK LINKS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Button key={link.label} variant="outline" size="sm" className="text-xs h-8">
                <Link href={link.href}>
                  <link.icon className="h-3 w-3 mr-1" /> {link.label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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

      {/* ===== FOOTER ===== */}
      <div className="text-[10px] md:text-xs text-gray-400 border-t pt-4 text-center">
        Company: {user.companyName || "Golden Roadways & Logistics Pvt Ltd"} | Version: 2.0.0.1 | Build Date: 29-09-2020
      </div>
    </div>
  );
}