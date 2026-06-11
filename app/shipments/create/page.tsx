"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CalendarIcon,
  Package,
  MapPin,
  CheckCircle,
  Plus,
  Minus,
  Save,
  Send,
  Calculator,
  Shield,
  Info,
  X,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:5000"

interface ShipmentItem {
  id: string
  description: string
  quantity: number
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  value: number // in INR
  category: string
  hazardous: boolean
}

interface Address {
  company: string
  contactName: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  email: string
}

interface AlertState {
  show: boolean
  type: "success" | "error" | "warning" | "info"
  message: string
}

export default function CreateShipmentPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [shipmentType, setShipmentType] = useState("standard")
  const [priority, setPriority] = useState("standard")
  const [pickupDate, setPickupDate] = useState<Date>()
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [items, setItems] = useState<ShipmentItem[]>([
    {
      id: "1",
      description: "",
      quantity: 1,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      value: 0,
      category: "general",
      hazardous: false,
    },
  ])
  const [originAddress, setOriginAddress] = useState<Address>({
    company: "",
    contactName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IN",
    phone: "",
    email: "",
  })
  const [destinationAddress, setDestinationAddress] = useState<Address>({
    company: "",
    contactName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IN",
    phone: "",
    email: "",
  })
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [insuranceRequired, setInsuranceRequired] = useState(false)
  const [signatureRequired, setSignatureRequired] = useState(false)
  const [temperatureControlled, setTemperatureControlled] = useState(false)
  const [fragile, setFragile] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [carrier, setCarrier] = useState("")
  const [service, setService] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: "success",
    message: "",
  })

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  // INR Conversion rates (example rates - adjust as needed)
  const BASE_RATE_INR = 125 // ₹125 per kg base rate
  const EXPRESS_MULTIPLIER = 2
  const OVERNIGHT_MULTIPLIER = 3
  const INSURANCE_RATE = 0.01 // 1% of value
  const SIGNATURE_FEE_INR = 415 // ₹415
  const TEMP_CONTROL_FEE_INR = 2075 // ₹2075
  const FRAGILE_FEE_INR = 830 // ₹830
  const BASE_SHIPPING_INR = 1245 // ₹1245

  // Show alert function
  const showAlert = (type: "success" | "error" | "warning" | "info", message: string) => {
    setAlert({ show: true, type, message })
    setTimeout(() => {
      setAlert({ show: false, type: "success", message: "" })
    }, 5000)
  }

  const addItem = () => {
    const newItem: ShipmentItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      value: 0,
      category: "general",
      hazardous: false,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    )
  }

  const calculateTotalWeight = () => {
    return items.reduce((total, item) => total + item.weight * item.quantity, 0)
  }

  const calculateTotalValue = () => {
    return items.reduce((total, item) => total + item.value * item.quantity, 0)
  }

  const calculateEstimate = () => {
    const totalWeight = calculateTotalWeight()
    const totalValue = calculateTotalValue()
    
    // Priority multiplier
    let priorityMultiplier = 1
    let priorityFee = 0
    if (priority === "express") {
      priorityMultiplier = EXPRESS_MULTIPLIER
      priorityFee = 1245 // ₹1245 extra for express
    } else if (priority === "overnight") {
      priorityMultiplier = OVERNIGHT_MULTIPLIER
      priorityFee = 2905 // ₹2905 extra for overnight
    }
    
    // Weight charge: ₹125 per kg
    const weightCharge = totalWeight * BASE_RATE_INR
    
    // Insurance: 1% of total value
    const insuranceCharge = insuranceRequired ? totalValue * INSURANCE_RATE : 0
    
    // Additional services
    const signatureCharge = signatureRequired ? SIGNATURE_FEE_INR : 0
    const tempCharge = temperatureControlled ? TEMP_CONTROL_FEE_INR : 0
    const fragileCharge = fragile ? FRAGILE_FEE_INR : 0
    
    // Total estimate
    const estimate = BASE_SHIPPING_INR + weightCharge + priorityFee + insuranceCharge + 
                     signatureCharge + tempCharge + fragileCharge
    
    setEstimatedCost(Math.round(estimate))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Format currency in INR
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Save as Draft
  const saveAsDraft = async () => {
    setIsLoading(true)
    
    const shipmentData = {
      shipmentType,
      priority,
      pickupDate,
      deliveryDate,
      originAddress,
      destinationAddress,
      items,
      specialInstructions,
      insuranceRequired,
      signatureRequired,
      temperatureControlled,
      fragile,
      carrier,
      service,
      estimatedCost,
      customerName,
      customerEmail,
      customerPhone,
      currency: "INR",
      status: "draft",
    }

    try {
      const response = await fetch(`${API_URL}/api/createshipments/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", "✅ Shipment saved as draft successfully!")
      } else {
        showAlert("error", `❌ Failed to save draft: ${data.message}`)
      }
    } catch (error) {
      console.error("Save draft error:", error)
      showAlert("error", "❌ Network error! Failed to save draft.")
    } finally {
      setIsLoading(false)
    }
  }

  // Create Shipment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!customerName || !customerEmail || !customerPhone) {
      showAlert("error", "❌ Please fill in customer details!")
      setIsLoading(false)
      return
    }

    if (!pickupDate) {
      showAlert("error", "❌ Please select pickup date!")
      setIsLoading(false)
      return
    }

    if (items.length === 0 || !items[0].description) {
      showAlert("error", "❌ Please add at least one item with description!")
      setIsLoading(false)
      return
    }

    const shipmentData = {
      shipmentType,
      priority,
      pickupDate,
      deliveryDate,
      originAddress,
      destinationAddress,
      items,
      specialInstructions,
      insuranceRequired,
      signatureRequired,
      temperatureControlled,
      fragile,
      carrier,
      service,
      estimatedCost,
      customerName,
      customerEmail,
      customerPhone,
      currency: "INR",
    }

    try {
      const response = await fetch(`${API_URL}/api/createshipments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      })

      const data = await response.json()

      if (data.success) {
        showAlert("success", `✅ Shipment created successfully! Tracking ID: ${data.data.trackingId}`)
        
        // Reset form after successful submission
        setTimeout(() => {
          setCurrentStep(1)
          setCustomerName("")
          setCustomerEmail("")
          setCustomerPhone("")
          setPickupDate(undefined)
          setDeliveryDate(undefined)
          setOriginAddress({
            company: "",
            contactName: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zipCode: "",
            country: "IN",
            phone: "",
            email: "",
          })
          setDestinationAddress({
            company: "",
            contactName: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zipCode: "",
            country: "IN",
            phone: "",
            email: "",
          })
          setItems([{
            id: "1",
            description: "",
            quantity: 1,
            weight: 0,
            dimensions: { length: 0, width: 0, height: 0 },
            value: 0,
            category: "general",
            hazardous: false,
          }])
          setSpecialInstructions("")
          setInsuranceRequired(false)
          setSignatureRequired(false)
          setTemperatureControlled(false)
          setFragile(false)
          setCarrier("")
          setService("")
          setEstimatedCost(0)
        }, 2000)
      } else {
        showAlert("error", `❌ Failed to create shipment: ${data.message}`)
      }
    } catch (error) {
      console.error("Create shipment error:", error)
      showAlert("error", "❌ Network error! Failed to create shipment.")
    } finally {
      setIsLoading(false)
    }
  }

  // Alert Component
  const AlertComponent = () => {
    if (!alert.show) return null

    const alertStyles = {
      success: "bg-green-50 border-green-500 text-green-800",
      error: "bg-red-50 border-red-500 text-red-800",
      warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
      info: "bg-blue-50 border-blue-500 text-blue-800",
    }

    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      error: <AlertCircle className="h-5 w-5 text-red-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />,
    }

    return (
      <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
        <div className={cn("rounded-lg border p-4 shadow-lg min-w-[300px]", alertStyles[alert.type])}>
          <div className="flex items-start gap-3">
            {icons[alert.type]}
            <div className="flex-1">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
            <button
              onClick={() => setAlert({ ...alert, show: false })}
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Customer Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Customer Details
                </CardTitle>
                <CardDescription>Enter customer information for this shipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name *</Label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Email *</Label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter customer email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Customer Phone *</Label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter customer phone"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Shipment Type & Priority
                </CardTitle>
                <CardDescription>Select the type of shipment and delivery priority</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Shipment Type</Label>
                  <RadioGroup value={shipmentType} onValueChange={setShipmentType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard Package</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="document" id="document" />
                      <Label htmlFor="document">Document Envelope</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="freight" id="freight" />
                      <Label htmlFor="freight">Freight/Pallet</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bulk" id="bulk" />
                      <Label htmlFor="bulk">Bulk Cargo</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Delivery Priority</Label>
                  <RadioGroup value={priority} onValueChange={setPriority}>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="priority-standard" />
                        <div>
                          <Label htmlFor="priority-standard" className="font-medium">
                            Standard
                          </Label>
                          <p className="text-sm text-muted-foreground">5-7 business days</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{formatINR(1245)}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="express" id="priority-express" />
                        <div>
                          <Label htmlFor="priority-express" className="font-medium">
                            Express
                          </Label>
                          <p className="text-sm text-muted-foreground">2-3 business days</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{formatINR(2490)}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="overnight" id="priority-overnight" />
                        <div>
                          <Label htmlFor="priority-overnight" className="font-medium">
                            Overnight
                          </Label>
                          <p className="text-sm text-muted-foreground">Next business day</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{formatINR(4150)}</Badge>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !pickupDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Select pickup date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Preferred Delivery Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !deliveryDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : "Select delivery date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Origin Address
                </CardTitle>
                <CardDescription>Enter the pickup location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin-company">Company Name</Label>
                    <Input
                      id="origin-company"
                      value={originAddress.company}
                      onChange={(e) => setOriginAddress({ ...originAddress, company: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-contact">Contact Name</Label>
                    <Input
                      id="origin-contact"
                      value={originAddress.contactName}
                      onChange={(e) => setOriginAddress({ ...originAddress, contactName: e.target.value })}
                      placeholder="Enter contact name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin-address1">Address Line 1</Label>
                  <Input
                    id="origin-address1"
                    value={originAddress.address1}
                    onChange={(e) => setOriginAddress({ ...originAddress, address1: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin-address2">Address Line 2 (Optional)</Label>
                  <Input
                    id="origin-address2"
                    value={originAddress.address2}
                    onChange={(e) => setOriginAddress({ ...originAddress, address2: e.target.value })}
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin-city">City</Label>
                    <Input
                      id="origin-city"
                      value={originAddress.city}
                      onChange={(e) => setOriginAddress({ ...originAddress, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-state">State</Label>
                    <Select
                      value={originAddress.state}
                      onValueChange={(value) => setOriginAddress({ ...originAddress, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MH">Maharashtra</SelectItem>
                        <SelectItem value="DL">Delhi</SelectItem>
                        <SelectItem value="KA">Karnataka</SelectItem>
                        <SelectItem value="TN">Tamil Nadu</SelectItem>
                        <SelectItem value="WB">West Bengal</SelectItem>
                        <SelectItem value="GJ">Gujarat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-zip">PIN Code</Label>
                    <Input
                      id="origin-zip"
                      value={originAddress.zipCode}
                      onChange={(e) => setOriginAddress({ ...originAddress, zipCode: e.target.value })}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin-phone">Phone Number</Label>
                    <Input
                      id="origin-phone"
                      value={originAddress.phone}
                      onChange={(e) => setOriginAddress({ ...originAddress, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-email">Email Address</Label>
                    <Input
                      id="origin-email"
                      type="email"
                      value={originAddress.email}
                      onChange={(e) => setOriginAddress({ ...originAddress, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Destination Address
                </CardTitle>
                <CardDescription>Enter the delivery location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dest-company">Company Name</Label>
                    <Input
                      id="dest-company"
                      value={destinationAddress.company}
                      onChange={(e) => setDestinationAddress({ ...destinationAddress, company: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-contact">Contact Name</Label>
                    <Input
                      id="dest-contact"
                      value={destinationAddress.contactName}
                      onChange={(e) => setDestinationAddress({ ...destinationAddress, contactName: e.target.value })}
                      placeholder="Enter contact name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dest-address1">Address Line 1</Label>
                  <Input
                    id="dest-address1"
                    value={destinationAddress.address1}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, address1: e.target.value })}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dest-address2">Address Line 2 (Optional)</Label>
                  <Input
                    id="dest-address2"
                    value={destinationAddress.address2}
                    onChange={(e) => setDestinationAddress({ ...destinationAddress, address2: e.target.value })}
                    placeholder="Apartment, suite, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dest-city">City</Label>
                    <Input
                      id="dest-city"
                      value={destinationAddress.city}
                      onChange={(e) => setDestinationAddress({ ...destinationAddress, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-state">State</Label>
                    <Select
                      value={destinationAddress.state}
                      onValueChange={(value) => setDestinationAddress({ ...destinationAddress, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MH">Maharashtra</SelectItem>
                        <SelectItem value="DL">Delhi</SelectItem>
                        <SelectItem value="KA">Karnataka</SelectItem>
                        <SelectItem value="TN">Tamil Nadu</SelectItem>
                        <SelectItem value="WB">West Bengal</SelectItem>
                        <SelectItem value="GJ">Gujarat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-zip">PIN Code</Label>
                    <Input
                      id="dest-zip"
                      value={destinationAddress.zipCode}
                      onChange={(e) => setDestinationAddress({ ...destinationAddress, zipCode: e.target.value })}
                      placeholder="Enter PIN code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dest-phone">Phone Number</Label>
                    <Input
                      id="dest-phone"
                      value={destinationAddress.phone}
                      onChange={(e) => setDestinationAddress({ ...destinationAddress, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-email">Email Address</Label>
                    <Input
                      id="dest-email"
                      type="email"
                      value={destinationAddress.email}
                      onChange={(e) => setDestinationAddress({ ...destinationAddress, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Package Details
                </CardTitle>
                <CardDescription>Add items to your shipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="Enter item description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={item.category} onValueChange={(value) => updateItem(item.id, "category", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Merchandise</SelectItem>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="books">Books</SelectItem>
                            <SelectItem value="food">Food & Beverages</SelectItem>
                            <SelectItem value="medical">Medical Supplies</SelectItem>
                            <SelectItem value="automotive">Automotive Parts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.weight}
                          onChange={(e) => updateItem(item.id, "weight", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Value (₹)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={item.value}
                          onChange={(e) => updateItem(item.id, "value", Number.parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id={`hazardous-${item.id}`}
                          checked={item.hazardous}
                          onCheckedChange={(checked) => updateItem(item.id, "hazardous", checked)}
                        />
                        <Label htmlFor={`hazardous-${item.id}`} className="text-sm">
                          Hazardous
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dimensions (cm)</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Length (cm)"
                          value={item.dimensions.length}
                          onChange={(e) =>
                            updateItem(item.id, "dimensions", {
                              ...item.dimensions,
                              length: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Width (cm)"
                          value={item.dimensions.width}
                          onChange={(e) =>
                            updateItem(item.id, "dimensions", {
                              ...item.dimensions,
                              width: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="Height (cm)"
                          value={item.dimensions.height}
                          onChange={(e) =>
                            updateItem(item.id, "dimensions", {
                              ...item.dimensions,
                              height: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button onClick={addItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Item
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{items.length}</div>
                    <div className="text-sm text-muted-foreground">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{calculateTotalWeight().toFixed(1)} kg</div>
                    <div className="text-sm text-muted-foreground">Total Weight</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{formatINR(calculateTotalValue())}</div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Special Services & Options
                </CardTitle>
                <CardDescription>Configure additional services for your shipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Insurance Coverage (1% of value)</Label>
                        <p className="text-sm text-muted-foreground">Protect your shipment against loss or damage</p>
                      </div>
                      <Switch checked={insuranceRequired} onCheckedChange={setInsuranceRequired} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Signature Required</Label>
                        <p className="text-sm text-muted-foreground">Require signature upon delivery</p>
                        <p className="text-xs text-muted-foreground">Additional {formatINR(SIGNATURE_FEE_INR)}</p>
                      </div>
                      <Switch checked={signatureRequired} onCheckedChange={setSignatureRequired} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Temperature Controlled</Label>
                        <p className="text-sm text-muted-foreground">Maintain specific temperature range</p>
                        <p className="text-xs text-muted-foreground">Additional {formatINR(TEMP_CONTROL_FEE_INR)}</p>
                      </div>
                      <Switch checked={temperatureControlled} onCheckedChange={setTemperatureControlled} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Fragile Handling</Label>
                        <p className="text-sm text-muted-foreground">Special care for delicate items</p>
                        <p className="text-xs text-muted-foreground">Additional {formatINR(FRAGILE_FEE_INR)}</p>
                      </div>
                      <Switch checked={fragile} onCheckedChange={setFragile} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Preferred Carrier</Label>
                      <Select value={carrier} onValueChange={setCarrier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select carrier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bluedart">Blue Dart</SelectItem>
                          <SelectItem value="delhivery">Delhivery</SelectItem>
                          <SelectItem value="dtdc">DTDC</SelectItem>
                          <SelectItem value="fedex">FedEx India</SelectItem>
                          <SelectItem value="dhl">DHL India</SelectItem>
                          <SelectItem value="xpressbees">XpressBees</SelectItem>
                          <SelectItem value="cargomax">CargoMax Fleet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Service Level</Label>
                      <Select value={service} onValueChange={setService}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ground">Ground (3-5 days)</SelectItem>
                          <SelectItem value="air">Air (2-3 days)</SelectItem>
                          <SelectItem value="express">Express (1-2 days)</SelectItem>
                          <SelectItem value="overnight">Overnight</SelectItem>
                          <SelectItem value="same-day">Same Day (Metro cities)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="special-instructions">Special Instructions</Label>
                  <Textarea
                    id="special-instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Enter any special handling instructions, delivery notes, or requirements..."
                    rows={4}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Additional services may affect shipping cost and delivery time. Review the cost estimate in the next
                    step. All prices are in Indian Rupees (₹).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Review & Cost Estimate
                </CardTitle>
                <CardDescription>Review your shipment details and get a cost estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Name:</span>
                          <span className="font-medium">{customerName || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Email:</span>
                          <span>{customerEmail || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <span>{customerPhone || "—"}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Shipment Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="capitalize">{shipmentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority:</span>
                          <span className="capitalize">{priority}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Items:</span>
                          <span>{items.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Weight:</span>
                          <span>{calculateTotalWeight().toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Value:</span>
                          <span>{formatINR(calculateTotalValue())}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Route</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">From:</span>
                          <p className="text-muted-foreground">
                            {originAddress.company || "Origin Company"}
                            <br />
                            {originAddress.city}, {originAddress.state} - {originAddress.zipCode}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">To:</span>
                          <p className="text-muted-foreground">
                            {destinationAddress.company || "Destination Company"}
                            <br />
                            {destinationAddress.city}, {destinationAddress.state} - {destinationAddress.zipCode}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Special Services</h4>
                      <div className="space-y-1 text-sm">
                        {insuranceRequired && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Insurance Coverage (1% of value)</span>
                          </div>
                        )}
                        {signatureRequired && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Signature Required (+{formatINR(SIGNATURE_FEE_INR)})</span>
                          </div>
                        )}
                        {temperatureControlled && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Temperature Controlled (+{formatINR(TEMP_CONTROL_FEE_INR)})</span>
                          </div>
                        )}
                        {fragile && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Fragile Handling (+{formatINR(FRAGILE_FEE_INR)})</span>
                          </div>
                        )}
                        {!insuranceRequired && !signatureRequired && !temperatureControlled && !fragile && (
                          <span className="text-muted-foreground">No special services selected</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Cost Breakdown (INR)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Base Shipping:</span>
                          <span>{formatINR(BASE_SHIPPING_INR)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weight Charge ({calculateTotalWeight().toFixed(1)} kg @ ₹{BASE_RATE_INR}/kg):</span>
                          <span>{formatINR(calculateTotalWeight() * BASE_RATE_INR)}</span>
                        </div>
                        {priority === "express" && (
                          <div className="flex justify-between">
                            <span>Express Service:</span>
                            <span>{formatINR(1245)}</span>
                          </div>
                        )}
                        {priority === "overnight" && (
                          <div className="flex justify-between">
                            <span>Overnight Service:</span>
                            <span>{formatINR(2905)}</span>
                          </div>
                        )}
                        {insuranceRequired && (
                          <div className="flex justify-between">
                            <span>Insurance (1% of {formatINR(calculateTotalValue())}):</span>
                            <span>{formatINR(calculateTotalValue() * 0.01)}</span>
                          </div>
                        )}
                        {signatureRequired && (
                          <div className="flex justify-between">
                            <span>Signature Service:</span>
                            <span>{formatINR(SIGNATURE_FEE_INR)}</span>
                          </div>
                        )}
                        {temperatureControlled && (
                          <div className="flex justify-between">
                            <span>Temperature Control:</span>
                            <span>{formatINR(TEMP_CONTROL_FEE_INR)}</span>
                          </div>
                        )}
                        {fragile && (
                          <div className="flex justify-between">
                            <span>Fragile Handling:</span>
                            <span>{formatINR(FRAGILE_FEE_INR)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-medium text-lg">
                          <span>Total Estimated Cost:</span>
                          <span className="text-green-600 font-bold">{formatINR(estimatedCost)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                          *GST @ 18% will be applied extra
                        </p>
                      </CardContent>
                    </Card>

                    <Button onClick={calculateEstimate} variant="outline" className="w-full">
                      <Calculator className="h-4 w-4 mr-2" />
                      Recalculate Estimate
                    </Button>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        This is an estimate. Final cost may vary based on actual dimensions, carrier rates, and applicable taxes.
                        All prices are in Indian Rupees (₹).
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Alert Component */}
      <AlertComponent />

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Create New Shipment</h1>
        <p className="text-muted-foreground mt-2">Follow the steps below to create and schedule your shipment</p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex flex-wrap gap-2 text-nowrap sm:justify-between text-xs text-muted-foreground">
            <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>Shipment Type</span>
            <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>Addresses</span>
            <span className={currentStep >= 3 ? "text-primary font-medium" : ""}>Package Details</span>
            <span className={currentStep >= 4 ? "text-primary font-medium" : ""}>Services</span>
            <span className={currentStep >= 5 ? "text-primary font-medium" : ""}>Review</span>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <div className="flex flex-wrap gap-2 justify-between mt-8">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          Previous
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveAsDraft} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Draft"}
          </Button>
          {currentStep === totalSteps ? (
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Creating..." : "Create Shipment"}
            </Button>
          ) : (
            <Button onClick={nextStep}>Next</Button>
          )}
        </div>
      </div>
    </div>
  )
}