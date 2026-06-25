"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Eye, Settings, Printer, Download, RefreshCw, Loader2 } from "lucide-react";
import { getStockRegister } from "@/services/api";

interface StockItem {
  id: number;
  sNo: number;
  itemName: string;
  unitType: string;
  openingStock: number;
  purchased: number;
  issued: number;
  blocked: number;
  stockInHand: number;
}

export default function HOStationeryStockRegister() {
  const [selectedItem, setSelectedItem] = useState<string>("ALL");
  const [asOnDate, setAsOnDate] = useState<Date>(new Date(2026, 4, 18));
  const [showStock, setShowStock] = useState<boolean>(true); // Default true → auto show
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [filteredStockData, setFilteredStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [columnSettings, setColumnSettings] = useState({
    sNo: true,
    itemName: true,
    unitType: true,
    openingStock: true,
    purchased: true,
    issued: true,
    blocked: true,
    stockInHand: true,
  });

  const fetchStockData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getStockRegister(selectedItem);
      
      let stockList = [];
      if (Array.isArray(data)) stockList = data;
      else if (data?.data && Array.isArray(data.data)) stockList = data.data;
      else if (data?.success && Array.isArray(data.result)) stockList = data.result;

      setStockData(stockList);
      setFilteredStockData(stockList); // Auto show data
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to load stock data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto load data on page mount
  useEffect(() => {
    fetchStockData();
  }, []);

  // Handle Show Stock (Now acts as Refresh + Filter)
  const handleShowStock = () => {
    fetchStockData(); // Refresh + apply filter
  };

  const handleClear = () => {
    setSelectedItem("ALL");
    setFilteredStockData(stockData);
    setShowStock(true);
  };

  const getTotalOpeningStock = () => filteredStockData.reduce((sum, item) => sum + item.openingStock, 0);
  const getTotalPurchased = () => filteredStockData.reduce((sum, item) => sum + item.purchased, 0);
  const getTotalIssued = () => filteredStockData.reduce((sum, item) => sum + item.issued, 0);
  const getTotalBlocked = () => filteredStockData.reduce((sum, item) => sum + item.blocked, 0);
  const getTotalStockInHand = () => filteredStockData.reduce((sum, item) => sum + item.stockInHand, 0);

  const handlePrint = () => window.print();
  const handleExport = () => alert("Export to Excel functionality would be implemented here.");

  const showItemDetails = (item: StockItem) => {
    alert(
      `📋 Stock Details\n\n` +
      `Item Name     : ${item.itemName}\n` +
      `Unit Type     : ${item.unitType}\n` +
      `Opening Stock : ${item.openingStock}\n` +
      `Purchased     : ${item.purchased}\n` +
      `Issued        : ${item.issued}\n` +
      `Blocked       : ${item.blocked}\n` +
      `Stock In Hand : ${item.stockInHand}\n\n` +
      `Note: Opening + Purchased - Issued - Blocked = Stock In Hand`
    );
  };

  const itemOptions = Array.from(new Set(stockData.map(item => item.itemName)));

  return (
    <div className="space-y-6 p-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-primary">2. HO STATIONERY STOCK REGISTER</h1>
        <div className="text-xs text-muted-foreground mt-1">
          Company : GOLDEN ROADWAYS &amp; LOGISTICS PVT LTD | Login By : ADMIN@GMAIL.COM
          <br />
          Login Branch : HEAD OFFICE | Financial Year : 2026-2027
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📊 Stationery Stock Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="text-base font-medium">Items <span className="text-red-500">*</span></Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">ALL - Show All Items</SelectItem>
                  {itemOptions.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-medium">As On <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(asOnDate, "dd-MM-yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={asOnDate} onSelect={(d) => d && setAsOnDate(d)} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button onClick={handleShowStock} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh / Show Stock
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RefreshCw className="mr-2 h-4 w-4" /> Clear
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>

          {error && <p className="text-red-600 mt-4">{error}</p>}

          {/* Auto Show Table */}
          <div className="mt-8">
            {/* Info Bar */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 flex justify-between items-center">
              <div>
                <strong>As On:</strong> {format(asOnDate, "dd-MM-yyyy")} &nbsp;
                <strong>Item:</strong> {selectedItem === "ALL" ? "All Items" : selectedItem} &nbsp;
                <strong>Records:</strong> {filteredStockData.length}
              </div>
            </div>

            {/* Column Settings */}
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
                      onCheckedChange={(c) => setColumnSettings(prev => ({ ...prev, [key]: !!c }))}
                    />
                    <Label className="text-sm cursor-pointer capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
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
                    {columnSettings.sNo && <TableHead className="w-16 text-center">S#</TableHead>}
                    {columnSettings.itemName && <TableHead>Item Name</TableHead>}
                    {columnSettings.unitType && <TableHead className="w-24">Unit Type</TableHead>}
                    {columnSettings.openingStock && <TableHead className="text-right w-28">Opening Stock</TableHead>}
                    {columnSettings.purchased && <TableHead className="text-right w-28">Purchased</TableHead>}
                    {columnSettings.issued && <TableHead className="text-right w-24">Issued</TableHead>}
                    {columnSettings.blocked && <TableHead className="text-right w-24">Blocked</TableHead>}
                    {columnSettings.stockInHand && <TableHead className="text-right w-32">Stock In Hand</TableHead>}
                    {columnSettings.stockInHand && <TableHead className="w-16 text-center">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStockData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                        No stock data found. Please check your Purchase Bills.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStockData.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        {columnSettings.sNo && <TableCell className="text-center">{item.sNo}</TableCell>}
                        {columnSettings.itemName && <TableCell className="font-medium">{item.itemName}</TableCell>}
                        {columnSettings.unitType && <TableCell><span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.unitType}</span></TableCell>}
                        {columnSettings.openingStock && <TableCell className="text-right">{item.openingStock}</TableCell>}
                        {columnSettings.purchased && <TableCell className="text-right text-green-600">+{item.purchased}</TableCell>}
                        {columnSettings.issued && <TableCell className="text-right text-red-600">-{item.issued}</TableCell>}
                        {columnSettings.blocked && <TableCell className="text-right text-orange-600">{item.blocked}</TableCell>}
                        {columnSettings.stockInHand && <TableCell className="text-right font-bold text-blue-600">{item.stockInHand}</TableCell>}
                        {columnSettings.stockInHand && (
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" onClick={() => showItemDetails(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary & Footer */}
            {filteredStockData.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">Total Opening Stock</div>
                    <div className="text-xl font-bold text-gray-700">{getTotalOpeningStock()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">Total Purchased</div>
                    <div className="text-xl font-bold text-green-600">+{getTotalPurchased()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">Total Issued</div>
                    <div className="text-xl font-bold text-red-600">-{getTotalIssued()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">Total Blocked</div>
                    <div className="text-xl font-bold text-orange-600">{getTotalBlocked()}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">Total Stock In Hand</div>
                    <div className="text-xl font-bold text-blue-600">{getTotalStockInHand()}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-gray-400 text-center border-t pt-3">
              <p>Stock Register as on {format(asOnDate, "dd-MM-yyyy")} | HO Stationery Department</p>
              <p>Note: Opening Stock + Purchased - Issued - Blocked = Stock In Hand</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}