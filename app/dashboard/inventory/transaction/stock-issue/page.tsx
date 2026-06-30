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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  Eye,
  Settings,
  Search,
  RefreshCw,
  Package,
  Truck,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";

// ==================== TYPES ====================
interface StockIssue {
  _id?: string;
  issueId: string;
  issueTo: string;
  issueDate: string;
  itemName: string;
  unitType: string;
  startNo: string;
  endNo: string;
  quantity: number;
  status: string;
  remarks: string;
}

interface StockItem {
  itemName: string;
  unitType: string;
  stockInHand: number;
}

// ==================== COMPONENT ====================
export default function StockIssueToBranch() {

  const user = useSessionUser();

  // ==================== STATE ====================
  const [allData, setAllData] = useState<StockIssue[]>([]);
  const [filteredData, setFilteredData] = useState<StockIssue[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branchAll, setBranchAll] = useState(true);
  const [selectedItem, setSelectedItem] = useState("");
  const [itemAll, setItemAll] = useState(true);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Column settings
  const [columnSettings, setColumnSettings] = useState({
    sNo: true,
    issueId: true,
    issueTo: true,
    issueDate: true,
    itemName: true,
    unitType: true,
    startNo: true,
    endNo: true,
    quantity: true,
    status: true,
  });

  // ==================== ADD MODAL STATE ====================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<StockIssue>>({
    issueTo: "",
    itemName: "",
    unitType: "",
    quantity: 1,
    startNo: "",
    endNo: "",
    issueDate: format(new Date(), "dd-MM-yyyy"),
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ==================== EDIT MODAL STATE ====================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<StockIssue | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StockIssue>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // ==================== DELETE STATE ====================
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ==================== FETCH DATA ====================
  const fetchStockItems = async () => {
    try {
      const response = await api.get("/stock-register", { params: { item: "ALL" } });
      setStockItems(response.data || []);
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  const fetchData = async (params: any = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/stock-issue", { params });
      const data = response.data || [];
      setAllData(data);
      setFilteredData(data);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching stock issues:", error);
      toast.error("Failed to load stock issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockItems();
    fetchData();
  }, []);

  // ==================== HANDLERS ====================

  const handleShow = () => {
    const params: any = {};
    if (!branchAll && selectedBranch) params.branch = selectedBranch;
    if (!itemAll && selectedItem) params.item = selectedItem;
    params.fromDate = format(fromDate, "dd-MM-yyyy");
    params.toDate = format(toDate, "dd-MM-yyyy");
    fetchData(params);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredData(allData);
      return;
    }
    const term = searchTerm.trim().toLowerCase();
    const filtered = allData.filter(
      (issue) =>
        issue.issueId.toLowerCase().includes(term) ||
        issue.issueTo.toLowerCase().includes(term) ||
        issue.itemName.toLowerCase().includes(term) ||
        issue.unitType.toLowerCase().includes(term) ||
        issue.startNo.toLowerCase().includes(term) ||
        issue.endNo.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredData(allData);
  };

  const clearAll = () => {
    setSelectedBranch("");
    setBranchAll(true);
    setSelectedItem("");
    setItemAll(true);
    setFromDate(new Date());
    setToDate(new Date());
    setSearchTerm("");
    setFilteredData([]);
    setShowResults(false);
  };

  const viewDetails = (issue: StockIssue) => {
    toast.success(`📋 ${issue.issueId} - ${issue.itemName} (${issue.quantity} ${issue.unitType})`);
  };

  // ==================== ADD ISSUE ====================
  const openAddModal = () => {
    setFormData({
      issueTo: "",
      itemName: "",
      unitType: "",
      quantity: 1,
      startNo: "",
      endNo: "",
      issueDate: format(new Date(), "dd-MM-yyyy"),
      remarks: "",
    });
    setIsAddModalOpen(true);
  };

  const handleItemSelect = (itemName: string) => {
    const selected = stockItems.find((i) => i.itemName === itemName);
    if (selected) {
      setFormData({
        ...formData,
        itemName: selected.itemName,
        unitType: selected.unitType || "PCS",
      });
    }
  };

  const handleSaveIssue = async () => {
    if (!formData.issueTo || !formData.itemName || !formData.quantity) {
      toast.error("Please fill all required fields (Branch, Item, Quantity)");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        issueTo: formData.issueTo,
        issueDate: formData.issueDate || format(new Date(), "dd-MM-yyyy"),
        itemName: formData.itemName,
        unitType: formData.unitType || "PCS",
        quantity: formData.quantity,
        startNo: formData.startNo || "",
        endNo: formData.endNo || "",
        remarks: formData.remarks || "",
        status: "Issued",
      };

      await api.post("/stock-issue", payload);
      toast.success("✅ Stock issue created successfully!");
      setIsAddModalOpen(false);
      fetchData();
      fetchStockItems();
    } catch (error: any) {
      console.error("Error creating stock issue:", error);
      toast.error(error.response?.data?.message || "Failed to create stock issue.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== EDIT ISSUE ====================
  const openEditModal = (issue: StockIssue) => {
    setEditingIssue(issue);
    setEditFormData({
      issueTo: issue.issueTo,
      issueDate: issue.issueDate,
      itemName: issue.itemName,
      unitType: issue.unitType,
      quantity: issue.quantity,
      startNo: issue.startNo || "",
      endNo: issue.endNo || "",
      remarks: issue.remarks || "",
      status: issue.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditItemSelect = (itemName: string) => {
    const selected = stockItems.find((i) => i.itemName === itemName);
    if (selected) {
      setEditFormData({
        ...editFormData,
        itemName: selected.itemName,
        unitType: selected.unitType || "PCS",
      });
    }
  };

  const handleEditSave = async () => {
    if (!editingIssue || !editFormData.issueTo || !editFormData.itemName || !editFormData.quantity) {
      toast.error("Please fill all required fields");
      return;
    }

    setEditSubmitting(true);
    try {
      const payload = {
        issueTo: editFormData.issueTo,
        issueDate: editFormData.issueDate || format(new Date(), "dd-MM-yyyy"),
        itemName: editFormData.itemName,
        unitType: editFormData.unitType || "PCS",
        quantity: editFormData.quantity,
        startNo: editFormData.startNo || "",
        endNo: editFormData.endNo || "",
        remarks: editFormData.remarks || "",
        status: editFormData.status || "Issued",
      };

      await api.put(`/stock-issue/${editingIssue._id}`, payload);
      toast.success("✅ Stock issue updated successfully!");
      setIsEditModalOpen(false);
      fetchData();
      fetchStockItems();
    } catch (error: any) {
      console.error("Error updating stock issue:", error);
      toast.error(error.response?.data?.message || "Failed to update stock issue.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // ==================== DELETE ISSUE ====================
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stock issue? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await api.delete(`/stock-issue/${id}`);
      toast.success("✅ Stock issue deleted successfully!");
      fetchData();
      fetchStockItems();
    } catch (error: any) {
      console.error("Error deleting stock issue:", error);
      toast.error(error.response?.data?.message || "Failed to delete stock issue.");
    } finally {
      setDeletingId(null);
    }
  };

  // ==================== DERIVED DATA ====================
  const uniqueBranches = [...new Set(allData.map((i) => i.issueTo))];
  const totalIssues = filteredData.length;
  const totalQuantity = filteredData.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6 p-4">
      {/* Header with Add Button */}
      <div className="border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">STOCK ISSUE TO BRANCH</h1>
          <div className="text-xs text-muted-foreground mt-1">
            Company : {user.companyName} | Login By : {user.email}
            <br />
            Login Branch : {user.branch} | Financial Year : {user.financialYear}
          </div>
        </div>
        <Button onClick={openAddModal} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Add Issue
        </Button>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Stock Issue Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Branch</Label>
              <div className="flex items-center gap-3 mt-2 mb-2">
                <Checkbox
                  checked={branchAll}
                  onCheckedChange={(c) => {
                    setBranchAll(!!c);
                    if (!!c) setSelectedBranch("");
                  }}
                />
                <Label className="cursor-pointer font-normal">ALL</Label>
              </div>
              {!branchAll && (
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBranches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>Item</Label>
              <div className="flex items-center gap-3 mt-2 mb-2">
                <Checkbox
                  checked={itemAll}
                  onCheckedChange={(c) => {
                    setItemAll(!!c);
                    if (!!c) setSelectedItem("");
                  }}
                />
                <Label className="cursor-pointer font-normal">ALL</Label>
              </div>
              {!itemAll && (
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Item" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockItems.map((item) => (
                      <SelectItem key={item.itemName} value={item.itemName}>
                        {item.itemName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>Period From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(fromDate, "dd-MM-yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={fromDate} onSelect={(d) => d && setFromDate(d)} />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Period To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(toDate, "dd-MM-yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar mode="single" selected={toDate} onSelect={(d) => d && setToDate(d)} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handleShow} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <Eye className="mr-2 h-4 w-4" /> {loading ? "Loading..." : "Show"}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <RefreshCw className="mr-2 h-4 w-4" /> Clear
            </Button>
          </div>

          {showResults && (
            <>
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <div className="flex-1">
                  <Input
                    placeholder="Search by ID, Branch, Item, etc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                  <Search className="mr-2 h-4 w-4" /> Search
                </Button>
                <Button variant="outline" onClick={clearSearch}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Clear
                </Button>
              </div>

              {/* Column Settings */}
              <div className="mt-4 mb-4 p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Column Settings</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {Object.keys(columnSettings).map((key) => (
                    <div key={key} className="flex items-center gap-2">
                      <Checkbox
                        checked={columnSettings[key as keyof typeof columnSettings]}
                        onCheckedChange={(c) =>
                          setColumnSettings({ ...columnSettings, [key]: !!c })
                        }
                      />
                      <Label className="text-sm cursor-pointer">
                        {key === "issueId" ? "Issue ID" :
                         key === "issueTo" ? "Issue To" :
                         key === "issueDate" ? "Issue Date" :
                         key === "itemName" ? "Item Name" :
                         key === "unitType" ? "Unit Type" :
                         key === "startNo" ? "Start No" :
                         key === "endNo" ? "End No" :
                         key === "sNo" ? "S#" :
                         key === "quantity" ? "Qty" :
                         key === "status" ? "Status" : key}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      {columnSettings.sNo && <TableHead className="w-12">S#</TableHead>}
                      {columnSettings.issueId && <TableHead>Issue ID</TableHead>}
                      {columnSettings.issueTo && <TableHead>Issue To</TableHead>}
                      {columnSettings.issueDate && <TableHead>Issue Date</TableHead>}
                      {columnSettings.itemName && <TableHead>Item Name</TableHead>}
                      {columnSettings.unitType && <TableHead>Unit Type</TableHead>}
                      {columnSettings.quantity && <TableHead className="text-right">Qty</TableHead>}
                      {columnSettings.startNo && <TableHead>Start No</TableHead>}
                      {columnSettings.endNo && <TableHead>End No</TableHead>}
                      {columnSettings.status && <TableHead>Status</TableHead>}
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={Object.values(columnSettings).filter(Boolean).length + 1}
                          className="text-center py-8 text-gray-500"
                        >
                          <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          No stock issue records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((issue, idx) => (
                        <TableRow key={issue._id || idx} className="hover:bg-gray-50">
                          {columnSettings.sNo && <TableCell>{idx + 1}</TableCell>}
                          {columnSettings.issueId && (
                            <TableCell className="font-medium text-blue-600">{issue.issueId}</TableCell>
                          )}
                          {columnSettings.issueTo && <TableCell>{issue.issueTo}</TableCell>}
                          {columnSettings.issueDate && <TableCell>{issue.issueDate}</TableCell>}
                          {columnSettings.itemName && <TableCell>{issue.itemName}</TableCell>}
                          {columnSettings.unitType && (
                            <TableCell>
                              <span className="bg-gray-100 px-2 py-1 rounded text-xs">{issue.unitType}</span>
                            </TableCell>
                          )}
                          {columnSettings.quantity && <TableCell className="text-right font-medium">{issue.quantity}</TableCell>}
                          {columnSettings.startNo && <TableCell>{issue.startNo || "-"}</TableCell>}
                          {columnSettings.endNo && <TableCell>{issue.endNo || "-"}</TableCell>}
                          {columnSettings.status && (
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                issue.status === "Issued" ? "bg-green-100 text-green-700" :
                                issue.status === "Returned" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {issue.status || "Issued"}
                              </span>
                            </TableCell>
                          )}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewDetails(issue)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(issue)}
                                className="text-green-600 hover:text-green-800"
                                title="Edit Issue"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(issue._id!)}
                                className="text-red-600 hover:text-red-800"
                                disabled={deletingId === issue._id}
                                title="Delete Issue"
                              >
                                {deletingId === issue._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              {filteredData.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Total Issues</div>
                    <div className="text-xl font-bold text-blue-600">{totalIssues}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Total Quantity</div>
                    <div className="text-xl font-bold text-green-600">{totalQuantity}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Unique Branches</div>
                    <div className="text-xl font-bold text-purple-600">{new Set(filteredData.map(i => i.issueTo)).size}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Unique Items</div>
                    <div className="text-xl font-bold text-orange-600">{new Set(filteredData.map(i => i.itemName)).size}</div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400 text-center border-t pt-3">
                <p>Period: {format(fromDate, "dd-MM-yyyy")} to {format(toDate, "dd-MM-yyyy")}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ==================== ADD ISSUE MODAL ==================== */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Stock Issue</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>Branch *</Label>
              <Select
                value={formData.issueTo || ""}
                onValueChange={(v) => setFormData({ ...formData, issueTo: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueBranches.length > 0 ? (
                    uniqueBranches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="HEAD OFFICE">HEAD OFFICE</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Item Name *</Label>
              <Select
                value={formData.itemName || ""}
                onValueChange={(v) => {
                  setFormData({ ...formData, itemName: v });
                  handleItemSelect(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map((item) => (
                    <SelectItem key={item.itemName} value={item.itemName}>
                      {item.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Unit Type</Label>
              <Input value={formData.unitType || ""} readOnly className="bg-gray-100" />
            </div>

            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={formData.quantity || 1}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                }
                min="1"
              />
            </div>

            <div>
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? format(new Date(formData.issueDate.split("-").reverse().join("-")), "dd-MM-yyyy") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={formData.issueDate ? new Date(formData.issueDate.split("-").reverse().join("-")) : undefined}
                    onSelect={(d) =>
                      d && setFormData({ ...formData, issueDate: format(d, "dd-MM-yyyy") })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Start No</Label>
              <Input
                value={formData.startNo || ""}
                onChange={(e) => setFormData({ ...formData, startNo: e.target.value })}
                placeholder="e.g., S001"
              />
            </div>

            <div>
              <Label>End No</Label>
              <Input
                value={formData.endNo || ""}
                onChange={(e) => setFormData({ ...formData, endNo: e.target.value })}
                placeholder="e.g., S050"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Remarks</Label>
              <Input
                value={formData.remarks || ""}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIssue} disabled={submitting} className="bg-green-600 hover:bg-green-700">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {submitting ? "Saving..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== EDIT ISSUE MODAL ==================== */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stock Issue - {editingIssue?.issueId}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label>Branch *</Label>
              <Select
                value={editFormData.issueTo || ""}
                onValueChange={(v) => setEditFormData({ ...editFormData, issueTo: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueBranches.length > 0 ? (
                    uniqueBranches.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="HEAD OFFICE">HEAD OFFICE</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Item Name *</Label>
              <Select
                value={editFormData.itemName || ""}
                onValueChange={(v) => {
                  setEditFormData({ ...editFormData, itemName: v });
                  handleEditItemSelect(v);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map((item) => (
                    <SelectItem key={item.itemName} value={item.itemName}>
                      {item.itemName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Unit Type</Label>
              <Input value={editFormData.unitType || ""} readOnly className="bg-gray-100" />
            </div>

            <div>
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={editFormData.quantity || 1}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, quantity: parseInt(e.target.value) || 0 })
                }
                min="1"
              />
            </div>

            <div>
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editFormData.issueDate ? format(new Date(editFormData.issueDate.split("-").reverse().join("-")), "dd-MM-yyyy") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={editFormData.issueDate ? new Date(editFormData.issueDate.split("-").reverse().join("-")) : undefined}
                    onSelect={(d) =>
                      d && setEditFormData({ ...editFormData, issueDate: format(d, "dd-MM-yyyy") })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Start No</Label>
              <Input
                value={editFormData.startNo || ""}
                onChange={(e) => setEditFormData({ ...editFormData, startNo: e.target.value })}
                placeholder="e.g., S001"
              />
            </div>

            <div>
              <Label>End No</Label>
              <Input
                value={editFormData.endNo || ""}
                onChange={(e) => setEditFormData({ ...editFormData, endNo: e.target.value })}
                placeholder="e.g., S050"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={editFormData.status || "Issued"}
                onValueChange={(v) => setEditFormData({ ...editFormData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Issued">Issued</SelectItem>
                  <SelectItem value="Returned">Returned</SelectItem>
                  <SelectItem value="Transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Remarks</Label>
              <Input
                value={editFormData.remarks || ""}
                onChange={(e) => setEditFormData({ ...editFormData, remarks: e.target.value })}
                placeholder="Optional remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {editSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editSubmitting ? "Saving..." : "Update Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}