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
  Save,
  X,
  Search,
  Plus,
  Upload,
  FileSpreadsheet,
  Settings,
  Eye,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  createPurchaseBill,
  getPendingPurchaseOrders,
  getVendorBillReceipts,
  getPurchaseBillById,
  updatePurchaseBill,
  deletePurchaseBill,
} from "@/services/api";

// ==================== TYPE DEFINITIONS ====================

interface PurchaseItem {
  id: number;
  sNo: number;
  item: string;
  unitType: string;
  qty: number;
  rate: number;
  subTotal: number;
  igstPercent: number;
  igstAmount: number;
  totalAmount: number;
  startNo: string;
  endNo: string;
  qualityChecked: boolean;
  remarks: string;
}

interface ParticularEntry {
  id: number;
  particulars: string;
  sign: string;
  percent: number;
  applicable: boolean;
  amount: number;
  remarks: string;
}

interface PurchaseOrder {
  id: string;
  sNo: number;
  branchName: string;
  vendorName: string;
  poId: string;
  poNo: string;
  poDate: string;
  noOfItems: number;
  deliveryDate: string;
  purchaseValue: number;
  itemsList: string;
}

interface VendorBillReceipt {
  id: number;
  sNo: number;
  receiptId: string;
  date: string;
  poNo: string;
  referenceNo: string;
  invoiceNo: string;
  invoiceCategory: string;
  branch: string;
  divisionName: string;
  vendor: string;
  vendorDepartment: string;
  subTotal: number;
  gstAmount: number;
  billAmount: number;
  tdsAmount: number;
  advanceAdjusted: number;
  netPayable: number;
  billStatus: string;
  voucherNo: string;
  balancePayable: number;
  paymentTerms: string;
}

// ==================== DROPDOWN OPTIONS ====================
const branchOptions = ["HEAD OFFICE", "DELHI BRANCH", "MUMBAI BRANCH", "BANGALORE BRANCH", "CHENNAI BRANCH"];
const vendorOptions = ["Sharma Suppliers", "Tech Solutions", "Goyal Transport", "Patel Agencies", "Singh Enterprises"];
const invoiceCategoryOptions = ["STATIONERY PURCHASE", "ELECTRONICS", "VEHICLE PARTS", "OFFICE SUPPLIES", "FURNITURE"];
const unitTypeOptions = ["PCS", "BOX", "REAM", "KG", "LTR", "METER", "ROLL", "SET", "DOZEN"];
const itemOptions = ["Printer Paper", "Pens", "Staplers", "Laptop", "Mouse", "Keyboard", "Vehicle Parts", "Oil", "Filters", "Desk", "Chair"];
const filterOnOptions = ["ALL", "Today", "This Week", "This Month", "Custom"];

export default function ItemPurchase() {
  // ==================== ENTRY/EDIT FORM STATE ====================
  const [branch, setBranch] = useState("HEAD OFFICE");
  const [branchGst, setBranchGst] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [receiptDate, setReceiptDate] = useState<Date>(new Date());
  const [storeName, setStoreName] = useState("");
  const [vendor, setVendor] = useState("");
  const [vendorGst, setVendorGst] = useState("");
  const [vendorDepartment, setVendorDepartment] = useState("");
  const [subLedger, setSubLedger] = useState("");
  const [invoiceCategory, setInvoiceCategory] = useState("STATIONERY PURCHASE");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date>(new Date());

  // Purchase Items
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([
    { id: 1, sNo: 1, item: "", unitType: "", qty: 0, rate: 0, subTotal: 0, igstPercent: 0, igstAmount: 0, totalAmount: 0, startNo: "", endNo: "", qualityChecked: false, remarks: "" }
  ]);

  // Particulars
  const [particulars, setParticulars] = useState<ParticularEntry[]>([
    { id: 1, particulars: "SUBTOTAL", sign: "+", percent: 0, applicable: true, amount: 0, remarks: "" }
  ]);

  const [roundOff, setRoundOff] = useState(0);
  const [finalRemarks, setFinalRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ==================== EDIT MODE STATE ====================
  const [editBillId, setEditBillId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ==================== PENDING PO TAB STATE ====================
  const [pendingPoBranch, setPendingPoBranch] = useState("HEAD OFFICE");
  const [pendingPoVendor, setPendingPoVendor] = useState("");
  const [vendorAll, setVendorAll] = useState(true);
  const [asOnDate, setAsOnDate] = useState<Date>(new Date());
  const [showPendingPo, setShowPendingPo] = useState(false);
  const [filteredPurchaseOrders, setFilteredPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [poLoading, setPoLoading] = useState(false);

  // ==================== SEARCH TAB STATE ====================
  const defaultFrom = new Date(2000, 0, 1);
  defaultFrom.setHours(0, 0, 0, 0);
  const defaultTo = new Date();
  defaultTo.setHours(23, 59, 59, 999);

  const [periodFrom, setPeriodFrom] = useState<Date>(defaultFrom);
  const [periodTo, setPeriodTo] = useState<Date>(defaultTo);
  const [filterOn, setFilterOn] = useState("ALL");
  const [searchInvoiceCategory, setSearchInvoiceCategory] = useState("all");
  const [filteredReceipts, setFilteredReceipts] = useState<VendorBillReceipt[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [columnSettings, setColumnSettings] = useState({
    receiptId: true, date: true, poNo: true, referenceNo: true, invoiceNo: true,
    invoiceCategory: true, branch: true, divisionName: true, vendor: true, vendorDepartment: true,
    subTotal: true, gstAmount: true, billAmount: true, tdsAmount: true, advanceAdjusted: true,
    netPayable: true, billStatus: true, voucherNo: true, balancePayable: true, paymentTerms: true
  });

  const [activeTab, setActiveTab] = useState("entry");
  const [pendingPoInitialized, setPendingPoInitialized] = useState(false);
  const [searchInitialized, setSearchInitialized] = useState(false);

  // ==================== ITEM ROW MANAGEMENT ====================
  const addPurchaseItem = () => {
    const newId = Math.max(...purchaseItems.map(i => i.id), 0) + 1;
    const newSNo = purchaseItems.length + 1;
    setPurchaseItems([...purchaseItems, { id: newId, sNo: newSNo, item: "", unitType: "", qty: 0, rate: 0, subTotal: 0, igstPercent: 0, igstAmount: 0, totalAmount: 0, startNo: "", endNo: "", qualityChecked: false, remarks: "" }]);
  };

  const removePurchaseItem = (id: number) => {
    if (purchaseItems.length > 1) {
      const filtered = purchaseItems.filter(i => i.id !== id);
      const reindexed = filtered.map((item, idx) => ({ ...item, sNo: idx + 1 }));
      setPurchaseItems(reindexed);
    }
  };

  const updatePurchaseItem = (id: number, field: keyof PurchaseItem, value: any) => {
    const updated = purchaseItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'rate' || field === 'igstPercent') {
          const qty = field === 'qty' ? value : item.qty;
          const rate = field === 'rate' ? value : item.rate;
          const igstPercent = field === 'igstPercent' ? value : item.igstPercent;
          const subTotal = qty * rate;
          const igstAmount = (subTotal * igstPercent) / 100;
          const totalAmount = subTotal + igstAmount;
          return { ...updatedItem, subTotal, igstAmount, totalAmount };
        }
        return updatedItem;
      }
      return item;
    });
    setPurchaseItems(updated);
  };

  // ==================== PARTICULARS MANAGEMENT ====================
  const addParticular = () => {
    const newId = Math.max(...particulars.map(p => p.id), 0) + 1;
    setParticulars([...particulars, { id: newId, particulars: "", sign: "+", percent: 0, applicable: true, amount: 0, remarks: "" }]);
  };

  const removeParticular = (id: number) => {
    if (particulars.length > 1) {
      setParticulars(particulars.filter(p => p.id !== id));
    }
  };

  const updateParticular = (id: number, field: keyof ParticularEntry, value: any) => {
    setParticulars(particulars.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // ==================== TOTALS ====================
  const totalQty = purchaseItems.reduce((sum, item) => sum + item.qty, 0);
  const totalSubTotal = purchaseItems.reduce((sum, item) => sum + item.subTotal, 0);
  const totalIgst = purchaseItems.reduce((sum, item) => sum + item.igstAmount, 0);
  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.totalAmount, 0);

  // ==================== SAVE / UPDATE ====================
  const handleSave = async () => {
    if (!branch) { toast.error("Branch is required!"); return; }
    if (!vendor) { toast.error("Vendor is required!"); return; }
    if (!invoiceCategory) { toast.error("Invoice Category is required!"); return; }
    if (!invoiceNo) { toast.error("Invoice No. is required!"); return; }

    // Recalculate totals from items to ensure consistency
    const itemsWithRecalc = purchaseItems.map(item => {
      const subTotal = item.qty * item.rate;
      const igstAmount = (subTotal * item.igstPercent) / 100;
      const totalAmount = subTotal + igstAmount;
      return { ...item, subTotal, igstAmount, totalAmount };
    });
    const newTotalQty = itemsWithRecalc.reduce((sum, i) => sum + i.qty, 0);
    const newTotalSubTotal = itemsWithRecalc.reduce((sum, i) => sum + i.subTotal, 0);
    const newTotalIgst = itemsWithRecalc.reduce((sum, i) => sum + i.igstAmount, 0);
    const newTotalAmount = itemsWithRecalc.reduce((sum, i) => sum + i.totalAmount, 0);

    const payload = {
      branch,
      branchGst,
      receiptDate: receiptDate.toISOString(),
      storeName,
      vendor,
      vendorGst,
      vendorDepartment,
      subLedger,
      invoiceCategory,
      invoiceNo,
      invoiceDate: invoiceDate.toISOString(),
      items: itemsWithRecalc.map(({ id, sNo, ...rest }) => rest), // remove frontend-only fields
      particulars: particulars.map(({ id, ...rest }) => rest),
      roundOff,
      finalRemarks,
      totalQty: newTotalQty,
      totalSubTotal: newTotalSubTotal,
      totalIgst: newTotalIgst,
      totalAmount: newTotalAmount,
    };

    setSaving(true);
    try {
      if (isEditing && editBillId) {
        await updatePurchaseBill(editBillId, payload);
        toast.success("Purchase Bill updated successfully!");
        handleSearchReceipts();
        setIsEditing(false);
        setEditBillId(null);
        handleClear();
      } else {
        const response = await createPurchaseBill(payload);
        toast.success(`Purchase Bill created! Receipt ID: ${response.receiptId}`);
        handleClear();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ==================== EDIT BILL ====================
  const handleEditBill = async (receiptId: string) => {
    setSaving(true);
    try {
      const data = await getPurchaseBillById(receiptId);
      setBranch(data.branch);
      setBranchGst(data.branchGst || "");
      setReceiptId(data.receiptId);
      setReceiptDate(new Date(data.receiptDate));
      setStoreName(data.storeName || "");
      setVendor(data.vendor);
      setVendorGst(data.vendorGst || "");
      setVendorDepartment(data.vendorDepartment || "");
      setSubLedger(data.subLedger || "");
      setInvoiceCategory(data.invoiceCategory);
      setInvoiceNo(data.invoiceNo);
      setInvoiceDate(new Date(data.invoiceDate));

      if (data.items && data.items.length > 0) {
        const mappedItems = data.items.map((item: any, idx: number) => ({
          id: idx + 1,
          sNo: idx + 1,
          item: item.item,
          unitType: item.unitType,
          qty: item.qty,
          rate: item.rate,
          subTotal: item.subTotal,
          igstPercent: item.igstPercent,
          igstAmount: item.igstAmount,
          totalAmount: item.totalAmount,
          startNo: item.startNo || "",
          endNo: item.endNo || "",
          qualityChecked: item.qualityChecked || false,
          remarks: item.remarks || "",
        }));
        setPurchaseItems(mappedItems);
      } else {
        setPurchaseItems([{ id: 1, sNo: 1, item: "", unitType: "", qty: 0, rate: 0, subTotal: 0, igstPercent: 0, igstAmount: 0, totalAmount: 0, startNo: "", endNo: "", qualityChecked: false, remarks: "" }]);
      }

      if (data.particulars && data.particulars.length > 0) {
        const mappedParticulars = data.particulars.map((p: any, idx: number) => ({
          id: idx + 1,
          particulars: p.particulars,
          sign: p.sign || "+",
          percent: p.percent || 0,
          applicable: p.applicable !== undefined ? p.applicable : true,
          amount: p.amount || 0,
          remarks: p.remarks || "",
        }));
        setParticulars(mappedParticulars);
      } else {
        setParticulars([{ id: 1, particulars: "SUBTOTAL", sign: "+", percent: 0, applicable: true, amount: 0, remarks: "" }]);
      }

      setRoundOff(data.roundOff || 0);
      setFinalRemarks(data.finalRemarks || "");

      setIsEditing(true);
      setEditBillId(data.receiptId);
      setActiveTab("entry");
      toast.success("Bill loaded for editing");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to load bill details");
    } finally {
      setSaving(false);
    }
  };

  // ==================== DELETE BILL ====================
  const handleDeleteBill = async (receiptId: string) => {
    if (!confirm(`Are you sure you want to delete receipt ${receiptId}? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deletePurchaseBill(receiptId);
      toast.success("Purchase Bill deleted successfully!");
      handleSearchReceipts();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to delete bill");
    } finally {
      setDeleting(false);
    }
  };

  const handleClear = () => {
    setBranch("HEAD OFFICE");
    setBranchGst("");
    setReceiptId("");
    setReceiptDate(new Date());
    setStoreName("");
    setVendor("");
    setVendorGst("");
    setVendorDepartment("");
    setSubLedger("");
    setInvoiceCategory("STATIONERY PURCHASE");
    setInvoiceNo("");
    setInvoiceDate(new Date());
    setPurchaseItems([{ id: 1, sNo: 1, item: "", unitType: "", qty: 0, rate: 0, subTotal: 0, igstPercent: 0, igstAmount: 0, totalAmount: 0, startNo: "", endNo: "", qualityChecked: false, remarks: "" }]);
    setParticulars([{ id: 1, particulars: "SUBTOTAL", sign: "+", percent: 0, applicable: true, amount: 0, remarks: "" }]);
    setRoundOff(0);
    setFinalRemarks("");
    setIsEditing(false);
    setEditBillId(null);
  };

  // ==================== PENDING PO ====================
  const handleShowPendingPO = async () => {
    if (!pendingPoBranch) {
      toast.error("Please select Branch");
      return;
    }
    setPoLoading(true);
    try {
      const params: any = { branch: pendingPoBranch };
      if (!vendorAll && pendingPoVendor) params.vendor = pendingPoVendor;
      if (asOnDate) params.asOnDate = asOnDate.toISOString();
      const data = await getPendingPurchaseOrders(params);
      setFilteredPurchaseOrders(data);
      setShowPendingPo(true);
      toast.success(`Found ${data.length} pending POs`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to fetch pending POs");
    } finally {
      setPoLoading(false);
    }
  };

  // ==================== SEARCH ====================
  const handleSearchReceipts = async () => {
    setSearchLoading(true);
    try {
      const params: any = {
        fromDate: periodFrom.toISOString(),
        toDate: periodTo.toISOString(),
        filterOn,
      };
      if (searchInvoiceCategory && searchInvoiceCategory !== 'all') {
        params.invoiceCategory = searchInvoiceCategory;
      }
      const data = await getVendorBillReceipts(params);
      setFilteredReceipts(data);
      toast.success(`Found ${data.length} receipts`);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to search receipts");
    } finally {
      setSearchLoading(false);
    }
  };

  // ==================== AUTO‑LOAD ON TAB CHANGE ====================
  useEffect(() => {
    if (activeTab === 'pendingPo' && !pendingPoInitialized) {
      handleShowPendingPO();
      setPendingPoInitialized(true);
    }
  }, [activeTab, pendingPoInitialized]);

  useEffect(() => {
    if (activeTab === 'search' && !searchInitialized) {
      handleSearchReceipts();
      setSearchInitialized(true);
    }
  }, [activeTab, searchInitialized]);

  // ==================== RENDER ====================
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-primary">01. ITEM PURCHASE</h1>
        <div className="text-xs text-muted-foreground mt-1">
          Company : GOLDEN ROADWAYS &amp; LOGISTICS PVT LTD | Login By : ADMIN@GMAIL.COM
          <br />
          Login Branch : CORPORATE OFFICE | Financial Year : 2026-2027
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="entry">Entry</TabsTrigger>
          <TabsTrigger value="pendingPo">Pending PO</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        {/* ==================== ENTRY TAB ==================== */}
        <TabsContent value="entry" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Purchase Bill" : "Purchase Bill Entry"}</CardTitle>
              {isEditing && (
                <div className="text-sm text-muted-foreground">
                  Editing receipt: <strong>{editBillId}</strong>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Branch <span className="text-red-500">*</span></Label>
                  <Select value={branch} onValueChange={setBranch}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{branchOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Branch GST#</Label>
                  <Input
                    value={branchGst}
                    onChange={(e) => setBranchGst(e.target.value)}
                    placeholder="Enter Branch GST"
                  />
                </div>
                <div>
                  <Label>Receipt ID</Label>
                  <Input value={receiptId} readOnly placeholder="Auto generated" className="bg-gray-50" />
                </div>
                <div>
                  <Label>Receipt Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(receiptDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={receiptDate} onSelect={(d) => d && setReceiptDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Store Name</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Enter store name" />
                </div>
                <div>
                  <Label>Vendor <span className="text-red-500">*</span></Label>
                  <Select value={vendor} onValueChange={setVendor}>
                    <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                    <SelectContent>{vendorOptions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor/Department GST #</Label>
                  <Input value={vendorGst} onChange={(e) => setVendorGst(e.target.value)} placeholder="Enter GST" />
                </div>
                <div>
                  <Label>Vendor Department</Label>
                  <Input value={vendorDepartment} onChange={(e) => setVendorDepartment(e.target.value)} placeholder="Enter department" />
                </div>
                <div>
                  <Label>Sub Ledger</Label>
                  <Input value={subLedger} onChange={(e) => setSubLedger(e.target.value)} placeholder="Enter sub ledger" />
                </div>
                <div>
                  <Label>Invoice Category <span className="text-red-500">*</span></Label>
                  <Select value={invoiceCategory} onValueChange={setInvoiceCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{invoiceCategoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <Label>Invoice No. & Date <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="Invoice No"
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(invoiceDate, "dd-MM-yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar mode="single" selected={invoiceDate} onSelect={(d) => d && setInvoiceDate(d)} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Select Excel (Import)</Button>
                <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> Bill Details Export to Excel</Button>
                <Button variant="outline"><FileSpreadsheet className="mr-2 h-4 w-4" /> Batch Details Export to Excel</Button>
                <Button variant="outline"><Eye className="mr-2 h-4 w-4" /> Select Purchase Order</Button>
              </div>

              <div className="mt-6">
                <Label className="text-base font-medium">Purchase Items</Label>
                <div className="overflow-x-auto mt-2 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead>S#</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Unit Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                        <TableHead className="text-right">Sub Total</TableHead>
                        <TableHead>IGST @ %</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Start #</TableHead>
                        <TableHead>End #</TableHead>
                        <TableHead>Quality Checked</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sNo}</TableCell>
                          <TableCell>
                            <Select value={item.item} onValueChange={(v) => updatePurchaseItem(item.id, 'item', v)}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{itemOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={item.unitType} onValueChange={(v) => updatePurchaseItem(item.id, 'unitType', v)}>
                              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{unitTypeOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.qty || ""}
                              onChange={(e) => updatePurchaseItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                              className="w-20 text-right"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.rate || ""}
                              onChange={(e) => updatePurchaseItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell className="text-right">{item.subTotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.igstPercent || ""}
                              onChange={(e) => updatePurchaseItem(item.id, 'igstPercent', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              placeholder="0"
                            /> %
                          </TableCell>
                          <TableCell className="text-right">{item.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Input value={item.startNo} onChange={(e) => updatePurchaseItem(item.id, 'startNo', e.target.value)} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <Input value={item.endNo} onChange={(e) => updatePurchaseItem(item.id, 'endNo', e.target.value)} className="w-20" />
                          </TableCell>
                          <TableCell>
                            <Checkbox checked={item.qualityChecked} onCheckedChange={(c) => updatePurchaseItem(item.id, 'qualityChecked', !!c)} />
                          </TableCell>
                          <TableCell>
                            <Input value={item.remarks} onChange={(e) => updatePurchaseItem(item.id, 'remarks', e.target.value)} className="w-24" />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removePurchaseItem(item.id)} className="text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" onClick={addPurchaseItem} className="mt-2">
                  <Plus className="mr-1 h-3 w-3" /> Add more..
                </Button>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded flex flex-wrap justify-between">
                <span><strong>Total:</strong> Qty: {totalQty.toFixed(2)}</span>
                <span><strong>SubTotal:</strong> ₹{totalSubTotal.toFixed(2)}</span>
                <span><strong>IGST Total:</strong> ₹{totalIgst.toFixed(2)}</span>
                <span><strong>Amount:</strong> ₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="mt-6">
                <Label className="text-base font-medium">Particulars</Label>
                <div className="overflow-x-auto mt-2 border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead>Particulars</TableHead>
                        <TableHead>+/-</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Applicable</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {particulars.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Input value={p.particulars} onChange={(e) => updateParticular(p.id, 'particulars', e.target.value)} placeholder="Particulars" />
                          </TableCell>
                          <TableCell>
                            <Select value={p.sign} onValueChange={(v) => updateParticular(p.id, 'sign', v)}>
                              <SelectTrigger className="w-16"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="+">+</SelectItem>
                                <SelectItem value="-">-</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={p.percent || ""}
                              onChange={(e) => updateParticular(p.id, 'percent', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox checked={p.applicable} onCheckedChange={(c) => updateParticular(p.id, 'applicable', !!c)} />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={p.amount || ""}
                              onChange={(e) => updateParticular(p.id, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-24 text-right"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input value={p.remarks} onChange={(e) => updateParticular(p.id, 'remarks', e.target.value)} placeholder="Remarks" />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => removeParticular(p.id)} className="text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button variant="outline" size="sm" onClick={addParticular} className="mt-2">
                  <Plus className="mr-1 h-3 w-3" /> Add more..
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>RoundOff</Label>
                  <Input
                    type="number"
                    value={roundOff || ""}
                    onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Input
                    value={finalRemarks}
                    onChange={(e) => setFinalRemarks(e.target.value)}
                    placeholder="Please enter remarks here"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6 border-t mt-6">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isEditing ? "Update" : "Save"}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                  <X className="mr-2 h-4 w-4" /> Clear
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("search")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== PENDING PO TAB ==================== */}
        <TabsContent value="pendingPo" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Pending Purchase Orders</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Branch <span className="text-red-500">*</span></Label>
                  <Select value={pendingPoBranch} onValueChange={setPendingPoBranch}>
                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>{branchOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox checked={vendorAll} onCheckedChange={(c) => setVendorAll(!!c)} />
                    <Label className="cursor-pointer">ALL</Label>
                  </div>
                  <Select disabled={!vendorAll} value={pendingPoVendor} onValueChange={setPendingPoVendor}>
                    <SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                    <SelectContent>{vendorOptions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>As On Date <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(asOnDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={asOnDate} onSelect={(d) => d && setAsOnDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="mt-4">
                <Button onClick={handleShowPendingPO} className="bg-blue-600" disabled={poLoading}>
                  {poLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                  Show Pending
                </Button>
              </div>

              {showPendingPo && (
                <div className="mt-6 overflow-x-auto border rounded-lg">
                  <Table>
                    <TableHeader className="bg-gray-100">
                      <TableRow>
                        <TableHead>S#</TableHead>
                        <TableHead>Branch Name</TableHead>
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>PO Id</TableHead>
                        <TableHead>PO #</TableHead>
                        <TableHead>PO Date</TableHead>
                        <TableHead>No Of Items</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead className="text-right">Purchase Value</TableHead>
                        <TableHead>Items List</TableHead>
                        <TableHead>Select</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPurchaseOrders.map((po, idx) => (
                        <TableRow key={po.id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{po.branchName}</TableCell>
                          <TableCell>{po.vendorName}</TableCell>
                          <TableCell>{po.poId}</TableCell>
                          <TableCell className="text-blue-600">{po.poNo}</TableCell>
                          <TableCell>{po.poDate}</TableCell>
                          <TableCell>{po.noOfItems}</TableCell>
                          <TableCell>{po.deliveryDate}</TableCell>
                          <TableCell className="text-right">₹{po.purchaseValue.toLocaleString()}</TableCell>
                          <TableCell>{po.itemsList}</TableCell>
                          <TableCell><Checkbox /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== SEARCH TAB ==================== */}
        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader><CardTitle>Vendor Bill Receipt Search</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Period From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(periodFrom, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={periodFrom} onSelect={(d) => d && setPeriodFrom(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Period To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(periodTo, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={periodTo} onSelect={(d) => d && setPeriodTo(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Filter On</Label>
                  <Select value={filterOn} onValueChange={setFilterOn}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{filterOnOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Invoice Category</Label>
                  <Select value={searchInvoiceCategory} onValueChange={setSearchInvoiceCategory}>
                    <SelectTrigger><SelectValue placeholder="ALL" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ALL</SelectItem>
                      {invoiceCategoryOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={handleSearchReceipts} className="bg-blue-600" disabled={searchLoading}>
                  {searchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  Show Vendor Bill Receipt
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const from = new Date(2000, 0, 1);
                    from.setHours(0,0,0,0);
                    const to = new Date();
                    to.setHours(23,59,59,999);
                    setPeriodFrom(from);
                    setPeriodTo(to);
                    setFilterOn("ALL");
                    setSearchInvoiceCategory("all");
                    handleSearchReceipts();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>

              <div className="mt-4 mb-4 p-3 bg-gray-50 rounded flex flex-wrap gap-2">
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium">Column Settings:</span>
                {Object.keys(columnSettings).map((key) => (
                  <div key={key} className="flex items-center gap-1">
                    <Checkbox
                      checked={columnSettings[key as keyof typeof columnSettings]}
                      onCheckedChange={(c) => setColumnSettings({ ...columnSettings, [key]: !!c })}
                    />
                    <Label className="text-xs cursor-pointer">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      {columnSettings.receiptId && <TableHead>Receipt ID</TableHead>}
                      {columnSettings.date && <TableHead>Date</TableHead>}
                      {columnSettings.poNo && <TableHead>PO #</TableHead>}
                      {columnSettings.referenceNo && <TableHead>Reference #</TableHead>}
                      {columnSettings.invoiceNo && <TableHead>Invoice #</TableHead>}
                      {columnSettings.invoiceCategory && <TableHead>Invoice Category</TableHead>}
                      {columnSettings.branch && <TableHead>Branch</TableHead>}
                      {columnSettings.divisionName && <TableHead>Division Name</TableHead>}
                      {columnSettings.vendor && <TableHead>Vendor</TableHead>}
                      {columnSettings.vendorDepartment && <TableHead>Vendor Dept</TableHead>}
                      {columnSettings.subTotal && <TableHead className="text-right">Sub Total</TableHead>}
                      {columnSettings.gstAmount && <TableHead className="text-right">GST Amount</TableHead>}
                      {columnSettings.billAmount && <TableHead className="text-right">Bill Amount</TableHead>}
                      {columnSettings.tdsAmount && <TableHead className="text-right">TDS Amount</TableHead>}
                      {columnSettings.advanceAdjusted && <TableHead className="text-right">Advance Adj.</TableHead>}
                      {columnSettings.netPayable && <TableHead className="text-right">Net Payable</TableHead>}
                      {columnSettings.billStatus && <TableHead>Bill Status</TableHead>}
                      {columnSettings.voucherNo && <TableHead>Voucher #</TableHead>}
                      {columnSettings.balancePayable && <TableHead className="text-right">Balance Payable</TableHead>}
                      {columnSettings.paymentTerms && <TableHead>Payment Terms</TableHead>}
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={Object.values(columnSettings).filter(Boolean).length + 1} className="text-center py-6 text-gray-500">
                          No records found. Adjust filters and click Search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReceipts.map((r, idx) => (
                        <TableRow key={idx}>
                          {columnSettings.receiptId && <TableCell>{r.receiptId}</TableCell>}
                          {columnSettings.date && <TableCell>{r.date}</TableCell>}
                          {columnSettings.poNo && <TableCell>{r.poNo}</TableCell>}
                          {columnSettings.referenceNo && <TableCell>{r.referenceNo}</TableCell>}
                          {columnSettings.invoiceNo && <TableCell>{r.invoiceNo}</TableCell>}
                          {columnSettings.invoiceCategory && <TableCell>{r.invoiceCategory}</TableCell>}
                          {columnSettings.branch && <TableCell>{r.branch}</TableCell>}
                          {columnSettings.divisionName && <TableCell>{r.divisionName}</TableCell>}
                          {columnSettings.vendor && <TableCell>{r.vendor}</TableCell>}
                          {columnSettings.vendorDepartment && <TableCell>{r.vendorDepartment}</TableCell>}
                          {columnSettings.subTotal && <TableCell className="text-right">₹{r.subTotal.toLocaleString()}</TableCell>}
                          {columnSettings.gstAmount && <TableCell className="text-right">₹{r.gstAmount.toLocaleString()}</TableCell>}
                          {columnSettings.billAmount && <TableCell className="text-right">₹{r.billAmount.toLocaleString()}</TableCell>}
                          {columnSettings.tdsAmount && <TableCell className="text-right">₹{r.tdsAmount.toLocaleString()}</TableCell>}
                          {columnSettings.advanceAdjusted && <TableCell className="text-right">₹{r.advanceAdjusted.toLocaleString()}</TableCell>}
                          {columnSettings.netPayable && <TableCell className="text-right">₹{r.netPayable.toLocaleString()}</TableCell>}
                          {columnSettings.billStatus && (
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${r.billStatus === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                                {r.billStatus}
                              </span>
                            </TableCell>
                          )}
                          {columnSettings.voucherNo && <TableCell>{r.voucherNo || "-"}</TableCell>}
                          {columnSettings.balancePayable && <TableCell className="text-right">₹{r.balancePayable.toLocaleString()}</TableCell>}
                          {columnSettings.paymentTerms && <TableCell>{r.paymentTerms}</TableCell>}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => handleEditBill(r.receiptId)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteBill(r.receiptId)}
                                disabled={deleting}
                                title="Delete"
                              >
                                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}