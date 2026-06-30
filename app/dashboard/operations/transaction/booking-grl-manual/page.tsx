"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  Save,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  Plus,
  X,
  FileText,
  Printer,
  AlertCircle,
  Building,
  Users,
  Package,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Loader2,
  CheckCircle,
  DollarSign,
  Mic,
  MicOff,
  Camera,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

// Import API services
import api, {
  getManualBookings,
  createManualBooking,
  updateManualBooking,
  cancelManualBooking,
  restoreManualBooking,
  deleteManualBooking,
  getManualBookingStats,
  getClients,
  createClient,
  searchClient,
  getContentCategories,
  getPackingTypes,
  getBranches,
} from "@/services/api";

// Types
interface GoodsItem {
  id: number;
  noOfPckgs: number;
  contentCategory: string;
  contentSubCategory: string;
  content: string;
  packing: string;
  actualWeight: number;
  chargeWeight: number;
  isWeightValid: boolean;
  weightError?: string;
}

interface InvoiceItem {
  id: number;
  invoiceNo: string;
  date: Date;
  value: string;
  ewayBillNo: string;
  ewayBillDate: Date;
  validUpto: string;
}

interface ExtraCharge {
  id: number;
  name: string;
  rate: number;
  amount: number;
}

interface ClientData {
  _id?: string;
  id?: number;
  name: string;
  gstNumber: string;
  adhaarNumber: string;
  panNumber: string;
  address: string;
  city: string;
  state: string;
  mobile: string;
  email: string;
  dealerCode: string;
  iecCode: string;
  bankAdNo: string;
}

interface BookingRecord {
  _id?: string;
  id?: number;
  grNo: string;
  bookingFrom: string;
  bookingDate: Date;
  destination: string;
  pickupFrom: string;
  deliveryPoint: string;
  bookingType: string;
  collectionAt: string;
  consignorId: string;
  consignorName: string;
  consignorGst: string;
  consignorAdhaar: string;
  consignorPan: string;
  consignorCode: string;
  consignorAddress: string;
  consignorCity: string;
  consignorState: string;
  consignorMobile: string;
  consignorEmail: string;
  consignorIec: string;
  consignorBankAd: string;
  consigneeId: string;
  consigneeName: string;
  consigneeGst: string;
  consigneeAdhaar: string;
  consigneePan: string;
  consigneeCode: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeMobile: string;
  consigneeEmail: string;
  consigneeIec: string;
  consigneeBankAd: string;
  pvtMarkaSealNo: string;
  serviceProduct: string;
  deliveryType: string;
  loadType: string;
  mkExecutive: string;
  freightOn: string;
  manualRates: boolean;
  ncv: boolean;
  printAfterSave: boolean;
  ccAttached: boolean;
  totalPckgs: number;
  totalActualWeight: number;
  totalChargeWeight: number;
  totalFreight: number;
  remarks: string;
  roRemarks: string;
  billNo: string;
  supplementaryBillNo: string;
  insuranceCoveredBy: string;
  insuranceNo: string;
  insuranceDate: Date;
  insuranceCompany: string;
  goodsItems: GoodsItem[];
  invoices: InvoiceItem[];
  status: "active" | "cancelled";
  cancelledDate?: Date;
  cancelledReason?: string;
  createdAt: Date;
  updatedAt: Date;
  damageType?: ("damaged" | "missing" | "both")[];
  damageReason?: string;
  damageOtherRemark?: string;
  damagePackageCount?: number;
  damagePhotos?: string[];
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
}

// Define Branch type
interface Branch {
  value: string;
  text: string;
}

// Destination options
const destinationOptions = [
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

// POINT 5: Booking Type Options - FOC instead of TOC
const bookingTypeOptions = [
  { value: "TOPAY", label: "TO PAY" },
  { value: "PAID", label: "PAID" },
  { value: "TBB", label: "TBB" },
  { value: "FOC", label: "FOC" },
];

const serviceProductOptions = [
  { value: "SURFACE", label: "SURFACE" },
  { value: "AIR", label: "AIR" },
  { value: "RAIL", label: "RAIL" },
];

// POINT 7: Delivery Type - DOOR DELIVERY instead of PICKUP
const deliveryTypeOptions = [
  { value: "GODOWN", label: "GODOWN" },
  { value: "DOOR DELIVERY", label: "DOOR DELIVERY" },
];

const loadTypeOptions = [
  { value: "PART LOAD", label: "PART LOAD" },
  { value: "FULL LOAD", label: "FULL LOAD" },
  { value: "CONTAINER", label: "CONTAINER" },
];

const freightOnOptions = [
  { value: "CHARGE WEIGHT", label: "CHARGE WEIGHT" },
  { value: "ACTUAL WEIGHT", label: "ACTUAL WEIGHT" },
  { value: "PER PACKAGE", label: "PER PACKAGE" },
];

const insuranceCoveredByOptions = [
  { value: "carrier", label: "Carrier" },
  { value: "consignor", label: "Consignor" },
  { value: "consignee", label: "Consignee" },
];

const cancelledReasonOptions = [
  "Customer Request", "Payment Issue", "Wrong Booking", "Duplicate Booking",
  "Vehicle Unavailable", "Route Not Available", "Other"
];

const idTypeOptions = ["Self", "GST Number", "Adhaar Number", "PAN Number"];

// Damage reason options
const damageReasonOptions = [
  "Short at Origin (sender gave less packages)",
  "Transit Damage (damaged during transport)",
  "Loading Damage (damaged while loading/unloading)",
  "Wet / Water Damage",
  "Fire / Heat Damage",
  "Theft suspected",
  "Seal Broken / Tampered",
  "Packaging Defect",
  "Other (specify)"
];

// Extra charges configuration
const EXTRA_CHARGES = [
  { id: 1, name: "PF CHARGE", defaultRate: 0 },
  { id: 2, name: "DOCKET CHARGE", defaultRate: 100 },
  { id: 3, name: "HAMALI CHARGE", defaultRate: 0 },
  { id: 4, name: "GREEN TAX CHARGE", defaultRate: 0 },
  { id: 5, name: "DOOR DELIVERY", defaultRate: 0 },
  { id: 6, name: "OTHER CHARGES", defaultRate: 0 },
];

const gstPaidByOptions = [
  { value: "CONSIGNOR", label: "CONSIGNOR" },
  { value: "CONSIGNEE", label: "CONSIGNEE" },
  { value: "THIRD_PARTY", label: "THIRD PARTY" },
];

export default function BookingGRLManual() {
  const [mainTab, setMainTab] = useState<"active" | "cancelled">("active");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "report">("report");
  const [isCancelledDialogOpen, setIsCancelledDialogOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<BookingRecord | null>(null);
  const [cancelledReason, setCancelledReason] = useState<string>("");

  // Freight calculation states
  const [freightRate, setFreightRate] = useState<number>(0);
  const [calculatedFreight, setCalculatedFreight] = useState<number>(0);
  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>(() =>
    EXTRA_CHARGES.map(charge => ({
      ...charge,
      rate: charge.defaultRate,
      amount: charge.defaultRate
    }))
  );
  const [gstPaidBy, setGstPaidBy] = useState<string>("CONSIGNEE");
  const [gstRate, setGstRate] = useState<number>(0);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);

  // Calculation totals
  const [subTotal, setSubTotal] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);

  // Static data from API
  const [contentCategories, setContentCategories] = useState<any[]>([]);
  const [packingTypes, setPackingTypes] = useState<any[]>([]);
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);

  // Current user data
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Collapsible sections state
  const [isConsignorAddressOpen, setIsConsignorAddressOpen] = useState(false);
  const [isConsigneeAddressOpen, setIsConsigneeAddressOpen] = useState(false);

  // New Client Dialog
  const [isNewConsignorDialogOpen, setIsNewConsignorDialogOpen] = useState(false);
  const [isNewConsigneeDialogOpen, setIsNewConsigneeDialogOpen] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<ClientData>>({});

  // Consignor Selection
  const [consignorIdType, setConsignorIdType] = useState<string>("");
  const [consignorIdValue, setConsignorIdValue] = useState<string>("");
  const [consignorId, setConsignorId] = useState<string>("");
  const [consignorName, setConsignorName] = useState<string>("");
  const [consignorMobile, setConsignorMobile] = useState<string>("");
  const [consignorGst, setConsignorGst] = useState<string>("");
  const [consignorAdhaar, setConsignorAdhaar] = useState<string>("");
  const [consignorPan, setConsignorPan] = useState<string>("");
  const [consignorCode, setConsignorCode] = useState<string>("");
  const [consignorAddress, setConsignorAddress] = useState<string>("");
  const [consignorCity, setConsignorCity] = useState<string>("");
  const [consignorState, setConsignorState] = useState<string>("");
  const [consignorEmail, setConsignorEmail] = useState<string>("");
  const [consignorIec, setConsignorIec] = useState<string>("");
  const [consignorBankAd, setConsignorBankAd] = useState<string>("");

  // POINT 11: Search results for consignor with GST
  const [consignorSearchResults, setConsignorSearchResults] = useState<ClientData[]>([]);
  const [showConsignorDropdown, setShowConsignorDropdown] = useState(false);

  // Consignee Selection
  const [consigneeIdType, setConsigneeIdType] = useState<string>("");
  const [consigneeIdValue, setConsigneeIdValue] = useState<string>("");
  const [consigneeId, setConsigneeId] = useState<string>("");
  const [consigneeName, setConsigneeName] = useState<string>("");
  const [consigneeMobile, setConsigneeMobile] = useState<string>("");
  const [consigneeGst, setConsigneeGst] = useState<string>("");
  const [consigneeAdhaar, setConsigneeAdhaar] = useState<string>("");
  const [consigneePan, setConsigneePan] = useState<string>("");
  const [consigneeCode, setConsigneeCode] = useState<string>("");
  const [consigneeAddress, setConsigneeAddress] = useState<string>("");
  const [consigneeCity, setConsigneeCity] = useState<string>("");
  const [consigneeState, setConsigneeState] = useState<string>("");
  const [consigneeEmail, setConsigneeEmail] = useState<string>("");
  const [consigneeIec, setConsigneeIec] = useState<string>("");
  const [consigneeBankAd, setConsigneeBankAd] = useState<string>("");

  // Search results for consignee
  const [consigneeSearchResults, setConsigneeSearchResults] = useState<ClientData[]>([]);
  const [showConsigneeDropdown, setShowConsigneeDropdown] = useState(false);

  // POINT 12: Content Category search
  const [contentCategorySearch, setContentCategorySearch] = useState<string>("");
  const [contentCategoryResults, setContentCategoryResults] = useState<any[]>([]);
  const [showContentCategoryDropdown, setShowContentCategoryDropdown] = useState(false);

  // Basic Info
  const [grNo, setGrNo] = useState<string>("");
  const [bookingFrom, setBookingFrom] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<Date>(new Date());
  const [destination, setDestination] = useState<string>("");
  const [pickupFrom, setPickupFrom] = useState<string>("");
  const [deliveryPoint, setDeliveryPoint] = useState<string>("");
  // POINT 2: Booking Type Default "TOPAY"
  const [bookingType, setBookingType] = useState<string>("TOPAY");
  const [collectionAt, setCollectionAt] = useState<string>("");
  const [pvtMarkaSealNo, setPvtMarkaSealNo] = useState<string>("");
  // POINT 6: Service Product Default "SURFACE"
  const [serviceProduct, setServiceProduct] = useState<string>("SURFACE");
  // POINT 7: Delivery Type Default "GODOWN"
  const [deliveryType, setDeliveryType] = useState<string>("GODOWN");
  // POINT 8: Load Type Default "PART LOAD"
  const [loadType, setLoadType] = useState<string>("PART LOAD");
  const [mkExecutive, setMkExecutive] = useState<string>("");
  const [freightOn, setFreightOn] = useState<string>("CHARGE WEIGHT");
  const [manualRates, setManualRates] = useState<boolean>(false);
  const [ncv, setNcv] = useState<boolean>(false);
  const [printAfterSave, setPrintAfterSave] = useState<boolean>(false);
  const [ccAttached, setCcAttached] = useState<boolean>(false);

  // Goods Items
  const [goodsItems, setGoodsItems] = useState<GoodsItem[]>([
    { id: Date.now(), noOfPckgs: 0, contentCategory: "", contentSubCategory: "", content: "", packing: "BOX", actualWeight: 0, chargeWeight: 0, isWeightValid: true },
  ]);

  // Invoices
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    { id: Date.now(), invoiceNo: "", date: new Date(), value: "0", ewayBillNo: "", ewayBillDate: new Date(), validUpto: "" },
  ]);

  // Remarks
  const [remarks, setRemarks] = useState<string>("");
  const [roRemarks, setRoRemarks] = useState<string>("");
  const [billNo, setBillNo] = useState<string>("");
  const [supplementaryBillNo, setSupplementaryBillNo] = useState<string>("");

  // Insurance
  const [insuranceCoveredBy, setInsuranceCoveredBy] = useState<string>("");
  const [insuranceNo, setInsuranceNo] = useState<string>("");
  const [insuranceDate, setInsuranceDate] = useState<Date>(new Date());
  const [insuranceCompany, setInsuranceCompany] = useState<string>("");

  // Totals
  const [totalPckgs, setTotalPckgs] = useState<number>(0);
  const [totalActualWeight, setTotalActualWeight] = useState<number>(0);
  const [totalChargeWeight, setTotalChargeWeight] = useState<number>(0);
  const [totalFreight, setTotalFreight] = useState<number>(0);

  // Search
  const [searchFromDate, setSearchFromDate] = useState<Date>(new Date());
  const [searchToDate, setSearchToDate] = useState<Date>(new Date());
  const [searchGrNo, setSearchGrNo] = useState<string>("");
  const [searchBranch, setSearchBranch] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<BookingRecord[]>([]);
  const [cancelledSearchResults, setCancelledSearchResults] = useState<BookingRecord[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cancelledCurrentPage, setCancelledCurrentPage] = useState<number>(1);
  const [stats, setStats] = useState({ active: { count: 0, totalFreight: 0 }, cancelled: { count: 0, totalFreight: 0 } });
  const itemsPerPage: number = 10;

  // ========== DAMAGE/MISSING STATES ==========
  const [damageType, setDamageType] = useState<("damaged" | "missing" | "both")[]>([]);
  const [damageReason, setDamageReason] = useState<string>("");
  const [damageOtherRemark, setDamageOtherRemark] = useState<string>("");
  const [damagePackageCount, setDamagePackageCount] = useState<number>(0);
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const [damagePackageError, setDamagePackageError] = useState<string>("");

  // ========== VOICE RECORDING STATES ==========
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | null>(null);
  const [voiceNoteBase64, setVoiceNoteBase64] = useState<string | null>(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalDurationRef = useRef<number>(0);

  // ========== POINT 3 & 4: Booking Type Logic ==========
  useEffect(() => {
    // POINT 3: TOPAY → Collection At = Destination
    if (bookingType === "TOPAY" && destination) {
      setCollectionAt(destination);
    }
    // POINT 4: PAID, TBB, FOC → Collection At = Booking From
    else if (bookingType === "PAID" || bookingType === "TBB" || bookingType === "FOC") {
      setCollectionAt(bookingFrom);
    }
  }, [bookingType, destination, bookingFrom]);

  // ========== POINT 11: Consignor Name Search with GST ==========
  const handleConsignorNameSearch = async (value: string) => {
    setConsignorIdValue(value);
    setConsignorName(value);

    if (value.length >= 2) {
      try {
        // Pass "name" as idType
        const response = await searchClient("name", value);

        const data = response?.data || response || [];
        const results = Array.isArray(data) ? data : [data].filter(Boolean);

        setConsignorSearchResults(results);
        setShowConsignorDropdown(results.length > 0);
      } catch (error) {
        setConsignorSearchResults([]);
        setShowConsignorDropdown(false);
      }
    } else {
      setConsignorSearchResults([]);
      setShowConsignorDropdown(false);
    }
  };

  const handleConsignorSelect = (client: ClientData) => {
    setConsignorId(client._id || "");
    setConsignorName(client.name);
    setConsignorIdValue(client.name);
    setConsignorMobile(client.mobile || "");
    setConsignorGst(client.gstNumber || "");
    setConsignorAdhaar(client.adhaarNumber || "");
    setConsignorPan(client.panNumber || "");
    setConsignorCode(client.dealerCode || "");
    setConsignorAddress(client.address || "");
    setConsignorCity(client.city || "");
    setConsignorState(client.state || "");
    setConsignorEmail(client.email || "");
    setConsignorIec(client.iecCode || "");
    setConsignorBankAd(client.bankAdNo || "");
    setShowConsignorDropdown(false);
    toast.success(`Consignor "${client.name}" loaded successfully!`);
  };

  // ========== Consignee Name Search ==========
  const handleConsigneeNameSearch = async (value: string) => {
    setConsigneeIdValue(value);
    setConsigneeName(value);

    if (value.length >= 2) {
      try {
        const response = await searchClient("name", value);
        if (response.data) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          setConsigneeSearchResults(data);
          setShowConsigneeDropdown(true);
        } else {
          setConsigneeSearchResults([]);
          setShowConsigneeDropdown(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setConsigneeSearchResults([]);
        setShowConsigneeDropdown(false);
      }
    } else {
      setConsigneeSearchResults([]);
      setShowConsigneeDropdown(false);
    }
  };

  const handleConsigneeSelect = (client: ClientData) => {
    setConsigneeId(client._id || "");
    setConsigneeName(client.name);
    setConsigneeIdValue(client.name);
    setConsigneeMobile(client.mobile || "");
    setConsigneeGst(client.gstNumber || "");
    setConsigneeAdhaar(client.adhaarNumber || "");
    setConsigneePan(client.panNumber || "");
    setConsigneeCode(client.dealerCode || "");
    setConsigneeAddress(client.address || "");
    setConsigneeCity(client.city || "");
    setConsigneeState(client.state || "");
    setConsigneeEmail(client.email || "");
    setConsigneeIec(client.iecCode || "");
    setConsigneeBankAd(client.bankAdNo || "");
    setShowConsigneeDropdown(false);
    toast.success(`Consignee "${client.name}" loaded successfully!`);
  };

  // ========== POINT 12: Content Category Search - FIXED ==========
  const handleContentCategorySearch = (value: string) => {
    setContentCategorySearch(value);
    if (value.length >= 1) {
      const filtered = contentCategories.filter(cat =>
        cat.name.toLowerCase().includes(value.toLowerCase())
      );
      setContentCategoryResults(filtered);
      setShowContentCategoryDropdown(true);
    } else {
      setContentCategoryResults([]);
      setShowContentCategoryDropdown(false);
      // Clear the category from goods item when search is empty
      setGoodsItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          contentCategory: "",
          content: "",
          contentSubCategory: ""
        }))
      );
    }
  };

  const handleContentCategorySelect = (category: any) => {
    // Update goods item with selected category
    setGoodsItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        contentCategory: String(category.id),
        content: category.name,
        contentSubCategory: ""
      }))
    );
    setContentCategorySearch(category.name);
    setShowContentCategoryDropdown(false);
    toast.success(`Category "${category.name}" selected`);
  };

  // ========== HELPER FUNCTIONS ==========
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const validateDamagePackageCount = (count: number) => {
    if (damageType.length > 0) {
      if (count < 1) {
        setDamagePackageError("Number of damaged/missing packages must be at least 1");
        return false;
      }
      if (count > totalPckgs) {
        setDamagePackageError(`Cannot exceed total packages (${totalPckgs})`);
        return false;
      }
      setDamagePackageError("");
      return true;
    }
    setDamagePackageError("");
    return true;
  };

  const handleDamagePackageCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setDamagePackageCount(count);
    validateDamagePackageCount(count);
  };

  const handleDamageTypeChange = (type: "damaged" | "missing" | "both") => {
    setDamageType(prev => {
      if (prev.includes(type)) {
        const newType = prev.filter(t => t !== type);
        if (newType.length === 0) {
          setDamagePackageCount(0);
          setDamagePackageError("");
        }
        return newType;
      } else {
        return [...prev, type];
      }
    });
  };

  const handleDamageReasonChange = (value: string) => {
    setDamageReason(value);
    if (value !== "Other (specify)") {
      setDamageOtherRemark("");
    }
  };

  // ========== VOICE RECORDING FUNCTIONS ==========
  const startRecording = async () => {
    try {
      if (voiceNoteUrl) {
        if (voiceNoteUrl.startsWith('blob:')) {
          URL.revokeObjectURL(voiceNoteUrl);
        }
        setVoiceNoteUrl(null);
        setVoiceNoteDuration(null);
        setVoiceNoteBase64(null);
      }

      audioChunksRef.current = [];
      finalDurationRef.current = 0;
      setRecordingDuration(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result as string;
            setVoiceNoteBase64(base64Audio);
          };
          reader.readAsDataURL(audioBlob);

          setVoiceNoteUrl(audioUrl);
          const savedDuration = finalDurationRef.current;
          setVoiceNoteDuration(savedDuration);
          toast.success(`Voice note recorded: ${formatDuration(savedDuration)}`);
        } else {
          toast.error("No audio captured. Please try again.");
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          finalDurationRef.current = newDuration;
          if (newDuration >= 120) {
            stopRecording();
            return 120;
          }
          return newDuration;
        });
      }, 1000);

      toast.success("Recording started... Speak now!");
    } catch (error) {
      console.error("Microphone error:", error);
      toast.error("Unable to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        toast.success("Recording stopped!");
      } catch (error) {
        console.error("Stop recording error:", error);
        toast.error("Error stopping recording");
      }
    }
  };

  const deleteVoiceNote = () => {
    if (voiceNoteUrl && voiceNoteUrl.startsWith('blob:')) {
      URL.revokeObjectURL(voiceNoteUrl);
    }
    setVoiceNoteUrl(null);
    setVoiceNoteDuration(null);
    setVoiceNoteBase64(null);
    setIsRecording(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
    finalDurationRef.current = 0;

    if (mediaRecorderRef.current) {
      try {
        if (isRecording) mediaRecorderRef.current.stop();
      } catch (e) { }
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    toast.success("Voice note deleted");
  };

  // ========== PHOTO UPLOAD FUNCTIONS ==========
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (damagePhotos.length + files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }

    files.forEach(file => {
      if (!file.type.match(/image\/(jpeg|png|webp)/)) {
        toast.error(`File ${file.name} is not JPG, PNG, or WEBP`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setDamagePhotos(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setDamagePhotos(prev => prev.filter((_, i) => i !== index));
  };

  // ========== CALCULATION FUNCTIONS ==========
  const calculateAllTotals = () => {
    let freight = 0;
    if (freightOn === "CHARGE WEIGHT") {
      freight = totalChargeWeight * freightRate;
    } else if (freightOn === "ACTUAL WEIGHT") {
      freight = totalActualWeight * freightRate;
    } else if (freightOn === "PER PACKAGE") {
      freight = totalPckgs * freightRate;
    }

    setCalculatedFreight(freight);
    setTotalFreight(freight);

    const extraChargesTotal = extraCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    const subtotal = freight + extraChargesTotal;
    setSubTotal(subtotal);
    const gst = (subtotal * gstRate) / 100;
    setGstAmount(gst);
    const total = subtotal + gst;
    setTotalAmount(total);
    const balance = total - advanceAmount;
    setBalanceAmount(balance > 0 ? balance : 0);
  };

  const updateExtraCharge = (id: number, rate: number) => {
    setExtraCharges(prev =>
      prev.map(charge => charge.id === id ? { ...charge, rate, amount: rate } : charge)
    );
  };

  const handleClearFreight = () => {
    setFreightRate(0);
    toast.success("Freight rate cleared");
  };

  // ========== DATA LOADING FUNCTIONS ==========
  useEffect(() => {
    loadStaticData();
    loadBookings();
    loadStats();
    loadClients();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [goodsItems]);

  useEffect(() => {
    if (manualRates) calculateAllTotals();
  }, [totalChargeWeight, totalActualWeight, totalPckgs, freightRate, freightOn, extraCharges, gstRate, advanceAmount, manualRates]);

  useEffect(() => {
    if (!manualRates) setTotalFreight(totalChargeWeight * 5);
  }, [totalChargeWeight, manualRates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (voiceNoteUrl && voiceNoteUrl.startsWith('blob:')) URL.revokeObjectURL(voiceNoteUrl);
    };
  }, [voiceNoteUrl]);

  const loadCurrentUser = () => {
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('user');
      const selectedBranchStr = sessionStorage.getItem('selectedBranch');
      const branchCode = sessionStorage.getItem('branchCode');

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setCurrentUser(user);
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }

      if (selectedBranchStr) {
        setSelectedBranch(selectedBranchStr);
        setBookingFrom(selectedBranchStr);
      } else if (branchCode) {
        setSelectedBranch(branchCode);
        setBookingFrom(branchCode);
      }
    }
  };

  const loadStaticData = async () => {
    try {
      const [categoriesRes, packingRes, branchesRes] = await Promise.all([
        getContentCategories(),
        getPackingTypes(),
        getBranches()
      ]);
      setContentCategories(categoriesRes.data || []);
      setPackingTypes(packingRes.data || []);
      setBranchOptions(branchesRes.data || []);
    } catch (error) {
      console.error('Error loading static data:', error);
      toast.error('Failed to load static data');
    }
  };

  const loadClients = async () => {
    try {
      const response = await getClients({ limit: 100 });
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await getManualBookings({ status: 'active', limit: 100 });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadCancelledBookings = async () => {
    setLoading(true);
    try {
      const response = await getManualBookings({ status: 'cancelled', limit: 100 });
      setCancelledSearchResults(response.data || []);
    } catch (error) {
      console.error('Error loading cancelled bookings:', error);
      toast.error('Failed to load cancelled bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getManualBookingStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const validatePackageWeight = (item: GoodsItem): { isValid: boolean; error?: string } => {
    const packingType = packingTypes.find(p => p.name === item.packing);
    if (packingType && item.chargeWeight > 0 && item.noOfPckgs > 0) {
      const perPackageWeight = item.chargeWeight / item.noOfPckgs;
      if (perPackageWeight > packingType.maxWeight) {
        return {
          isValid: false,
          error: `Per package weight (${perPackageWeight.toFixed(2)} kg) exceeds limit for ${packingType.name} (Max: ${packingType.maxWeight} kg/package)`
        };
      }
    }
    return { isValid: true };
  };

  const calculateTotals = () => {
    let pckgs = 0, actWeight = 0, chgWeight = 0;
    goodsItems.forEach(item => {
      pckgs += Number(item.noOfPckgs) || 0;
      actWeight += Number(item.actualWeight) || 0;
      chgWeight += Number(item.chargeWeight) || 0;
    });
    setTotalPckgs(pckgs);
    setTotalActualWeight(actWeight);
    setTotalChargeWeight(chgWeight);
  };

  const updateGoodsItem = (id: number, field: keyof GoodsItem, value: any) => {
    setGoodsItems(goodsItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "actualWeight") updated.chargeWeight = Number(value) || 0;
        if (field === "contentCategory") {
          updated.contentSubCategory = "";
          updated.content = "";
        }
        const validation = validatePackageWeight(updated);
        updated.isWeightValid = validation.isValid;
        updated.weightError = validation.error;
        return updated;
      }
      return item;
    }));
  };

  // Number input with no leading zero
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (value: number) => void) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/^0+(?=\d)/, '');
    const numValue = cleanedValue === '' ? 0 : Number(cleanedValue);
    if (!isNaN(numValue)) {
      callback(numValue);
    }
  };

  const addGoodsRow = () => {
    setGoodsItems([...goodsItems, { id: Date.now(), noOfPckgs: 0, contentCategory: "", contentSubCategory: "", content: "", packing: "BOX", actualWeight: 0, chargeWeight: 0, isWeightValid: true }]);
    toast.success("New goods row added");
  };

  const removeGoodsRow = (id: number) => {
    if (goodsItems.length > 1) {
      setGoodsItems(goodsItems.filter(item => item.id !== id));
      toast.success("Goods row removed");
    } else {
      toast.error("At least one goods row is required");
    }
  };

  const addInvoiceRow = () => {
    setInvoices([...invoices, { id: Date.now(), invoiceNo: "", date: new Date(), value: "0", ewayBillNo: "", ewayBillDate: new Date(), validUpto: "" }]);
    toast.success("New invoice row added");
  };

  const updateInvoice = (id: number, field: keyof InvoiceItem, value: any) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
  };

  const removeInvoice = (id: number) => {
    if (invoices.length > 1) {
      setInvoices(invoices.filter(inv => inv.id !== id));
      toast.success("Invoice row removed");
    }
  };

  // ========== CLIENT HANDLERS ==========
  const handleConsignorSearch = async () => {
    if (!consignorIdType) { toast.error("Please select ID type"); return; }
    if (consignorIdType === "Self") {
      // POINT 10: Self - Name & Mobile Show (Mobile Optional)
      setConsignorId("self");
      setConsignorName(currentUser?.name || "Self");
      setConsignorMobile(currentUser?.mobile || ""); // Optional - not mandatory
      setConsignorGst("");
      setConsignorAdhaar("");
      setConsignorPan("");
      setConsignorCode("");
      setConsignorAddress("");
      setConsignorCity("");
      setConsignorState("");
      setConsignorEmail("");
      setConsignorIec("");
      setConsignorBankAd("");
      setConsignorIdValue("");
      toast.success("Self selected - No ID required");
      return;
    }
    if (!consignorIdValue) { toast.error("Please enter ID value"); return; }

    try {
      const response = await searchClient(consignorIdType, consignorIdValue);
      if (response.data) {
        const client = response.data;
        setConsignorId(client._id);
        setConsignorName(client.name);
        setConsignorMobile(client.mobile || "");
        setConsignorGst(client.gstNumber || "");
        setConsignorAdhaar(client.adhaarNumber || "");
        setConsignorPan(client.panNumber || "");
        setConsignorCode(client.dealerCode || "");
        setConsignorAddress(client.address || "");
        setConsignorCity(client.city || "");
        setConsignorState(client.state || "");
        setConsignorEmail(client.email || "");
        setConsignorIec(client.iecCode || "");
        setConsignorBankAd(client.bankAdNo || "");
        toast.success(`Consignor "${client.name}" loaded successfully!`);
      } else {
        toast.error("Client not found. Please add new client.");
        setIsNewConsignorDialogOpen(true);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      if (error.response?.status === 400) {
        toast.error("Invalid search. Please check the ID type and value.");
      } else {
        toast.error("Error searching client. Please try again.");
      }
      setIsNewConsignorDialogOpen(true);
    }
  };

  const handleConsignorAdd = () => setIsNewConsignorDialogOpen(true);

  const handleConsigneeSearch = async () => {
    if (!consigneeIdType) { toast.error("Please select ID type"); return; }
    if (consigneeIdType === "Self") {
      // POINT 10: Self - Name & Mobile Show (Mobile Optional)
      setConsigneeId("self");
      setConsigneeName(currentUser?.name || "Self");
      setConsigneeMobile(currentUser?.mobile || ""); // Optional - not mandatory
      setConsigneeGst("");
      setConsigneeAdhaar("");
      setConsigneePan("");
      setConsigneeCode("");
      setConsigneeAddress("");
      setConsigneeCity("");
      setConsigneeState("");
      setConsigneeEmail("");
      setConsigneeIec("");
      setConsigneeBankAd("");
      setConsigneeIdValue("");
      toast.success("Self selected - No ID required");
      return;
    }
    if (!consigneeIdValue) { toast.error("Please enter ID value"); return; }

    try {
      const response = await searchClient(consigneeIdType, consigneeIdValue);
      if (response.data) {
        const client = response.data;
        setConsigneeId(client._id);
        setConsigneeName(client.name);
        setConsigneeMobile(client.mobile || "");
        setConsigneeGst(client.gstNumber || "");
        setConsigneeAdhaar(client.adhaarNumber || "");
        setConsigneePan(client.panNumber || "");
        setConsigneeCode(client.dealerCode || "");
        setConsigneeAddress(client.address || "");
        setConsigneeCity(client.city || "");
        setConsigneeState(client.state || "");
        setConsigneeEmail(client.email || "");
        setConsigneeIec(client.iecCode || "");
        setConsigneeBankAd(client.bankAdNo || "");
        toast.success(`Consignee "${client.name}" loaded successfully!`);
      } else {
        toast.error("Client not found. Please add new client.");
        setIsNewConsigneeDialogOpen(true);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      if (error.response?.status === 400) {
        toast.error("Invalid search. Please check the ID type and value.");
      } else {
        toast.error("Error searching client. Please try again.");
      }
      setIsNewConsigneeDialogOpen(true);
    }
  };

  const handleConsigneeAdd = () => setIsNewConsigneeDialogOpen(true);

  const addNewClient = async (type: "consignor" | "consignee") => {
    if (!newClientData.name) { toast.error("Please enter client name"); return; }

    try {
      const response = await createClient({
        name: newClientData.name,
        mobile: newClientData.mobile || "",
        gstNumber: newClientData.gstNumber || "",
        adhaarNumber: newClientData.adhaarNumber || "",
        panNumber: newClientData.panNumber || "",
        address: newClientData.address || "",
        city: newClientData.city || "",
        state: newClientData.state || "",
        email: newClientData.email || "",
        dealerCode: newClientData.dealerCode || "",
        iecCode: newClientData.iecCode || "",
        bankAdNo: newClientData.bankAdNo || "",
      });

      const newClient = response.data;
      await loadClients();

      if (type === "consignor") {
        setConsignorId(newClient._id);
        setConsignorName(newClient.name);
        setConsignorMobile(newClient.mobile || "");
        setConsignorGst(newClient.gstNumber);
        setConsignorAdhaar(newClient.adhaarNumber);
        setConsignorPan(newClient.panNumber);
        setConsignorCode(newClient.dealerCode);
        setConsignorAddress(newClient.address);
        setConsignorCity(newClient.city);
        setConsignorState(newClient.state);
        setConsignorEmail(newClient.email);
        setConsignorIec(newClient.iecCode);
        setConsignorBankAd(newClient.bankAdNo);
        setIsNewConsignorDialogOpen(false);
        toast.success(`Consignor "${newClient.name}" added successfully!`);
      } else {
        setConsigneeId(newClient._id);
        setConsigneeName(newClient.name);
        setConsigneeMobile(newClient.mobile || "");
        setConsigneeGst(newClient.gstNumber);
        setConsigneeAdhaar(newClient.adhaarNumber);
        setConsigneePan(newClient.panNumber);
        setConsigneeCode(newClient.dealerCode);
        setConsigneeAddress(newClient.address);
        setConsigneeCity(newClient.city);
        setConsigneeState(newClient.state);
        setConsigneeEmail(newClient.email);
        setConsigneeIec(newClient.iecCode);
        setConsigneeBankAd(newClient.bankAdNo);
        setIsNewConsigneeDialogOpen(false);
        toast.success(`Consignee "${newClient.name}" added successfully!`);
      }
      setNewClientData({});
    } catch (error: any) {
      console.error('Add client error:', error);
      toast.error(error.response?.data?.message || "Failed to add client");
    }
  };

  // ========== FORM HANDLERS ==========

  // ==================== CREATE STOCK ISSUE FROM BOOKING (NEW) ====================
  const handleCreateIssue = async (booking: BookingRecord) => {
    try {
      // Create a stock issue for each goods item
      for (const item of booking.goodsItems) {
        await api.post('/stock-issue', {
          issueTo: booking.bookingFrom,
          issueDate: format(booking.bookingDate, 'dd-MM-yyyy'),
          itemName: item.content || 'Goods',
          unitType: item.packing || 'PCS',
          quantity: item.noOfPckgs || 1,
          remarks: `Created from Booking ${booking.grNo}`,
        });
      }
      toast.success(`Stock issue created for Booking ${booking.grNo}`);
    } catch (error) {
      console.error('Failed to create stock issue:', error);
      toast.error('Failed to auto-create stock issue');
    }
  };

  const handlePrint = () => {
    window.print();
    toast.success("Print dialog opened");
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all form data?")) {
      resetForm();
      toast.success("Form cleared");
    }
  };

  const resetForm = () => {
    setGrNo("");
    setBookingFrom(selectedBranch);
    setBookingDate(new Date());
    setDestination("");
    setPickupFrom("");
    setDeliveryPoint("");
    // POINT 2: Booking Type Default "TOPAY"
    setBookingType("TOPAY");
    setCollectionAt("");
    setPvtMarkaSealNo("");
    setServiceProduct("SURFACE");
    setDeliveryType("GODOWN");
    setLoadType("PART LOAD");
    setMkExecutive("");
    setFreightOn("CHARGE WEIGHT");
    setManualRates(false);
    setNcv(false);
    setPrintAfterSave(false);
    setCcAttached(false);

    setFreightRate(0);
    setCalculatedFreight(0);
    setGstRate(0);
    setAdvanceAmount(0);
    setGstPaidBy("CONSIGNEE");
    setExtraCharges(EXTRA_CHARGES.map(charge => ({ ...charge, rate: charge.defaultRate, amount: charge.defaultRate })));
    setSubTotal(0);
    setGstAmount(0);
    setTotalAmount(0);
    setBalanceAmount(0);

    setConsignorIdType("");
    setConsignorIdValue("");
    setConsignorId("");
    setConsignorName("");
    setConsignorMobile("");
    setConsignorGst("");
    setConsignorAdhaar("");
    setConsignorPan("");
    setConsignorCode("");
    setConsignorAddress("");
    setConsignorCity("");
    setConsignorState("");
    setConsignorEmail("");
    setConsignorIec("");
    setConsignorBankAd("");
    setConsignorSearchResults([]);
    setShowConsignorDropdown(false);

    setConsigneeIdType("");
    setConsigneeIdValue("");
    setConsigneeId("");
    setConsigneeName("");
    setConsigneeMobile("");
    setConsigneeGst("");
    setConsigneeAdhaar("");
    setConsigneePan("");
    setConsigneeCode("");
    setConsigneeAddress("");
    setConsigneeCity("");
    setConsigneeState("");
    setConsigneeEmail("");
    setConsigneeIec("");
    setConsigneeBankAd("");
    setConsigneeSearchResults([]);
    setShowConsigneeDropdown(false);

    setContentCategorySearch("");
    setContentCategoryResults([]);
    setShowContentCategoryDropdown(false);

    setGoodsItems([{ id: Date.now(), noOfPckgs: 0, contentCategory: "", contentSubCategory: "", content: "", packing: "BOX", actualWeight: 0, chargeWeight: 0, isWeightValid: true }]);
    setInvoices([{ id: Date.now(), invoiceNo: "", date: new Date(), value: "0", ewayBillNo: "", ewayBillDate: new Date(), validUpto: "" }]);
    setRemarks("");
    setRoRemarks("");
    setBillNo("");
    setSupplementaryBillNo("");
    setInsuranceCoveredBy("");
    setInsuranceNo("");
    setInsuranceDate(new Date());
    setInsuranceCompany("");
    setTotalPckgs(0);
    setTotalActualWeight(0);
    setTotalChargeWeight(0);
    setTotalFreight(0);
    setEditMode(false);
    setCurrentEditId(null);
    setIsConsignorAddressOpen(false);
    setIsConsigneeAddressOpen(false);

    setDamageType([]);
    setDamageReason("");
    setDamageOtherRemark("");
    setDamagePackageCount(0);
    setDamagePackageError("");
    setDamagePhotos([]);

    if (voiceNoteUrl && voiceNoteUrl.startsWith('blob:')) URL.revokeObjectURL(voiceNoteUrl);
    setVoiceNoteUrl(null);
    setVoiceNoteDuration(null);
    setVoiceNoteBase64(null);
    setIsRecording(false);
    setRecordingDuration(0);
    finalDurationRef.current = 0;
    audioChunksRef.current = [];

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      try { if (isRecording) mediaRecorderRef.current.stop(); } catch (e) { }
      mediaRecorderRef.current = null;
    }

    setValidationErrors({});
  };

  // Validate required fields
  const validateRequiredFields = () => {
    const errors: { [key: string]: string } = {};

    if (!grNo) errors.grNo = "GR Number is required";
    if (!bookingFrom) errors.bookingFrom = "Booking From is required";
    if (!destination) errors.destination = "Destination is required";
    if (!consignorName) errors.consignorName = "Consignor Name is required";
    if (!consigneeName) errors.consigneeName = "Consignee Name is required";
    if (!bookingType) errors.bookingType = "Booking Type is required";
    if (!collectionAt) errors.collectionAt = "Collection At is required";
    if (!serviceProduct) errors.serviceProduct = "Service/Product is required";
    if (!deliveryType) errors.deliveryType = "Delivery Type is required";
    if (!loadType) errors.loadType = "Load Type is required";

    const hasWeightError = goodsItems.some(item => !item.isWeightValid);
    if (hasWeightError) errors.weightError = "Please fix weight validation errors";

    if (damageType.length > 0) {
      if (!damageReason) errors.damageReason = "Please select a damage/missing reason";
      if (damageReason === "Other (specify)" && !damageOtherRemark.trim()) {
        errors.damageOtherRemark = "Please specify the reason";
      }
      if (!remarks.trim()) errors.remarks = "Please add remarks about the damage/missing condition";
      if (damagePackageCount < 1) errors.damagePackageCount = "Number of damaged/missing packages must be at least 1";
      if (damagePackageCount > totalPckgs) errors.damagePackageCount = `Cannot exceed total packages (${totalPckgs})`;
      if (damagePhotos.length === 0) errors.damagePhotos = "Please upload at least 1 damage photo";
      if (!voiceNoteBase64 && !voiceNoteUrl) errors.voiceNote = "Please record a voice note describing the damage";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== UPDATED SAVE FUNCTION (WITH STOCK ISSUE) ====================
  const handleSave = async () => {
    console.log("=== MANUAL BOOKING SAVE BUTTON CLICKED ===");

    if (!validateRequiredFields()) {
      const firstError = Object.values(validationErrors)[0];
      if (firstError) toast.error(firstError);
      return;
    }

    setLoading(true);

    const finalVoiceNoteUrl = voiceNoteBase64 || voiceNoteUrl || "";

    const bookingData = {
      grNo, bookingFrom, bookingDate, destination, pickupFrom: pickupFrom || "", deliveryPoint: deliveryPoint || "",
      bookingType, collectionAt,
      consignorId: consignorId === "self" ? "" : consignorId, consignorName, consignorMobile: consignorMobile || "",
      consignorGst: consignorGst || "", consignorAdhaar: consignorAdhaar || "", consignorPan: consignorPan || "",
      consignorCode: consignorCode || "", consignorAddress: consignorAddress || "", consignorCity: consignorCity || "",
      consignorState: consignorState || "", consignorEmail: consignorEmail || "", consignorIec: consignorIec || "",
      consignorBankAd: consignorBankAd || "",
      consigneeId: consigneeId === "self" ? "" : consigneeId, consigneeName, consigneeMobile: consigneeMobile || "",
      consigneeGst: consigneeGst || "", consigneeAdhaar: consigneeAdhaar || "", consigneePan: consigneePan || "",
      consigneeCode: consigneeCode || "", consigneeAddress: consigneeAddress || "", consigneeCity: consigneeCity || "",
      consigneeState: consigneeState || "", consigneeEmail: consigneeEmail || "", consigneeIec: consigneeIec || "",
      consigneeBankAd: consigneeBankAd || "",
      pvtMarkaSealNo: pvtMarkaSealNo || "", serviceProduct, deliveryType, loadType, mkExecutive: mkExecutive || "",
      freightOn, manualRates, ncv, printAfterSave, ccAttached,
      totalPckgs, totalActualWeight, totalChargeWeight, totalFreight: manualRates ? calculatedFreight : totalChargeWeight * 5,
      remarks: remarks || "", roRemarks: roRemarks || "", billNo: billNo || "", supplementaryBillNo: supplementaryBillNo || "",
      insuranceCoveredBy: insuranceCoveredBy || "", insuranceNo: insuranceNo || "", insuranceDate, insuranceCompany: insuranceCompany || "",
      goodsItems: goodsItems.map(({ id, ...rest }) => rest),
      invoices: invoices.map(({ id, ...rest }) => ({ ...rest, date: rest.date, ewayBillDate: rest.ewayBillDate })),
      damageType: damageType.length > 0 ? damageType : undefined,
      damageReason: damageReason || undefined,
      damageOtherRemark: damageOtherRemark || undefined,
      damagePackageCount: damagePackageCount || 0,
      damagePhotos: damagePhotos.length > 0 ? damagePhotos : undefined,
      voiceNoteUrl: finalVoiceNoteUrl,
      voiceNoteDuration: voiceNoteDuration || undefined,
      ...(manualRates && { freightRate, extraCharges, gstPaidBy, gstRate, advanceAmount, subTotal, gstAmount, totalAmount, balanceAmount }),
    };

    try {
      let response;
      if (editMode && currentEditId) {
        response = await updateManualBooking(currentEditId, bookingData);
        toast.success("Booking updated successfully!");
      } else {
        response = await createManualBooking(bookingData);
        toast.success(`Booking created successfully! GR No: ${response.data.grNo}`);

        // ✅ CREATE STOCK ISSUE FROM BOOKING (ONLY FOR NEW BOOKINGS)
        if (response.data) {
          await handleCreateIssue(response.data);
        }
      }

      await loadBookings();
      await loadStats();

      if (printAfterSave) handlePrint();
      resetForm();
      setIsBookingModalOpen(false);
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.response?.data?.message) {
        if (error.response.data.message.includes("duplicate") || error.response.data.message.includes("already exists")) {
          toast.error(`GR Number "${grNo}" already exists. Please use a different GR number.`);
        } else {
          toast.error(error.response.data.message);
        }
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to save booking. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelledReason) { toast.error("Please select cancellation reason"); return; }
    if (cancellingBooking) {
      setLoading(true);
      try {
        await cancelManualBooking(cancellingBooking._id!, cancelledReason);
        toast.success(`Booking ${cancellingBooking.grNo} cancelled!`);
        await loadBookings();
        await loadCancelledBookings();
        await loadStats();
        setIsCancelledDialogOpen(false);
        setCancellingBooking(null);
        setCancelledReason("");
      } catch (error: any) {
        console.error('Cancel error:', error);
        toast.error(error.response?.data?.message || "Failed to cancel booking");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRestoreBooking = async (record: BookingRecord) => {
    if (confirm(`Restore booking ${record.grNo}?`)) {
      setLoading(true);
      try {
        await restoreManualBooking(record._id!);
        toast.success(`Booking ${record.grNo} restored!`);
        await loadBookings();
        await loadCancelledBookings();
        await loadStats();
      } catch (error: any) {
        console.error('Restore error:', error);
        toast.error(error.response?.data?.message || "Failed to restore booking");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this booking? This action cannot be undone.")) {
      setLoading(true);
      try {
        await deleteManualBooking(id);
        toast.success("Booking deleted permanently!");
        await loadBookings();
        await loadCancelledBookings();
        await loadStats();
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error(error.response?.data?.message || "Failed to delete booking");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filters: any = { status: 'active', limit: 100 };
      if (searchGrNo && searchGrNo.toString().trim() !== '') filters.grNo = searchGrNo.toString().trim();
      if (searchFromDate) filters.fromDate = searchFromDate.toISOString();
      if (searchToDate) filters.toDate = searchToDate.toISOString();
      if (searchBranch !== "all") filters.branch = searchBranch;

      const response = await getManualBookings(filters);
      setSearchResults(response.data || []);
      setCurrentPage(1);
      toast.success(`Found ${response.data?.length || 0} bookings`);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelledSearch = async () => {
    setLoading(true);
    try {
      const filters: any = { status: 'cancelled', limit: 100 };
      if (searchGrNo) filters.grNo = searchGrNo;
      if (searchFromDate) filters.fromDate = searchFromDate.toISOString();
      if (searchToDate) filters.toDate = searchToDate.toISOString();
      if (searchBranch !== "all") filters.branch = searchBranch;

      const response = await getManualBookings(filters);
      setCancelledSearchResults(response.data || []);
      setCancelledCurrentPage(1);
      toast.success(`Found ${response.data?.length || 0} cancelled bookings`);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchGrNo("");
    setSearchFromDate(new Date());
    setSearchToDate(new Date());
    setSearchBranch("all");
    loadBookings();
    loadCancelledBookings();
    toast.success("Search filters cleared");
  };

  const handleEdit = (record: BookingRecord) => {
    setEditMode(true);
    setCurrentEditId(record._id!);
    setGrNo(record.grNo);
    setBookingFrom(record.bookingFrom);
    setBookingDate(new Date(record.bookingDate));
    setDestination(record.destination);
    setPickupFrom(record.pickupFrom);
    setDeliveryPoint(record.deliveryPoint);
    setBookingType(record.bookingType);
    setCollectionAt(record.collectionAt);
    setPvtMarkaSealNo(record.pvtMarkaSealNo);
    setServiceProduct(record.serviceProduct);
    setDeliveryType(record.deliveryType);
    setLoadType(record.loadType);
    setMkExecutive(record.mkExecutive);
    setFreightOn(record.freightOn || "CHARGE WEIGHT");
    setManualRates(record.manualRates || false);
    setNcv(record.ncv);
    setPrintAfterSave(record.printAfterSave);
    setCcAttached(record.ccAttached);

    setConsignorId(String(record.consignorId));
    setConsignorName(record.consignorName);
    setConsignorMobile(record.consignorMobile || "");
    setConsignorGst(record.consignorGst);
    setConsignorAdhaar(record.consignorAdhaar);
    setConsignorPan(record.consignorPan);
    setConsignorCode(record.consignorCode);
    setConsignorAddress(record.consignorAddress);
    setConsignorCity(record.consignorCity);
    setConsignorState(record.consignorState);
    setConsignorEmail(record.consignorEmail);
    setConsignorIec(record.consignorIec);
    setConsignorBankAd(record.consignorBankAd);

    setConsigneeId(String(record.consigneeId));
    setConsigneeName(record.consigneeName);
    setConsigneeMobile(record.consigneeMobile || "");
    setConsigneeGst(record.consigneeGst);
    setConsigneeAdhaar(record.consigneeAdhaar);
    setConsigneePan(record.consigneePan);
    setConsigneeCode(record.consigneeCode);
    setConsigneeAddress(record.consigneeAddress);
    setConsigneeCity(record.consigneeCity);
    setConsigneeState(record.consigneeState);
    setConsigneeEmail(record.consigneeEmail);
    setConsigneeIec(record.consigneeIec);
    setConsigneeBankAd(record.consigneeBankAd);

    setGoodsItems(record.goodsItems.map((item, idx) => ({ ...item, id: Date.now() + idx })));
    setInvoices(record.invoices.map((inv, idx) => ({ ...inv, id: Date.now() + idx })));
    setRemarks(record.remarks);
    setRoRemarks(record.roRemarks);
    setBillNo(record.billNo);
    setSupplementaryBillNo(record.supplementaryBillNo);
    setInsuranceCoveredBy(record.insuranceCoveredBy);
    setInsuranceNo(record.insuranceNo);
    setInsuranceDate(new Date(record.insuranceDate));
    setInsuranceCompany(record.insuranceCompany);
    setTotalPckgs(record.totalPckgs);
    setTotalActualWeight(record.totalActualWeight);
    setTotalChargeWeight(record.totalChargeWeight);
    setTotalFreight(record.totalFreight);

    if (record.damageType && record.damageType.length > 0) setDamageType(record.damageType);
    else setDamageType([]);

    if (record.damageReason) setDamageReason(record.damageReason);
    else setDamageReason("");

    if (record.damageOtherRemark) setDamageOtherRemark(record.damageOtherRemark);
    else setDamageOtherRemark("");

    if (record.damagePackageCount && record.damagePackageCount > 0) setDamagePackageCount(record.damagePackageCount);
    else setDamagePackageCount(0);

    if (record.damagePhotos && record.damagePhotos.length > 0) setDamagePhotos(record.damagePhotos);
    else setDamagePhotos([]);

    if (record.voiceNoteUrl && record.voiceNoteUrl.trim() !== "") {
      setVoiceNoteUrl(record.voiceNoteUrl);
      setVoiceNoteBase64(record.voiceNoteUrl);
      setVoiceNoteDuration(record.voiceNoteDuration || 0);
    } else {
      setVoiceNoteUrl(null);
      setVoiceNoteBase64(null);
      setVoiceNoteDuration(null);
    }

    setIsRecording(false);
    setRecordingDuration(0);
    setDamagePackageError("");
    setValidationErrors({});

    setIsBookingModalOpen(true);
  };

  const openAddModal = () => {
    resetForm();
    setEditMode(false);
    setCurrentEditId(null);
    setGrNo("");
    setIsBookingModalOpen(true);
  };

  const openCancelDialog = (record: BookingRecord) => {
    setCancellingBooking(record);
    setCancelledReason("");
    setIsCancelledDialogOpen(true);
  };

  // ============================================
  // PDF GENERATION USING HTML TO PDF (PROFESSIONAL DESIGN)
  // ============================================
  const generatePDFFromData = async (data: any) => {
    // ✅ Guard against server-side execution
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('PDF generation skipped - running on server');
      return;
    }

    try {
      // Dynamic import - only loads on client
      const html2pdf = (await import('html2pdf.js')).default;

      // Build HTML content with all booking details
      const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Booking Confirmation</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          background: #fff;
          padding: 12px;
          color: #000;
        }
        .page {
          max-width: 210mm;
          margin: 0 auto;
          background: #fff;
          padding: 10px 12px 8px 12px;
          border: 2px solid #000;
          position: relative;
        }
        /* Header Section */
        .header {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .header h1 {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .header p {
          font-size: 9px;
          margin: 2px 0;
          color: #333;
        }
        /* Title & Status */
        .title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .title-section h2 {
          font-size: 17px;
          font-weight: 700;
        }
        .status-badge {
          font-size: 10px;
          font-weight: 700;
          color: #cc0000;
          border: 1px solid #cc0000;
          padding: 2px 12px;
          border-radius: 3px;
        }
        /* Two-column layout */
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .col {
          flex: 1 1 45%;
          padding: 2px 6px;
        }
        .field {
          display: flex;
          font-size: 9px;
          line-height: 1.6;
          padding: 1px 0;
        }
        .field .label {
          font-weight: 700;
          width: 90px;
          flex-shrink: 0;
        }
        .field .value {
          flex: 1;
          word-break: break-word;
          padding-left: 2px;
        }
        /* Section Title */
        .section-title {
          font-size: 12px;
          font-weight: 700;
          background: #eee;
          padding: 3px 10px;
          margin: 10px 0 5px 0;
          border-left: 4px solid #000;
        }
        /* Tables */
        .grid-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8.5px;
          margin: 5px 0 8px 0;
        }
        .grid-table th {
          background: #333;
          color: #fff;
          padding: 4px 5px;
          text-align: center;
          font-weight: 700;
          border: 1px solid #000;
        }
        .grid-table td {
          padding: 3px 5px;
          border: 1px solid #000;
          text-align: center;
        }
        .grid-table tr:nth-child(even) td {
          background: #f8f8f8;
        }
        /* Totals Box */
        .totals-box {
          border: 1px solid #000;
          padding: 8px 12px;
          margin: 6px 0 10px 0;
          background: #f9f9f9;
        }
        .totals-box .label {
          font-weight: 700;
          display: inline-block;
          width: 150px;
        }
        .totals-box .line {
          padding: 2px 0;
          font-size: 9px;
        }
        .totals-box .title {
          font-weight: 700;
          font-size: 11px;
          margin-bottom: 3px;
        }
        /* Damage & Remarks Boxes */
        .damage-box, .remarks-box {
          border: 1px solid #000;
          padding: 8px 12px;
          margin: 6px 0;
          background: #fcfcfc;
        }
        .damage-box .title, .remarks-box .title {
          font-weight: 700;
          font-size: 11px;
          background: #eee;
          padding: 2px 8px;
          margin: -8px -12px 6px -12px;
          border-bottom: 1px solid #000;
        }
        .damage-box .line, .remarks-box .line {
          font-size: 9px;
          padding: 2px 0;
        }
        .damage-box .line .lbl, .remarks-box .line .lbl {
          font-weight: 700;
          display: inline-block;
          width: 110px;
        }
        /* Footer */
        .footer {
          text-align: center;
          font-size: 7.5px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 6px;
          margin-top: 10px;
        }
        .footer .page-number {
          font-weight: 700;
        }
        /* Responsive */
        @media (max-width: 600px) {
          .col { flex: 1 1 100%; }
          .field .label { width: 70px; }
        }
        @media print {
          .page { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="page" id="pdf-content">
        <!-- HEADER -->
        <div class="header">
          <h1>GOLDEN ROADWAYS &amp; LOGISTICS PVT LTD</h1>
          <p>Corporate Office: Golden Roadways Building, NH-24, Delhi - 110092</p>
          <p>Phone: 011-12345678 | Email: info@goldenroadways.com | GST: 07AABCG1234D1Z1</p>
        </div>

        <!-- TITLE & STATUS -->
        <div class="title-section">
          <h2>${data.editMode ? 'EDIT BOOKING' : 'BOOKING CONFIRMATION'}</h2>
          <span class="status-badge">STATUS: ${(data.status || 'ACTIVE').toUpperCase()}</span>
        </div>

        <!-- BOOKING DETAILS (two columns) -->
        <div class="row">
          <div class="col">
            <div class="field"><span class="label">GR No.</span><span class="value">${data.grNo || 'Auto-generated'}</span></div>
            <div class="field"><span class="label">Booking From</span><span class="value">${data.bookingFrom || '-'}</span></div>
            <div class="field"><span class="label">Booking Date</span><span class="value">${format(data.bookingDate, 'dd-MM-yyyy')}</span></div>
            <div class="field"><span class="label">Destination</span><span class="value">${data.destination || '-'}</span></div>
            <div class="field"><span class="label">Booking Type</span><span class="value">${data.bookingType || '-'}</span></div>
            <div class="field"><span class="label">Collection At</span><span class="value">${data.collectionAt || '-'}</span></div>
          </div>
          <div class="col">
            <div class="field"><span class="label">Service Product</span><span class="value">${data.serviceProduct || '-'}</span></div>
            <div class="field"><span class="label">Delivery Type</span><span class="value">${data.deliveryType || '-'}</span></div>
            <div class="field"><span class="label">Load Type</span><span class="value">${data.loadType || '-'}</span></div>
            <div class="field"><span class="label">Freight On</span><span class="value">${data.freightOn || '-'}</span></div>
            <div class="field"><span class="label">Pvt Marka/Seal</span><span class="value">${data.pvtMarkaSealNo || '-'}</span></div>
          </div>
        </div>

        <!-- CONSIGNOR & CONSIGNEE -->
        <div style="display:flex; flex-wrap:wrap; gap:14px; margin:6px 0 8px 0;">
          <div style="flex:1; min-width:190px; border:1px solid #000; padding:7px;">
            <div style="font-weight:700; background:#eee; padding:2px 8px; margin:-7px -7px 5px -7px; border-bottom:1px solid #000;">CONSIGNOR DETAILS</div>
            <div class="field"><span class="label">Name</span><span class="value">${data.consignorName || '-'}</span></div>
            <div class="field"><span class="label">Mobile</span><span class="value">${data.consignorMobile || '-'}</span></div>
            <div class="field"><span class="label">GST</span><span class="value">${data.consignorGst || '-'}</span></div>
            <div class="field"><span class="label">PAN</span><span class="value">${data.consignorPan || '-'}</span></div>
            <div class="field"><span class="label">Address</span><span class="value">${data.consignorAddress || '-'}</span></div>
            <div class="field"><span class="label">City</span><span class="value">${data.consignorCity || '-'}</span></div>
            <div class="field"><span class="label">State</span><span class="value">${data.consignorState || '-'}</span></div>
          </div>
          <div style="flex:1; min-width:190px; border:1px solid #000; padding:7px;">
            <div style="font-weight:700; background:#eee; padding:2px 8px; margin:-7px -7px 5px -7px; border-bottom:1px solid #000;">CONSIGNEE DETAILS</div>
            <div class="field"><span class="label">Name</span><span class="value">${data.consigneeName || '-'}</span></div>
            <div class="field"><span class="label">Mobile</span><span class="value">${data.consigneeMobile || '-'}</span></div>
            <div class="field"><span class="label">GST</span><span class="value">${data.consigneeGst || '-'}</span></div>
            <div class="field"><span class="label">PAN</span><span class="value">${data.consigneePan || '-'}</span></div>
            <div class="field"><span class="label">Address</span><span class="value">${data.consigneeAddress || '-'}</span></div>
            <div class="field"><span class="label">City</span><span class="value">${data.consigneeCity || '-'}</span></div>
            <div class="field"><span class="label">State</span><span class="value">${data.consigneeState || '-'}</span></div>
          </div>
        </div>

        <!-- GOODS TABLE -->
        <div class="section-title">GOODS DETAILS</div>
        <table class="grid-table">
          <thead>
            <tr>
              <th style="width:5%;">#</th>
              <th style="width:8%;">Pkgs</th>
              <th style="width:18%;">Category</th>
              <th style="width:18%;">Content</th>
              <th style="width:12%;">Packing</th>
              <th style="width:14%;">Act. Wt (kg)</th>
              <th style="width:14%;">Chg. Wt (kg)</th>
            </tr>
          </thead>
          <tbody>
            ${data.goodsItems && data.goodsItems.length > 0
        ? data.goodsItems.map((item: any, idx: number) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.noOfPckgs}</td>
                  <td>${item.contentCategoryName || item.contentCategory || '-'}</td>
                  <td>${item.content || '-'}</td>
                  <td>${item.packing || '-'}</td>
                  <td>${Number(item.actualWeight).toFixed(2)}</td>
                  <td>${Number(item.chargeWeight).toFixed(2)}</td>
                </tr>
              `).join('')
        : `<tr><td colspan="7" style="text-align:center; padding:10px;">No goods items</td></tr>`
      }
          </tbody>
        </table>

        <!-- TOTALS -->
        <div class="totals-box">
          <div class="title">TOTALS</div>
          <div class="line"><span class="label">Total Packages:</span> ${data.totalPckgs}</div>
          <div class="line"><span class="label">Total Actual Weight:</span> ${Number(data.totalActualWeight).toFixed(2)} kg</div>
          <div class="line"><span class="label">Total Charge Weight:</span> ${Number(data.totalChargeWeight).toFixed(2)} kg</div>
          ${data.manualRates ? `
            <div class="line"><span class="label">Freight:</span> Rs. ${Number(data.calculatedFreight || 0).toLocaleString('en-IN')}</div>
            <div class="line"><span class="label">GST (${data.gstRate || 0}%):</span> Rs. ${Number(data.gstAmount || 0).toLocaleString('en-IN')}</div>
            <div class="line"><span class="label">Total Amount:</span> Rs. ${Number(data.totalAmount || 0).toLocaleString('en-IN')}</div>
            <div class="line"><span class="label">Advance:</span> Rs. ${Number(data.advanceAmount || 0).toLocaleString('en-IN')}</div>
            <div class="line"><span class="label">Balance:</span> Rs. ${Number(data.balanceAmount || 0).toLocaleString('en-IN')}</div>
          ` : `
            <div class="line"><span class="label">Freight:</span> Rs. ${(data.totalChargeWeight * 5).toFixed(2)}</div>
          `}
        </div>

        <!-- INVOICES TABLE -->
        ${data.invoices && data.invoices.length > 0 ? `
          <div class="section-title">INVOICE DETAILS</div>
          <table class="grid-table">
            <thead>
              <tr>
                <th style="width:6%;">S#</th>
                <th style="width:16%;">Invoice #</th>
                <th style="width:14%;">Date</th>
                <th style="width:14%;">Value</th>
                <th style="width:16%;">Eway Bill #</th>
                <th style="width:14%;">Eway Date</th>
                <th style="width:14%;">Valid Upto</th>
              </tr>
            </thead>
            <tbody>
              ${data.invoices.map((inv: any, idx: number) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${inv.invoiceNo || '-'}</td>
                  <td>${format(inv.date, 'dd-MM-yyyy')}</td>
                  <td>${inv.value || '0'}</td>
                  <td>${inv.ewayBillNo || '-'}</td>
                  <td>${format(inv.ewayBillDate, 'dd-MM-yyyy')}</td>
                  <td>${inv.validUpto || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- DAMAGE SECTION -->
        ${data.damageType && data.damageType.length > 0 ? `
          <div class="damage-box">
            <div class="title">DAMAGE / MISSING REPORT</div>
            <div class="line"><span class="lbl">Type:</span> ${data.damageType.join(', ')}</div>
            <div class="line"><span class="lbl">Reason:</span> ${data.damageReason || 'N/A'}</div>
            <div class="line"><span class="lbl">Packages:</span> ${data.damagePackageCount || 0}</div>
            ${data.damageOtherRemark ? `<div class="line"><span class="lbl">Other Remark:</span> ${data.damageOtherRemark}</div>` : ''}
          </div>
        ` : ''}

        <!-- REMARKS & INSURANCE -->
        ${(data.remarks || data.roRemarks || data.billNo || data.supplementaryBillNo ||
        data.insuranceCoveredBy || data.insuranceNo || data.insuranceCompany || data.insuranceDate) ? `
          <div class="remarks-box">
            <div class="title">REMARKS &amp; INSURANCE</div>
            ${data.remarks ? `<div class="line"><span class="lbl">Remarks:</span> ${data.remarks}</div>` : ''}
            ${data.roRemarks ? `<div class="line"><span class="lbl">RO Remarks:</span> ${data.roRemarks}</div>` : ''}
            ${data.billNo ? `<div class="line"><span class="lbl">Bill No:</span> ${data.billNo}</div>` : ''}
            ${data.supplementaryBillNo ? `<div class="line"><span class="lbl">Suppl. Bill No:</span> ${data.supplementaryBillNo}</div>` : ''}
            ${data.insuranceCoveredBy ? `<div class="line"><span class="lbl">Covered By:</span> ${data.insuranceCoveredBy}</div>` : ''}
            ${data.insuranceNo ? `<div class="line"><span class="lbl">Insurance #:</span> ${data.insuranceNo}</div>` : ''}
            ${data.insuranceCompany ? `<div class="line"><span class="lbl">Company:</span> ${data.insuranceCompany}</div>` : ''}
            ${data.insuranceDate ? `<div class="line"><span class="lbl">Date:</span> ${format(data.insuranceDate, 'dd-MM-yyyy')}</div>` : ''}
          </div>
        ` : ''}

        <!-- FOOTER -->
        <div class="footer">
          <div>This is a computer-generated document. No signature required.</div>
          <div class="page-number">Generated on ${format(new Date(), 'dd-MM-yyyy HH:mm:ss')}</div>
        </div>
      </div>
    </body>
    </html>
  `;

      // Create a hidden container to render the HTML
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.background = '#fff';
      container.style.zIndex = '-1';
      container.innerHTML = content;
      document.body.appendChild(container);

      const element = container.querySelector('#pdf-content') as HTMLElement;
      if (!element) {
        document.body.removeChild(container);
        toast.error('PDF content not found');
        return;
      }

      // PDF options
      const opt: any = {
        margin: [8, 8, 8, 8],
        filename: `Booking_${data.grNo || 'new'}_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };

      await html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          document.body.removeChild(container);
          toast.success('PDF downloaded successfully!');
        })
        .catch((err: any) => {
          console.error('PDF generation error:', err);
          document.body.removeChild(container);
          toast.error('Failed to generate PDF');
        });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };
  // ============================================
  // DOWNLOAD PDF FOR A SPECIFIC BOOKING
  // ============================================
  const downloadBookingPDF = (record: BookingRecord) => {
    const data = {
      editMode: false,
      grNo: record.grNo,
      bookingFrom: record.bookingFrom,
      bookingDate: record.bookingDate,
      destination: record.destination,
      bookingType: record.bookingType,
      collectionAt: record.collectionAt,
      serviceProduct: record.serviceProduct,
      deliveryType: record.deliveryType,
      loadType: record.loadType,
      freightOn: record.freightOn || 'CHARGE WEIGHT',
      pvtMarkaSealNo: record.pvtMarkaSealNo || '',
      consignorName: record.consignorName,
      consignorMobile: record.consignorMobile || '',
      consignorGst: record.consignorGst || '',
      consignorPan: record.consignorPan || '',
      consignorAddress: record.consignorAddress || '',
      consignorCity: record.consignorCity || '',
      consignorState: record.consignorState || '',
      consigneeName: record.consigneeName,
      consigneeMobile: record.consigneeMobile || '',
      consigneeGst: record.consigneeGst || '',
      consigneePan: record.consigneePan || '',
      consigneeAddress: record.consigneeAddress || '',
      consigneeCity: record.consigneeCity || '',
      consigneeState: record.consigneeState || '',
      goodsItems: record.goodsItems.map(item => ({
        ...item,
        contentCategory: item.contentCategory || item.content || ''
      })),
      invoices: record.invoices || [],
      totalPckgs: record.totalPckgs,
      totalActualWeight: record.totalActualWeight,
      totalChargeWeight: record.totalChargeWeight,
      manualRates: record.manualRates || false,
      calculatedFreight: record.totalFreight || 0,
      gstRate: 0,
      gstAmount: 0,
      totalAmount: 0,
      advanceAmount: 0,
      balanceAmount: 0,
      damageType: record.damageType || [],
      damageReason: record.damageReason || '',
      damageOtherRemark: record.damageOtherRemark || '',
      damagePackageCount: record.damagePackageCount || 0,
      remarks: record.remarks || '',
      roRemarks: record.roRemarks || '',
      billNo: record.billNo || '',
      supplementaryBillNo: record.supplementaryBillNo || '',
      insuranceCoveredBy: record.insuranceCoveredBy || '',
      insuranceNo: record.insuranceNo || '',
      insuranceCompany: record.insuranceCompany || '',
      insuranceDate: record.insuranceDate || new Date(),
    };
    generatePDFFromData(data);
  };

  // Stats
  const activeStats = { total: stats.active.count, totalFreight: stats.active.totalFreight };
  const cancelledStats = { total: stats.cancelled.count, totalFreight: stats.cancelled.totalFreight };

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const paginatedResults = searchResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const cancelledTotalPages = Math.ceil(cancelledSearchResults.length / itemsPerPage);
  const paginatedCancelledResults = cancelledSearchResults.slice((cancelledCurrentPage - 1) * itemsPerPage, cancelledCurrentPage * itemsPerPage);
  const goToCancelledPage = (page: number) => setCancelledCurrentPage(Math.max(1, Math.min(page, cancelledTotalPages)));

  // ========== RENDER ==========
  return (
    <div className="space-y-4 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">BOOKING GRL MANUAL</h1>
            </div>
          </div>
          <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />New Booking
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b bg-white rounded-t-lg">
        <button
          onClick={() => { setMainTab("active"); loadBookings(); }}
          className={cn("px-6 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
            mainTab === "active" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100")}
        >
          Active Bookings
        </button>
        <button
          onClick={() => { setMainTab("cancelled"); loadCancelledBookings(); }}
          className={cn("px-6 py-2.5 text-sm font-medium rounded-t-lg transition-colors",
            mainTab === "cancelled" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-100")}
        >
          Cancelled Bookings
        </button>
      </div>

      {/* Active Tab Content */}
      {mainTab === "active" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Active</p>
                    <p className="text-2xl font-bold">{activeStats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Freight</p>
                    <p className="text-2xl font-bold">₹{activeStats.totalFreight.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm"><Search className="h-4 w-4 inline mr-1" />Search Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <Label className="text-sm">From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 w-full text-sm justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(searchFromDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[10000]">
                      <Calendar mode="single" selected={searchFromDate} onSelect={(d) => d && setSearchFromDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm">To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-9 w-full text-sm justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(searchToDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[10000]">
                      <Calendar mode="single" selected={searchToDate} onSelect={(d) => d && setSearchToDate(d)} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm">GR No.</Label>
                  <Input value={searchGrNo} onChange={(e) => setSearchGrNo(e.target.value)} placeholder="Enter GR Number" className="h-9 text-sm" />
                </div>
                <div>
                  <Label className="text-sm">Branch</Label>
                  <Select value={searchBranch} onValueChange={setSearchBranch}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Branches" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branchOptions.map((branch) => (<SelectItem key={branch.value} value={branch.value}>{branch.text}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 items-end">
                  <Button onClick={handleSearch} className="h-9 text-sm bg-blue-600" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
                    Search
                  </Button>
                  <Button onClick={handleClearSearch} variant="outline" className="h-9 text-sm"><RefreshCw className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setViewMode("report")} variant={viewMode === "report" ? "default" : "outline"} size="sm" className="h-8 text-sm">
              <FileText className="h-4 w-4 mr-1" />Report
            </Button>
            <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "default" : "outline"} size="sm" className="h-8 text-sm">
              <Package className="h-4 w-4 mr-1" />Grid
            </Button>
          </div>

          {loading ? (
            <Card><CardContent className="py-12 text-center"><Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin" /><p className="text-gray-500 mt-2">Loading bookings...</p></CardContent></Card>
          ) : viewMode === "report" && searchResults.length > 0 ? (
            <Card><CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-sm p-3">#</TableHead>
                      <TableHead className="text-sm p-3">GR No.</TableHead>
                      <TableHead className="text-sm p-3">Date</TableHead>
                      <TableHead className="text-sm p-3">From</TableHead>
                      <TableHead className="text-sm p-3">To</TableHead>
                      <TableHead className="text-sm p-3">Consignor</TableHead>
                      <TableHead className="text-sm p-3">Consignee</TableHead>
                      <TableHead className="text-sm p-3 text-right">Freight</TableHead>
                      <TableHead className="text-sm p-3 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResults.map((r, idx) => (
                      <TableRow key={r._id} className="hover:bg-gray-50">
                        <TableCell className="text-sm p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</TableCell>
                        <TableCell className="text-sm p-3 font-mono font-bold"><Badge variant="secondary" className="bg-blue-100 text-blue-700">{r.grNo}</Badge></TableCell>
                        <TableCell className="text-sm p-3">{format(new Date(r.bookingDate), "dd-MM-yyyy")}</TableCell>
                        <TableCell className="text-sm p-3">{r.bookingFrom}</TableCell>
                        <TableCell className="text-sm p-3">{r.destination}</TableCell>
                        <TableCell className="text-sm p-3 truncate max-w-[150px]" title={r.consignorName}>{r.consignorName}</TableCell>
                        <TableCell className="text-sm p-3 truncate max-w-[150px]" title={r.consigneeName}>{r.consigneeName}</TableCell>
                        <TableCell className="text-sm p-3 text-right font-semibold">₹{r.totalFreight.toLocaleString()}</TableCell>
                        <TableCell className="text-sm p-3 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(r)} className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => openCancelDialog(r)} className="h-8 w-8 p-0 text-orange-500 hover:text-orange-700 hover:bg-orange-50"><X className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r._id!)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                            {/* DOWNLOAD BUTTON */}
                            <Button variant="ghost" size="sm" onClick={() => downloadBookingPDF(r)} className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50" title="Download PDF"><Download className="h-4 w-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (<div className="flex justify-center gap-2 p-4 border-t"><Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Previous</Button><span className="px-4 py-2 text-sm">Page {currentPage} of {totalPages}</span><Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button></div>)}
            </CardContent></Card>
          ) : searchResults.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><FileText className="h-12 w-12 mx-auto text-gray-400" /><p className="text-gray-500 mt-2">No active bookings found</p></CardContent></Card>
          ) : null}
        </>
      )}

      {/* Cancelled Tab Content */}
      {mainTab === "cancelled" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white"><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm opacity-90">Total Cancelled</p><p className="text-2xl font-bold">{cancelledStats.total}</p></div><X className="h-8 w-8 opacity-80" /></div></CardContent></Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"><CardContent className="p-4"><div className="flex justify-between"><div><p className="text-sm opacity-90">Freight Lost</p><p className="text-2xl font-bold">₹{cancelledStats.totalFreight.toLocaleString()}</p></div><DollarSign className="h-8 w-8 opacity-80" /></div></CardContent></Card>
          </div>

          <Card><CardHeader><CardTitle className="text-sm"><Search className="h-4 w-4 inline mr-1" />Search Cancelled Bookings</CardTitle></CardHeader><CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div><Label className="text-sm">From Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full text-sm justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(searchFromDate, "dd-MM-yyyy")}</Button></PopoverTrigger><PopoverContent className="z-[10000]"><Calendar mode="single" selected={searchFromDate} onSelect={(d) => d && setSearchFromDate(d)} /></PopoverContent></Popover></div>
              <div><Label className="text-sm">To Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full text-sm justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(searchToDate, "dd-MM-yyyy")}</Button></PopoverTrigger><PopoverContent className="z-[10000]"><Calendar mode="single" selected={searchToDate} onSelect={(d) => d && setSearchToDate(d)} /></PopoverContent></Popover></div>
              <div><Label className="text-sm">GR No.</Label><Input value={searchGrNo} onChange={(e) => setSearchGrNo(e.target.value)} className="h-9 text-sm" /></div>
              <div><Label className="text-sm">Branch</Label><Select value={searchBranch} onValueChange={setSearchBranch}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="All Branches" /></SelectTrigger><SelectContent><SelectItem value="all">All Branches</SelectItem>{branchOptions.map((branch) => (<SelectItem key={branch.value} value={branch.value}>{branch.text}</SelectItem>))}</SelectContent></Select></div>
              <div className="flex gap-2 items-end"><Button onClick={handleCancelledSearch} className="h-9 text-sm bg-red-600" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}Search</Button><Button onClick={handleClearSearch} variant="outline" className="h-9 text-sm"><RefreshCw className="h-4 w-4" /></Button></div>
            </div>
          </CardContent></Card>

          {loading ? (<Card><CardContent className="py-12 text-center"><Loader2 className="h-12 w-12 mx-auto text-red-500 animate-spin" /><p className="text-gray-500 mt-2">Loading cancelled bookings...</p></CardContent></Card>
          ) : cancelledSearchResults.length > 0 ? (
            <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead className="text-sm p-3">#</TableHead><TableHead className="text-sm p-3">GR No.</TableHead><TableHead className="text-sm p-3">Date</TableHead><TableHead className="text-sm p-3">From</TableHead><TableHead className="text-sm p-3">To</TableHead><TableHead className="text-sm p-3">Consignor</TableHead><TableHead className="text-sm p-3">Consignee</TableHead><TableHead className="text-sm p-3 text-right">Freight</TableHead><TableHead className="text-sm p-3">Cancel Date</TableHead><TableHead className="text-sm p-3">Reason</TableHead><TableHead className="text-sm p-3 text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{paginatedCancelledResults.map((r, idx) => (<TableRow key={r._id} className="bg-red-50/30 hover:bg-red-50"><TableCell className="text-sm p-3">{(cancelledCurrentPage - 1) * itemsPerPage + idx + 1}</TableCell><TableCell className="text-sm p-3"><Badge variant="secondary" className="bg-red-100 text-red-700">{r.grNo}</Badge></TableCell><TableCell className="text-sm p-3">{format(new Date(r.bookingDate), "dd-MM-yyyy")}</TableCell><TableCell className="text-sm p-3">{r.bookingFrom}</TableCell><TableCell className="text-sm p-3">{r.destination}</TableCell><TableCell className="text-sm p-3 truncate max-w-[150px]">{r.consignorName}</TableCell><TableCell className="text-sm p-3 truncate max-w-[150px]">{r.consigneeName}</TableCell><TableCell className="text-sm p-3 text-right">₹{r.totalFreight.toLocaleString()}</TableCell><TableCell className="text-sm p-3">{r.cancelledDate ? format(new Date(r.cancelledDate), "dd-MM-yyyy") : "-"}</TableCell><TableCell className="text-sm p-3 truncate max-w-[150px]" title={r.cancelledReason}>{r.cancelledReason}</TableCell><TableCell className="text-sm p-3 text-center">
              <div className="flex gap-1 justify-center">
                <Button variant="ghost" size="sm" onClick={() => handleRestoreBooking(r)} className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-50" title="Restore Booking"><RefreshCw className="h-4 w-4" /></Button>
                {/* DOWNLOAD BUTTON IN CANCELLED */}
                <Button variant="ghost" size="sm" onClick={() => downloadBookingPDF(r)} className="h-8 w-8 p-0 text-purple-500 hover:text-purple-700 hover:bg-purple-50" title="Download PDF"><Download className="h-4 w-4" /></Button>
              </div>
            </TableCell></TableRow>))}</TableBody></Table></div>
              {cancelledTotalPages > 1 && (<div className="flex justify-center gap-2 p-4 border-t"><Button variant="outline" size="sm" onClick={() => goToCancelledPage(cancelledCurrentPage - 1)} disabled={cancelledCurrentPage === 1}>Previous</Button><span className="px-4 py-2 text-sm">Page {cancelledCurrentPage} of {cancelledTotalPages}</span><Button variant="outline" size="sm" onClick={() => goToCancelledPage(cancelledCurrentPage + 1)} disabled={cancelledCurrentPage === cancelledTotalPages}>Next</Button></div>)}
            </CardContent></Card>
          ) : (<Card><CardContent className="py-12 text-center"><X className="h-12 w-12 mx-auto text-gray-400" /><p className="text-gray-500 mt-2">No cancelled bookings found</p></CardContent></Card>)}
        </>
      )}

      {/* Cancel Dialog */}
      <Dialog open={isCancelledDialogOpen} onOpenChange={setIsCancelledDialogOpen}>
        <DialogContent className="z-[9999]"><DialogHeader><DialogTitle className="text-red-600 flex items-center gap-2"><X className="h-5 w-5" />Cancel Booking</DialogTitle><DialogDescription>Are you sure you want to cancel {cancellingBooking?.grNo}?</DialogDescription></DialogHeader>
          <div className="py-4"><Label className="text-sm font-semibold">Cancellation Reason *</Label><Select value={cancelledReason} onValueChange={setCancelledReason}><SelectTrigger className="mt-2"><SelectValue placeholder="Select cancellation reason" /></SelectTrigger><SelectContent>{cancelledReasonOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCancelledDialogOpen(false)}>No, Keep</Button><Button variant="destructive" onClick={handleCancelBooking} disabled={loading}>{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}Yes, Cancel</Button></DialogFooter></DialogContent>
      </Dialog>

      {/* New Consignor Dialog */}
      <Dialog open={isNewConsignorDialogOpen} onOpenChange={setIsNewConsignorDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto z-[9999]"><DialogHeader><DialogTitle>Add New Consignor</DialogTitle><DialogDescription>Enter consignor details below</DialogDescription></DialogHeader>
          <div className="space-y-3 py-4"><div><Label className="text-sm">Name *</Label><Input value={newClientData.name || ""} onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Mobile No.</Label><Input value={newClientData.mobile || ""} onChange={(e) => setNewClientData({ ...newClientData, mobile: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">GST Number</Label><Input value={newClientData.gstNumber || ""} onChange={(e) => setNewClientData({ ...newClientData, gstNumber: e.target.value })} className="h-9 text-sm uppercase" /></div><div><Label className="text-sm">Adhaar Number</Label><Input value={newClientData.adhaarNumber || ""} onChange={(e) => setNewClientData({ ...newClientData, adhaarNumber: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">PAN Number</Label><Input value={newClientData.panNumber || ""} onChange={(e) => setNewClientData({ ...newClientData, panNumber: e.target.value })} className="h-9 text-sm uppercase" /></div><div><Label className="text-sm">Email</Label><Input value={newClientData.email || ""} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Address</Label><Input value={newClientData.address || ""} onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">City</Label><Input value={newClientData.city || ""} onChange={(e) => setNewClientData({ ...newClientData, city: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">State</Label><Input value={newClientData.state || ""} onChange={(e) => setNewClientData({ ...newClientData, state: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Dealer Code</Label><Input value={newClientData.dealerCode || ""} onChange={(e) => setNewClientData({ ...newClientData, dealerCode: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">IEC Code</Label><Input value={newClientData.iecCode || ""} onChange={(e) => setNewClientData({ ...newClientData, iecCode: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Bank AD No.</Label><Input value={newClientData.bankAdNo || ""} onChange={(e) => setNewClientData({ ...newClientData, bankAdNo: e.target.value })} className="h-9 text-sm" /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsNewConsignorDialogOpen(false)}>Cancel</Button><Button onClick={() => addNewClient("consignor")} className="bg-blue-600" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Consignor</Button></DialogFooter></DialogContent>
      </Dialog>

      {/* New Consignee Dialog */}
      <Dialog open={isNewConsigneeDialogOpen} onOpenChange={setIsNewConsigneeDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto z-[9999]"><DialogHeader><DialogTitle>Add New Consignee</DialogTitle><DialogDescription>Enter consignee details below</DialogDescription></DialogHeader>
          <div className="space-y-3 py-4"><div><Label className="text-sm">Name *</Label><Input value={newClientData.name || ""} onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Mobile No.</Label><Input value={newClientData.mobile || ""} onChange={(e) => setNewClientData({ ...newClientData, mobile: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">GST Number</Label><Input value={newClientData.gstNumber || ""} onChange={(e) => setNewClientData({ ...newClientData, gstNumber: e.target.value })} className="h-9 text-sm uppercase" /></div><div><Label className="text-sm">Adhaar Number</Label><Input value={newClientData.adhaarNumber || ""} onChange={(e) => setNewClientData({ ...newClientData, adhaarNumber: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">PAN Number</Label><Input value={newClientData.panNumber || ""} onChange={(e) => setNewClientData({ ...newClientData, panNumber: e.target.value })} className="h-9 text-sm uppercase" /></div><div><Label className="text-sm">Email</Label><Input value={newClientData.email || ""} onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Address</Label><Input value={newClientData.address || ""} onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">City</Label><Input value={newClientData.city || ""} onChange={(e) => setNewClientData({ ...newClientData, city: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">State</Label><Input value={newClientData.state || ""} onChange={(e) => setNewClientData({ ...newClientData, state: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">Dealer Code</Label><Input value={newClientData.dealerCode || ""} onChange={(e) => setNewClientData({ ...newClientData, dealerCode: e.target.value })} className="h-9 text-sm" /></div><div><Label className="text-sm">IEC Code</Label><Input value={newClientData.iecCode || ""} onChange={(e) => setNewClientData({ ...newClientData, iecCode: e.target.value })} className="h-9 text-sm" /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsNewConsigneeDialogOpen(false)}>Cancel</Button><Button onClick={() => addNewClient("consignee")} className="bg-blue-600" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add Consignee</Button></DialogFooter></DialogContent>
      </Dialog>

      {/* Main Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="w-screen max-w-screen h-screen max-h-screen p-0 m-0 rounded-none overflow-hidden flex flex-col bg-white">
          <DialogHeader className="sticky top-0 bg-white z-10 px-6 pt-6 pt-4 border-b shrink-0">
            <DialogTitle className="text-xl">{editMode ? "Edit Booking" : "Create New Booking"}</DialogTitle>
            <DialogDescription>Fill in all booking details below.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Basic Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-blue-600"><FileText className="h-5 w-5" /> Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div><Label className="text-sm">GR # <span className="text-red-500">*</span></Label><Input value={grNo} onChange={(e) => setGrNo(e.target.value)} className="h-9 text-sm" placeholder="Enter GR Number" disabled={editMode} /></div>
                <div><Label className="text-sm">Booking From <span className="text-red-500">*</span></Label><Input value={bookingFrom} onChange={(e) => setBookingFrom(e.target.value)} className="h-9 text-sm bg-gray-100" readOnly disabled /></div>
                <div><Label className="text-sm">Booking Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full text-sm justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(bookingDate, "dd-MM-yyyy")}</Button></PopoverTrigger><PopoverContent className="z-[10000]"><Calendar mode="single" selected={bookingDate} onSelect={(d) => d && setBookingDate(d)} /></PopoverContent></Popover></div>
                <div><Label className="text-sm">Destination <span className="text-red-500">*</span></Label><Select value={destination} onValueChange={setDestination}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select Destination" /></SelectTrigger><SelectContent>{destinationOptions.map((option) => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}</SelectContent></Select></div>
                {/* POINT 1: Pickup From Disabled */}
                <div><Label className="text-sm">Pickup From</Label><Input value={pickupFrom} onChange={(e) => setPickupFrom(e.target.value)} className="h-9 text-sm bg-gray-100" disabled /></div>
                {/* POINT 1: Delivery Point Disabled */}
                <div><Label className="text-sm">Delivery Point</Label><Input value={deliveryPoint} onChange={(e) => setDeliveryPoint(e.target.value)} className="h-9 text-sm bg-gray-100" disabled /></div>
                {/* POINT 2: Booking Type Default "TOPAY" */}
                <div><Label className="text-sm">Booking Type <span className="text-red-500">*</span></Label><Select value={bookingType} onValueChange={setBookingType}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent>{bookingTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label className="text-sm">Collection At <span className="text-red-500">*</span></Label><Input value={collectionAt} onChange={(e) => setCollectionAt(e.target.value)} className="h-9 text-sm" /></div>
                <div><Label className="text-sm">Pvt Marka/Seal No</Label><Input value={pvtMarkaSealNo} onChange={(e) => setPvtMarkaSealNo(e.target.value)} className="h-9 text-sm" /></div>
                {/* POINT 6: Service Product LOCKED - SURFACE Default */}
                <div><Label className="text-sm">Service/Product <span className="text-red-500">*</span></Label>
                  <Select value={serviceProduct} onValueChange={setServiceProduct} disabled>
                    <SelectTrigger className="h-9 text-sm bg-gray-100">
                      <SelectValue placeholder="SURFACE" />
                    </SelectTrigger>
                    <SelectContent>{serviceProductOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {/* POINT 7: Delivery Type - GODOWN Default, DOOR DELIVERY instead of PICKUP */}
                <div><Label className="text-sm">Delivery Type <span className="text-red-500">*</span></Label><Select value={deliveryType} onValueChange={setDeliveryType}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent>{deliveryTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
                {/* POINT 8: Load Type Default "PART LOAD" */}
                <div><Label className="text-sm">Load Type <span className="text-red-500">*</span></Label><Select value={loadType} onValueChange={setLoadType}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent>{loadTypeOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
                {/* POINT 9: MKT Executive LOCKED */}
                <div><Label className="text-sm">MKT. Executive</Label><Input value={mkExecutive} onChange={(e) => setMkExecutive(e.target.value)} className="h-9 text-sm bg-gray-100" disabled /></div>
                <div><Label className="text-sm">Freight On</Label><Select value={freightOn} onValueChange={setFreightOn}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent>{freightOnOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
            </div>

            {/* Consignor Details */}
            <div className="border rounded-lg p-4 bg-blue-50/30">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-blue-700">
                <Building className="h-5 w-5" /> Consignor Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-sm">Select ID Type</Label>
                  <Select value={consignorIdType} onValueChange={setConsignorIdType}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="SELECT" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypeOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {consignorIdType !== "Self" && consignorIdType !== "" && (
                  <div className="relative">
                    <Label className="text-sm">Enter ID Value / Name</Label>
                    <Input
                      value={consignorIdValue}
                      onChange={(e) => handleConsignorNameSearch(e.target.value)}
                      placeholder="Enter GST/Adhaar/PAN or Name"
                      className="h-9 text-sm"
                    />
                    {/* Dropdown for search results */}
                    {showConsignorDropdown && consignorSearchResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {consignorSearchResults.map((client) => (
                          <div
                            key={client._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleConsignorSelect(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-gray-500">
                              {client.gstNumber && `GST: ${client.gstNumber}`}
                              {client.mobile && ` | 📱 ${client.mobile}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <Button onClick={handleConsignorSearch} className="h-9 text-sm bg-blue-600">
                    <Search className="h-4 w-4 mr-1" />Search
                  </Button>
                  <Button onClick={handleConsignorAdd} variant="outline" className="h-9 text-sm">
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                </div>
              </div>

              {/* Name and Mobile - Both always visible */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={consignorName}
                    onChange={(e) => setConsignorName(e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Enter Name"
                  />
                </div>
                <div>
                  <Label className="text-sm">Mobile No.</Label>
                  <Input
                    value={consignorMobile}
                    onChange={(e) => setConsignorMobile(e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Enter Mobile Number"
                  />
                </div>
              </div>

              {consignorName === "Self" && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ Self Selected
                </div>
              )}

              {/* Address Toggle */}
              <button
                onClick={() => setIsConsignorAddressOpen(!isConsignorAddressOpen)}
                className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {isConsignorAddressOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                {isConsignorAddressOpen ? "Hide Address Details" : "Show Address Details"}
              </button>

              {isConsignorAddressOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 rounded border">
                  <div><Label className="text-sm">Address</Label><Input value={consignorAddress} onChange={(e) => setConsignorAddress(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">City</Label><Input value={consignorCity} onChange={(e) => setConsignorCity(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">State</Label><Input value={consignorState} onChange={(e) => setConsignorState(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">Dealer Code</Label><Input value={consignorCode} onChange={(e) => setConsignorCode(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">IEC Code</Label><Input value={consignorIec} onChange={(e) => setConsignorIec(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">Bank AD No.</Label><Input value={consignorBankAd} onChange={(e) => setConsignorBankAd(e.target.value)} className="h-9 text-sm" /></div>
                </div>
              )}
            </div>


            {/* Consignee Details */}
            <div className="border rounded-lg p-4 bg-green-50/30">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-green-700">
                <Users className="h-5 w-5" /> Consignee Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-sm">Select ID Type</Label>
                  <Select value={consigneeIdType} onValueChange={setConsigneeIdType}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="SELECT" />
                    </SelectTrigger>
                    <SelectContent>
                      {idTypeOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {consigneeIdType !== "Self" && consigneeIdType !== "" && (
                  <div className="relative">
                    <Label className="text-sm">Enter ID Value / Name</Label>
                    <Input
                      value={consigneeIdValue}
                      onChange={(e) => handleConsigneeNameSearch(e.target.value)}
                      placeholder="Enter GST/Adhaar/PAN or Name"
                      className="h-9 text-sm"
                    />
                    {/* Dropdown for search results */}
                    {showConsigneeDropdown && consigneeSearchResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {consigneeSearchResults.map((client) => (
                          <div
                            key={client._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleConsigneeSelect(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-gray-500">
                              {client.gstNumber && `GST: ${client.gstNumber}`}
                              {client.mobile && ` | 📱 ${client.mobile}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <Button onClick={handleConsigneeSearch} className="h-9 text-sm bg-green-600">
                    <Search className="h-4 w-4 mr-1" />Search
                  </Button>
                  <Button onClick={handleConsigneeAdd} variant="outline" className="h-9 text-sm">
                    <Plus className="h-4 w-4 mr-1" />Add
                  </Button>
                </div>
              </div>

              {/* Name and Mobile - Both always visible for Self and others */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-sm">Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Enter Name"
                  />
                </div>
                <div>
                  <Label className="text-sm">Mobile No.</Label>
                  <Input
                    value={consigneeMobile}
                    onChange={(e) => setConsigneeMobile(e.target.value)}
                    className="h-9 text-sm"
                    placeholder="Enter Mobile Number"
                  />
                </div>
              </div>

              {consigneeName === "Self" && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ Self Selected
                </div>
              )}

              {/* Address Toggle */}
              <button
                onClick={() => setIsConsigneeAddressOpen(!isConsigneeAddressOpen)}
                className="mt-3 flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
              >
                {isConsigneeAddressOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                {isConsigneeAddressOpen ? "Hide Address Details" : "Show Address Details"}
              </button>

              {isConsigneeAddressOpen && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 rounded border">
                  <div><Label className="text-sm">Address</Label><Input value={consigneeAddress} onChange={(e) => setConsigneeAddress(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">City</Label><Input value={consigneeCity} onChange={(e) => setConsigneeCity(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">State</Label><Input value={consigneeState} onChange={(e) => setConsigneeState(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">Dealer Code</Label><Input value={consigneeCode} onChange={(e) => setConsigneeCode(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">IEC Code</Label><Input value={consigneeIec} onChange={(e) => setConsigneeIec(e.target.value)} className="h-9 text-sm" /></div>
                  <div><Label className="text-sm">Bank AD No.</Label><Input value={consigneeBankAd} onChange={(e) => setConsigneeBankAd(e.target.value)} className="h-9 text-sm" /></div>
                </div>
              )}
            </div>

            {/* Goods Details Section */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center"><h3 className="text-base font-semibold flex items-center gap-2"><Package className="h-5 w-5" /> GOODS DETAILS</h3><Button onClick={addGoodsRow} variant="ghost" size="sm" className="h-8 text-sm"><Plus className="mr-1 h-4 w-4" />ADD GOODS</Button></div>
              <div className="overflow-x-auto p-4">
                <div className="overflow-x-auto p-4 max-h-[300px] overflow-y-auto">
                  <Table><TableHeader><TableRow className="bg-gray-50"><TableHead className="text-sm w-12">#</TableHead><TableHead className="text-sm">No Of Pckgs</TableHead><TableHead className="text-sm">Content Category</TableHead><TableHead className="text-sm">Content (Sub)</TableHead><TableHead className="text-sm">Packing</TableHead><TableHead className="text-sm">Actual Weight</TableHead><TableHead className="text-sm">Charge Weight</TableHead><TableHead className="text-sm">Status</TableHead><TableHead className="text-sm w-12">Action</TableHead></TableRow></TableHeader>
                    <TableBody>{goodsItems.map((item, idx) => {
                      const selectedCategory = contentCategories.find(c => c.id === Number(item.contentCategory));
                      return (
                        <TableRow key={item.id} className={!item.isWeightValid ? "bg-red-50" : ""}>
                          <TableCell className="text-sm">{idx + 1}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.noOfPckgs || ""}
                              onChange={(e) => handleNumberChange(e, (val) => updateGoodsItem(item.id, "noOfPckgs", val))}
                              className="h-8 w-24 text-sm"
                              min="0"
                              placeholder="0"
                            />
                          </TableCell>
                          {/* POINT 12: Content Category with Search */}
                          {/* Content Category with Search - COMPLETE FIXED */}
                          <TableCell className="relative min-w-[180px]">
                            <div className="relative">
                              <Input
                                value={contentCategorySearch || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setContentCategorySearch(value);
                                  if (value.length >= 1) {
                                    const filtered = contentCategories.filter(cat =>
                                      cat.name.toLowerCase().includes(value.toLowerCase())
                                    );
                                    setContentCategoryResults(filtered);
                                    setShowContentCategoryDropdown(true);
                                  } else {
                                    setContentCategoryResults([]);
                                    setShowContentCategoryDropdown(false);
                                    // Clear the category from goods item when search is empty
                                    setGoodsItems(prevItems =>
                                      prevItems.map(item => ({
                                        ...item,
                                        contentCategory: "",
                                        content: "",
                                        contentSubCategory: ""
                                      }))
                                    );
                                  }
                                }}
                                className="h-8 w-32 text-sm pr-7"
                                placeholder="Search category..."
                              />
                              {/* Clear button */}
                              {contentCategorySearch && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContentCategorySearch("");
                                    setContentCategoryResults([]);
                                    setShowContentCategoryDropdown(false);
                                    // Clear the category from goods item
                                    setGoodsItems(prevItems =>
                                      prevItems.map(item => ({
                                        ...item,
                                        contentCategory: "",
                                        content: "",
                                        contentSubCategory: ""
                                      }))
                                    );
                                  }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>

                            {showContentCategoryDropdown && contentCategoryResults.length > 0 && (
                              <div className="absolute z-50 mt-1 w-64 bg-white border rounded-md shadow-lg max-h-40 overflow-auto">
                                {contentCategoryResults.map((cat) => (
                                  <div
                                    key={cat.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-sm"
                                    onClick={() => handleContentCategorySelect(cat)}
                                  >
                                    {cat.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          {/* POINT 13: Content (Sub) LOCKED */}
                          <TableCell>
                            <Select
                              value={item.contentSubCategory}
                              onValueChange={(val) => updateGoodsItem(item.id, "contentSubCategory", val)}
                              disabled
                            >
                              <SelectTrigger className="h-8 w-32 text-sm bg-gray-100">
                                <SelectValue placeholder="Locked" />
                              </SelectTrigger>
                            </Select>
                          </TableCell>
                          {/* POINT 14: Packing LOCKED */}
                          <TableCell>
                            <Select
                              value={item.packing}
                              onValueChange={(val) => updateGoodsItem(item.id, "packing", val)}
                              disabled
                            >
                              <SelectTrigger className="h-8 w-28 text-sm bg-gray-100">
                                <SelectValue placeholder="Locked" />
                              </SelectTrigger>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.actualWeight || ""}
                              onChange={(e) => handleNumberChange(e, (val) => updateGoodsItem(item.id, "actualWeight", val))}
                              className="h-8 w-24 text-sm"
                              step="0.01"
                              min="0"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.chargeWeight || ""}
                              onChange={(e) => handleNumberChange(e, (val) => updateGoodsItem(item.id, "chargeWeight", val))}
                              className="h-8 w-24 text-sm"
                              step="0.01"
                              min="0"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>{!item.isWeightValid && <span className="text-red-500 text-sm flex items-center gap-1"><AlertCircle className="h-4 w-4" />{item.weightError?.substring(0, 40)}</span>}{item.isWeightValid && item.chargeWeight > 0 && <span className="text-green-500 text-sm flex items-center gap-1"><CheckCircle className="h-4 w-4" />Valid</span>}</TableCell>
                          <TableCell><Button variant="ghost" size="sm" onClick={() => removeGoodsRow(item.id)} disabled={goodsItems.length === 1} className="h-8 w-8 p-0 text-red-500"><Trash2 className="h-4 w-4" /></Button></TableCell>
                        </TableRow>
                      );
                    })}</TableBody>
                  </Table>
                </div>
              </div>
              <div className="p-3 bg-gray-50 flex flex-wrap gap-4 justify-between items-center border-t"><div className="flex flex-wrap gap-4 items-center"><span className="text-sm font-medium">Total Pckgs: <strong className="text-blue-600">{totalPckgs}</strong></span><span className="text-sm font-medium">Total Actual Weight: <strong className="text-blue-600">{totalActualWeight.toFixed(2)} kg</strong></span><span className="text-sm font-medium">Total Charge Weight: <strong className="text-blue-600">{totalChargeWeight.toFixed(2)} kg</strong></span>{!manualRates && (<span className="text-sm font-medium">Total Freight: <strong className="text-green-600">₹{(totalChargeWeight * 5).toFixed(2)}</strong></span>)}</div><div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={manualRates} onChange={(e) => setManualRates(e.target.checked)} className="h-4 w-4 rounded" /><span className="text-sm font-medium">Manual Rates</span></label></div></div>
            </div>

            {/* POINT 15: Manual Rates Section - Only show when manualRates is true */}
            {manualRates && (
              <div className="border rounded-lg p-3 bg-yellow-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2"><div className="flex items-center gap-2"><Label className="text-xs font-medium">Rate (per kg/pkg):</Label><Input type="number" value={freightRate || ""} onChange={(e) => handleNumberChange(e, setFreightRate)} className="h-7 text-xs w-28" step="0.01" placeholder="0" /><Button onClick={handleClearFreight} variant="outline" size="sm" className="h-7 text-xs px-2">CLEAR</Button></div><div className="flex items-center gap-2"><Label className="text-xs font-medium">Charge Wt:</Label><Input type="number" value={totalChargeWeight || ""} readOnly className="h-7 text-xs w-28 bg-gray-50" /></div><div className="flex items-center gap-2"><Label className="text-xs font-medium">Freight:</Label><Input type="number" value={calculatedFreight || ""} readOnly className="h-7 text-xs w-28 font-bold text-green-600 bg-green-50" /></div></div>
                  <div className="col-span-1"><Table className="text-xs"><TableHeader><TableRow className="bg-gray-50"><TableHead className="text-xs p-1">Charges</TableHead><TableHead className="text-xs p-1 text-center w-16">Rate</TableHead><TableHead className="text-xs p-1 text-right w-20">Amount</TableHead></TableRow></TableHeader><TableBody>{extraCharges.map((charge) => (<TableRow key={charge.id} className="text-xs"><TableCell className="text-xs p-1">{charge.name}</TableCell><TableCell className="p-1"><Input type="number" value={charge.rate || ""} onChange={(e) => handleNumberChange(e, (val) => updateExtraCharge(charge.id, val))} className="h-7 w-20 text-xs" step="0.01" placeholder="0" /></TableCell><TableCell className="text-xs p-1 text-right">₹{charge.amount.toFixed(0)}</TableCell></TableRow>))}</TableBody></Table></div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between"><Label className="text-xs">GST Paid By:</Label><Select value={gstPaidBy} onValueChange={setGstPaidBy}><SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent>{gstPaidByOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}</SelectContent></Select></div>
                    <div className="flex items-center justify-between"><Label className="text-xs">GST Rate (%):</Label><Input type="number" value={gstRate || ""} onChange={(e) => handleNumberChange(e, setGstRate)} className="h-7 w-20 text-xs" step="0.01" placeholder="0" /></div>
                    <div className="border-t pt-1 mt-1">
                      <div className="flex justify-between text-xs"><span>SubTotal:</span><span className="font-semibold">₹{subTotal.toFixed(0)}</span></div>
                      <div className="flex justify-between text-xs"><span>GST ({gstRate}%):</span><span>₹{gstAmount.toFixed(0)}</span></div>
                      {/* POINT 15: Total Amount Show Only in Manual Rates */}
                      <div className="flex justify-between text-xs font-bold text-green-600"><span>Total:</span><span>₹{totalAmount.toFixed(0)}</span></div>
                      <div className="flex justify-between items-center text-xs mt-1"><span>Advance:</span><Input type="number" value={advanceAmount || ""} onChange={(e) => handleNumberChange(e, setAdvanceAmount)} className="h-7 w-24 text-xs text-right" step="0.01" placeholder="0" /></div>
                      <div className="flex justify-between text-xs font-bold text-blue-600 border-t pt-1 mt-1"><span>Balance:</span><span>₹{balanceAmount.toFixed(0)}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Damage/Missing Section */}
            <div className="border rounded-lg p-4 bg-red-50/20">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" /> Damage/Missing at the time of booking
              </h3>

              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Select Damage/Missing Type:</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={damageType.includes("damaged")} onChange={() => handleDamageTypeChange("damaged")} className="h-4 w-4 rounded" />
                    <span className="text-sm">Damaged</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={damageType.includes("missing")} onChange={() => handleDamageTypeChange("missing")} className="h-4 w-4 rounded" />
                    <span className="text-sm">Missing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={damageType.includes("both")} onChange={() => handleDamageTypeChange("both")} className="h-4 w-4 rounded" />
                    <span className="text-sm">Both</span>
                  </label>
                </div>
              </div>

              {damageType.length > 0 && (
                <>
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Reason <span className="text-red-500">*</span></Label>
                    <Select value={damageReason} onValueChange={handleDamageReasonChange}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason" /></SelectTrigger>
                      <SelectContent>{damageReasonOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select>
                    {validationErrors.damageReason && <p className="text-red-500 text-xs mt-1">{validationErrors.damageReason}</p>}
                  </div>

                  {damageReason === "Other (specify)" && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Please specify <span className="text-red-500">*</span></Label>
                      <Textarea value={damageOtherRemark} onChange={(e) => setDamageOtherRemark(e.target.value)} placeholder="Describe the issue in detail..." rows={2} className="mt-1" />
                      {validationErrors.damageOtherRemark && <p className="text-red-500 text-xs mt-1">{validationErrors.damageOtherRemark}</p>}
                    </div>
                  )}

                  <div className="mb-4">
                    <Label className="text-sm font-medium">Number of Damaged/Missing Packages <span className="text-red-500">*</span></Label>
                    <Input type="number" value={damagePackageCount || ""} onChange={(e) => handleDamagePackageCountChange(e.target.value)} placeholder={`Enter count (Max: ${totalPckgs})`} className="mt-1 w-32" min="1" max={totalPckgs} />
                    {damagePackageError && <p className="text-red-500 text-xs mt-1">{damagePackageError}</p>}
                    {validationErrors.damagePackageCount && <p className="text-red-500 text-xs mt-1">{validationErrors.damagePackageCount}</p>}
                    <p className="text-xs text-gray-500 mt-1">Total packages in this booking: <strong>{totalPckgs}</strong></p>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium">Remark <span className="text-red-500">*</span></Label>
                    <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks about damage/missing condition..." rows={2} className="mt-1" />
                    {validationErrors.remarks && <p className="text-red-500 text-xs mt-1">{validationErrors.remarks}</p>}
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium">Upload Damage Photos <span className="text-red-500">* (Min: 1, Max: 10, Max 5MB each)</span></Label>
                    <div className="mt-2">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-9">
                        <Camera className="h-4 w-4 mr-2" />Select Photos (JPG, PNG, WEBP)
                      </Button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoUpload} className="hidden" />
                    </div>
                    {damagePhotos.length > 0 && (<div className="flex flex-wrap gap-3 mt-3">{damagePhotos.map((photo, idx) => (<div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden group bg-gray-100"><img src={photo} alt={`Damage ${idx + 1}`} className="w-full h-full object-cover" /><button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"><X className="h-3 w-3" /></button></div>))}</div>)}
                    {validationErrors.damagePhotos && <p className="text-red-500 text-xs mt-1">{validationErrors.damagePhotos}</p>}
                    <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, WEBP. Max 5MB per photo. Click X to remove.</p>
                  </div>

                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Voice Note <span className="text-red-500">*</span></Label>
                    {!isRecording && !voiceNoteUrl && (<Button type="button" onClick={startRecording} variant="outline" className="h-10 bg-blue-50 hover:bg-blue-100 border-blue-300"><Mic className="h-4 w-4 mr-2" />Start Recording (Max 2 min)</Button>)}
                    {isRecording && (<div className="space-y-2 p-3 bg-red-50 rounded-lg border border-red-200"><Button type="button" onClick={stopRecording} variant="destructive" className="h-10 w-full animate-pulse"><MicOff className="h-4 w-4 mr-2" />■ Stop Recording ({formatDuration(recordingDuration)})</Button><p className="text-xs text-red-600 text-center">Recording in progress... Please speak clearly</p></div>)}
                    {voiceNoteUrl && !isRecording && (<div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200"><div className="flex items-center gap-3 flex-wrap"><audio controls src={voiceNoteUrl} className="h-10 flex-1 min-w-[200px]" onError={() => { toast.error("Audio playback error"); deleteVoiceNote(); }} /><div className="flex gap-2"><Button type="button" onClick={() => { deleteVoiceNote(); startRecording(); }} variant="outline" size="sm" className="h-8"><Mic className="h-3 w-3 mr-1" />Re-record</Button><Button type="button" onClick={deleteVoiceNote} variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-3 w-3 mr-1" />Delete</Button></div></div><p className="text-sm font-medium text-green-700">✅ Voice note recorded - Duration: {voiceNoteDuration ? formatDuration(voiceNoteDuration) : "0:00"}</p></div>)}
                    {validationErrors.voiceNote && <p className="text-red-500 text-xs mt-1">{validationErrors.voiceNote}</p>}
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />Tip: Describe the damage verbally - what you see, package condition, any sender remarks (Max 2 minutes)</p>
                  </div>
                </>
              )}
            </div>

            {/* Invoices Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center"><h3 className="text-base font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> INVOICES</h3><div className="flex gap-3 items-center"><label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={ncv} onChange={(e) => setNcv(e.target.checked)} className="h-4 w-4 rounded" /><span className="text-sm">NCV</span></label><Button onClick={addInvoiceRow} variant="ghost" size="sm" className="h-8 text-sm"><Plus className="mr-1 h-4 w-4" />ADD INVOICE</Button></div></div>
              <div className="overflow-x-auto p-4"><Table><TableHeader><TableRow className="bg-gray-50"><TableHead className="text-sm w-12">S#</TableHead><TableHead className="text-sm">Invoice #</TableHead><TableHead className="text-sm">Date</TableHead><TableHead className="text-sm">Value</TableHead><TableHead className="text-sm">Eway Bill #</TableHead><TableHead className="text-sm">Eway Date</TableHead><TableHead className="text-sm">Valid Upto</TableHead><TableHead className="text-sm w-12">Action</TableHead></TableRow></TableHeader><TableBody>{invoices.map((inv, idx) => (<TableRow key={inv.id}><TableCell className="text-sm">{idx + 1}</TableCell><TableCell><Input value={inv.invoiceNo} onChange={(e) => updateInvoice(inv.id, "invoiceNo", e.target.value)} className="h-8 w-28 text-sm" /></TableCell><TableCell><Popover><PopoverTrigger asChild><Button variant="outline" className="h-8 w-28 text-sm justify-start"><CalendarIcon className="mr-1 h-4 w-4" />{format(inv.date, "dd-MM-yyyy")}</Button></PopoverTrigger><PopoverContent className="z-[10000]"><Calendar mode="single" selected={inv.date} onSelect={(d) => d && updateInvoice(inv.id, "date", d)} /></PopoverContent></Popover></TableCell><TableCell><Input value={inv.value} onChange={(e) => updateInvoice(inv.id, "value", e.target.value)} className="h-8 w-24 text-sm" /></TableCell><TableCell><Input value={inv.ewayBillNo} onChange={(e) => updateInvoice(inv.id, "ewayBillNo", e.target.value)} className="h-8 w-28 text-sm" /></TableCell><TableCell><Popover><PopoverTrigger asChild><Button variant="outline" className="h-8 w-28 text-sm justify-start"><CalendarIcon className="mr-1 h-4 w-4" />{format(inv.ewayBillDate, "dd-MM-yyyy")}</Button></PopoverTrigger><PopoverContent className="z-[10000]"><Calendar mode="single" selected={inv.ewayBillDate} onSelect={(d) => d && updateInvoice(inv.id, "ewayBillDate", d)} /></PopoverContent></Popover></TableCell><TableCell><Input value={inv.validUpto} onChange={(e) => updateInvoice(inv.id, "validUpto", e.target.value)} className="h-8 w-24 text-sm" placeholder="Valid upto" /></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => removeInvoice(inv.id)} disabled={invoices.length === 1} className="h-8 w-8 p-0 text-red-500"><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></div>
            </div>

            {/* Remarks & Billing Section */}
            <div className="border rounded-lg p-4"><h3 className="text-base font-semibold mb-3 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Remarks & Billing</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label className="text-sm">Remarks</Label><Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className="text-sm" placeholder="General remarks" /></div><div><Label className="text-sm">RO Remarks</Label><Textarea value={roRemarks} onChange={(e) => setRoRemarks(e.target.value)} rows={2} className="text-sm" placeholder="RO remarks" /></div><div><Label className="text-sm">Bill No</Label><Input value={billNo} onChange={(e) => setBillNo(e.target.value)} className="h-9 text-sm" placeholder="Bill number" /></div><div><Label className="text-sm">Supplementary Bill No</Label><Input value={supplementaryBillNo} onChange={(e) => setSupplementaryBillNo(e.target.value)} className="h-9 text-sm" placeholder="Supplementary bill number" /></div></div></div>

            {/* Insurance Section */}
            <div className="border rounded-lg p-4"><h3 className="text-base font-semibold mb-3 flex items-center gap-2"><Shield className="h-5 w-5" /> Insurance Details</h3><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"><div><Label className="text-sm">Insurance Covered By</Label><Select value={insuranceCoveredBy} onValueChange={setInsuranceCoveredBy}><SelectTrigger className="h-9 text-sm"><SelectValue placeholder="SELECT" /></SelectTrigger><SelectContent>{insuranceCoveredByOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select></div><div><Label className="text-sm">Insurance #</Label><Input value={insuranceNo} onChange={(e) => setInsuranceNo(e.target.value)} className="h-9 text-sm" placeholder="Insurance number" /></div><div><Label className="text-sm">Insurance Date</Label><Popover><PopoverTrigger asChild><Button variant="outline" className="h-9 w-full text-sm justify-start"><CalendarIcon className="mr-2 h-4 w-4" />{format(insuranceDate, "dd-MM-yyyy")}</Button></PopoverTrigger><PopoverContent className="z-[10000]"><Calendar mode="single" selected={insuranceDate} onSelect={(d) => d && setInsuranceDate(d)} /></PopoverContent></Popover></div><div><Label className="text-sm">Insurance Company</Label><Input value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} className="h-9 text-sm" placeholder="Insurance company name" /></div></div></div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap justify-between items-center pt-4 border-t mt-4"><div className="flex gap-4"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={printAfterSave} onChange={(e) => setPrintAfterSave(e.target.checked)} className="h-4 w-4 rounded" /><span className="text-sm">Print After Save</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={ccAttached} onChange={(e) => setCcAttached(e.target.checked)} className="h-4 w-4 rounded" /><span className="text-sm">CC Attached</span></label></div><div className="flex gap-2"><Button variant="outline" onClick={handlePrint} className="h-9 text-sm"><Printer className="mr-1 h-4 w-4" /> Print</Button><Button variant="outline" onClick={handleClear} className="h-9 text-sm"><RefreshCw className="mr-1 h-4 w-4" /> Clear</Button><Button variant="outline" onClick={() => setIsBookingModalOpen(false)} className="h-9 text-sm"><X className="mr-1 h-4 w-4" /> Cancel</Button><Button onClick={handleSave} disabled={loading} className="h-9 text-sm bg-blue-600 hover:bg-blue-700">{loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}{editMode ? "Update" : "Save"}</Button></div></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}