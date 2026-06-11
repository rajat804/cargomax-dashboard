"use client";

import { useState, useEffect } from "react";
import axios from "axios";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  MapPin,
  Building2,
  MoreVertical,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function WarehouseList() {

  const BASE_URI =
    process.env.NEXT_PUBLIC_BASE_URI || "http://localhost:4000";

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    type: "",
    capacity: "",
    phone: "",
    email: "",
    manager: ""
  });


  // =============================
  // Fetch Warehouses
  // =============================
  const fetchWarehouses = async () => {

    try {

      const res = await axios.get(`${BASE_URI}/api/warehouses`);

      setWarehouses(res.data.data || []);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchWarehouses();

  }, []);


  // =============================
  // View Warehouse
  // =============================
  const handleViewWarehouse = (warehouse: any) => {

    setSelectedWarehouse(warehouse);

    setViewModal(true);

  };


  // =============================
  // Edit Warehouse
  // =============================
  const handleEditWarehouse = (warehouse: any) => {

    setSelectedWarehouse(warehouse);

    setFormData({
      name: warehouse.name || "",
      code: warehouse.code || "",
      address: warehouse.address || "",
      city: warehouse.city || "",
      state: warehouse.state || "",
      zip: warehouse.zip || "",
      type: warehouse.type || "",
      capacity: warehouse.capacity || "",
      phone: warehouse.phone || "",
      email: warehouse.email || "",
      manager: warehouse.manager || ""
    });

    setEditOpen(true);

  };


  // =============================
  // Handle Change
  // =============================
  const handleChange = (e: any) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // =============================
  // Update Warehouse
  // =============================
  const updateWarehouse = async (e: any) => {

    e.preventDefault();

    try {

      await axios.put(
        `${BASE_URI}/api/warehouses/${selectedWarehouse._id}`,
        formData
      );

      alert("Warehouse Updated");

      setEditOpen(false);

      fetchWarehouses();

    } catch (error) {

      alert("Update Failed");

    }

  };


  // =============================
  // Delete Warehouse
  // =============================
  const handleDeleteWarehouse = async (id: string) => {

    if (!confirm("Delete this warehouse?")) return;

    try {

      await axios.delete(`${BASE_URI}/api/warehouses/${id}`);

      alert("Warehouse Deleted");

      fetchWarehouses();

    } catch (error) {

      alert("Delete Failed");

    }

  };


  // =============================
  // Filter
  // =============================
  const filteredWarehouses = warehouses.filter((w) =>
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // =============================
  // Loading
  // =============================
  if (loading) {

    return <div className="text-center py-10">Loading...</div>;

  }


  // =============================
  // UI
  // =============================
  return (

    <div className="space-y-6">

      <Card>

        <CardHeader>

          <CardTitle>Warehouse Management</CardTitle>

          <CardDescription>
            Manage warehouses easily
          </CardDescription>

        </CardHeader>

        <CardContent>

          <div className="relative">

            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

            <Input
              placeholder="Search warehouse..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>

        </CardContent>

      </Card>


      <div className="grid md:grid-cols-3 gap-6">

        {filteredWarehouses.map((warehouse) => (

          <Card key={warehouse._id}>

            <CardHeader className="flex justify-between flex-row">

              <div>

                <CardTitle className="flex gap-2">

                  <Building2 className="h-5 w-5 text-blue-600" />

                  {warehouse.name}

                </CardTitle>

                <Badge variant="outline">{warehouse.code}</Badge>

              </div>


              <DropdownMenu>

                <DropdownMenuTrigger asChild>

                  <button className="p-2 rounded hover:bg-gray-100">

                    <MoreVertical className="h-5 w-5" />

                  </button>

                </DropdownMenuTrigger>


                <DropdownMenuContent align="end">

                  <DropdownMenuItem
                    onClick={() => handleViewWarehouse(warehouse)}
                  >

                    <Eye className="mr-2 h-4 w-4" />

                    View

                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={() => handleEditWarehouse(warehouse)}
                  >

                    <Pencil className="mr-2 h-4 w-4" />

                    Edit

                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={() => handleDeleteWarehouse(warehouse._id)}
                    className="text-red-600"
                  >

                    <Trash2 className="mr-2 h-4 w-4" />

                    Delete

                  </DropdownMenuItem>

                </DropdownMenuContent>

              </DropdownMenu>

            </CardHeader>


            <CardContent>

              <div className="flex gap-2 text-sm">

                <MapPin className="h-4 w-4 text-gray-400" />

                <div>

                  <p>{warehouse.address}</p>

                  <p className="text-gray-500">
                    {warehouse.city}, {warehouse.state}
                  </p>

                </div>

              </div>

              <div className="mt-3 text-sm">

                <p className="text-gray-500">Manager</p>

                <p className="font-medium">{warehouse.manager}</p>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>


      {/* ================= VIEW MODAL ================= */}
{viewModal && selectedWarehouse && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
    <div className="bg-white rounded-2xl w-[600px] shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
      
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Warehouse Details</h2>
              <p className="text-white/70 text-sm mt-1">Complete warehouse information</p>
            </div>
          </div>
          <button
            onClick={() => setViewModal(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        
        {/* Basic Information Card */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Basic Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Warehouse Name</p>
              <p className="text-base font-bold text-gray-800 mt-1">{selectedWarehouse.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Warehouse Code</p>
              <p className="text-base font-mono font-semibold text-gray-800 mt-1">{selectedWarehouse.code || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">Manager</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-800">{selectedWarehouse.manager || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900">Location Details</h3>
          </div>
          <div className="space-y-3">
            {selectedWarehouse.address && (
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide font-medium">Address</p>
                <p className="text-base text-gray-800 mt-1">{selectedWarehouse.address}</p>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide font-medium">City</p>
                <p className="text-base font-medium text-gray-800 mt-1">{selectedWarehouse.city || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide font-medium">State</p>
                <p className="text-base font-medium text-gray-800 mt-1">{selectedWarehouse.state || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-green-600 uppercase tracking-wide font-medium">ZIP Code</p>
                <p className="text-base font-medium text-gray-800 mt-1">{selectedWarehouse.zip || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Capacity Card */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-purple-900">Contact & Capacity</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Phone</p>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-base text-gray-800">{selectedWarehouse.phone || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Email</p>
              <div className="flex items-center gap-2 mt-1">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-base text-gray-800 break-all">{selectedWarehouse.email || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Capacity</p>
              <p className="text-base font-semibold text-gray-800 mt-1">
                {selectedWarehouse.capacity ? `${selectedWarehouse.capacity.toLocaleString()} sq ft` : '—'}
              </p>
              {selectedWarehouse.capacity && (
                <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Type</p>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium">
                  {selectedWarehouse.type === 'distribution' && '📦 Distribution'}
                  {selectedWarehouse.type === 'storage' && '🏪 Storage'}
                  {selectedWarehouse.type === 'fulfillment' && '🚚 Fulfillment'}
                  {selectedWarehouse.type === 'cross-dock' && '🔄 Cross Dock'}
                  {selectedWarehouse.type === 'cold-storage' && '❄️ Cold Storage'}
                  {!selectedWarehouse.type && '—'}
                </span>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 p-5 rounded-b-2xl bg-gray-50">
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setViewModal(false)}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
          <button
            onClick={() => {
              setViewModal(false);
              handleEditWarehouse(selectedWarehouse);
            }}
            className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Warehouse
          </button>
        </div>
      </div>

    </div>
  </div>
)}


      {/* ================= EDIT MODAL ================= */}
      {editOpen && selectedWarehouse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl w-[650px] shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Warehouse</h2>
                    <p className="text-white/70 text-sm mt-1">Update warehouse information</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={updateWarehouse} className="p-6 space-y-5">

              {/* Basic Information Section */}
              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse Name *</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter warehouse name"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse Code *</label>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., WH-001"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Manager Name *</label>
                    <input
                      name="manager"
                      value={formData.manager}
                      onChange={handleChange}
                      placeholder="Full name of manager"
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Street address"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                      <input
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                      <input
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="State"
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ZIP Code *</label>
                      <input
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        placeholder="ZIP code"
                        required
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Capacity Section */}
              <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact & Capacity
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      type="tel"
                      placeholder="+1 234 567 8900"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="manager@warehouse.com"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Capacity (sq ft)</label>
                    <input
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      type="number"
                      placeholder="e.g., 50000"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none bg-white"
                    >
                      <option value="distribution">📦 Distribution Center</option>
                      <option value="storage">🏪 Storage Warehouse</option>
                      <option value="fulfillment">🚚 Fulfillment Center</option>
                      <option value="cross-dock">🔄 Cross Dock</option>
                      <option value="cold-storage">❄️ Cold Storage</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm shadow-md flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Warehouse
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>

  );

}