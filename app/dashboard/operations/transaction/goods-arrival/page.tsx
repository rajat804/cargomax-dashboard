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
  Search,
  Printer,
  X,
  Truck,
  Package,
  Clock,
  PlusCircle,
  Trash2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  FileCheck,
  RefreshCw,
  Building,
  Navigation,
  AlertCircle,
  Mic,
  MicOff,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import toast from "react-hot-toast";

// ============================================
// ✅ IMPORT FROM API SERVICE
// ============================================
import {
  getBranches,
  getPendingManifests,
  createGoodsArrival,
  getGoodsArrivals,
  printGoodsArrival,
  exportGoodsArrivals,
  getGoodsArrivalStats,
  cancelGoodsArrival,
  restoreGoodsArrival,
  deleteGoodsArrival,
  searchAnyManifest,
  searchManifestByGR,
  getBookings,
  getManualBookings,
} from "@/services/api";

// ============================================
// TYPES
// ============================================
interface ArrivedRecord {
  _id: string;
  manifestNo: string;
  serArrivalNo: string;
  receiveDate: Date;
  fromStation: string;
  vehicleNo?: string;
  driverName?: string;
  arrivalTotals: {
    totalPckgs: number;
    totalWeight: number;
  };
  arrivalStatus: string;
  status: string;
  remarks?: string;
}

interface PendingManifest {
  _id: string;
  manifestNo: string;
  manifestDate: Date;
  lhcNo?: string;
  branch: string;
  toStation: string;
  modeName: string;
  modeCategory: string;
  noOfPickups: number;
  grossWeight: number;
  vehicleNo?: string;
  driverName?: string;
  driverMobile?: string;
  loadingPerson?: string;
  status?: string;
  assignedGRs?: AssignedGR[];
  arrivalStatus?: string;
}

interface AssignedGR {
  id: string;
  grNo: string;
  grDate: Date;
  consignor: string;
  consignee: string;
  destination: string;
  toPay: number;
  paid: number;
  tbb: number;
  bookedPckgs: number;
  stockPckgs: number;
  dispatchedPckgs: number;
  weight: number;
  bookingId: string;
  bookingType: string;
}

interface GRItem {
  grNo: string;
  grDate: Date;
  origin: string;
  destination: string;
  consignor: string;
  consignee: string;
  despPckgs: number;
  despWt: number;
  receivePckgs: number;
  receiveWt: number;
  damagePcs: number;
  short: number;
  excess: number;
  missingPcs: number;
  issueDescription: string;
  godown: string;
  remarks: string;
}

// ============================================
// OPTIONS
// ============================================
const godownOptions = [
  { value: "U P BORDER A JH UP", label: "U P BORDER A JH UP" },
  { value: "U P BORDER B BR", label: "U P BORDER B BR" },
  { value: "U P BORDER C ASM WB", label: "U P BORDER C ASM WB" },
  { value: "U P BORDER D BR GP", label: "U P BORDER D BR GP" },
];

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

// ============================================
// MAIN COMPONENT
// ============================================
export default function GoodsArrival() {
  // View State
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"pending" | "arrived">("pending");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [isAutoFetching, setIsAutoFetching] = useState(false);

  // Data State
  const [arrivedResults, setArrivedResults] = useState<ArrivedRecord[]>([]);
  const [pendingResults, setPendingResults] = useState<PendingManifest[]>([]);
  const [selectedManifest, setSelectedManifest] = useState<PendingManifest | null>(null);
  const [branchOptions, setBranchOptions] = useState<{ value: string; text: string }[]>([]);
  const [stats, setStats] = useState({
    active: { count: 0, totalFreight: 0, totalPackages: 0, totalDamage: 0 },
    cancelled: { count: 0, totalFreight: 0 },
    damage: { totalDamagePackages: 0, totalShort: 0, totalExcess: 0 }
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    branch: "ALL",
    fromDate: null as Date | null,
    toDate: null as Date | null,
    manifestNo: "",
  });

  // Form State
  const [formData, setFormData] = useState({
    branch: "",
    selectGodown: "",
    manifestNo: "",
    despatchOn: new Date(),
    despatchTime: "",
    fromStation: "",
    modeType: "",
    modeName: "",
    driver: "",
    mobile: "",
    unloadingPerson: "",
    serArrivalNo: "",
    autoArrival: true,
    receiveDate: new Date(),
    receiveTime: "",
    unloadingHours: 0,
    unloadingMinutes: 0,
    route: "",
    tat: 0,
    scheduleArrivalDateTime: new Date(),
    vehicleArrivalDateTime: new Date(),
    unloadingDateTime: new Date(),
    sealNo: "",
    sealOk: true,
    dharamKantaWeight: 0,
    remarks: "",
    linkedManifestId: ""
  });

  // ========== DAMAGE/SHORT SECTION STATES ==========
  const [damageType, setDamageType] = useState<("damaged" | "missing")[]>([]);
  const [shortExcessType, setShortExcessType] = useState<("short" | "excess")[]>([]);
  const [damageReason, setDamageReason] = useState<string>("");
  const [damageOtherRemark, setDamageOtherRemark] = useState<string>("");
  const [damagePackageCount, setDamagePackageCount] = useState<number>(0);
  const [damagePackageError, setDamagePackageError] = useState<string>("");
  const [damagePhotos, setDamagePhotos] = useState<string[]>([]);
  const [damageRemarks, setDamageRemarks] = useState<string>("");
  const [shortDetails, setShortDetails] = useState<string>("");
  const [excessDetails, setExcessDetails] = useState<string>("");
  const [damageValidationErrors, setDamageValidationErrors] = useState<{ [key: string]: string }>({});

  // ========== VOICE NOTE STATES ==========
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | null>(null);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState<number | null>(null);
  const [voiceNoteBase64, setVoiceNoteBase64] = useState<string | null>(null);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalDurationRef = useRef<number>(0);

  // GR Items
  const [grItems, setGrItems] = useState<GRItem[]>([]);

  // GR Search Results
  const [grSearchResults, setGrSearchResults] = useState<any[]>([]);
  const [isGrSearching, setIsGrSearching] = useState(false);
  const [grSearchTerm, setGrSearchTerm] = useState("");

  // Totals
  const [manifestTotals, setManifestTotals] = useState({
    noOfGR: 0,
    totalPckgs: 0,
    totalWeight: 0
  });

  const [arrivalTotals, setArrivalTotals] = useState({
    noOfGR: 0,
    totalPckgs: 0,
    totalWeight: 0,
    damagePckgs: 0,
    totalShort: 0,
    totalExcess: 0,
    totalMissing: 0
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================
  // VOICE NOTE FUNCTIONS - FIXED
  // ============================================
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // ✅ FIXED: deleteVoiceNote without toast
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
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (voiceNoteUrl && voiceNoteUrl.startsWith('blob:')) URL.revokeObjectURL(voiceNoteUrl);
    };
  }, [voiceNoteUrl]);

  // ============================================
  // GR SEARCH FUNCTIONS - FIXED with dropdown
  // ============================================
  const searchGR = async (grNo: string) => {
    if (!grNo || grNo.trim() === "") return [];

    try {
      const results: any[] = [];

      // Search in Computerized Booking
      try {
        const response = await getBookings({ grNo: grNo.trim(), limit: 10 });
        if (response.success && response.data && response.data.length > 0) {
          results.push(...response.data.map((b: any) => ({ ...b, source: 'Computerized' })));
        }
      } catch (e) { }

      // Search in Manual Booking
      try {
        const response = await getManualBookings({ grNo: grNo.trim(), limit: 10 });
        if (response.success && response.data && response.data.length > 0) {
          results.push(...response.data.map((b: any) => ({ ...b, source: 'Manual' })));
        }
      } catch (e) { }

      return results;
    } catch (error) {
      console.error("Error searching GR:", error);
      return [];
    }
  };

  const handleGRSearch = async (value: string) => {
    setGrSearchTerm(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.length < 2) {
      setGrSearchResults([]);
      return;
    }

    setIsGrSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchGR(value);
        setGrSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setGrSearchResults([]);
      } finally {
        setIsGrSearching(false);
      }
    }, 500);
  };

  const selectGR = (booking: any, index: number) => {
    const updated = [...grItems];
    updated[index] = {
      ...updated[index],
      grNo: booking.grNo,
      grDate: booking.bookingDate || new Date(),
      origin: booking.bookingFrom || "",
      destination: booking.destination || "",
      consignor: booking.consignorName || "",
      consignee: booking.consigneeName || "",
      despPckgs: booking.totalPckgs || 0,
      despWt: booking.totalChargeWeight || 0,
    };
    setGrItems(updated);
    setGrSearchResults([]);
    setGrSearchTerm("");
    calculateTotals();
    toast.success(`GR ${booking.grNo} loaded from ${booking.source}!`);
  };

  // ============================================
  // DAMAGE TYPE HANDLERS
  // ============================================
  const handleDamageTypeChange = (type: "damaged" | "missing") => {
    setDamageType(prev => {
      if (prev.includes(type)) {
        const newType = prev.filter(t => t !== type);
        if (newType.length === 0) {
          setDamagePackageCount(0);
          setDamagePackageError("");
          setDamageReason("");
          setDamageOtherRemark("");
          setDamageRemarks("");
          setDamagePhotos([]);
          deleteVoiceNote();
        }
        return newType;
      } else {
        return [...prev, type];
      }
    });
  };

  const handleShortExcessTypeChange = (type: "short" | "excess") => {
    setShortExcessType(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
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

  const handleDamagePackageCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    setDamagePackageCount(count);
    validateDamagePackageCount(count);
  };

  const validateDamagePackageCount = (count: number) => {
    if (damageType.length > 0) {
      if (count < 1) {
        setDamagePackageError("Number of damaged/missing packages must be at least 1");
        return false;
      }
      const totalPckgs = grItems.reduce((sum, item) => sum + (item.receivePckgs || 0), 0);
      if (count > totalPckgs) {
        setDamagePackageError(`Cannot exceed total received packages (${totalPckgs})`);
        return false;
      }
      setDamagePackageError("");
      return true;
    }
    setDamagePackageError("");
    return true;
  };

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

  const validateDamageSection = () => {
    const errors: { [key: string]: string } = {};

    if (damageType.length > 0) {
      if (!damageReason) {
        errors.damageReason = "Please select a damage/missing reason";
      }
      if (damageReason === "Other (specify)" && !damageOtherRemark.trim()) {
        errors.damageOtherRemark = "Please specify the reason";
      }
      if (!damageRemarks.trim()) {
        errors.damageRemarks = "Please add remarks about the damage/missing condition";
      }
      if (damagePackageCount < 1) {
        errors.damagePackageCount = "Number of damaged/missing packages must be at least 1";
      }
      const totalPckgs = grItems.reduce((sum, item) => sum + (item.receivePckgs || 0), 0);
      if (damagePackageCount > totalPckgs) {
        errors.damagePackageCount = `Cannot exceed total received packages (${totalPckgs})`;
      }
      if (damagePhotos.length === 0) {
        errors.damagePhotos = "Please upload at least 1 damage photo";
      }
      if (!voiceNoteBase64 && !voiceNoteUrl) {
        errors.voiceNote = "Please record a voice note describing the damage";
      }
    }

    if (shortExcessType.includes("short") && !shortDetails.trim()) {
      errors.shortDetails = "Please enter details about short packages";
    }
    if (shortExcessType.includes("excess") && !excessDetails.trim()) {
      errors.excessDetails = "Please enter details about excess packages";
    }

    setDamageValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================
  // API CALLS
  // ============================================
  const loadBranches = async () => {
    try {
      const response = await getBranches();
      if (response.success && response.data) {
        setBranchOptions(response.data);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error("Failed to load branches");
    }
  };

  const loadStats = async () => {
    try {
      const response = await getGoodsArrivalStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // ============================================
  // AUTO FETCH MANIFEST
  // ============================================
  const autoFetchManifest = async (searchValue: string) => {
    if (!searchValue || searchValue.trim() === "") {
      return;
    }

    setIsAutoFetching(true);
    try {
      const trimmedValue = searchValue.trim();
      console.log("🔍 Searching for:", trimmedValue);

      const response = await getPendingManifests({
        search: trimmedValue,
        page: 1,
        limit: 1
      });

      console.log("📦 Search response:", response);

      if (response.success && response.data && response.data.length > 0) {
        const manifest = response.data[0];
        toast.success(`✅ Manifest ${manifest.manifestNo} found!`);
        handleSelectManifest(manifest);
      } else {
        try {
          const responseAll = await searchAnyManifest(trimmedValue);

          if (responseAll.success && responseAll.data && responseAll.data.length > 0) {
            const manifest = responseAll.data[0];

            if (manifest.isArrived) {
              toast(`⚠️ Manifest ${manifest.manifestNo} is already arrived!`, {
                icon: '⚠️',
                duration: 4000,
              });
              handleSelectManifest(manifest);
              setIsAutoFetching(false);
              return;
            }
          }
        } catch (e) {
          console.log("⚠️ Not found in all manifests");
        }

        toast.error(`❌ No manifest found for "${trimmedValue}"`);
      }
    } catch (error: any) {
      console.error("❌ Error auto-fetching manifest:", error);
      toast.error(error.response?.data?.message || "Failed to fetch manifest");
    } finally {
      setIsAutoFetching(false);
    }
  };

  // ============================================
  // fetchPendingManifests
  // ============================================
  const fetchPendingManifests = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (filters.branch && filters.branch !== "ALL") {
        params.branch = filters.branch;
      }

      if (filters.manifestNo && filters.manifestNo.trim() !== "") {
        params.manifestNo = filters.manifestNo;
      }

      if (filters.fromDate) {
        params.fromDate = format(filters.fromDate, "yyyy-MM-dd");
      }
      if (filters.toDate) {
        params.toDate = format(filters.toDate, "yyyy-MM-dd");
      }

      const response = await getPendingManifests(params);

      if (response.success) {
        setPendingResults(response.data || []);
        setTotalRecords(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error("Error fetching pending manifests:", error);
      toast.error(error.response?.data?.message || "Failed to fetch pending manifests");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // fetchArrivedGoods
  // ============================================
  const fetchArrivedGoods = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      };

      if (filters.branch && filters.branch !== "ALL") {
        params.branch = filters.branch;
      }

      if (filters.manifestNo && filters.manifestNo.trim() !== "") {
        params.manifestNo = filters.manifestNo;
      }

      if (filters.fromDate) {
        params.fromDate = format(filters.fromDate, "yyyy-MM-dd");
      }
      if (filters.toDate) {
        params.toDate = format(filters.toDate, "yyyy-MM-dd");
      }

      const response = await getGoodsArrivals(params);

      if (response.success) {
        setArrivedResults(response.data || []);
        setTotalRecords(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);

        if (response.data && response.data.length === 0) {
          toast("No arrived goods found");
        }
      } else {
        toast.error(response.message || "Failed to fetch arrived goods");
      }
    } catch (error: any) {
      console.error("❌ Error fetching arrived goods:", error);
      toast.error(error.response?.data?.message || "Failed to fetch arrived goods");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // handleSelectManifest
  // ============================================
  const handleSelectManifest = (manifest: PendingManifest) => {
    setSelectedManifest(manifest);

    const mappedGRItems: GRItem[] = (manifest.assignedGRs || []).map((gr) => ({
      grNo: gr.grNo,
      grDate: gr.grDate,
      origin: manifest.branch,
      destination: manifest.toStation,
      consignor: gr.consignor || "",
      consignee: gr.consignee || "",
      despPckgs: gr.dispatchedPckgs || gr.bookedPckgs || 0,
      despWt: gr.weight || 0,
      receivePckgs: 0,
      receiveWt: 0,
      damagePcs: 0,
      short: 0,
      excess: 0,
      missingPcs: 0,
      issueDescription: "",
      godown: "",
      remarks: ""
    }));

    if (mappedGRItems.length === 0) {
      mappedGRItems.push({
        grNo: manifest.manifestNo,
        grDate: manifest.manifestDate,
        origin: manifest.branch,
        destination: manifest.toStation,
        consignor: "",
        consignee: "",
        despPckgs: manifest.noOfPickups || 0,
        despWt: manifest.grossWeight || 0,
        receivePckgs: 0,
        receiveWt: 0,
        damagePcs: 0,
        short: 0,
        excess: 0,
        missingPcs: 0,
        issueDescription: "",
        godown: "",
        remarks: ""
      });
    }

    setGrItems(mappedGRItems);

    setFormData({
      ...formData,
      branch: manifest.branch,
      manifestNo: manifest.manifestNo,
      despatchOn: manifest.manifestDate,
      despatchTime: "",
      fromStation: manifest.toStation,
      modeType: manifest.modeCategory || "SURFACE",
      modeName: manifest.modeName,
      driver: manifest.driverName || "",
      mobile: manifest.driverMobile || "",
      unloadingPerson: "",
      receiveDate: new Date(),
      receiveTime: "",
      linkedManifestId: manifest._id
    });

    setDamageType([]);
    setShortExcessType([]);
    setDamageReason("");
    setDamageOtherRemark("");
    setDamagePackageCount(0);
    setDamagePackageError("");
    setDamagePhotos([]);
    setDamageRemarks("");
    setShortDetails("");
    setExcessDetails("");
    setDamageValidationErrors({});
    deleteVoiceNote();
    setSaveStatus("idle");
    setSaveMessage("");

    setIsModalOpen(true);
  };

  // ============================================
  // HANDLE SUBMIT
  // ============================================
  const handleSubmit = async () => {
    console.log("🚀 Save button clicked!");

    // Validation
    if (!formData.branch) {
      toast.error("Please select branch");
      return;
    }
    if (!formData.selectGodown) {
      toast.error("Please select godown");
      return;
    }
    if (!formData.manifestNo) {
      toast.error("Manifest number is required");
      return;
    }
    if (!formData.unloadingPerson) {
      toast.error("Unloading person is required");
      return;
    }

    // ✅ Validate damage section
    if (damageType.length > 0) {
      if (!damageReason) {
        toast.error("Please select damage/missing reason");
        return;
      }
      if (damageReason === "Other (specify)" && !damageOtherRemark.trim()) {
        toast.error("Please specify the reason");
        return;
      }
      if (!damageRemarks.trim()) {
        toast.error("Please add damage/missing remarks");
        return;
      }
      if (damagePackageCount < 1) {
        toast.error("Number of damaged/missing packages must be at least 1");
        return;
      }
      const totalPckgs = grItems.reduce((sum, item) => sum + (item.receivePckgs || 0), 0);
      if (damagePackageCount > totalPckgs) {
        toast.error(`Cannot exceed total received packages (${totalPckgs})`);
        return;
      }
      if (damagePhotos.length === 0) {
        toast.error("Please upload at least 1 damage photo");
        return;
      }
      if (!voiceNoteBase64 && !voiceNoteUrl) {
        toast.error("Please record a voice note describing the damage");
        return;
      }
    }

    if (shortExcessType.includes("short") && !shortDetails.trim()) {
      toast.error("Please enter details about short packages");
      return;
    }
    if (shortExcessType.includes("excess") && !excessDetails.trim()) {
      toast.error("Please enter details about excess packages");
      return;
    }

    setSaveStatus("saving");
    setSubmitting(true);
    setSaveMessage("Saving goods arrival...");

    try {
      calculateTotals();

      const payload = {
        ...formData,
        grItems: grItems.filter(item => item.grNo),
        receiveDate: formData.receiveDate,
        receiveTime: formData.receiveTime,
        despatchOn: formData.despatchOn,
        scheduleArrivalDateTime: formData.scheduleArrivalDateTime,
        vehicleArrivalDateTime: formData.vehicleArrivalDateTime,
        unloadingDateTime: formData.unloadingDateTime,
        serArrivalNo: formData.autoArrival ? undefined : formData.serArrivalNo,
        arrivalTotals,
        manifestTotals,
        damageType: damageType.length > 0 ? damageType : undefined,
        damageReason: damageReason || undefined,
        damageOtherRemark: damageOtherRemark || undefined,
        damagePackageCount: damagePackageCount || 0,
        damagePhotos: damagePhotos.length > 0 ? damagePhotos : undefined,
        damageRemarks: damageRemarks || undefined,
        shortExcessType: shortExcessType.length > 0 ? shortExcessType : undefined,
        shortDetails: shortDetails || undefined,
        excessDetails: excessDetails || undefined,
        voiceNoteUrl: voiceNoteBase64 || voiceNoteUrl || "",
        voiceNoteDuration: voiceNoteDuration || undefined,
      };

      console.log("📤 Submitting payload:", JSON.stringify(payload, null, 2));

      const response = await createGoodsArrival(payload);

      console.log("✅ Response:", response);

      if (response.success) {
        setSaveStatus("success");
        setSaveMessage("✅ Goods arrival recorded successfully!");
        toast.success("Goods arrival recorded successfully!");

        setTimeout(() => {
          resetForm();
          setIsModalOpen(false);
          setViewMode("list");
          setActiveTab("arrived");
          setCurrentPage(1);
          fetchArrivedGoods();
          fetchPendingManifests();
          loadStats();
          setSaveStatus("idle");
          setSaveMessage("");
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to save goods arrival");
      }
    } catch (error: any) {
      console.error("❌ Error saving goods arrival:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save goods arrival";
      setSaveStatus("error");
      setSaveMessage(`❌ Error: ${errorMessage}`);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintArrival = async (id: string) => {
    try {
      const response = await printGoodsArrival(id);
      if (response.success) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head><title>Goods Arrival Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
                .company { font-size: 18px; font-weight: bold; }
              </style>
              </head>
              <body>
                <div class="header">
                  <div class="company">GOLDEN ROADWAYS & LOGISTICS PVT LTD</div>
                  <div>Goods Arrival Report</div>
                  <div>Date: ${new Date().toLocaleDateString()}</div>
                </div>
                <pre>${JSON.stringify(response.data, null, 2)}</pre>
                <script>window.print();</script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }
    } catch (error) {
      toast.error("Failed to generate print report");
    }
  };

  const handleExportToExcel = async () => {
    try {
      const params: any = {};

      if (filters.branch && filters.branch !== "ALL") {
        params.branch = filters.branch;
      }

      if (filters.fromDate) {
        params.fromDate = format(filters.fromDate, "yyyy-MM-dd");
      }
      if (filters.toDate) {
        params.toDate = format(filters.toDate, "yyyy-MM-dd");
      }

      const response = await exportGoodsArrivals(params);

      if (response.success && response.data) {
        const csvRows = [];
        const headers = Object.keys(response.data[0] || {});
        csvRows.push(headers.join(','));
        for (const row of response.data) {
          const values = headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
            return value || '';
          });
          csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `goods-arrival-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);

        toast.success("Export completed successfully");
      }
    } catch (error) {
      toast.error("Failed to export data");
    }
  };

  // ============================================
  // HANDLERS
  // ============================================
  const calculateTotals = () => {
    const manifestTotal = {
      noOfGR: grItems.length,
      totalPckgs: grItems.reduce((sum, item) => sum + (item.despPckgs || 0), 0),
      totalWeight: grItems.reduce((sum, item) => sum + (item.despWt || 0), 0)
    };
    setManifestTotals(manifestTotal);

    const arrivalTotal = {
      noOfGR: grItems.length,
      totalPckgs: grItems.reduce((sum, item) => sum + (item.receivePckgs || 0), 0),
      totalWeight: grItems.reduce((sum, item) => sum + (item.receiveWt || 0), 0),
      damagePckgs: grItems.reduce((sum, item) => sum + (item.damagePcs || 0), 0),
      totalShort: grItems.reduce((sum, item) => sum + (item.short || 0), 0),
      totalExcess: grItems.reduce((sum, item) => sum + (item.excess || 0), 0),
      totalMissing: grItems.reduce((sum, item) => sum + (item.missingPcs || 0), 0)
    };
    setArrivalTotals(arrivalTotal);
  };

  const addGRItem = () => {
    setGrItems([...grItems, {
      grNo: "",
      grDate: new Date(),
      origin: "",
      destination: "",
      consignor: "",
      consignee: "",
      despPckgs: 0,
      despWt: 0,
      receivePckgs: 0,
      receiveWt: 0,
      damagePcs: 0,
      short: 0,
      excess: 0,
      missingPcs: 0,
      issueDescription: "",
      godown: "",
      remarks: ""
    }]);
  };

  const updateGRItem = (index: number, field: keyof GRItem, value: any) => {
    const updated = [...grItems];
    updated[index] = { ...updated[index], [field]: value };
    setGrItems(updated);
    calculateTotals();
  };

  const removeGRItem = (index: number) => {
    if (grItems.length > 1) {
      setGrItems(grItems.filter((_, i) => i !== index));
      calculateTotals();
    }
  };

  const resetForm = () => {
    setFormData({
      branch: "",
      selectGodown: "",
      manifestNo: "",
      despatchOn: new Date(),
      despatchTime: "",
      fromStation: "",
      modeType: "",
      modeName: "",
      driver: "",
      mobile: "",
      unloadingPerson: "",
      serArrivalNo: "",
      autoArrival: true,
      receiveDate: new Date(),
      receiveTime: "",
      unloadingHours: 0,
      unloadingMinutes: 0,
      route: "",
      tat: 0,
      scheduleArrivalDateTime: new Date(),
      vehicleArrivalDateTime: new Date(),
      unloadingDateTime: new Date(),
      sealNo: "",
      sealOk: true,
      dharamKantaWeight: 0,
      remarks: "",
      linkedManifestId: ""
    });
    setGrItems([]);
    setSelectedManifest(null);
    setGrSearchResults([]);
    setGrSearchTerm("");
    setDamageType([]);
    setShortExcessType([]);
    setDamageReason("");
    setDamageOtherRemark("");
    setDamagePackageCount(0);
    setDamagePackageError("");
    setDamagePhotos([]);
    setDamageRemarks("");
    setShortDetails("");
    setExcessDetails("");
    setDamageValidationErrors({});
    deleteVoiceNote();
    setManifestTotals({ noOfGR: 0, totalPckgs: 0, totalWeight: 0 });
    setArrivalTotals({ noOfGR: 0, totalPckgs: 0, totalWeight: 0, damagePckgs: 0, totalShort: 0, totalExcess: 0, totalMissing: 0 });
    setSaveStatus("idle");
    setSaveMessage("");
  };

  const handleSearch = () => {
    setCurrentPage(1);
    if (activeTab === "pending") {
      fetchPendingManifests();
    } else {
      fetchArrivedGoods();
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const renderGodownOptions = () => {
    return godownOptions.map((opt) => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ));
  };

  const handleCancelArrival = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this arrival?")) return;

    setLoading(true);
    try {
      const response = await cancelGoodsArrival(id);
      if (response.success) {
        toast.success("Arrival cancelled successfully");
        fetchArrivedGoods();
        loadStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel arrival");
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreArrival = async (id: string) => {
    if (!confirm("Are you sure you want to restore this arrival?")) return;

    setLoading(true);
    try {
      const response = await restoreGoodsArrival(id);
      if (response.success) {
        toast.success("Arrival restored successfully");
        fetchArrivedGoods();
        loadStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to restore arrival");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArrival = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this arrival?")) return;

    setLoading(true);
    try {
      const response = await deleteGoodsArrival(id);
      if (response.success) {
        toast.success("Arrival deleted successfully");
        fetchArrivedGoods();
        loadStats();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete arrival");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    loadBranches();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === "pending") {
      fetchPendingManifests();
    } else {
      fetchArrivedGoods();
    }
  }, [activeTab, currentPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ============================================
  // RENDER: PENDING MANIFESTS
  // ============================================
  const renderPendingManifests = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-600" />
            Pending Arrivals - Dispatched Manifests
          </CardTitle>
          <Button onClick={handleExportToExcel} variant="outline" size="sm" className="h-8 text-xs">
            <FileSpreadsheet className="mr-1 h-3 w-3" /> Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">Branch</Label>
            <Select value={filters.branch} onValueChange={(v) => setFilters({ ...filters, branch: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ALL" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                {branchOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">Manifest #</Label>
            <Input value={filters.manifestNo} onChange={(e) => setFilters({ ...filters, manifestNo: e.target.value })} placeholder="Enter Manifest #" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-full text-xs justify-start">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {filters.fromDate ? format(filters.fromDate, "dd-MM-yyyy") : "Select Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={filters.fromDate || undefined}
                  onSelect={(d) => setFilters({ ...filters, fromDate: d || null })}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} size="sm" className="h-8 text-xs bg-yellow-600 hover:bg-yellow-700">
              <Search className="mr-1 h-3 w-3" /> Search
            </Button>
            <Button
              onClick={() => {
                setFilters({ branch: "ALL", fromDate: null, toDate: null, manifestNo: "" });
                fetchPendingManifests();
              }}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold text-center w-12">S#</TableHead>
                  <TableHead className="text-xs font-semibold">Manifest #</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">LHC#</TableHead>
                  <TableHead className="text-xs font-semibold">Branch</TableHead>
                  <TableHead className="text-xs font-semibold">To Station</TableHead>
                  <TableHead className="text-xs font-semibold">Mode</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Pickups</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Gross Wt.</TableHead>
                  <TableHead className="text-xs font-semibold text-center w-24">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : pendingResults.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-gray-500">No pending manifests found</TableCell></TableRow>
                ) : (
                  pendingResults.map((record, idx) => (
                    <TableRow key={record._id} className="hover:bg-gray-50">
                      <TableCell className="text-center text-xs">{((currentPage - 1) * itemsPerPage) + idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">{record.manifestNo}</TableCell>
                      <TableCell className="text-xs">{record.manifestDate ? format(new Date(record.manifestDate), "dd-MM-yyyy") : "-"}</TableCell>
                      <TableCell className="text-xs">{record.lhcNo || "-"}</TableCell>
                      <TableCell className="text-xs">{record.branch}</TableCell>
                      <TableCell className="text-xs">{record.toStation}</TableCell>
                      <TableCell className="text-xs">{record.modeName}</TableCell>
                      <TableCell className="text-center text-xs">{record.noOfPickups}</TableCell>
                      <TableCell className="text-center text-xs">{record.grossWeight?.toFixed(3)}</TableCell>
                      <TableCell className="text-center">
                        <Button onClick={() => handleSelectManifest(record)} size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700">
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">Total {totalRecords} records</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="h-7 text-xs">
                <ChevronLeft className="h-3 w-3 mr-1" /> Previous
              </Button>
              <span className="px-3 py-1 text-xs">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="h-7 text-xs">
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============================================
  // RENDER: ARRIVED GOODS
  // ============================================
  const renderArrivedGoods = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-green-600" />
            Arrived Goods List
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchArrivedGoods()}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={loading}
            >
              <RefreshCw className={cn("h-3 w-3 mr-1", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button onClick={handleExportToExcel} variant="outline" size="sm" className="h-8 text-xs">
              <FileSpreadsheet className="mr-1 h-3 w-3" /> Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">Branch</Label>
            <Select value={filters.branch} onValueChange={(v) => setFilters({ ...filters, branch: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="ALL" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ALL</SelectItem>
                {branchOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">Manifest #</Label>
            <Input value={filters.manifestNo} onChange={(e) => setFilters({ ...filters, manifestNo: e.target.value })} placeholder="Enter Manifest #" className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-medium">From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-8 w-full text-xs justify-start">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {filters.fromDate ? format(filters.fromDate, "dd-MM-yyyy") : "Select Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  selected={filters.fromDate || undefined}
                  onSelect={(d) => setFilters({ ...filters, fromDate: d || null })}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700">
              <Search className="mr-1 h-3 w-3" /> Search
            </Button>
            <Button
              onClick={() => {
                setFilters({ branch: "ALL", fromDate: null, toDate: null, manifestNo: "" });
                fetchArrivedGoods();
              }}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-xs font-semibold text-center w-12">#</TableHead>
                  <TableHead className="text-xs font-semibold">Manifest #</TableHead>
                  <TableHead className="text-xs font-semibold">Arrival #</TableHead>
                  <TableHead className="text-xs font-semibold">Arrival Date</TableHead>
                  <TableHead className="text-xs font-semibold">From Station</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Packages</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Weight</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-center w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <p className="text-xs text-gray-500 mt-2">Loading...</p>
                    </TableCell>
                  </TableRow>
                ) : arrivedResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      <Package className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      No arrived records found
                    </TableCell>
                  </TableRow>
                ) : (
                  arrivedResults.map((record, idx) => (
                    <TableRow key={record._id} className="hover:bg-gray-50">
                      <TableCell className="text-center text-xs">{((currentPage - 1) * itemsPerPage) + idx + 1}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">{record.manifestNo}</TableCell>
                      <TableCell className="text-xs">{record.serArrivalNo || "-"}</TableCell>
                      <TableCell className="text-xs">
                        {record.receiveDate ? format(new Date(record.receiveDate), "dd-MM-yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-xs">{record.fromStation || "-"}</TableCell>
                      <TableCell className="text-center text-xs">{record.arrivalTotals?.totalPckgs || 0}</TableCell>
                      <TableCell className="text-center text-xs">{record.arrivalTotals?.totalWeight?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn(
                          "text-[10px]",
                          record.arrivalStatus === 'CANCELLED' ? "bg-red-100 text-red-700" :
                            record.arrivalStatus === 'COMPLETED' ? "bg-blue-100 text-blue-700" :
                              "bg-green-100 text-green-700"
                        )}>
                          {record.arrivalStatus || 'ARRIVED'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button
                            onClick={() => handlePrintArrival(record._id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700"
                            title="Print"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </Button>
                          {record.status === 'active' ? (
                            <Button
                              onClick={() => handleCancelArrival(record._id)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-orange-500 hover:text-orange-700"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleRestoreArrival(record._id)}
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-green-500 hover:text-green-700"
                              title="Restore"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteArrival(record._id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} records
            </div>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-7 text-xs"
              >
                <ChevronLeft className="h-3 w-3 mr-1" /> Previous
              </Button>
              <span className="px-3 py-1 text-xs flex items-center">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-7 text-xs"
              >
                Next <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ============================================
  // RENDER: MODAL FORM
  // ============================================
  const renderModalForm = () => (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
      }
      setIsModalOpen(open);
    }}>
      <DialogContent className="w-screen max-w-screen h-screen max-h-screen p-0 m-0 rounded-none overflow-hidden flex flex-col bg-white">
        <DialogHeader className="sticky top-0 bg-white z-10 px-6 pt-4 pb-3 border-b shrink-0 flex justify-between items-center">
          <div>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Goods Arrival - {selectedManifest?.manifestNo || "New Entry"}
            </DialogTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setIsModalOpen(false); resetForm(); }}
            className="h-8"
            disabled={submitting}
          >
            <X className="mr-1 h-3 w-3" /> Close
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Building className="h-4 w-4" /> Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Branch *</Label>
                <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {branchOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.text}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Select Godown *</Label>
                <Select value={formData.selectGodown} onValueChange={(v) => setFormData({ ...formData, selectGodown: v })}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select Godown" /></SelectTrigger>
                  <SelectContent>{renderGodownOptions()}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Manifest # *</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.manifestNo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, manifestNo: val });
                      if (val.length >= 3) {
                        const timeoutId = setTimeout(() => {
                          autoFetchManifest(val);
                        }, 500);
                        return () => clearTimeout(timeoutId);
                      }
                    }}
                    className="h-8 text-sm flex-1"
                    placeholder="Enter Manifest Number (Auto-fetch)"
                    disabled={isAutoFetching}
                  />
                  {isAutoFetching && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                </div>
                <p className="text-xs text-gray-500">Enter manifest number to auto-fetch details</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Receive Date *</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-8 flex-1 text-sm">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {format(formData.receiveDate, "dd-MM-yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Calendar mode="single" selected={formData.receiveDate} onSelect={(d) => d && setFormData({ ...formData, receiveDate: d })} />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" value={formData.receiveTime} onChange={(e) => setFormData({ ...formData, receiveTime: e.target.value })} className="h-8 w-28 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Transport Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Navigation className="h-4 w-4" /> Transport Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">From Station</Label>
                <Input value={formData.fromStation} onChange={(e) => setFormData({ ...formData, fromStation: e.target.value })} className="h-8 text-sm" placeholder="Enter from station" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Mode Name</Label>
                <Input value={formData.modeName} onChange={(e) => setFormData({ ...formData, modeName: e.target.value })} className="h-8 text-sm" placeholder="Enter mode name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Driver</Label>
                <Input value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} className="h-8 text-sm" placeholder="Enter driver name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Unloading Person *</Label>
                <Input value={formData.unloadingPerson} onChange={(e) => setFormData({ ...formData, unloadingPerson: e.target.value })} className="h-8 text-sm" placeholder="Enter unloading person" />
              </div>
            </div>
          </div>

          {/* GR Items Table with Search Dropdown */}
          <div className="rounded-md border">
            <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" /> GR Details
              </h3>
              <Button onClick={addGRItem} variant="ghost" size="sm" className="h-7 text-xs text-blue-600">
                <PlusCircle className="mr-1 h-3 w-3" /> Add GR
              </Button>
            </div>
            <div className="overflow-x-auto p-3">
              <div className="min-w-[1400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs min-w-[200px]">GR #</TableHead>
                      <TableHead className="text-xs min-w-[80px]">Origin</TableHead>
                      <TableHead className="text-xs min-w-[80px]">Destination</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px]">Desp Pckgs</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px]">Desp Wt</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px]">Rec Pckgs</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px]">Rec Wt</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px] bg-red-50">Damage</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px] bg-orange-50">Short</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px] bg-green-50">Excess</TableHead>
                      <TableHead className="text-xs text-center min-w-[70px] bg-purple-50">Missing</TableHead>
                      <TableHead className="text-xs min-w-[150px]">Issue Remarks</TableHead>
                      <TableHead className="text-xs min-w-[100px]">Godown</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grItems.map((item, idx) => (
                      <TableRow key={idx} className={cn(
                        (item.damagePcs > 0 || item.short > 0 || item.excess > 0 || item.missingPcs > 0) &&
                        "border-l-4 border-red-400 bg-red-50/10"
                      )}>
                        <TableCell className="relative">
                          <Input
                            value={item.grNo}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateGRItem(idx, "grNo", val);
                              handleGRSearch(val);
                            }}
                            className="h-7 w-48 text-xs"
                            placeholder="Enter GR # to search..."
                          />
                          {/* Search Results Dropdown */}
                          {grSearchResults.length > 0 && idx === grItems.length - 1 && (
                            <div className="absolute z-50 top-full left-0 mt-1 w-96 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                              {grSearchResults.map((result, ridx) => (
                                <div
                                  key={ridx}
                                  className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 text-xs"
                                  onClick={() => selectGR(result, idx)}
                                >
                                  <div className="font-medium">{result.grNo}</div>
                                  <div className="text-gray-500 text-[10px]">
                                    {result.consignorName} → {result.destination} | 
                                    Pckgs: {result.totalPckgs} | Wt: {result.totalChargeWeight}kg
                                    <Badge className="ml-2 text-[8px]" variant="outline">
                                      {result.source}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.origin}
                            onChange={(e) => updateGRItem(idx, "origin", e.target.value)}
                            className="h-7 w-28 text-xs"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.destination}
                            onChange={(e) => updateGRItem(idx, "destination", e.target.value)}
                            className="h-7 w-28 text-xs"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.despPckgs || ""}
                            onChange={(e) => updateGRItem(idx, "despPckgs", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.despWt || ""}
                            onChange={(e) => updateGRItem(idx, "despWt", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.receivePckgs || ""}
                            onChange={(e) => updateGRItem(idx, "receivePckgs", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.receiveWt || ""}
                            onChange={(e) => updateGRItem(idx, "receiveWt", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="bg-red-50">
                          <Input
                            type="number"
                            value={item.damagePcs || ""}
                            onChange={(e) => updateGRItem(idx, "damagePcs", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right border-red-300 bg-red-50"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="bg-orange-50">
                          <Input
                            type="number"
                            value={item.short || ""}
                            onChange={(e) => updateGRItem(idx, "short", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right border-orange-300 bg-orange-50"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="bg-green-50">
                          <Input
                            type="number"
                            value={item.excess || ""}
                            onChange={(e) => updateGRItem(idx, "excess", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right border-green-300 bg-green-50"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="bg-purple-50">
                          <Input
                            type="number"
                            value={item.missingPcs || ""}
                            onChange={(e) => updateGRItem(idx, "missingPcs", Number(e.target.value))}
                            className="h-7 w-20 text-xs text-right border-purple-300 bg-purple-50"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.issueDescription || ""}
                            onChange={(e) => updateGRItem(idx, "issueDescription", e.target.value)}
                            className="h-7 text-xs"
                            placeholder="Describe issue..."
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.godown}
                            onValueChange={(v) => updateGRItem(idx, "godown", v)}
                          >
                            <SelectTrigger className="h-7 w-28 text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>{renderGodownOptions()}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGRItem(idx)}
                            className="h-6 w-6 p-0 text-red-500"
                            disabled={grItems.length <= 1}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Totals Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border rounded-lg p-3 bg-blue-50">
              <h4 className="text-sm font-semibold mb-2">As Per Manifest</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span>GR: {manifestTotals.noOfGR}</span>
                <span>Pckgs: {manifestTotals.totalPckgs}</span>
                <span>Wt: {manifestTotals.totalWeight.toFixed(2)} kg</span>
              </div>
            </div>
            <div className="border rounded-lg p-3 bg-green-50">
              <h4 className="text-sm font-semibold mb-2">As Per Arrival</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span>GR: {arrivalTotals.noOfGR}</span>
                <span>Pckgs: {arrivalTotals.totalPckgs}</span>
                <span>Wt: {arrivalTotals.totalWeight.toFixed(2)} kg</span>
                {arrivalTotals.damagePckgs > 0 && <span className="text-red-600">Damage: {arrivalTotals.damagePckgs}</span>}
                {arrivalTotals.totalShort > 0 && <span className="text-orange-600">Short: {arrivalTotals.totalShort}</span>}
                {arrivalTotals.totalExcess > 0 && <span className="text-green-600">Excess: {arrivalTotals.totalExcess}</span>}
                {arrivalTotals.totalMissing > 0 && <span className="text-purple-600">Missing: {arrivalTotals.totalMissing}</span>}
              </div>
            </div>
          </div>

          {/* ============================================
          🔥 COMPLETE DAMAGE/MISSING SECTION - 2 Columns
          ============================================ */}
          <div className="border rounded-lg p-4 bg-red-50/20">
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" /> Damage / Missing / Short / Excess Details
            </h3>

            {/* Row 1: Damage/Missing & Short/Excess - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Damage/Missing Type:</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={damageType.includes("damaged")}
                      onChange={() => handleDamageTypeChange("damaged")}
                      className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-red-700">Damaged</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={damageType.includes("missing")}
                      onChange={() => handleDamageTypeChange("missing")}
                      className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-orange-700">Missing</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Short/Excess Type:</Label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shortExcessType.includes("short")}
                      onChange={() => handleShortExcessTypeChange("short")}
                      className="h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-yellow-700">Short</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shortExcessType.includes("excess")}
                      onChange={() => handleShortExcessTypeChange("excess")}
                      className="h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-green-700">Excess</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 2: Reason - Full Width */}
            {damageType.length > 0 && (
              <div className="mb-3">
                <Label className="text-sm font-medium">Reason <span className="text-red-500">*</span></Label>
                <Select value={damageReason} onValueChange={handleDamageReasonChange}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    {damageReasonOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                  </SelectContent>
                </Select>
                {damageValidationErrors.damageReason && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.damageReason}</p>}

                {damageReason === "Other (specify)" && (
                  <div className="mt-2">
                    <Textarea
                      value={damageOtherRemark}
                      onChange={(e) => setDamageOtherRemark(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      rows={2}
                      className="mt-1"
                    />
                    {damageValidationErrors.damageOtherRemark && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.damageOtherRemark}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Row 3: Damage Package Count & Remarks - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {damageType.length > 0 && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Damage/Missing Packages <span className="text-red-500">*</span></Label>
                    <Input
                      type="number"
                      value={damagePackageCount || ""}
                      onChange={(e) => handleDamagePackageCountChange(e.target.value)}
                      className="mt-1"
                      placeholder="0"
                      min="1"
                      max={grItems.reduce((sum, item) => sum + (item.receivePckgs || 0), 0)}
                    />
                    {damagePackageError && <p className="text-red-500 text-xs mt-1">{damagePackageError}</p>}
                    {damageValidationErrors.damagePackageCount && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.damagePackageCount}</p>}
                    <p className="text-xs text-gray-500 mt-1">Total received packages: <strong>{grItems.reduce((sum, item) => sum + (item.receivePckgs || 0), 0)}</strong></p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Damage Remarks <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={damageRemarks}
                      onChange={(e) => setDamageRemarks(e.target.value)}
                      placeholder="Enter details about damage/missing..."
                      rows={2}
                      className="mt-1"
                    />
                    {damageValidationErrors.damageRemarks && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.damageRemarks}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Row 4: Short & Excess Details - 2 Columns */}
            {shortExcessType.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                {shortExcessType.includes("short") && (
                  <div>
                    <Label className="text-sm font-medium">Short Details <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={shortDetails}
                      onChange={(e) => setShortDetails(e.target.value)}
                      placeholder="Enter details about short packages..."
                      rows={2}
                      className="mt-1"
                    />
                    {damageValidationErrors.shortDetails && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.shortDetails}</p>}
                  </div>
                )}
                {shortExcessType.includes("excess") && (
                  <div>
                    <Label className="text-sm font-medium">Excess Details <span className="text-red-500">*</span></Label>
                    <Textarea
                      value={excessDetails}
                      onChange={(e) => setExcessDetails(e.target.value)}
                      placeholder="Enter details about excess packages..."
                      rows={2}
                      className="mt-1"
                    />
                    {damageValidationErrors.excessDetails && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.excessDetails}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Row 5: Photos & Voice Note - 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {damageType.length > 0 && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Damage Photos <span className="text-red-500">* (Min: 1, Max: 10)</span></Label>
                    <div className="mt-2">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="h-9">
                        <PlusCircle className="h-4 w-4 mr-2" />Select Photos
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    {damagePhotos.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {damagePhotos.map((photo, idx) => (
                          <div key={idx} className="relative w-20 h-20 border rounded-lg overflow-hidden group bg-gray-100">
                            <img src={photo} alt={`Damage ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePhoto(idx)}
                              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {damageValidationErrors.damagePhotos && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.damagePhotos}</p>}
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP. Max 5MB each.</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Voice Note <span className="text-red-500">*</span></Label>
                    {!isRecording && !voiceNoteUrl && (
                      <Button type="button" onClick={startRecording} variant="outline" className="h-10 bg-blue-50 hover:bg-blue-100 border-blue-300">
                        <Mic className="h-4 w-4 mr-2" />Start Recording (Max 2 min)
                      </Button>
                    )}
                    {isRecording && (
                      <div className="space-y-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <Button type="button" onClick={stopRecording} variant="destructive" className="h-10 w-full animate-pulse">
                          <MicOff className="h-4 w-4 mr-2" /> ■ Stop Recording ({formatDuration(recordingDuration)})
                        </Button>
                        <p className="text-xs text-red-600 text-center">Recording...</p>
                      </div>
                    )}
                    {voiceNoteUrl && !isRecording && (
                      <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3 flex-wrap">
                          <audio
                            controls
                            src={voiceNoteUrl}
                            className="h-10 flex-1 min-w-[200px]"
                            onError={() => { toast.error("Audio playback error"); deleteVoiceNote(); }}
                          />
                          <div className="flex gap-2">
                            <Button type="button" onClick={() => { deleteVoiceNote(); startRecording(); }} variant="outline" size="sm" className="h-8">
                              <Mic className="h-3 w-3 mr-1" />Re-record
                            </Button>
                            <Button type="button" onClick={deleteVoiceNote} variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 className="h-3 w-3 mr-1" />Delete
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-green-700">✅ Voice note recorded - {voiceNoteDuration ? formatDuration(voiceNoteDuration) : "0:00"}</p>
                      </div>
                    )}
                    {damageValidationErrors.voiceNote && <p className="text-red-500 text-xs mt-1">{damageValidationErrors.voiceNote}</p>}
                  </div>
                </>
              )}
            </div>

            {/* Selected Options Summary */}
            {(damageType.length > 0 || shortExcessType.length > 0) && (
              <div className="mt-3 p-3 bg-white rounded-lg border">
                <p className="text-xs font-medium text-gray-600">Selected Options:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {damageType.includes("damaged") && <Badge className="bg-red-100 text-red-700">Damaged</Badge>}
                  {damageType.includes("missing") && <Badge className="bg-orange-100 text-orange-700">Missing</Badge>}
                  {shortExcessType.includes("short") && <Badge className="bg-yellow-100 text-yellow-700">Short</Badge>}
                  {shortExcessType.includes("excess") && <Badge className="bg-green-100 text-green-700">Excess</Badge>}
                </div>
              </div>
            )}
          </div>

          {/* General Remarks */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">General Remarks</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={2}
              className="text-sm"
              placeholder="Additional remarks..."
            />
          </div>

          {/* Save Status */}
          {saveStatus !== "idle" && (
            <div className={cn(
              "p-3 rounded-lg border flex items-center gap-2",
              saveStatus === "saving" && "bg-blue-50 border-blue-200 text-blue-700",
              saveStatus === "success" && "bg-green-50 border-green-200 text-green-700",
              saveStatus === "error" && "bg-red-50 border-red-200 text-red-700"
            )}>
              {saveStatus === "saving" && <Loader2 className="h-4 w-4 animate-spin" />}
              {saveStatus === "success" && <CheckCircle className="h-4 w-4" />}
              {saveStatus === "error" && <AlertCircle className="h-4 w-4" />}
              <span className="text-sm">{saveMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <Button
              variant="outline"
              onClick={() => { resetForm(); setSaveStatus("idle"); setSaveMessage(""); }}
              className="h-8"
              disabled={submitting}
            >
              <RefreshCw className="mr-1 h-3 w-3" /> Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || saveStatus === "saving"}
              className="h-8 min-w-[120px] bg-green-600 hover:bg-green-700"
            >
              {submitting || saveStatus === "saving" ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === "success" ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="mr-1 h-3 w-3" />
                  Save Arrival
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="space-y-4 p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">GOODS ARRIVAL</h1>
            </div>
            <div className="mt-1 flex flex-wrap gap-4 text-xs text-gray-500">
              <span>Company: GOLDEN ROADWAYS &amp; LOGISTICS PVT LTD</span>
              <span>Branch: CORPORATE OFFICE</span>
              <span>Financial Year: 2026-2027</span>
            </div>
          </div>
          {viewMode === "list" && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> New Goods Arrival
            </Button>
          )}
        </div>
      </div>

      {viewMode === "list" && (
        <div className="flex border-b bg-white rounded-t-lg">
          <button
            onClick={() => { setActiveTab("pending"); setCurrentPage(1); }}
            className={cn("px-6 py-2.5 text-sm font-medium rounded-t-lg",
              activeTab === "pending" ? "bg-yellow-600 text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Pending Arrival
          </button>
          <button
            onClick={() => { setActiveTab("arrived"); setCurrentPage(1); }}
            className={cn("px-6 py-2.5 text-sm font-medium rounded-t-lg",
              activeTab === "arrived" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            Arrived
          </button>
        </div>
      )}

      {viewMode === "list"
        ? (activeTab === "pending" ? renderPendingManifests() : renderArrivedGoods())
        : renderModalForm()
      }

      {/* Modal - Always rendered but controlled by isModalOpen */}
      {renderModalForm()}
    </div>
  );
}