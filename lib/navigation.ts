// lib/navigation.ts
import {
  Activity,
  BarChart,
  RefreshCw,
  BoxesIcon,
  Building2,
  Bus,
  Calendar,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Map,
  MessageCircle,
  Navigation,
  PackagePlus,
  PlusSquare,
  RotateCcw,
  Scroll,
  Settings,
  ShieldCheck,
  Ticket,
  Truck,
  UserCog,
  Users,
  Warehouse,
  FolderTree,
  FileText,
  GitBranch,
  CalendarDays,
  DollarSign,
  Gift,
  Receipt,
  BarChart3,
  ChevronDown,
  X,
  TrendingUp,
  Gauge,
  BookOpen,
  FileCheck,
  Handshake,
  Landmark,
  PiggyBank,
  ReceiptText,
  FileSpreadsheet,
  FileBarChart,
  FileOutput,
  IndianRupee,
  Wrench,
  FileX,
  CalendarX,
  History,
  Upload,
  AlertCircle,
  AlertTriangle,
  Search,
  Printer,
  Menu,
  Lock,
  Sliders,
  Database,
  MapPin,
  ShoppingCart,
  Wallet,
  CreditCard,
  Route,
  Merge,
  Calculator,
  Car,
  Fuel,
  MessageSquare,
  MapPinned,
  Building,
  BadgeIndianRupee,
  FileWarning,
  Shield,
  Network,
  Zap,
  Layers,
  Package,
  Send,
  Eye,
  Radar,
  GaugeCircle,
  Wifi,
  Signal,
  Globe,
  Crosshair,
  Route as RouteIcon,
  Split,
  GitMerge,
  TrendingUp as TrendingUpIcon,
  AlertOctagon,
  ActivitySquare,
  Cpu,
} from "lucide-react";

export interface NavItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

export interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

// ============================
// Common groups (Dashboard)
// ============================
export const commonNavGroups: NavGroup[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { title: "Overview", icon: LayoutDashboard, href: "/dashboard/overview" },
      { title: "Live Shipment Map", icon: Map, href: "/dashboard/map" },
      { title: "Fleet Status", icon: Activity, href: "/dashboard/fleet-status" },
    ],
  },
];

// ============================
// Module-specific groups
// ============================
export const moduleNavGroups: Record<string, NavGroup[]> = {
  Operations: [
    {
      title: "Workflow",
      icon: ClipboardList,
      items: [
        { title: "Booking Computerize GRL", icon: PlusSquare, href: "/dashboard/operations/transaction/booking-computerize" },
        { title: "Booking GRL Manual", icon: FileText, href: "/dashboard/operations/transaction/booking-grl-manual" },
        { title: "Loading Tally Report", icon: ClipboardList, href: "/dashboard/operations/transaction/loading-tally" },
        { title: "Change Vehicle In Manifest", icon: Truck, href: "/dashboard/operations/transaction/change-vehicle-in-manifest" },
        { title: "DDR", icon: FileText, href: "/dashboard/operations/transaction/ddr" },
        { title: "DR Charge Update", icon: DollarSign, href: "/dashboard/operations/transaction/dr-charge-update" },
        { title: "Gate Pass Entry", icon: Navigation, href: "/dashboard/operations/transaction/gate-pass" },
        { title: "Goods Arrival", icon: PackagePlus, href: "/dashboard/operations/transaction/goods-arrival" },
        { title: "GR Enquiry", icon: ClipboardList, href: "/dashboard/operations/transaction/gr-enquiry" },
        { title: "Local Manifest", icon: Map, href: "/dashboard/operations/transaction/local-manifest" },
        { title: "Long Route Manifest GRL", icon: Map, href: "/dashboard/operations/transaction/long-route-manifest" },
        { title: "Lorry Hire Challan", icon: Truck, href: "/dashboard/operations/transaction/lhc" },
        { title: "Manifest Enquiry", icon: Search, href: "/dashboard/operations/transaction/manifest-enquiry" },
        { title: "Pickup Manifest", icon: Map, href: "/dashboard/operations/transaction/pickup-manifest" },
        { title: "POD Entry", icon: Receipt, href: "/dashboard/operations/transaction/pod-entry" },
        { title: "POD Upload", icon: Upload, href: "/dashboard/operations/transaction/pod-upload" },
        { title: "Route Merge Tool", icon: Merge, href: "/dashboard/operations/transaction/route-merge-tool" },
        { title: "Trip P&L Calculator (Inside Manifest)", icon: Calculator, href: "/dashboard/operations/transaction/trip-calculator" },
        { title: "Market Vehicle Placement Portal", icon: Truck, href: "/dashboard/operations/transaction/market-vehicle-placement" },
        { title: "RTO Entry (Reverse Logistics)", icon: RotateCcw, href: "/dashboard/operations/transaction/rto-entry" },
        { title: "Detention Entry (Auto-Generated But Viewable)", icon: AlertTriangle, href: "/dashboard/operations/transaction/detention-entry" },
      ],
    },
    {
      title: "Setup",
      icon: FolderTree,
      items: [
        { title: "Agency Commission Master", icon: Building2, href: "/dashboard/operations/agency-commission" },
        { title: "Commission Category Master", icon: BarChart, href: "/dashboard/operations/commission-category" },
        { title: "Consignment Charges Master", icon: Receipt, href: "/dashboard/operations/consignment-charges" },
        { title: "Consignor Consignee Master", icon: Users, href: "/dashboard/operations/consignor-consignee" },
        { title: "Credit Note Reason Master", icon: FileText, href: "/dashboard/operations/credit-note-reason" },
        { title: "Freight On Master", icon: Truck, href: "/dashboard/operations/freight-on" },
        { title: "Godown Master", icon: Warehouse, href: "/dashboard/operations/godown-master" },
        { title: "LHC Enquiry", icon: Search, href: "/dashboard/operations/lhc-enquiry" },
        { title: "Market Vehicle Master", icon: Bus, href: "/dashboard/operations/market-vehicle" },
        { title: "Packing Master", icon: PackagePlus, href: "/dashboard/operations/packing" },
        {
          title: "Transportation Masters",
          icon: Truck,
          children: [
            { title: "Driver Master", icon: UserCog, href: "/operations/driver-master" },
          ]
        },
        { title: "Vehicle Group Master", icon: FolderTree, href: "/operations/vehicle-group" },
        { title: "Vehicle Manufacture Master", icon: Building2, href: "/operations/vehicle-manufacture" },
        { title: "Vehicle Master (New)", icon: Bus, href: "/operations/vehicles-new" },
        { title: "Vehicle Subgroup Master", icon: GitBranch, href: "/operations/vehicle-subgroup" },
        { title: "Vehicle Type Master", icon: Bus, href: "/operations/vehicle-type" },
        { title: "Hub Configuration", icon: Building, href: "/operations/hub-config" },
        { title: "Spoke Configuration", icon: Route, href: "/operations/spoke-config" },
        { title: "Pincode Master", icon: MapPinned, href: "/operations/pincode-master" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      items: [
        // Original Reports
        { title: "Pending POD Report New", icon: Clock, href: "/dashboard/operations/reports/pending-pod-new" },
        { title: "Arrival Register Report", icon: ClipboardList, href: "/dashboard/operations/reports/arrival-register" },
        // { title: "Loading Tally Report", icon: ClipboardList, href: "/operations/reports/loading-tally" },
        { title: "Booking Other Charges Report", icon: Receipt, href: "/dashboard/operations/reports/booking-other-charges" },
        { title: "Booking Summary And Detail Report", icon: BarChart, href: "/dashboard/operations/reports/booking-summary-detail" },
        { title: "Branch Stock Report", icon: BoxesIcon, href: "/dashboard/operations/reports/branch-stock" },
        { title: "Branch Stock Report Summary", icon: BarChart, href: "/dashboard/operations/reports/branch-stock-summary" },
        { title: "Daily Sales Report", icon: BarChart, href: "/dashboard/operations/reports/daily-sales" },
        { title: "Daily Sales Report (New)", icon: TrendingUp, href: "/dashboard/operations/reports/daily-sales-new" },
        { title: "Delivery Register Report", icon: ClipboardList, href: "/dashboard/operations/reports/delivery-register" },
        { title: "Despatch Register Report", icon: Truck, href: "/dashboard/operations/reports/despatch-register" },
        { title: "Destination Wise Booking Summary Report", icon: Map, href: "/dashboard/operations/reports/destination-wise-booking" },
        { title: "DRS Register New Report", icon: FileText, href: "/dashboard/operations/reports/drs-register-new" },
        { title: "GR Register LX", icon: FileText, href: "/dashboard/operations/reports/gr-register-lx" },
        { title: "LHC Report GRL", icon: Truck, href: "/dashboard/operations/reports/lhc-report-grl" },
        { title: "LHC Report GRL New", icon: TrendingUp, href: "/dashboard/operations/reports/lhc-report-grl-new" },
        { title: "Loading Tally", icon: ClipboardList, href: "/dashboard/operations/reports/loading-tally" },
        { title: "POD Not Uploaded New", icon: AlertCircle, href: "/dashboard/operations/reports/pod-not-uploaded" },
        { title: "POD Register Report", icon: Receipt, href: "/dashboard/operations/reports/pod-register" },
        { title: "Short / Excess Report", icon: AlertTriangle, href: "/dashboard/operations/reports/short-excess" },
        { title: "Undelivery Register Report", icon: Clock, href: "/dashboard/operations/reports/undelivery-register" },
        { title: "Vehicle Arrival Report", icon: Bus, href: "/dashboard/operations/reports/vehicle-arrival" },
        // Moved from Tools section
        { title: "GRL Manifest Report", icon: FileText, href: "/dashboard/utilities/grl-manifest-report" },
        { title: "Manifest", icon: Map, href: "/dashboard/utilities/manifest" },
      ],
    },
  ],
  Accounts: [
    {
      title: "Workflow",
      icon: ClipboardList,
      items: [
        { title: "Money Receipt", icon: DollarSign, href: "/dashboard/accounts/transaction/money-receipt" },
        { title: "Reverse Money Receipt", icon: RotateCcw, href: "/dashboard/accounts/transaction/reverse-mr" },
        { title: "Bank Reconciliation", icon: BarChart, href: "/dashboard/accounts/transaction/bank-reconciliation" },
        { title: "Freight Memo Payment", icon: Receipt, href: "/dashboard/accounts/transaction/freight-memo-payment" },
        { title: "Vendor Bill Receipt", icon: DollarSign, href: "/dashboard/accounts/transaction/vendor-bill-receipt" },
        { title: "Vendor Bill Passing", icon: FileCheck, href: "/dashboard/accounts/transaction/vendor-bill-passing" },
        { title: "Vendor Bill Payment", icon: Receipt, href: "/dashboard/accounts/transaction/vendor-bill-payment" },
        { title: "Vendor Bill Search", icon: Search, href: "/dashboard/accounts/transaction/vendor-bill-enquiry" },
        { title: "Bill Search", icon: Search, href: "/dashboard/accounts/transaction/bill-enquiry" },
        { title: "LHC Advance Payment", icon: Handshake, href: "/dashboard/accounts/transaction/lhc-advance-payment" },
        { title: "LHC Balances Payment", icon: PiggyBank, href: "/dashboard/accounts/transaction/lhc-balance-payment" },
        { title: "Fund Transfer", icon: Landmark, href: "/dashboard/accounts/transaction/fund-transfer" },
        { title: "Fund Transfer Approval", icon: ShieldCheck, href: "/dashboard/accounts/transaction/fund-transfer-approval" },
        { title: "Account Adjustment", icon: RotateCcw, href: "/dashboard/accounts/transaction/on-ac-adjustment" },
        { title: "Operational Expense", icon: PiggyBank, href: "/dashboard/accounts/transaction/operational-expense" },
        { title: "Vendro Expense Entry", icon: PiggyBank, href: "/dashboard/accounts/transaction/vendor-operational-expense" },
        // ✅ FIX: Renamed duplicate to unique title
        { title: "Bank Reconciliation (Blank)", icon: FileText, href: "/dashboard/accounts/transaction/" },
        { title: "Voucher Entry", icon: ClipboardList, href: "/dashboard/accounts/transaction/voucher" },
        { title: "TDS Rate Setup", icon: FileText, href: "/dashboard/accounts/transaction/tds-rate" },
        { title: "Detention Debit Notes", icon: FileWarning, href: "/dashboard/accounts/transaction/detention-debit-notes" },
        { title: "Driver Advance Wallet", icon: Wallet, href: "/dashboard/accounts/transaction/driver-advance-wallet" },
        { title: "Fastag Reconciliation", icon: CreditCard, href: "/dashboard/accounts/transaction/fastag-reconciliation" },
        { title: "Internal Damage Ledger", icon: Shield, href: "/dashboard/accounts/transaction/internal-damage-ledger" },
        { title: "RTO Billing", icon: ReceiptText, href: "/dashboard/accounts/transaction/rto-billing" },
      ],
    },
    {
      title: "Setup",
      icon: FolderTree,
      items: [
        { title: "Customer", icon: Users, href: "/dashboard/accounts/master/customers" },
        { title: "Vendor", icon: Building2, href: "/dashboard/accounts/master/vendor" },
        { title: "Account Group", icon: FolderTree, href: "/dashboard/accounts/master/main-group" },
        { title: "Account Sub Group", icon: GitBranch, href: "/dashboard/accounts/master/sub-group" },
        { title: "Cost Center", icon: GitBranch, href: "/dashboard/accounts/master/cost-center" },
        { title: "TDS Categories", icon: FileText, href: "/dashboard/accounts/master/tds-category" },
        { title: "TDS Sections", icon: FileText, href: "/dashboard/accounts/master/tds-section" },
        { title: "TDS Statuses", icon: FileCheck, href: "/dashboard/accounts/master/tds-status" },
        { title: "Client Credit Profiles (ENHANCED)", icon: BadgeIndianRupee, href: "/dashboard/accounts/master/client-credit-profiles" },
        { title: "TDS Rule Engine (SECTION 194C)", icon: FileSpreadsheet, href: "/dashboard/accounts/master/tds-rule" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      items: [
        { title: "Day Book", icon: BookOpen, href: "/dashboard/accounts/reports/day-book" },
        { title: "Cash Report", icon: IndianRupee, href: "/dashboard/accounts/reports/cash" },
        { title: "Ledger Report", icon: FileSpreadsheet, href: "/dashboard/accounts/reports/ledger" },
        { title: "Bill Register", icon: ReceiptText, href: "/dashboard/accounts/reports/bill-register-gr-wise" },
        { title: "Billed VS UnBilled", icon: ReceiptText, href: "/dashboard/accounts/reports/" },
        { title: "Billed UnBilled Counters", icon: FileCheck, href: "/dashboard/accounts/reports/billed-unbilled-counters" },
        { title: "Cash And Bank Register", icon: IndianRupee, href: "/dashboard/accounts/reports/cash-bank-mr-register" },
        { title: "Gst 1R Report", icon: FileBarChart, href: "/dashboard/accounts/reports/gst-1r" },
        { title: "Vendor Bill Register", icon: FileOutput, href: "/dashboard/accounts/reports/vendor-bill-register" },
        { title: "Funds Transfer Register", icon: Landmark, href: "/dashboard/accounts/reports/funds-transfer" },
      ],
    },
  ],
  Administrator: [
    {
      title: "Workflow",
      icon: ClipboardList,
      items: [
        { title: "MRN Type", icon: FileText, href: "/dashboard/administrator/transaction/mrn-type-master" },
        { title: "Query Builder", icon: Database, href: "/dashboard/administrator/transaction/query-builder" },
        { title: "Reset Data", icon: RotateCcw, href: "/dashboard/administrator/transaction/reset-data" },
      ],
    },
    {
      title: "Setup",
      icon: FolderTree,
      items: [
        { title: "Activate Deactivate User", icon: UserCog, href: "/dashboard/administrator/master/activate-deactivate-user" },
        {
          title: "System Config",
          icon: Settings,
          children: [
            {
              title: "API Integration Layer",
              icon: Database,
              children: [
                { title: "GST/NIC E-Way Bill API Config", icon: FileBarChart, href: "/dashboard/administrator/master/admin-other/api-integration/gst-nic-config" },
                { title: "Vahan/Sarathi API Config", icon: Car, href: "/dashboard/administrator/master/admin-other/api-integration/vahan-sarathi-config" },
                { title: "Fastag API Config", icon: CreditCard, href: "/dashboard/administrator/master/admin-other/api-integration/fastag-api-config" },
                { title: "WhatsApp Business API Config", icon: MessageSquare, href: "/dashboard/administrator/master/admin-other/api-integration/whatsapp-api-config" },
                { title: "Fuel Card API Config", icon: Fuel, href: "/dashboard/administrator/master/admin-other/api-integration/fuel-api-config" },
              ]
            },
            { title: "Company Profile", icon: Building2, href: "/dashboard/administrator/master/admin-other/company-master" },
            { title: "Accounts Para Setup Master", icon: Settings, href: "/dashboard/administrator/master/admin-other/acc-para-setup" },
            { title: "Copy Paste Menu", icon: ClipboardList, href: "/dashboard/administrator/master/admin-other/copy-paste-menu" },
            { title: "Document Cancel/Uncancel", icon: FileX, href: "/dashboard/administrator/master/admin-other/document-cancel-uncancel" },
            { title: "Document Print Setup Master", icon: Printer, href: "/dashboard/administrator/master/admin-other/document-print-setup" },
            { title: "Financial Year Closing", icon: CalendarX, href: "/dashboard/administrator/master/admin-other/financial-year-closing" },
            { title: "Financial Year Master", icon: CalendarDays, href: "/dashboard/administrator/master/admin-other/financial-year" },
            { title: "Invoice Setup", icon: Receipt, href: "/dashboard/administrator/master/admin-other/invoice-setup" },
            { title: "Menu Master", icon: Menu, href: "/dashboard/administrator/master/admin-other/menu-master" },
            { title: "Module Lock", icon: Lock, href: "/dashboard/administrator/master/admin-other/module-lock" },
            { title: "Parameter Configuration", icon: Settings, href: "/dashboard/administrator/master/admin-other/parameters" },
            { title: "Parameter Setup", icon: Sliders, href: "/dashboard/administrator/master/admin-other/parameter-setup" },
            { title: "Product Master", icon: BoxesIcon, href: "/dashboard/administrator/master/admin-other/product-master" },
          ]
        },
        {
          title: "GST",
          icon: FileBarChart,
          children: [
            { title: "GST Category Master", icon: FolderTree, href: "/dashboard/administrator/master/gst/gst-category" },
            { title: "GST Configuration Master", icon: Settings, href: "/dashboard/administrator/master/gst/gst-configuration" },
            { title: "GST Exemption Category Master", icon: FileCheck, href: "/dashboard/administrator/master/gst/gst-exemption-category" },
          ]
        },
        { title: "Print Copy Type Master", icon: Printer, href: "/dashboard/administrator/master/print-copy-type" },
        {
          title: "SMS/Email",
          icon: Mail,
          children: [
            { title: "Email Template", icon: Mail, href: "/dashboard/administrator/master/sms-email/email-template" },
            { title: "SMS Template Master", icon: MessageCircle, href: "/dashboard/administrator/master/sms-email/sms-template" },
            { title: "SMS/Email Configuration", icon: Settings, href: "/dashboard/administrator/master/sms-email/sms-email-config" },
            { title: "SMS/Email Master", icon: Mail, href: "/dashboard/administrator/master/sms-email/sms-email-master" },
          ]
        },
        { title: "SQL Procedure Master", icon: Database, href: "/dashboard/administrator/master/sql-procedure" },
        {
          title: "Stations",
          icon: Map,
          children: [
            { title: "Hub Office", icon: Building2, href: "/dashboard/administrator/master/stations/hub-office" },
            { title: "Unschedule Delivery Points", icon: MapPin, href: "/dashboard/administrator/master/stations/unschedule-delivery-points" },
            { title: "Agency Master", icon: Building2, href: "/dashboard/administrator/master/stations/agency-master" },
            { title: "Branch Master", icon: Building2, href: "/dashboard/administrator/master/stations/branch-master" },
            { title: "Zonal Master", icon: Map, href: "/dashboard/administrator/master/stations/zonal-master" },
          ]
        },
        { title: "Tariff Master", icon: BarChart, href: "/dashboard/administrator/master/tariff" },
        {
          title: "User & Rights",
          icon: ShieldCheck,
          children: [
            { title: "Users", icon: Users, href: "/dashboard/administrator/master/users" },
            { title: "Right Assignment", icon: ShieldCheck, href: "/dashboard/administrator/master/user-rights/right-assignment" },
            { title: "Role Master", icon: ShieldCheck, href: "/dashboard/administrator/master/user-rights/role-master" },
            { title: "User Master", icon: Users, href: "/dashboard/administrator/master/user-rights/user-master" },
          ]
        },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      items: [
        { title: "Custom Report Builder", icon: BarChart3, href: "/dashboard/administrator/reports/build-your-own-report" },
        // Moved from Tools section
        { title: "Audit Logs", icon: FileText, href: "/dashboard/administrator/tools/audit-logs" },
        { title: "Year End Closing", icon: FileText, href: "/dashboard/administrator/tools/year-end-closing" },
        { title: "Document Control", icon: FileText, href: "/dashboard/administrator/tools/document-control" },
        { title: "Manifest Details", icon: FileText, href: "/dashboard/administrator/tools/manifest-details" },
        { title: "Manifest Details New", icon: FileText, href: "/dashboard/administrator/tools/manifest-details-new" },
      ],
    },
  ],
  Inventory: [
    {
      title: "Workflow",
      icon: ClipboardList,
      items: [
        { title: "Item Purchase", icon: ShoppingCart, href: "/dashboard/inventory/transaction/purchase" },
        { title: "HO Stationary Stock Register", icon: Building2, href: "/dashboard/inventory/transaction/ho-stationery-stock" },
        { title: "Item Despatch", icon: Truck, href: "/dashboard/inventory/transaction/despatch" },
        { title: "Item Despatch Receive", icon: Truck, href: "/dashboard/inventory/transaction/item-despatch-receive" },
        { title: " Stock Issue To Branch", icon: GitBranch, href: "/dashboard/inventory/transaction/stock-issue" },
      ],
    },
    {
      title: "Setup",
      icon: FolderTree,
      items: [
        { title: "Stationery Items", icon: BoxesIcon, href: "/dashboard/inventory/master/items-web" },
        { title: "Materials", icon: PackagePlus, href: "/dashboard/inventory/master/materials" },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      items: [
        { title: "Branch Stock Report", icon: BoxesIcon, href: "/dashboard/inventory/reports/branch-stationery-stock" },
        { title: "Purchase Register", icon: FileText, href: "/dashboard/inventory/reports/stationery-purchase-register" },
        // Moved from Tools section
        { title: "Coming Soon", icon: BoxesIcon, href: "/dashboard/inventory/tools/coming-soon" },
      ],
    },
  ],
  Network: [
    {
      title: "Workflow",
      icon: ClipboardList,
      items: [
        { title: "Inbound at Hub", icon: Package, href: "/dashboard/network/workflow/inbound-hub" },
        { title: "Floor Allocation", icon: Layers, href: "/dashboard/network/workflow/floor-allocation" },
        { title: "Digital Bagging", icon: PackagePlus, href: "/dashboard/network/workflow/digital-bagging" },
        { title: "Bag Dispatch", icon: Send, href: "/dashboard/network/workflow/bag-dispatch" },
        { title: "Cross Dock Entry", icon: Split, href: "/dashboard/network/workflow/cross-dock" },
        {
          title: "Hub Transfer",
          icon: Truck,
          children: [
            { title: "Initiate Transfer", icon: Send, href: "/dashboard/network/workflow/transfer/initiate" },
            { title: "Receive Transfer", icon: Package, href: "/dashboard/network/workflow/transfer/receive" },
            { title: "Transfer History", icon: History, href: "/dashboard/network/workflow/transfer/history" },
          ]
        },
        {
          title: "Load Planning",
          icon: ClipboardList,
          children: [
            { title: "Vehicle Loading", icon: Truck, href: "/dashboard/network/workflow/load/vehicle" },
            { title: "Route Optimization", icon: Navigation, href: "/dashboard/network/workflow/load/optimization" },
            { title: "Load Manifest", icon: FileText, href: "/dashboard/network/workflow/load/manifest" },
          ]
        },
      ],
    },
    {
      title: "Setup",
      icon: FolderTree,
      items: [
        { title: "Hubs", icon: Building, href: "/dashboard/network/setup/hubs" },
        { title: "Spokes", icon: GitBranch, href: "/dashboard/network/setup/spokes" },
        { title: "Pin Code Routing", icon: MapPinned, href: "/dashboard/network/setup/pincode-routing" },
        { title: "Zone Configuration", icon: Map, href: "/dashboard/network/setup/zone-configuration" },
        {
          title: "Route Master",
          icon: RouteIcon,
          children: [
            { title: "Primary Routes", icon: Navigation, href: "/dashboard/network/setup/route-master/primary" },
            { title: "Alternate Routes", icon: GitMerge, href: "/dashboard/network/setup/route-master/alternate" },
            { title: "Route Mapping", icon: Map, href: "/dashboard/network/setup/route-master/mapping" },
          ]
        },
        {
          title: "Geofence Management",
          icon: Radar,
          children: [
            { title: "Hub Geofence", icon: Building, href: "/dashboard/network/setup/geofence/hub" },
            { title: "Spoke Geofence", icon: MapPin, href: "/dashboard/network/setup/geofence/spoke" },
            { title: "Geofence Rules", icon: Shield, href: "/dashboard/network/setup/geofence/rules" },
          ]
        },
        {
          title: "Service Level Agreements (SLA)",
          icon: Clock,
          children: [
            { title: "Transit SLA", icon: Truck, href: "/dashboard/network/setup/sla/transit" },
            { title: "Handling SLA", icon: Package, href: "/dashboard/network/setup/sla/handling" },
            { title: "Delivery SLA", icon: Navigation, href: "/dashboard/network/setup/sla/delivery" },
          ]
        },
      ],
    },
    {
      title: "Reports",
      icon: BarChart3,
      items: [
        { title: "Hub Inventory Report", icon: BoxesIcon, href: "/dashboard/network/insights/hub-inventory" },
        { title: "Network Flow Report", icon: TrendingUpIcon, href: "/dashboard/network/insights/network-flow" },
        { title: "Geofence Alert Log", icon: AlertOctagon, href: "/dashboard/network/insights/geofence-alerts" },
        {
          title: "Performance Metrics",
          icon: GaugeCircle,
          children: [
            { title: "Hub Performance", icon: Building, href: "/dashboard/network/insights/performance/hub" },
            { title: "Route Performance", icon: RouteIcon, href: "/dashboard/network/insights/performance/route" },
            { title: "SLA Compliance", icon: Clock, href: "/dashboard/network/insights/performance/sla" },
          ]
        },
        {
          title: "Traffic Analytics",
          icon: ActivitySquare,
          children: [
            { title: "Volume Analysis", icon: BarChart, href: "/dashboard/network/insights/traffic/volume" },
            { title: "Peak Hours", icon: Clock, href: "/dashboard/network/insights/traffic/peak-hours" },
            { title: "Bottleneck Detection", icon: AlertTriangle, href: "/dashboard/network/insights/traffic/bottlenecks" },
          ]
        },
        {
          title: "Real-time Monitoring",
          icon: Wifi,
          children: [
            { title: "Live Network Status", icon: Signal, href: "/dashboard/network/insights/monitoring/status" },
            { title: "Hub Capacity", icon: Warehouse, href: "/dashboard/network/insights/monitoring/capacity" },
            { title: "Vehicle Tracking", icon: Car, href: "/dashboard/network/insights/monitoring/vehicles" },
          ]
        },
        // Moved from Tools section
        { title: "Bag Tracker", icon: Package, href: "/dashboard/network/tools/bag-tracker" },
        { title: "Network Health Dashboard", icon: Activity, href: "/dashboard/network/tools/health-dashboard" },
        { title: "Route Simulator", icon: Navigation, href: "/dashboard/network/tools/route-simulator" },
        { title: "Capacity Planner", icon: BarChart3, href: "/dashboard/network/tools/capacity-planner" },
        {
          title: "Cost Optimizer",
          icon: Calculator,
          children: [
            { title: "Route Cost Analysis", icon: DollarSign, href: "/dashboard/network/tools/cost/route" },
            { title: "Hub Operating Cost", icon: Building, href: "/dashboard/network/tools/cost/hub" },
            { title: "Optimization Suggestions", icon: TrendingUpIcon, href: "/dashboard/network/tools/cost/suggestions" },
          ]
        },
        {
          title: "Network Simulator",
          icon: Cpu,
          children: [
            { title: "What-If Analysis", icon: GitBranch, href: "/dashboard/network/tools/simulator/whatif" },
            { title: "Load Testing", icon: Activity, href: "/dashboard/network/tools/simulator/load" },
            { title: "Disaster Recovery", icon: Shield, href: "/dashboard/network/tools/simulator/disaster" },
          ]
        },
        {
          title: "Integration Tools",
          icon: Database,
          children: [
            // ✅ Fixed typo: /dasboard/ → /dashboard/
            { title: "API Logs", icon: FileText, href: "/dashboard/network/tools/integration/api-logs" },
            { title: "Webhook Monitor", icon: Globe, href: "/dashboard/network/tools/integration/webhooks" },
            { title: "Data Sync Status", icon: RefreshCw, href: "/dashboard/network/tools/integration/sync" },
          ]
        },
      ],
    },
  ],
  Dashboard: [],
};

// ============================
// Help & Support group
// ============================
export const helpAndSupportGroup: NavGroup = {
  title: "Help & Support",
  icon: LifeBuoy,
  items: [
    { title: "Help Center", icon: LifeBuoy, href: "/help" },
    { title: "Support Tickets", icon: Ticket, href: "/help/tickets" },
    { title: "Audit Logs", icon: Scroll, href: "/help/logs" },
    { title: "Contact / Chat", icon: MessageCircle, href: "/contact" },
  ],
};

// ============================
// Helper: Extract all leaf pages from any array of NavGroups
// ============================
export function extractAllPages(groups: NavGroup[]): Array<{ path: string; name: string; module: string; icon: React.ElementType }> {
  const pages: Array<{ path: string; name: string; module: string; icon: React.ElementType }> = [];

  const traverse = (items: NavItem[], moduleName: string) => {
    for (const item of items) {
      if (item.href && !item.children) {
        pages.push({
          path: item.href,
          name: item.title,
          module: moduleName,
          icon: item.icon,
        });
      }
      if (item.children) {
        traverse(item.children, moduleName);
      }
    }
  };

  for (const group of groups) {
    traverse(group.items, group.title);
  }
  return pages;
}