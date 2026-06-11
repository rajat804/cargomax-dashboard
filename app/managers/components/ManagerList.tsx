"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";           // ← Yeh import add kiya
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BASE_URI = process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:4000";

export default function ManagerList() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    salary: "",
    status: "",
    joinDate: "",
    address: "",
    warehouse: ""
  });

  useEffect(() => {
    axios.get(`${BASE_URI}/api/managers`)
      .then((res) => setManagers(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {

    fetchWarehouses();

  }, []);
  useEffect(() => {

  fetchManagers();

}, []);

  const fetchWarehouses = async () => {

    try {

      const res = await axios.get(`${BASE_URI}/api/warehouses`);

      setWarehouses(res.data.data);

    } catch (error) {

      console.log(error);

    }

  };
const fetchManagers = async () => {
  try {

    const res = await axios.get(`${BASE_URI}/api/managers`);

    setManagers(res.data.data);

  } catch (error) {

    console.log("Error fetching managers:", error);

  }
};

  // Mask Phone (last 5 digits visible)
  const maskPhone = (phone: string | undefined): string => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 5) return phone;
    return `xx-xx-${cleaned.slice(-5)}`;
  };

  // Mask Email
  const maskEmail = (email: string | undefined): string => {
    if (!email) return "N/A";
    const [username, domain] = email.split("@");
    if (!username || username.length <= 3) return email;
    return `${username.slice(0, 3)}...@${domain}`;
  };

  const handleView = (manager: any) => {
    setSelectedManager(manager);
    setViewOpen(true);
  };

  const handleChange = (e: any) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };



  const handleEdit = (manager: any) => {

    setSelectedManager(manager);

    setFormData({
      name: manager.name || "",
      email: manager.email || "",
      phone: manager.phone || "",
      position: manager.position || "",
      salary: manager.salary || "",
      status: manager.status || "",
      joinDate: manager.joinDate?.split("T")[0] || "",
      address: manager.address || "",
      warehouse: manager.warehouse?._id || ""
    });

    setEditOpen(true);
  };

  const updateManager = async (e: any) => {

    e.preventDefault();

    try {

      await axios.put(
        `${BASE_URI}/api/managers/${selectedManager._id}`,
        formData
      );

      alert("Manager Updated Successfully");

      setEditOpen(false);

      fetchManagers(); // list refresh

    } catch (error) {

      console.log(error);
      alert("Update Failed");

    }

  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete manager "${name}"?`)) return;

    try {
      await axios.delete(`${BASE_URI}/api/managers/${id}`);
      setManagers(managers.filter((m) => m._id !== id));
      toast({ title: "Manager deleted successfully" });
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to delete manager" });
    }
  };

  if (loading) return <p className="text-center py-10">Loading managers...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {managers.map((manager) => (
        <Card key={manager._id} className="relative hover:shadow-lg transition-all">
          <CardContent className="p-6">
            {/* 3 Dots Menu */}
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleView(manager)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(manager)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Manager
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(manager._id, manager.name)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Manager
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="text-xl font-semibold">{manager.name}</h3>
            <p className="text-sm text-muted-foreground">{manager.position}</p>

            <div className="mt-4 space-y-2 text-sm">
              <p><strong>Email:</strong> {maskEmail(manager.email)}</p>
              <p><strong>Phone:</strong> {maskPhone(manager.phone)}</p>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">Warehouse</p>
              <p className="font-medium">{manager.warehouse?.name || "Not Assigned"}</p>
            </div>

            <Badge
              className="mt-4"
              variant={manager.status === "active" ? "default" : "secondary"}
            >
              {manager.status?.toUpperCase() || "ACTIVE"}
            </Badge>
          </CardContent>
        </Card>
      ))}

      {managers.length === 0 && (
        <p className="text-center text-muted-foreground py-10 col-span-full">
          No managers found
        </p>
      )}

      {/* Beautiful View Modal */}
      {viewOpen && selectedManager && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">

          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">

            {/* HEADER */}
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-600 px-6 py-8 text-white relative rounded-t-3xl">

              <button
                onClick={() => setViewOpen(false)}
                className="absolute top-5 right-5 text-white/80 hover:text-white"
              >
                ✕
              </button>

              <div className="flex flex-col items-center text-center">

                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4">
                  👨‍💼
                </div>

                <h2 className="text-2xl font-bold">
                  {selectedManager.name}
                </h2>

                <p className="text-blue-100">
                  {selectedManager.position || "Manager"}
                </p>

              </div>
            </div>


            {/* SCROLLABLE CONTENT */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">

              {/* CONTACT */}
              <div className="space-y-4">

                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="text-xl">✉️</div>

                  <div>
                    <p className="text-xs text-gray-500">EMAIL</p>
                    <p className="font-medium">{selectedManager.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4">
                  <div className="text-xl">📱</div>

                  <div>
                    <p className="text-xs text-gray-500">PHONE</p>
                    <p className="font-medium">{selectedManager.phone}</p>
                  </div>
                </div>

              </div>


              {/* POSITION */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">POSITION</p>
                <p className="font-semibold text-lg">
                  {selectedManager.position || "Not Provided"}
                </p>
              </div>


              {/* WAREHOUSE */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">WAREHOUSE</p>
                <p className="font-semibold text-lg">
                  {selectedManager.warehouse?.name || "Not Assigned"}
                </p>
              </div>


              {/* STATUS */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-2">STATUS</p>

                <Badge
                  className={`px-4 py-1 ${selectedManager.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {selectedManager.status?.toUpperCase() || "UNKNOWN"}
                </Badge>
              </div>


              {/* SALARY */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">MONTHLY SALARY</p>

                <p className="text-2xl font-bold text-indigo-600">
                  ₹{Number(selectedManager.salary || 0).toLocaleString("en-IN")}
                </p>
              </div>


              {/* JOIN DATE */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">JOIN DATE</p>

                <p className="font-semibold">
                  {selectedManager.joinDate
                    ? new Date(selectedManager.joinDate).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )
                    : "Not Provided"}
                </p>
              </div>


              {/* ADDRESS */}
              {selectedManager.address && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">ADDRESS</p>

                  <p className="text-gray-700">
                    {selectedManager.address}
                  </p>
                </div>
              )}

            </div>


            {/* FOOTER */}
            <div className="border-t p-5 bg-gray-50 rounded-b-3xl">

              <Button
                onClick={() => setViewOpen(false)}
                className="w-full"
              >
                Close Details
              </Button>

            </div>

          </div>

        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* HEADER */}
            <div className="p-5 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit Manager</h2>

              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={updateManager}
              className="overflow-y-auto p-6 space-y-5 flex-1"
            >

              {/* NAME */}
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter manager name"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              {/* POSITION */}
              <div className="space-y-2">
                <Label>Position *</Label>

                <Select
                  value={formData.position}
                  onValueChange={(v) =>
                    setFormData({ ...formData, position: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Warehouse Manager">
                      Warehouse Manager
                    </SelectItem>

                    <SelectItem value="Assistant Manager">
                      Assistant Manager
                    </SelectItem>

                    <SelectItem value="Shift Supervisor">
                      Shift Supervisor
                    </SelectItem>

                    <SelectItem value="Operations Manager">
                      Operations Manager
                    </SelectItem>
                  </SelectContent>
                </Select>

              </div>

              {/* WAREHOUSE */}
              <div className="space-y-2">
                <Label>Warehouse *</Label>

                <Select
                  value={formData.warehouse}
                  onValueChange={(v) =>
                    setFormData({ ...formData, warehouse: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>

                  <SelectContent>
                    {warehouses.map((wh: any) => (
                      <SelectItem key={wh._id} value={wh._id}>
                        {wh.name} ({wh.code})
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>

              </div>

              {/* SALARY */}
              <div className="space-y-2">
                <Label>Salary *</Label>
                <Input
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="Enter salary"
                />
              </div>

              {/* STATUS */}
              <div className="space-y-2">
                <Label>Status *</Label>

                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    setFormData({ ...formData, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                   <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>

                </Select>

              </div>

              {/* JOIN DATE */}
              <div className="space-y-2">
                <Label>Join Date *</Label>
                <Input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                />
              </div>

              {/* ADDRESS */}
              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="w-full"
                >
                  Update Manager
                </Button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
}