"use client";

import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";
import {
  CalendarIcon,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  RefreshCw,
  Truck,
  FileText,
  Package,
  Search,
  Settings,
  Printer,
  Eye,
} from "lucide-react";
import {
  getAllDispatches,
  createDispatch,
  updateDispatch,
  deleteDispatch,
} from "@/services/api";

// ==================== TYPES ====================
interface DispatchItem {
  id: number;
  sNo: number;
  itemName: string;
  unitType: string;
  qty: number;
  issueId: string;
  issueDate: string;
  startNo: string;
  endNo: string;
  itemSerialNo: string;
  remarks: string;
}

interface DispatchRecord {
  _id?: string;
  id: number;
  sNo: number;
  dispatchDate: string;
  branchName: string;
  dispatchedTo: string;
  dispatchThrough: string;
  vendorGrNo: string;
  vendorGrDate: string;
  dispatchId: string;
  noOfItems: number;
  status: string;
  items: DispatchItem[];
  remarks: string;
}

// ==================== OPTIONS ====================
const branchOptions = ["HEAD OFFICE", "DELHI BRANCH", "MUMBAI BRANCH", "BANGALORE BRANCH", "CHENNAI BRANCH", "KOLKATA BRANCH"];
const dispatchedToOptions = ["DELHI BRANCH", "MUMBAI BRANCH", "BANGALORE BRANCH", "CHENNAI BRANCH", "KOLKATA BRANCH", "PUNE BRANCH", "External Vendor"];
const dispatchThroughOptions = ["ROAD TRANSPORT", "AIR CARGO", "RAILWAY", "COURIER", "HAND DELIVERY"];
const itemOptions = ["A4 Printer Paper", "Ballpoint Pen", "Laptop", "Mouse", "Keyboard", "Furniture", "Stapler", "Notebook", "File Folders", "Whiteboard Marker"];
const unitTypeOptions = ["PCS", "BOX", "REAM", "SET", "DOZEN", "KG", "LTR", "ROLL"];
const statusOptions = ["Dispatched", "In Transit", "Delivered", "Cancelled"];

export default function ItemDespatch() {
  // ==================== ENTRY TAB STATE ====================
  const [branchName, setBranchName] = useState("HEAD OFFICE");
  const [dispatchDate, setDispatchDate] = useState<Date>(new Date());
  const [dispatchId, setDispatchId] = useState("");
  const [dispatchedTo, setDispatchedTo] = useState("");
  const [dispatchThrough, setDispatchThrough] = useState("");
  const [vendorGrNo, setVendorGrNo] = useState("");
  const [vendorGrDate, setVendorGrDate] = useState<Date>(new Date());
  const [remarks, setRemarks] = useState("");

  const [dispatchItems, setDispatchItems] = useState<DispatchItem[]>([
    {
      id: 1,
      sNo: 1,
      itemName: "",
      unitType: "",
      qty: 0,
      issueId: "",
      issueDate: format(new Date(), "dd-MM-yyyy"),
      startNo: "",
      endNo: "",
      itemSerialNo: "",
      remarks: "",
    },
  ]);

  // Search Tab State
  const [searchBranch, setSearchBranch] = useState("");
  const [searchDispatchedTo, setSearchDispatchedTo] = useState("");
  const [asOnDate, setAsOnDate] = useState<Date>(new Date());
  const [searchResults, setSearchResults] = useState<DispatchRecord[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [columnSettings, setColumnSettings] = useState({
    sNo: true,
    dispatchDate: true,
    branchName: true,
    dispatchedTo: true,
    dispatchThrough: true,
    grNo: true,
    grDate: true,
    noOfItems: true,
    status: true,
  });

  const [activeTab, setActiveTab] = useState("entry");
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DispatchRecord | null>(null);
  const [editFormData, setEditFormData] = useState<DispatchRecord | null>(null);
  const [editItems, setEditItems] = useState<DispatchItem[]>([]);

  // View Modal State (Full Screen)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<DispatchRecord | null>(null);

  const generateDispatchId = () => `DISP/2026-27/${Date.now().toString().slice(-6)}`;

  // ==================== ENTRY FUNCTIONS ====================
  const addDispatchItem = () => {
    const maxId = dispatchItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const newId = maxId + 1;
    const newSNo = dispatchItems.length + 1;
    setDispatchItems([
      ...dispatchItems,
      {
        id: newId,
        sNo: newSNo,
        itemName: "",
        unitType: "",
        qty: 0,
        issueId: "",
        issueDate: format(new Date(), "dd-MM-yyyy"),
        startNo: "",
        endNo: "",
        itemSerialNo: "",
        remarks: "",
      },
    ]);
  };

  const removeDispatchItem = (id: number) => {
    if (dispatchItems.length > 1) {
      const filtered = dispatchItems.filter((i) => i.id !== id);
      const reindexed = filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      setDispatchItems(reindexed);
    } else {
      alert("At least one item is required!");
    }
  };

  const updateDispatchItem = (id: number, field: keyof DispatchItem, value: any) => {
    setDispatchItems(
      dispatchItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const totalQty = dispatchItems.reduce((sum, item) => sum + item.qty, 0);
  const totalItems = dispatchItems.length;

  // ==================== SEARCH FUNCTIONS ====================
  const loadSearchData = async () => {
    setLoading(true);
    try {
      const data = await getAllDispatches();
      let filtered = Array.isArray(data) ? data : data?.data || [];

      if (searchBranch) filtered = filtered.filter((r: any) => r.branchName === searchBranch);
      if (searchDispatchedTo) filtered = filtered.filter((r: any) => r.dispatchedTo === searchDispatchedTo);

      filtered = filtered.filter((record: any) => {
        const recordDate = new Date(record.dispatchDate.split("-").reverse().join("-"));
        return recordDate <= asOnDate;
      });

      setSearchResults(filtered);
      setShowSearchResults(true);
    } catch (error) {
      console.error(error);
      alert("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSearchData();
  }, []);

  const handleShow = () => loadSearchData();

  // ==================== SAVE / CLEAR / CANCEL ====================
  const handleSave = async () => {
    if (!branchName || !dispatchedTo || dispatchItems.some((item) => !item.itemName)) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      const newDispatchId = dispatchId || generateDispatchId();
      const newDispatch = {
        dispatchDate: format(dispatchDate, "dd-MM-yyyy"),
        branchName,
        dispatchedTo,
        dispatchThrough,
        vendorGrNo,
        vendorGrDate: format(vendorGrDate, "dd-MM-yyyy"),
        dispatchId: newDispatchId,
        noOfItems: totalItems,
        status: "Dispatched",
        items: dispatchItems,
        remarks,
      };

      await createDispatch(newDispatch);
      alert(`✅ Dispatch Saved Successfully!\nID: ${newDispatchId}`);
      handleClear();
      loadSearchData();
    } catch (error) {
      console.error(error);
      alert("Failed to save dispatch");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setBranchName("HEAD OFFICE");
    setDispatchDate(new Date());
    setDispatchId("");
    setDispatchedTo("");
    setDispatchThrough("");
    setVendorGrNo("");
    setVendorGrDate(new Date());
    setRemarks("");
    setDispatchItems([
      {
        id: 1,
        sNo: 1,
        itemName: "",
        unitType: "",
        qty: 0,
        issueId: "",
        issueDate: format(new Date(), "dd-MM-yyyy"),
        startNo: "",
        endNo: "",
        itemSerialNo: "",
        remarks: "",
      },
    ]);
  };

  const handleCancel = () => setActiveTab("search");

  const handlePrint = () => window.print();

  // ==================== EDIT MODAL FUNCTIONS ====================
  const handleEdit = (record: DispatchRecord) => {
    setEditingRecord(record);
    const cloned = JSON.parse(JSON.stringify(record));
    // Ensure each item has a valid numeric id
    if (cloned.items && Array.isArray(cloned.items)) {
      cloned.items = cloned.items.map((item: any, index: number) => ({
        ...item,
        id: typeof item.id === 'number' ? item.id : index + 1,
      }));
    } else {
      cloned.items = [];
    }
    setEditFormData(cloned);
    setEditItems(cloned.items || []);
    setIsEditModalOpen(true);
  };

  const addEditItem = () => {
    const maxId = editItems.reduce((max, item) => Math.max(max, item.id || 0), 0);
    const newId = maxId + 1;
    const newSNo = editItems.length + 1;
    setEditItems([
      ...editItems,
      {
        id: newId,
        sNo: newSNo,
        itemName: "",
        unitType: "",
        qty: 0,
        issueId: "",
        issueDate: format(new Date(), "dd-MM-yyyy"),
        startNo: "",
        endNo: "",
        itemSerialNo: "",
        remarks: "",
      },
    ]);
  };

  const removeEditItem = (id: number) => {
    if (editItems.length > 1) {
      const filtered = editItems.filter((i) => i.id !== id);
      const reindexed = filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      setEditItems(reindexed);
    } else {
      alert("At least one item is required!");
    }
  };

  const updateEditItem = (id: number, field: keyof DispatchItem, value: any) => {
    setEditItems(
      editItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleEditSave = async () => {
    if (!editFormData) return;
    if (!editFormData.branchName || !editFormData.dispatchedTo || editItems.some((i) => !i.itemName)) {
      alert("Please fill all required fields!");
      return;
    }

    setLoading(true);
    try {
      const updatedData = {
        ...editFormData,
        items: editItems,
        noOfItems: editItems.length,
      };
      await updateDispatch(editFormData._id!, updatedData);
      alert("✅ Dispatch updated successfully!");
      setIsEditModalOpen(false);
      loadSearchData();
    } catch (error) {
      console.error(error);
      alert("Failed to update dispatch");
    } finally {
      setLoading(false);
    }
  };

  // ==================== VIEW MODAL (FULL SCREEN) ====================
  const handleView = (record: DispatchRecord) => {
    setViewRecord(record);
    setIsViewModalOpen(true);
  };

  // ==================== DELETE ====================
  const handleDelete = async (id: any) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setLoading(true);
    try {
      await deleteDispatch(id);
      alert("✅ Record deleted successfully!");
      loadSearchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete record");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-primary">3. ITEM DESPATCH</h1>
        <div className="text-xs text-muted-foreground mt-1">
          Company : GOLDEN ROADWAYS &amp; LOGISTICS PVT LTD | Login By : ADMIN@GMAIL.COM
          <br />
          Login Branch : HEAD OFFICE | Financial Year : 2026-2027
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* ENTRY TAB */}
        <TabsContent value="entry" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Item Dispatch Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label>Branch Name <span className="text-red-500">*</span></Label>
                  <Select value={branchName} onValueChange={setBranchName}>
                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>{branchOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dispatch Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dispatchDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent><Calendar mode="single" selected={dispatchDate} onSelect={(d) => d && setDispatchDate(d)} /></PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Dispatch ID</Label>
                  <Input value={dispatchId} onChange={(e) => setDispatchId(e.target.value)} placeholder="Auto generated" />
                </div>

                <div>
                  <Label>Dispatched To <span className="text-red-500">*</span></Label>
                  <Select value={dispatchedTo} onValueChange={setDispatchedTo}>
                    <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                    <SelectContent>{dispatchedToOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Dispatch Through</Label>
                  <Select value={dispatchThrough} onValueChange={setDispatchThrough}>
                    <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                    <SelectContent>{dispatchThroughOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Vendor GR #</Label>
                  <Input value={vendorGrNo} onChange={(e) => setVendorGrNo(e.target.value)} placeholder="Enter GR Number" />
                </div>

                <div>
                  <Label>GR Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(vendorGrDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent><Calendar mode="single" selected={vendorGrDate} onSelect={(d) => d && setVendorGrDate(d)} /></PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <Button variant="outline" onClick={addDispatchItem} className="bg-blue-50">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
                <Button variant="outline" className="bg-green-50">
                  <Package className="mr-2 h-4 w-4" /> Select Issue Stationary
                </Button>
                <Button variant="outline" className="bg-purple-50">
                  <FileText className="mr-2 h-4 w-4" /> Select Issued/Transferred Fixed Asset
                </Button>
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead>S #</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Unit Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Start #</TableHead>
                      <TableHead>End #</TableHead>
                      <TableHead>Item Serial #</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispatchItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Select value={item.itemName} onValueChange={(v) => updateDispatchItem(item.id, "itemName", v)}>
                              <SelectTrigger className="min-w-[150px]"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{itemOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={item.unitType} onValueChange={(v) => updateDispatchItem(item.id, "unitType", v)}>
                              <SelectTrigger className="w-24"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{unitTypeOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateDispatchItem(item.id, "qty", parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.issueId}
                              onChange={(e) => updateDispatchItem(item.id, "issueId", e.target.value)}
                              placeholder="Issue ID"
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.issueDate}
                              onChange={(e) => updateDispatchItem(item.id, "issueDate", e.target.value)}
                              placeholder="Date"
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.startNo}
                              onChange={(e) => updateDispatchItem(item.id, "startNo", e.target.value)}
                              placeholder="Start"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.endNo}
                              onChange={(e) => updateDispatchItem(item.id, "endNo", e.target.value)}
                              placeholder="End"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.itemSerialNo}
                              onChange={(e) => updateDispatchItem(item.id, "itemSerialNo", e.target.value)}
                              placeholder="Serial #"
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.remarks}
                              onChange={(e) => updateDispatchItem(item.id, "remarks", e.target.value)}
                              placeholder="Remarks"
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeDispatchItem(item.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                Total Items: {totalItems} | Total Quantity: {totalQty}
              </div>

              <div className="mt-4">
                <Label>Remarks</Label>
                <Input value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks here" />
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t mt-6">
                <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEARCH TAB */}
        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Dispatch Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label>Branch</Label>
                  <Select value={searchBranch} onValueChange={setSearchBranch}>
                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>{branchOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Despatch To</Label>
                  <Select value={searchDispatchedTo} onValueChange={setSearchDispatchedTo}>
                    <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">ALL</SelectItem>
                      {dispatchedToOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>AsOn Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(asOnDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent><Calendar mode="single" selected={asOnDate} onSelect={(d) => d && setAsOnDate(d)} /></PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={loadSearchData} disabled={loading} className="bg-blue-600">
                  <Eye className="mr-2 h-4 w-4" /> Show
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>

              {showSearchResults && (
                <div className="mt-6">
                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">Column Settings</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {Object.keys(columnSettings).map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            checked={columnSettings[key as keyof typeof columnSettings]}
                            onCheckedChange={(c) => setColumnSettings({ ...columnSettings, [key]: !!c })}
                          />
                          <Label className="text-sm cursor-pointer">
                            {key === "grNo" ? "GR #" : key === "grDate" ? "GR Date" : key.replace(/([A-Z])/g, " $1").trim()}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader className="bg-gray-100">
                        <TableRow>
                          {columnSettings.sNo && <TableHead>S#</TableHead>}
                          {columnSettings.dispatchDate && <TableHead>Dispatch Date</TableHead>}
                          {columnSettings.branchName && <TableHead>Branch Name</TableHead>}
                          {columnSettings.dispatchedTo && <TableHead>Dispatched To</TableHead>}
                          {columnSettings.dispatchThrough && <TableHead>Dispatch Through</TableHead>}
                          {columnSettings.grNo && <TableHead>GR #</TableHead>}
                          {columnSettings.grDate && <TableHead>GR Date</TableHead>}
                          {columnSettings.noOfItems && <TableHead>No of Items</TableHead>}
                          {columnSettings.status && <TableHead>Status</TableHead>}
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.length === 0 ? (
                          <TableRow key="empty-row">
                            <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                              No dispatch records found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          searchResults.map((record, index) => (
                            <TableRow key={record._id || record.id || record.dispatchId} className="hover:bg-gray-50">
                              <>
                                {columnSettings.sNo && <TableCell>{index + 1}</TableCell>}
                                {columnSettings.dispatchDate && <TableCell>{record.dispatchDate}</TableCell>}
                                {columnSettings.branchName && <TableCell>{record.branchName}</TableCell>}
                                {columnSettings.dispatchedTo && <TableCell>{record.dispatchedTo}</TableCell>}
                                {columnSettings.dispatchThrough && <TableCell>{record.dispatchThrough || "-"}</TableCell>}
                                {columnSettings.grNo && <TableCell>{record.vendorGrNo || "-"}</TableCell>}
                                {columnSettings.grDate && <TableCell>{record.vendorGrDate || "-"}</TableCell>}
                                {columnSettings.noOfItems && <TableCell>{record.noOfItems}</TableCell>}
                                {columnSettings.status && <TableCell>{record.status}</TableCell>}
                                <TableCell className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleView(record)}
                                    className="text-green-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(record)}
                                    className="text-blue-600"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(record._id || record.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== EDIT MODAL ==================== */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Dispatch - {editFormData.dispatchId}</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Edit Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Branch Name <span className="text-red-500">*</span></Label>
                <Select
                  value={editFormData.branchName}
                  onValueChange={(v) => setEditFormData({ ...editFormData, branchName: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>{branchOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dispatch Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editFormData.dispatchDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={new Date(editFormData.dispatchDate.split("-").reverse().join("-"))}
                      onSelect={(d) => d && setEditFormData({ ...editFormData, dispatchDate: format(d, "dd-MM-yyyy") })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Dispatch ID</Label>
                <Input value={editFormData.dispatchId} readOnly className="bg-gray-100" />
              </div>

              <div>
                <Label>Dispatched To <span className="text-red-500">*</span></Label>
                <Select
                  value={editFormData.dispatchedTo}
                  onValueChange={(v) => setEditFormData({ ...editFormData, dispatchedTo: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                  <SelectContent>{dispatchedToOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dispatch Through</Label>
                <Select
                  value={editFormData.dispatchThrough || ""}
                  onValueChange={(v) => setEditFormData({ ...editFormData, dispatchThrough: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                  <SelectContent>{dispatchThroughOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vendor GR #</Label>
                <Input
                  value={editFormData.vendorGrNo || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, vendorGrNo: e.target.value })}
                  placeholder="Enter GR Number"
                />
              </div>

              <div>
                <Label>GR Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editFormData.vendorGrDate || "-"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={editFormData.vendorGrDate ? new Date(editFormData.vendorGrDate.split("-").reverse().join("-")) : undefined}
                      onSelect={(d) => d && setEditFormData({ ...editFormData, vendorGrDate: format(d, "dd-MM-yyyy") })}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Remarks</Label>
                <Input
                  value={editFormData.remarks || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                  placeholder="Enter remarks"
                />
              </div>
            </div>

            {/* Edit Items Table */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Items</h3>
                <Button variant="outline" size="sm" onClick={addEditItem}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead>S #</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Unit Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Issue ID</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Start #</TableHead>
                      <TableHead>End #</TableHead>
                      <TableHead>Item Serial #</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <Select value={item.itemName} onValueChange={(v) => updateEditItem(item.id, "itemName", v)}>
                              <SelectTrigger className="min-w-[150px]"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{itemOptions.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={item.unitType} onValueChange={(v) => updateEditItem(item.id, "unitType", v)}>
                              <SelectTrigger className="w-24"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{unitTypeOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateEditItem(item.id, "qty", parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.issueId}
                              onChange={(e) => updateEditItem(item.id, "issueId", e.target.value)}
                              placeholder="Issue ID"
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.issueDate}
                              onChange={(e) => updateEditItem(item.id, "issueDate", e.target.value)}
                              placeholder="Date"
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.startNo}
                              onChange={(e) => updateEditItem(item.id, "startNo", e.target.value)}
                              placeholder="Start"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.endNo}
                              onChange={(e) => updateEditItem(item.id, "endNo", e.target.value)}
                              placeholder="End"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.itemSerialNo}
                              onChange={(e) => updateEditItem(item.id, "itemSerialNo", e.target.value)}
                              placeholder="Serial #"
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.remarks}
                              onChange={(e) => updateEditItem(item.id, "remarks", e.target.value)}
                              placeholder="Remarks"
                              className="w-32"
                            />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeEditItem(item.id)} className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Total Items: {editItems.length} | Total Quantity: {editItems.reduce((sum, i) => sum + i.qty, 0)}
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button onClick={handleEditSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" /> {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FULL-SCREEN VIEW MODAL ==================== */}
      {isViewModalOpen && viewRecord && (
        <div className="fixed inset-0 z-50 bg-white p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-2xl font-bold">Dispatch Details - {viewRecord.dispatchId}</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsViewModalOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div>
              <Label className="text-sm text-gray-500">Branch Name</Label>
              <p className="font-medium">{viewRecord.branchName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Dispatch Date</Label>
              <p className="font-medium">{viewRecord.dispatchDate}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Dispatch ID</Label>
              <p className="font-medium">{viewRecord.dispatchId}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Dispatched To</Label>
              <p className="font-medium">{viewRecord.dispatchedTo}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Dispatch Through</Label>
              <p className="font-medium">{viewRecord.dispatchThrough || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Vendor GR #</Label>
              <p className="font-medium">{viewRecord.vendorGrNo || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">GR Date</Label>
              <p className="font-medium">{viewRecord.vendorGrDate || "N/A"}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Status</Label>
              <p className="font-medium">{viewRecord.status}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Total Items</Label>
              <p className="font-medium">{viewRecord.noOfItems}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-3">Items</h3>
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>S #</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Unit Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Start #</TableHead>
                  <TableHead>End #</TableHead>
                  <TableHead>Item Serial #</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(viewRecord.items || []).map((item, idx) => (
                  <TableRow key={item.id || idx}>
                    <>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.itemName}</TableCell>
                      <TableCell>{item.unitType}</TableCell>
                      <TableCell className="text-right">{item.qty}</TableCell>
                      <TableCell>{item.issueId || "-"}</TableCell>
                      <TableCell>{item.issueDate || "-"}</TableCell>
                      <TableCell>{item.startNo || "-"}</TableCell>
                      <TableCell>{item.endNo || "-"}</TableCell>
                      <TableCell>{item.itemSerialNo || "-"}</TableCell>
                      <TableCell>{item.remarks || "-"}</TableCell>
                    </>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Total Items: {viewRecord.items?.length || 0} | Total Quantity: {(viewRecord.items || []).reduce((sum, i) => sum + i.qty, 0)}
          </div>

          {viewRecord.remarks && (
            <div className="mt-4">
              <Label className="text-sm text-gray-500">Remarks</Label>
              <p className="font-medium">{viewRecord.remarks}</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}