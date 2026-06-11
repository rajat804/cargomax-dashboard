"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

const BASE_URI = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:4000";

export default function ShipmentForm() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customer: "",
        carrier: "",
        originWarehouse: "",
        destinationVendor: "",
        type: "",
        priority: "",
        weight: "",
        items: "",
        value: "",
    });

    // Fetch Warehouses and Vendors when dialog opens
    const fetchData = async () => {
        setLoading(true);
        try {
            const [whRes, venRes] = await Promise.all([
                axios.get(`${BASE_URI}/api/shipments/warehouses`),
                axios.get(`${BASE_URI}/api/shipments/vendors`),
            ]);
            setWarehouses(whRes.data.data || []);
            setVendors(venRes.data.data || []);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Failed to load data",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customer || !formData.originWarehouse || !formData.destinationVendor ||
            !formData.type || !formData.priority) {
            toast({
                variant: "destructive",
                title: "Missing Fields",
                description: "Please fill all required fields"
            });
            return;
        }

        try {
            const response = await axios.post(`${BASE_URI}/api/shipments`, formData);

            toast({
                title: "✅ Shipment Created Successfully",
                description: `Tracking ID: ${response.data.trackingId}`,
            });

            setIsOpen(false);
            
            // Reset form
            setFormData({
                customer: "", 
                carrier: "", 
                originWarehouse: "", 
                destinationVendor: "",
                type: "", 
                priority: "", 
                weight: "", 
                items: "", 
                value: ""
            });

            router.push("/shipments");

        } catch (error: any) {   // ← Fixed: Added type 'any'
            console.error("Submit Error:", error);
            toast({
                variant: "destructive",
                title: "❌ Failed to Create Shipment",
                description: error.response?.data?.message || 
                            error.message || 
                            "Something went wrong on server",
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Shipment
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Shipment</DialogTitle>
                    <DialogDescription>
                        Origin = Warehouse | Destination = Vendor | Tracking ID will be auto-generated
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Customer Name *</Label>
                            <Input
                                placeholder="Enter customer name"
                                value={formData.customer}
                                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Carrier</Label>
                            <Select value={formData.carrier} onValueChange={(v) => setFormData({ ...formData, carrier: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select carrier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cargomax">CargoMax Express</SelectItem>
                                    <SelectItem value="fasttrack">FastTrack Logistics</SelectItem>
                                    <SelectItem value="airspeed">AirSpeed Cargo</SelectItem>
                                    <SelectItem value="oceanwave">OceanWave Freight</SelectItem>
                                    <SelectItem value="raillink">RailLink Transport</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Origin Warehouse */}
                    <div className="space-y-2">
                        <Label>Warehouse *</Label>
                        <Select value={formData.originWarehouse} onValueChange={(v) => setFormData({ ...formData, originWarehouse: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select origin warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map((wh: any) => (
                                    <SelectItem key={wh._id} value={wh._id}>
                                        {wh.name} ({wh.code}) - {wh.city}, {wh.state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Destination Vendor */}
                    <div className="space-y-2">
                        <Label>Vendor *</Label>
                        <Select value={formData.destinationVendor} onValueChange={(v) => setFormData({ ...formData, destinationVendor: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select destination vendor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.map((ven: any) => (
                                    <SelectItem key={ven._id} value={ven._id}>
                                        {ven.companyName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Shipment Type</Label>
                            <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="road">Road</SelectItem>
                                    <SelectItem value="air">Air</SelectItem>
                                    <SelectItem value="sea">Sea</SelectItem>
                                    <SelectItem value="rail">Rail</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="express">Express</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="economy">Economy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Items Count</Label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={formData.items}
                                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Value ($)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Shipment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}