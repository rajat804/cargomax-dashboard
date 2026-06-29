"use client";

import React, { useState, useEffect } from "react";
import { useSessionUser } from "@/hooks/useSessionUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import {
  CalendarIcon,
  Settings,
  Search,
  RefreshCw,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Edit,
  Package,
} from "lucide-react";
import {
  getAllDispatches,
  updateDispatch,
  receiveDespatch,
  cancelDespatch,
} from "@/services/api";

// ==================== TYPES (updated with GR fields) ====================
interface DispatchRecord {
  _id?: string;
  dispatchId: string;
  branchName: string;
  dispatchedTo: string;
  dispatchDate: string;
  dispatchThrough?: string;
  vendorGrNo?: string;
  noOfItems?: number;
  status: string;
  receivedOn?: string;
  receivedBy?: string;
  remarks?: string;
  items?: any[];
  // ─── NEW GR FIELDS ───
  grBookNumber?: string;
  fromLocation?: string;
  toLocation?: string;
  party?: string;
  destination?: string;
  containerDetails?: string;
  isShortDocument?: boolean;
  goodsType?: string;
}

// ==================== OPTIONS ====================
const branchOptions = [
  "HEAD OFFICE",
  "DELHI BRANCH",
  "MUMBAI BRANCH",
  "BANGALORE BRANCH",
  "CHANDIGARH BRANCH",
  "KOLKATA BRANCH",
];

const statusOptions = ["Dispatched", "In Transit", "Delivered", "Cancelled", "Received"];
const locationOptions = ["HEAD OFFICE", "DELHI", "MUMBAI", "BANGALORE", "CHENNAI", "KOLKATA", "PUNE", "External"];
const partyOptions = ["ABC Traders", "XYZ Enterprises", "Golden Roadways", "Logistics India", "Pankhala Transport"];

export default function ItemDespatchReceive() {

  const user = useSessionUser();

  // ==================== PENDING TAB ====================
  const [pendingBranchName, setPendingBranchName] = useState("");
  const [asOnDate, setAsOnDate] = useState<Date>(new Date());
  const [pendingRecords, setPendingRecords] = useState<DispatchRecord[]>([]);
  const [showPendingGrid, setShowPendingGrid] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingLoading, setPendingLoading] = useState(false);

  // ==================== SEARCH TAB ====================
  const [allRecords, setAllRecords] = useState<DispatchRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<DispatchRecord[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  // ==================== EDIT MODAL ====================
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<DispatchRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<DispatchRecord>>({});
  const [editLoading, setEditLoading] = useState(false);

  // ==================== TAB STATE ====================
  const [activeTab, setActiveTab] = useState("pending");

  // ==================== COLUMN SETTINGS ====================
  const [pendingCols, setPendingCols] = useState({
    sNo: true,
    dispatchId: true,
    branchName: true,
    dispatchedTo: true,
    dispatchDate: true,
    courierVendor: true,
    wayBillNo: true,
    noOfItems: true,
    status: true,
    receivedOn: true,
    grBookNumber: true,    // ✅ new
  });

  const [searchCols, setSearchCols] = useState({
    sNo: true,
    dispatchId: true,
    branchName: true,
    dispatchedTo: true,
    dispatchDate: true,
    courierVendor: true,
    wayBillNo: true,
    noOfItems: true,
    status: true,
    receivedOn: true,
    receivedBy: true,
    // ─── NEW GR COLUMNS ───
    grBookNumber: true,
    fromLocation: true,
    toLocation: true,
    party: true,
  });

  // ==================== LOAD ALL RECORDS (for Search) ====================
  const loadAllRecords = async () => {
    setSearchLoading(true);
    try {
      const data = await getAllDispatches();
      const records = Array.isArray(data) ? data : data?.data || [];
      setAllRecords(records);
      setFilteredRecords(records);
    } catch (error) {
      console.error(error);
      alert("Failed to load records.");
    } finally {
      setSearchLoading(false);
    }
  };

  // ==================== LOAD PENDING RECORDS ====================
  const loadPendingRecords = async (branch?: string) => {
    setPendingLoading(true);
    try {
      const data = await getAllDispatches({ branchName: branch || "" });
      const records = Array.isArray(data) ? data : data?.data || [];
      const pending = records.filter(
        (r: any) => r.status !== "Received" && r.status !== "Cancelled"
      );
      setPendingRecords(pending);
      setShowPendingGrid(true);
    } catch (error) {
      console.error(error);
      alert("Failed to load pending records.");
    } finally {
      setPendingLoading(false);
    }
  };

  // Auto-load on mount & tab change
  useEffect(() => {
    loadPendingRecords();
    loadAllRecords();
  }, []);

  useEffect(() => {
    if (activeTab === "pending") {
      loadPendingRecords(pendingBranchName || undefined);
    }
  }, [activeTab]);

  // ==================== HANDLE PROCEED (filter by branch) ====================
  const handleProceed = async () => {
    if (!pendingBranchName) {
      await loadPendingRecords();
    } else {
      await loadPendingRecords(pendingBranchName);
    }
  };

  // ==================== RECEIVE ====================
  const handleReceive = async (record: DispatchRecord) => {
    if (!confirm(`Mark ${record.dispatchId} as received?`)) return;
    try {
      await receiveDespatch(record._id!, "CURRENT_USER");
      await loadAllRecords();
      await loadPendingRecords(pendingBranchName || undefined);
      alert(`✅ ${record.dispatchId} received.`);
    } catch (error) {
      console.error(error);
      alert("Failed to receive.");
    }
  };

  // ==================== CANCEL (Search tab) ====================
  const handleCancel = async (record: DispatchRecord) => {
    if (!confirm(`Cancel ${record.dispatchId}?`)) return;
    try {
      await cancelDespatch(record._id!);
      await loadAllRecords();
      await loadPendingRecords(pendingBranchName || undefined);
      alert(`✅ ${record.dispatchId} cancelled.`);
    } catch (error) {
      console.error(error);
      alert("Failed to cancel.");
    }
  };

  // ==================== SEARCH (frontend) ====================
  const handleSearch = () => {
    if (!searchInput.trim()) {
      setFilteredRecords(allRecords);
      return;
    }
    const term = searchInput.trim().toLowerCase();
    const filtered = allRecords.filter(
      (r) =>
        r.dispatchId.toLowerCase().includes(term) ||
        r.branchName.toLowerCase().includes(term) ||
        r.dispatchedTo.toLowerCase().includes(term) ||
        (r.dispatchThrough && r.dispatchThrough.toLowerCase().includes(term)) ||
        (r.vendorGrNo && r.vendorGrNo.toLowerCase().includes(term)) ||
        (r.grBookNumber && r.grBookNumber.toLowerCase().includes(term)) ||
        (r.party && r.party.toLowerCase().includes(term))
    );
    setFilteredRecords(filtered);
  };

  const clearSearch = () => {
    setSearchInput("");
    setFilteredRecords(allRecords);
  };

  // ==================== PENDING SEARCH ====================
  const handlePendingSearch = () => {
    if (!searchTerm.trim()) {
      loadPendingRecords(pendingBranchName || undefined);
    } else {
      const term = searchTerm.trim().toLowerCase();
      const filtered = pendingRecords.filter(
        (r) =>
          r.dispatchId.toLowerCase().includes(term) ||
          r.dispatchedTo.toLowerCase().includes(term) ||
          (r.vendorGrNo && r.vendorGrNo.toLowerCase().includes(term)) ||
          (r.grBookNumber && r.grBookNumber.toLowerCase().includes(term))
      );
      setPendingRecords(filtered);
    }
  };

  const clearPendingSearch = () => {
    setSearchTerm("");
    loadPendingRecords(pendingBranchName || undefined);
  };

  // ==================== EDIT MODAL (updated with GR fields) ====================
  const openEditModal = (record: DispatchRecord) => {
    setEditRecord(record);
    setEditForm({
      branchName: record.branchName,
      dispatchedTo: record.dispatchedTo,
      dispatchDate: record.dispatchDate,
      dispatchThrough: record.dispatchThrough || "",
      vendorGrNo: record.vendorGrNo || "",
      noOfItems: record.noOfItems || 0,
      status: record.status,
      receivedOn: record.receivedOn || "",
      receivedBy: record.receivedBy || "",
      remarks: record.remarks || "",
      // GR fields
      grBookNumber: record.grBookNumber || "",
      fromLocation: record.fromLocation || "",
      toLocation: record.toLocation || "",
      party: record.party || "",
      destination: record.destination || "",
      containerDetails: record.containerDetails || "",
      isShortDocument: record.isShortDocument || false,
      goodsType: record.goodsType || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editRecord || !editRecord._id) return;
    setEditLoading(true);
    try {
      const payload = {
        branchName: editForm.branchName,
        dispatchedTo: editForm.dispatchedTo,
        dispatchDate: editForm.dispatchDate,
        dispatchThrough: editForm.dispatchThrough,
        vendorGrNo: editForm.vendorGrNo,
        noOfItems: editForm.noOfItems,
        status: editForm.status,
        receivedOn: editForm.receivedOn,
        receivedBy: editForm.receivedBy,
        remarks: editForm.remarks,
        // GR fields
        grBookNumber: editForm.grBookNumber,
        fromLocation: editForm.fromLocation,
        toLocation: editForm.toLocation,
        party: editForm.party,
        destination: editForm.destination,
        containerDetails: editForm.containerDetails,
        isShortDocument: editForm.isShortDocument,
        goodsType: editForm.goodsType,
      };
      await updateDispatch(editRecord._id, payload);
      await loadAllRecords();
      await loadPendingRecords(pendingBranchName || undefined);
      alert("✅ Record updated successfully.");
      setEditModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Failed to update record.");
    } finally {
      setEditLoading(false);
    }
  };

  // ==================== STATUS BADGE ====================
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s === "received")
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Received
        </span>
      );
    if (s === "pending")
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Clock className="h-3 w-3" /> Pending
        </span>
      );
    if (s === "in transit")
      return (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Truck className="h-3 w-3" /> In Transit
        </span>
      );
    if (s === "cancelled")
      return (
        <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <XCircle className="h-3 w-3" /> Cancelled
        </span>
      );
    if (s === "delivered")
      return (
        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Delivered
        </span>
      );
    if (s === "dispatched")
      return (
        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Truck className="h-3 w-3" /> Dispatched
        </span>
      );
    return (
      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
        {status}
      </span>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-primary">ITEM DESPATCH RECEIVE</h1>
        <div className="text-xs text-muted-foreground mt-1">
          Company : {user.companyName} | Login By : {user.email}
          <br />
          Login Branch : {user.branch} | Financial Year : {user.financialYear}
        </div>
      </div>

      {/* ─── 📦 Logistics Workflow Note ─── */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <Package className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">📋 Logistics Workflow Note</p>
          <p className="text-sm text-gray-700">
            All goods loaded to <span className="font-medium">Pankhala truck/vehicle</span> for dispatch will be fetched by
            <span className="font-medium"> Tony</span> (route quantity) and
            <span className="font-medium text-red-600"> chattanoo will be checked</span> (counted/verified).
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ⚡ Ensure proper documentation before handover to Pankhala.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* ====== PENDING TAB ====== */}
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Pending Despatch Receive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label>Branch Name</Label>
                  <Select value={pendingBranchName} onValueChange={setPendingBranchName}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">ALL</SelectItem>
                      {branchOptions.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">Select branch to filter</p>
                </div>
                <div>
                  <Label>As On Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(asOnDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar
                        mode="single"
                        selected={asOnDate}
                        onSelect={(d) => d && setAsOnDate(d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <Button
                  onClick={handleProceed}
                  disabled={pendingLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {pendingLoading ? "Loading..." : "Apply Filter"}
                </Button>
              </div>

              {showPendingGrid && (
                <>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by ID, To, WayBill, GR Book..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handlePendingSearch()}
                      />
                    </div>
                    <Button onClick={handlePendingSearch} className="bg-green-600 hover:bg-green-700">
                      <Search className="mr-2 h-4 w-4" /> Search
                    </Button>
                    <Button variant="outline" onClick={clearPendingSearch}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Clear
                    </Button>
                  </div>

                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Column Settings</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {Object.keys(pendingCols).map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            checked={pendingCols[key as keyof typeof pendingCols]}
                            onCheckedChange={(c) =>
                              setPendingCols({ ...pendingCols, [key]: !!c })
                            }
                          />
                          <Label className="text-sm cursor-pointer">
                            {key === "dispatchId"
                              ? "Dispatch ID"
                              : key === "branchName"
                              ? "Branch"
                              : key === "dispatchedTo"
                              ? "Dispatched To"
                              : key === "dispatchDate"
                              ? "Dispatch Date"
                              : key === "courierVendor"
                              ? "Courier/Vendor"
                              : key === "wayBillNo"
                              ? "WayBill"
                              : key === "noOfItems"
                              ? "Items"
                              : key === "receivedOn"
                              ? "Received On"
                              : key === "grBookNumber"
                              ? "GR Book #"
                              : key.replace(/([A-Z])/g, " $1").trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader className="bg-gray-100">
                        <TableRow>
                          {pendingCols.sNo && <TableHead className="w-12">S#</TableHead>}
                          {pendingCols.dispatchId && <TableHead>Dispatch ID</TableHead>}
                          {pendingCols.branchName && <TableHead>Branch</TableHead>}
                          {pendingCols.dispatchedTo && <TableHead>Dispatched To</TableHead>}
                          {pendingCols.dispatchDate && <TableHead>Dispatch Date</TableHead>}
                          {pendingCols.courierVendor && <TableHead>Courier/Vendor</TableHead>}
                          {pendingCols.wayBillNo && <TableHead>WayBill</TableHead>}
                          {pendingCols.noOfItems && <TableHead>Items</TableHead>}
                          {pendingCols.status && <TableHead>Status</TableHead>}
                          {pendingCols.receivedOn && <TableHead>Received On</TableHead>}
                          {pendingCols.grBookNumber && <TableHead>GR Book #</TableHead>}
                          {/* ✅ NO ACTION COLUMN IN PENDING TAB */}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingRecords.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={Object.values(pendingCols).filter(Boolean).length}
                              className="text-center py-8 text-gray-500"
                            >
                              No pending records.
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingRecords.map((rec, idx) => (
                            <TableRow key={rec._id || idx} className="hover:bg-gray-50">
                              {pendingCols.sNo && <TableCell>{idx + 1}</TableCell>}
                              {pendingCols.dispatchId && (
                                <TableCell className="font-medium text-blue-600">
                                  {rec.dispatchId}
                                </TableCell>
                              )}
                              {pendingCols.branchName && <TableCell>{rec.branchName}</TableCell>}
                              {pendingCols.dispatchedTo && <TableCell>{rec.dispatchedTo}</TableCell>}
                              {pendingCols.dispatchDate && <TableCell>{rec.dispatchDate}</TableCell>}
                              {pendingCols.courierVendor && (
                                <TableCell>{rec.dispatchThrough || "-"}</TableCell>
                              )}
                              {pendingCols.wayBillNo && (
                                <TableCell>{rec.vendorGrNo || "-"}</TableCell>
                              )}
                              {pendingCols.noOfItems && <TableCell>{rec.noOfItems || 0}</TableCell>}
                              {pendingCols.status && <TableCell>{getStatusBadge(rec.status)}</TableCell>}
                              {pendingCols.receivedOn && <TableCell>{rec.receivedOn || "-"}</TableCell>}
                              {pendingCols.grBookNumber && <TableCell>{rec.grBookNumber || "-"}</TableCell>}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Total pending: {pendingRecords.length}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== SEARCH TAB ====== */}
        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Despatch Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search by ID, Branch, To, Vendor, WayBill, GR Book, Party..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searchLoading} className="bg-blue-600 hover:bg-blue-700">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
                <Button variant="outline" onClick={clearSearch}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>

              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Column Settings</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(searchCols).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        checked={searchCols[key as keyof typeof searchCols]}
                        onCheckedChange={(c) =>
                          setSearchCols({ ...searchCols, [key]: !!c })
                        }
                      />
                      <Label className="text-sm cursor-pointer">
                        {key === "dispatchId"
                          ? "Dispatch ID"
                          : key === "branchName"
                          ? "Branch"
                          : key === "dispatchedTo"
                          ? "Dispatched To"
                          : key === "dispatchDate"
                          ? "Dispatch Date"
                          : key === "courierVendor"
                          ? "Courier/Vendor"
                          : key === "wayBillNo"
                          ? "WayBill"
                          : key === "noOfItems"
                          ? "Items"
                          : key === "receivedOn"
                          ? "Received On"
                          : key === "receivedBy"
                          ? "Received By"
                          : key === "grBookNumber"
                          ? "GR Book #"
                          : key === "fromLocation"
                          ? "From"
                          : key === "toLocation"
                          ? "To"
                          : key === "party"
                          ? "Party"
                          : key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      {searchCols.sNo && <TableHead className="w-12">S#</TableHead>}
                      {searchCols.dispatchId && <TableHead>Dispatch ID</TableHead>}
                      {searchCols.branchName && <TableHead>Branch</TableHead>}
                      {searchCols.dispatchedTo && <TableHead>Dispatched To</TableHead>}
                      {searchCols.dispatchDate && <TableHead>Dispatch Date</TableHead>}
                      {searchCols.courierVendor && <TableHead>Courier/Vendor</TableHead>}
                      {searchCols.wayBillNo && <TableHead>WayBill</TableHead>}
                      {searchCols.noOfItems && <TableHead>Items</TableHead>}
                      {searchCols.status && <TableHead>Status</TableHead>}
                      {searchCols.receivedOn && <TableHead>Received On</TableHead>}
                      {searchCols.receivedBy && <TableHead>Received By</TableHead>}
                      {searchCols.grBookNumber && <TableHead>GR Book #</TableHead>}
                      {searchCols.fromLocation && <TableHead>From</TableHead>}
                      {searchCols.toLocation && <TableHead>To</TableHead>}
                      {searchCols.party && <TableHead>Party</TableHead>}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={Object.values(searchCols).filter(Boolean).length + 2}
                          className="text-center py-8 text-gray-500"
                        >
                          No records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((rec, idx) => (
                        <TableRow key={rec._id || idx} className="hover:bg-gray-50">
                          {searchCols.sNo && <TableCell>{idx + 1}</TableCell>}
                          {searchCols.dispatchId && (
                            <TableCell className="font-medium text-blue-600">
                              {rec.dispatchId}
                            </TableCell>
                          )}
                          {searchCols.branchName && <TableCell>{rec.branchName}</TableCell>}
                          {searchCols.dispatchedTo && <TableCell>{rec.dispatchedTo}</TableCell>}
                          {searchCols.dispatchDate && <TableCell>{rec.dispatchDate}</TableCell>}
                          {searchCols.courierVendor && (
                            <TableCell>{rec.dispatchThrough || "-"}</TableCell>
                          )}
                          {searchCols.wayBillNo && (
                            <TableCell>{rec.vendorGrNo || "-"}</TableCell>
                          )}
                          {searchCols.noOfItems && <TableCell>{rec.noOfItems || 0}</TableCell>}
                          {searchCols.status && <TableCell>{getStatusBadge(rec.status)}</TableCell>}
                          {searchCols.receivedOn && <TableCell>{rec.receivedOn || "-"}</TableCell>}
                          {searchCols.receivedBy && <TableCell>{rec.receivedBy || "-"}</TableCell>}
                          {searchCols.grBookNumber && <TableCell>{rec.grBookNumber || "-"}</TableCell>}
                          {searchCols.fromLocation && <TableCell>{rec.fromLocation || "-"}</TableCell>}
                          {searchCols.toLocation && <TableCell>{rec.toLocation || "-"}</TableCell>}
                          {searchCols.party && <TableCell>{rec.party || "-"}</TableCell>}
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditModal(rec)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {rec.status !== "Received" && rec.status !== "Cancelled" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCancel(rec)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">Total: {filteredRecords.length}</div>
                <div className="text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2 mr-3">
                    <CheckCircle className="h-3 w-3 text-green-600" /> Received:{" "}
                    {filteredRecords.filter((r) => r.status === "Received").length}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-3 w-3 text-yellow-600" /> Pending:{" "}
                    {filteredRecords.filter(
                      (r) => r.status !== "Received" && r.status !== "Cancelled"
                    ).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== EDIT MODAL (with GR fields) ==================== */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dispatch Record – {editRecord?.dispatchId}</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Basic fields */}
              <div>
                <Label>Branch Name</Label>
                <Select
                  value={editForm.branchName || ""}
                  onValueChange={(v) => setEditForm({ ...editForm, branchName: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dispatched To</Label>
                <Input
                  value={editForm.dispatchedTo || ""}
                  onChange={(e) => setEditForm({ ...editForm, dispatchedTo: e.target.value })}
                />
              </div>
              <div>
                <Label>Dispatch Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.dispatchDate ? format(new Date(editForm.dispatchDate.split("-").reverse().join("-")), "dd-MM-yyyy") : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={editForm.dispatchDate ? new Date(editForm.dispatchDate.split("-").reverse().join("-")) : undefined}
                      onSelect={(d) =>
                        d && setEditForm({ ...editForm, dispatchDate: format(d, "dd-MM-yyyy") })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Courier / Vendor</Label>
                <Input
                  value={editForm.dispatchThrough || ""}
                  onChange={(e) => setEditForm({ ...editForm, dispatchThrough: e.target.value })}
                  placeholder="e.g., DTDC"
                />
              </div>
              <div>
                <Label>WayBill #</Label>
                <Input
                  value={editForm.vendorGrNo || ""}
                  onChange={(e) => setEditForm({ ...editForm, vendorGrNo: e.target.value })}
                  placeholder="WayBill number"
                />
              </div>
              <div>
                <Label>No. of Items</Label>
                <Input
                  type="number"
                  value={editForm.noOfItems || 0}
                  onChange={(e) =>
                    setEditForm({ ...editForm, noOfItems: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status || ""}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Received On</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editForm.receivedOn ? format(new Date(editForm.receivedOn.split("-").reverse().join("-")), "dd-MM-yyyy") : "Select Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={editForm.receivedOn ? new Date(editForm.receivedOn.split("-").reverse().join("-")) : undefined}
                      onSelect={(d) =>
                        d && setEditForm({ ...editForm, receivedOn: format(d, "dd-MM-yyyy") })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Received By</Label>
                <Input
                  value={editForm.receivedBy || ""}
                  onChange={(e) => setEditForm({ ...editForm, receivedBy: e.target.value })}
                  placeholder="e.g., ADMIN"
                />
              </div>
              {/* ─── GR FIELDS ─── */}
              <div>
                <Label>GR Book Number</Label>
                <Input
                  value={editForm.grBookNumber || ""}
                  onChange={(e) => setEditForm({ ...editForm, grBookNumber: e.target.value })}
                  placeholder="GR Book #"
                />
              </div>
              <div>
                <Label>From</Label>
                <Input
                  value={editForm.fromLocation || ""}
                  onChange={(e) => setEditForm({ ...editForm, fromLocation: e.target.value })}
                  placeholder="Origin"
                />
              </div>
              <div>
                <Label>To</Label>
                <Input
                  value={editForm.toLocation || ""}
                  onChange={(e) => setEditForm({ ...editForm, toLocation: e.target.value })}
                  placeholder="Destination"
                />
              </div>
              <div>
                <Label>Party</Label>
                <Input
                  value={editForm.party || ""}
                  onChange={(e) => setEditForm({ ...editForm, party: e.target.value })}
                  placeholder="Party name"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Destination Address</Label>
                <Input
                  value={editForm.destination || ""}
                  onChange={(e) => setEditForm({ ...editForm, destination: e.target.value })}
                  placeholder="Detailed address"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Container Details</Label>
                <Input
                  value={editForm.containerDetails || ""}
                  onChange={(e) => setEditForm({ ...editForm, containerDetails: e.target.value })}
                  placeholder="Container no., type, weight"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editForm.isShortDocument || false}
                  onCheckedChange={(c) => setEditForm({ ...editForm, isShortDocument: !!c })}
                />
                <Label>Short Document</Label>
              </div>
              <div>
                <Label>Goods Type</Label>
                <Input
                  value={editForm.goodsType || ""}
                  onChange={(e) => setEditForm({ ...editForm, goodsType: e.target.value })}
                  placeholder="Goods type"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Remarks</Label>
                <Input
                  value={editForm.remarks || ""}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  placeholder="Additional remarks"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}