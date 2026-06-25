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
} from "lucide-react";
import api from "@/services/api";

// ==================== TYPES ====================
interface StockIssue {
  _id?: string;
  issueId: string;
  issueTo: string;
  issueDate: string;
  itemName: string;   // ✅ itemCode removed
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

  // Column settings – removed itemCode
  const [columnSettings, setColumnSettings] = useState({
    sNo: true,
    issueId: true,
    issueTo: true,
    issueDate: true,
    itemName: true,
    unitType: true,
    startNo: true,
    endNo: true,
  });

  // Add Modal
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
      alert("Failed to load stock issues.");
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
    alert(`📋 Issue Details
━━━━━━━━━━━━━━━━━━
Issue ID    : ${issue.issueId}
Issue To    : ${issue.issueTo}
Issue Date  : ${issue.issueDate}
Item Name   : ${issue.itemName}
Unit Type   : ${issue.unitType}
Quantity    : ${issue.quantity}
Start No    : ${issue.startNo || "N/A"}
End No      : ${issue.endNo || "N/A"}
Status      : ${issue.status}
Remarks     : ${issue.remarks || "N/A"}`);
  };

  // ==================== ADD MODAL ====================
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
      alert("Please fill all required fields (Branch, Item, Quantity)");
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
      alert("✅ Stock issue created successfully!");
      setIsAddModalOpen(false);
      fetchData();
      fetchStockItems();
    } catch (error) {
      console.error("Error creating stock issue:", error);
      alert("Failed to create stock issue.");
    } finally {
      setSubmitting(false);
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
            Company : GOLDEN ROADWAYS &amp; LOGISTICS PVT LTD | Login By : ADMIN@GMAIL.COM
            <br />
            Login Branch : HEAD OFFICE | Financial Year : 2026-2027
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

              {/* Column Settings – itemCode removed */}
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
                         key === "sNo" ? "S#" : key}
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
                      {columnSettings.startNo && <TableHead>Start No</TableHead>}
                      {columnSettings.endNo && <TableHead>End No</TableHead>}
                      <TableHead className="text-center">Action</TableHead>
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
                          {columnSettings.startNo && <TableCell>{issue.startNo || "-"}</TableCell>}
                          {columnSettings.endNo && <TableCell>{issue.endNo || "-"}</TableCell>}
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewDetails(issue)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

      {/* Add Issue Modal */}
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
              {submitting ? "Saving..." : "Create Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}