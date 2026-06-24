"use client";

import React, { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Printer, Download, Search, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// Mock data – replace with actual API call
const MOCK_TALLY_DATA = [
    {
        id: 1,
        grNo: "GR-2026-001",
        origin: "DELHI",
        destination: "MUMBAI",
        consignor: "ABC Logistics",
        consignee: "XYZ Enterprises",
        packages: 25,
        weight: 1250,
        status: "Loaded",
    },
    {
        id: 2,
        grNo: "GR-2026-002",
        origin: "MUMBAI",
        destination: "CHENNAI",
        consignor: "PQR Transport",
        consignee: "LMN Industries",
        packages: 40,
        weight: 2100,
        status: "Pending",
    },
    {
        id: 3,
        grNo: "GR-2026-003",
        origin: "BANGALORE",
        destination: "HYDERABAD",
        consignor: "RST Cargo",
        consignee: "UVW Traders",
        packages: 15,
        weight: 750,
        status: "Loaded",
    },
    // Add more as needed
];

const branchTypeOptions = [
    { value: "ALL", label: "ALL" },
    { value: "Zone", label: "Zone" },
    { value: "State", label: "State" },
    { value: "Region", label: "Region" },
    { value: "Hub", label: "Hub" },
    { value: "Branch", label: "Branch" },
    { value: "Agency", label: "Agency" },
];

// Mock branch list (dynamic based on type)
const mockBranches = {
    Zone: ["North Zone", "South Zone", "East Zone", "West Zone"],
    State: ["Delhi", "Maharashtra", "Tamil Nadu", "Karnataka"],
    Region: ["Region A", "Region B", "Region C"],
    Hub: ["Hub-01", "Hub-02", "Hub-03"],
    Branch: ["Branch-101", "Branch-102", "Branch-103"],
    Agency: ["Agency-A", "Agency-B", "Agency-C"],
    ALL: ["All Branches"],
};

// Mock origins and destinations
const mockOrigins = ["DELHI", "MUMBAI", "BANGALORE", "CHENNAI", "HYDERABAD", "KOLKATA"];
const mockDestinations = [
    { value: "AGARTALA", label: "AGARTALA" },
    { value: "AKBERPUR/AMBEDKAR NAGAR", label: "AKBERPUR/AMBEDKAR NAGAR" },
    { value: "ALIPURDUAR", label: "ALIPURDUAR" },
    { value: "ALLAHABAD", label: "ALLAHABAD" },
    { value: "ALZALGARH", label: "ALZALGARH" },
    { value: "AMRITSAR", label: "AMRITSAR" },
    { value: "ANANTAPUR", label: "ANANTAPUR" },
    { value: "ANOOPSHER", label: "ANOOPSHER" },
    { value: "ARARIA COURT", label: "ARARIA COURT" },
    { value: "ARRAH", label: "ARRAH" },
    { value: "ASANSOL", label: "ASANSOL" },
    { value: "AURANGABAD B.R", label: "AURANGABAD B.R" },
    { value: "AURANGABAD U.P", label: "AURANGABAD U.P" },
    { value: "AZAMGARH", label: "AZAMGARH" },
    { value: "BABRALA", label: "BABRALA" },
    { value: "BAHERI", label: "BAHERI" },
    { value: "BAHJOI", label: "BAHJOI" },
    { value: "BALLIA", label: "BALLIA" },
    { value: "BANKURA", label: "BANKURA" },
    { value: "BAREILLY", label: "BAREILLY" },
    { value: "BARHALGANJ", label: "BARHALGANJ" },
    { value: "BARHI", label: "BARHI" },
    { value: "BARPETA ROAD", label: "BARPETA ROAD" },
    { value: "BASTI", label: "BASTI" },
    { value: "BEGUSARAI", label: "BEGUSARAI" },
    { value: "BELTHARA ROAD", label: "BELTHARA ROAD" },
    { value: "BERHAMPORE W.B", label: "BERHAMPORE W.B" },
    { value: "BETTIAH", label: "BETTIAH" },
    { value: "BHABHUA", label: "BHABHUA" },
    { value: "BHADOHI", label: "BHADOHI" },
    { value: "BHAGALPUR", label: "BHAGALPUR" },
    { value: "BHULANDSHAHAR", label: "BHULANDSHAHAR" },
    { value: "BIHARIGANJ", label: "BIHARIGANJ" },
    { value: "BIHARSHARIF", label: "BIHARSHARIF" },
    { value: "BIHIYA", label: "BIHIYA" },
    { value: "BIHTA", label: "BIHTA" },
    { value: "BIJNOR", label: "BIJNOR" },
    { value: "BILASIPARA", label: "BILASIPARA" },
    { value: "BONGAIGOAN", label: "BONGAIGOAN" },
    { value: "BRAHMAPUR", label: "BRAHMAPUR" },
    { value: "BURDWAN", label: "BURDWAN" },
    { value: "BUXAR", label: "BUXAR" },
    { value: "CHANCHAL", label: "CHANCHAL" },
    { value: "CHANDAUSI", label: "CHANDAUSI" },
    { value: "CHANDPUR", label: "CHANDPUR" },
    { value: "CHAS", label: "CHAS" },
    { value: "CHHAPRA", label: "CHHAPRA" },
    { value: "COOCHBEHAR", label: "COOCHBEHAR" },
    { value: "DALKOLA", label: "DALKOLA" },
    { value: "DALTONGANJ", label: "DALTONGANJ" },
    { value: "DARBHANGA", label: "DARBHANGA" },
    { value: "DAUDNAGAR", label: "DAUDNAGAR" },
    { value: "DEHRI ON SON", label: "DEHRI ON SON" },
    { value: "DEOGHAR", label: "DEOGHAR" },
    { value: "DEORIA", label: "DEORIA" },
    { value: "DHAMPUR", label: "DHAMPUR" },
    { value: "DHANAURA", label: "DHANAURA" },
    { value: "DHANBAD", label: "DHANBAD" },
    { value: "DHUBRI", label: "DHUBRI" },
    { value: "DHUPGURI", label: "DHUPGURI" },
    { value: "DIBAI", label: "DIBAI" },
    { value: "DINHATA", label: "DINHATA" },
    { value: "DUMKA", label: "DUMKA" },
    { value: "DUMROAN", label: "DUMROAN" },
    { value: "DURGAPUR", label: "DURGAPUR" },
    { value: "FAIZABAD", label: "FAIZABAD" },
    { value: "FALAKATA", label: "FALAKATA" },
    { value: "FORBISGANJ", label: "FORBISGANJ" },
    { value: "GANGARAMPUR", label: "GANGARAMPUR" },
    { value: "GARWA", label: "GARWA" },
    { value: "GAYA", label: "GAYA" },
    { value: "GHAZIPUR", label: "GHAZIPUR" },
    { value: "GHOSI", label: "GHOSI" },
    { value: "GIRIDIH", label: "GIRIDIH" },
    { value: "GOALPARA", label: "GOALPARA" },
    { value: "GODDA", label: "GODDA" },
    { value: "GOPALGANJ", label: "GOPALGANJ" },
    { value: "GORAKHPUR", label: "GORAKHPUR" },
    { value: "GOSAINGANJ", label: "GOSAINGANJ" },
    { value: "GULABBAGH", label: "GULABBAGH" },
    { value: "GULAOTHI", label: "GULAOTHI" },
    { value: "GUMLA", label: "GUMLA" },
    { value: "HAJIPUR", label: "HAJIPUR" },
    { value: "HARRAIYA", label: "HARRAIYA" },
    { value: "HATA", label: "HATA" },
    { value: "HAZARIBAGH", label: "HAZARIBAGH" },
    { value: "HEAD OFFICE", label: "HEAD OFFICE" },
    { value: "HINDUPUR", label: "HINDUPUR" },
    { value: "HYDERABAD", label: "HYDERABAD" },
    { value: "ISLAMPUR", label: "ISLAMPUR" },
    { value: "JAGITAL", label: "JAGITAL" },
    { value: "JAHANGIRABAD", label: "JAHANGIRABAD" },
    { value: "JAINAGAR", label: "JAINAGAR" },
    { value: "JALALPUR", label: "JALALPUR" },
    { value: "JALPAIGURI", label: "JALPAIGURI" },
    { value: "JAMSHEDPUR", label: "JAMSHEDPUR" },
    { value: "JAMUI", label: "JAMUI" },
    { value: "JAUNPUR", label: "JAUNPUR" },
    { value: "JHANJHARPUR", label: "JHANJHARPUR" },
    { value: "JHARIYA", label: "JHARIYA" },
    { value: "JHUMRITALIYA", label: "JHUMRITALIYA" },
    { value: "KADAPA", label: "KADAPA" },
    { value: "KALIACHAK", label: "KALIACHAK" },
    { value: "KALIYAGANJ", label: "KALIYAGANJ" },
    { value: "KANPUR", label: "KANPUR" },
    { value: "KAPTANGANJ", label: "KAPTANGANJ" },
    { value: "KARIM NAGAR", label: "KARIM NAGAR" },
    { value: "KASIA", label: "KASIA" },
    { value: "KATIHAR", label: "KATIHAR" },
    { value: "KHAGARIA", label: "KHAGARIA" },
    { value: "KHALILABAD", label: "KHALILABAD" },
    { value: "KIRATPUR", label: "KIRATPUR" },
    { value: "KISHANGANJ", label: "KISHANGANJ" },
    { value: "KOCHAS", label: "KOCHAS" },
    { value: "KOKRAJHAR", label: "KOKRAJHAR" },
    { value: "KRISHNAI", label: "KRISHNAI" },
    { value: "KUNDA", label: "KUNDA" },
    { value: "KURNOOL", label: "KURNOOL" },
    { value: "KUSHINAGAR", label: "KUSHINAGAR" },
    { value: "LAKHISARAI", label: "LAKHISARAI" },
    { value: "LALGANJ", label: "LALGANJ" },
    { value: "LOHARDGA", label: "LOHARDGA" },
    { value: "LUCKNOW", label: "LUCKNOW" },
    { value: "MACHHALISHAR", label: "MACHHALISHAR" },
    { value: "MADHEPURA", label: "MADHEPURA" },
    { value: "MADHUBANI", label: "MADHUBANI" },
    { value: "MADHUPUR", label: "MADHUPUR" },
    { value: "MAHARAJGANJ", label: "MAHARAJGANJ" },
    { value: "MAIRWA", label: "MAIRWA" },
    { value: "MALDA", label: "MALDA" },
    { value: "MATHABHANGA", label: "MATHABHANGA" },
    { value: "MAU", label: "MAU" },
    { value: "MAYNAGURI", label: "MAYNAGURI" },
    { value: "MIRZAPUR", label: "MIRZAPUR" },
    { value: "MOHAMMDABAD GOHNA", label: "MOHAMMDABAD GOHNA" },
    { value: "MOHANIYA", label: "MOHANIYA" },
    { value: "MORADABAD", label: "MORADABAD" },
    { value: "MOTIHARI", label: "MOTIHARI" },
    { value: "MUBARAKPUR", label: "MUBARAKPUR" },
    { value: "MUGHALSARAI", label: "MUGHALSARAI" },
    { value: "MUNGRA BADSHAHPUR", label: "MUNGRA BADSHAHPUR" },
    { value: "MURLIGANJ", label: "MURLIGANJ" },
    { value: "MURSHIDABAD", label: "MURSHIDABAD" },
    { value: "MUZAFFARPUR", label: "MUZAFFARPUR" },
    { value: "NAGINA", label: "NAGINA" },
    { value: "NALBARI", label: "NALBARI" },
    { value: "NANDYAL", label: "NANDYAL" },
    { value: "NARKATIYA GANJ", label: "NARKATIYA GANJ" },
    { value: "NAWABGANJ", label: "NAWABGANJ" },
    { value: "NAWADA", label: "NAWADA" },
    { value: "NETHAUR", label: "NETHAUR" },
    { value: "NOJIBABAD", label: "NOJIBABAD" },
    { value: "NOORPUR", label: "NOORPUR" },
    { value: "PADRAUNA", label: "PADRAUNA" },
    { value: "PATNA", label: "PATNA" },
    { value: "PHUSRO", label: "PHUSRO" },
    { value: "PILIBHIT", label: "PILIBHIT" },
    { value: "PODDATUR", label: "PODDATUR" },
    { value: "PRATAPGARH", label: "PRATAPGARH" },
    { value: "PURANPUR", label: "PURANPUR" },
    { value: "PURNIA", label: "PURNIA" },
    { value: "PURULIA", label: "PURULIA" },
    { value: "RAFIGANJ", label: "RAFIGANJ" },
    { value: "RAGHUNATHGANJ", label: "RAGHUNATHGANJ" },
    { value: "RAIGANJ", label: "RAIGANJ" },
    { value: "RAJAHMUNDRY", label: "RAJAHMUNDRY" },
    { value: "RAMGARH", label: "RAMGARH" },
    { value: "RANCHI", label: "RANCHI" },
    { value: "RANGIA", label: "RANGIA" },
    { value: "RANIGANJ", label: "RANIGANJ" },
    { value: "RASARA", label: "RASARA" },
    { value: "RAXAUL", label: "RAXAUL" },
    { value: "SAHARSA", label: "SAHARSA" },
    { value: "SAHASWAN", label: "SAHASWAN" },
    { value: "SALEMPUR", label: "SALEMPUR" },
    { value: "SAMASTIPUR", label: "SAMASTIPUR" },
    { value: "SAMBAL", label: "SAMBAL" },
    { value: "SAMSI", label: "SAMSI" },
    { value: "SASARAM", label: "SASARAM" },
    { value: "SECUNDERABAD", label: "SECUNDERABAD" },
    { value: "SEOHARA", label: "SEOHARA" },
    { value: "SHAHGANJ", label: "SHAHGANJ" },
    { value: "SHERGHATI", label: "SHERGHATI" },
    { value: "SHIKARPUR", label: "SHIKARPUR" },
    { value: "SIDDHARTHNAGAR", label: "SIDDHARTHNAGAR" },
    { value: "SIDDIPET", label: "SIDDIPET" },
    { value: "SILLIGURI", label: "SILLIGURI" },
    { value: "SIMDEGA", label: "SIMDEGA" },
    { value: "SISWABAZAR", label: "SISWABAZAR" },
    { value: "SITAMARHI", label: "SITAMARHI" },
    { value: "SIWAN", label: "SIWAN" },
    { value: "SIYANA", label: "SIYANA" },
    { value: "SRIKAKULAM", label: "SRIKAKULAM" },
    { value: "SULTANPUR", label: "SULTANPUR" },
    { value: "SUPAUL", label: "SUPAUL" },
    { value: "TAMKUHI", label: "TAMKUHI" },
    { value: "TANDA", label: "TANDA" },
    { value: "THAKURDWARA", label: "THAKURDWARA" },
    { value: "TRONICA CITY", label: "TRONICA CITY" },
    { value: "TUFANGANJ", label: "TUFANGANJ" },
    { value: "U P BORDER A JH UP", label: "U P BORDER A JH UP" },
    { value: "U P BORDER B BR", label: "U P BORDER B BR" },
    { value: "U P BORDER C ASM WB", label: "U P BORDER C ASM WB" },
    { value: "U P BORDER D BR GP", label: "U P BORDER D BR GP" },
    { value: "VARANASI", label: "VARANASI" },
    { value: "VIJAYWADA", label: "VIJAYWADA" },
    { value: "VIKRAMGANJ", label: "VIKRAMGANJ" },
    { value: "VISAKHAPATNAM", label: "VISAKHAPATNAM" },
    { value: "VIZIANAGARAM", label: "VIZIANAGARAM" },
    { value: "YUSUFPUR", label: "YUSUFPUR" }
];

export default function LoadingTallyPage() {
    const [asOnDate, setAsOnDate] = useState<Date>(new Date());
    const [branchType, setBranchType] = useState<string>("ALL");
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [origin, setOrigin] = useState<string>("");
    const [destination, setDestination] = useState<string>("");
    const [originAll, setOriginAll] = useState<boolean>(false);
    const [destinationAll, setDestinationAll] = useState<boolean>(false);
    const [tallyData, setTallyData] = useState(MOCK_TALLY_DATA);
    const [loading, setLoading] = useState<boolean>(false);

    // Get branch options based on selected type
    const branchOptions = branchType === "ALL"
        ? ["All Branches"]
        : (mockBranches[branchType as keyof typeof mockBranches] || []);

    // Handle "Show" button click – fetch data
    const handleShow = async () => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            // In real app: fetch from API with filters
            // const response = await getLoadingTally({ date, branch, origin, destination, ... });
            // setTallyData(response.data);
            toast.success("Tally data loaded successfully");
        } catch (error) {
            toast.error("Failed to load tally data");
        } finally {
            setLoading(false);
        }
    };

    // Print function
    const handlePrint = () => {
        window.print();
    };

    // Export to PDF – placeholder
    const handleExportPDF = () => {
        toast.success("PDF export coming soon");
    };

    // Clear filters
    const handleClear = () => {
        setBranchType("ALL");
        setSelectedBranch("");
        setOrigin("");
        setDestination("");
        setOriginAll(false);
        setDestinationAll(false);
        setAsOnDate(new Date());
        setTallyData(MOCK_TALLY_DATA);
        toast.success("Filters cleared");
    };

    // Calculate totals
    const totalPackages = tallyData.reduce((sum, item) => sum + item.packages, 0);
    const totalWeight = tallyData.reduce((sum, item) => sum + item.weight, 0);

    return (
        <div className="space-y-4 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Printer className="h-6 w-6 text-blue-600" />
                    LOADING TALLY
                </h1>
                <p className="text-sm text-gray-500">Generate loading tally report</p>
            </div>

            {/* Filters Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-500" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* As On Date */}
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">As On Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(asOnDate, "dd-MM-yyyy")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[10000]">
                                    <Calendar
                                        mode="single"
                                        selected={asOnDate}
                                        onSelect={(date) => date && setAsOnDate(date)}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Branch Type */}
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">Select Branch Type</Label>
                            <Select value={branchType} onValueChange={setBranchType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchTypeOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Select Branch */}
                        <div className="space-y-1">
                            <Label className="text-sm font-medium">Select Branch</Label>
                            <Select
                                value={selectedBranch}
                                onValueChange={setSelectedBranch}
                                disabled={branchType === "ALL"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchOptions.map((branch) => (
                                        <SelectItem key={branch} value={branch}>
                                            {branch}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Origin */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Select Origin</Label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        id="originAll"
                                        checked={originAll}
                                        onChange={(e) => {
                                            setOriginAll(e.target.checked);
                                            if (e.target.checked) setOrigin("");
                                        }}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="originAll" className="text-xs cursor-pointer">
                                        ALL
                                    </Label>
                                </div>
                            </div>
                            <Select
                                value={origin}
                                onValueChange={setOrigin}
                                disabled={originAll}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Origin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockOrigins.map((loc) => (
                                        <SelectItem key={loc} value={loc}>
                                            {loc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Destination */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Select Destination</Label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        id="destAll"
                                        checked={destinationAll}
                                        onChange={(e) => {
                                            setDestinationAll(e.target.checked);
                                            if (e.target.checked) setDestination("");
                                        }}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="destAll" className="text-xs cursor-pointer">
                                        ALL
                                    </Label>
                                </div>
                            </div>
                            <Select
                                value={destination}
                                onValueChange={setDestination}
                                disabled={destinationAll}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Destination" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockDestinations.map((loc) => (
                                        <SelectItem key={loc.value} value={loc.value}>
                                            {loc.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-3 border-t">
                        <Button
                            onClick={handleShow}
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="mr-2 h-4 w-4" />
                            )}
                            Show
                        </Button>
                        <Button variant="outline" onClick={handleClear}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                        <Button variant="outline" onClick={handlePrint} className="ml-auto">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" onClick={handleExportPDF}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-semibold">Tally Details</CardTitle>
                        <div className="text-sm text-gray-500">
                            Total: {tallyData.length} records
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="text-xs py-3 px-2 w-12 text-center">#</TableHead>
                                    <TableHead className="text-xs py-3 px-2 min-w-[100px]">GR #</TableHead>
                                    <TableHead className="text-xs py-3 px-2 min-w-[100px]">Origin</TableHead>
                                    <TableHead className="text-xs py-3 px-2 min-w-[100px]">Destination</TableHead>
                                    <TableHead className="text-xs py-3 px-2 min-w-[120px]">Consignor</TableHead>
                                    <TableHead className="text-xs py-3 px-2 min-w-[120px]">Consignee</TableHead>
                                    <TableHead className="text-xs py-3 px-2 w-[70px] text-center">Pckgs</TableHead>
                                    <TableHead className="text-xs py-3 px-2 w-[90px] text-right">Weight (kg)</TableHead>
                                    <TableHead className="text-xs py-3 px-2 w-[100px] text-center">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                            <RefreshCw className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                                            <p className="mt-2">Loading tally data...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : tallyData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                                            No records found. Adjust filters and click "Show".
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tallyData.map((item, idx) => (
                                        <TableRow key={item.id} className="hover:bg-gray-50">
                                            <TableCell className="py-3 px-2 text-center text-sm">{idx + 1}</TableCell>
                                            <TableCell className="py-3 px-2 font-mono text-sm font-semibold text-blue-600">
                                                {item.grNo}
                                            </TableCell>
                                            <TableCell className="py-3 px-2 text-sm">{item.origin}</TableCell>
                                            <TableCell className="py-3 px-2 text-sm">{item.destination}</TableCell>
                                            <TableCell className="py-3 px-2 text-sm">{item.consignor}</TableCell>
                                            <TableCell className="py-3 px-2 text-sm">{item.consignee}</TableCell>
                                            <TableCell className="py-3 px-2 text-center text-sm">{item.packages}</TableCell>
                                            <TableCell className="py-3 px-2 text-right text-sm">{item.weight}</TableCell>
                                            <TableCell className="py-3 px-2 text-center">
                                                <span
                                                    className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-medium",
                                                        item.status === "Loaded"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                    )}
                                                >
                                                    {item.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Totals */}
                    {tallyData.length > 0 && (
                        <div className="mt-4 flex justify-end gap-6 border-t pt-3 text-sm font-medium">
                            <div>
                                Total Packages: <span className="text-blue-600">{totalPackages}</span>
                            </div>
                            <div>
                                Total Weight: <span className="text-blue-600">{totalWeight} kg</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}