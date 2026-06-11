// app/payroll/reimbursements/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  Printer,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Upload,
  MapPin,
  Car,
  Heart,
  Utensils,
  MoreHorizontal,
  Calendar,
  DollarSign,
  User,
  MessageCircle,
  AlertCircle
} from 'lucide-react';

// Mock data for reimbursements
const initialReimbursements = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'Travel',
    amount: 3500,
    description: 'Client meeting travel expenses - Mumbai to Pune',
    date: '2024-03-15',
    documentUrl: '/docs/travel.pdf',
    status: 'Approved',
    approvedBy: 'Admin',
    approvedAt: '2024-03-20',
    remarks: 'Approved as per policy'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'Medical',
    amount: 2500,
    description: 'Annual health checkup',
    date: '2024-03-10',
    documentUrl: '/docs/medical.pdf',
    status: 'Paid',
    approvedBy: 'Admin',
    approvedAt: '2024-03-15',
    remarks: 'Medical claim approved'
  },
  {
    id: '3',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    type: 'Food',
    amount: 850,
    description: 'Team lunch meeting',
    date: '2024-03-18',
    status: 'Pending',
    remarks: 'Waiting for approval'
  },
  {
    id: '4',
    employeeId: '3',
    employeeName: 'Mike Chen',
    type: 'Travel',
    amount: 5200,
    description: 'Flight tickets for conference',
    date: '2024-03-05',
    documentUrl: '/docs/flight.pdf',
    status: 'Approved',
    approvedBy: 'Finance',
    approvedAt: '2024-03-10',
    remarks: 'Approved'
  },
  {
    id: '5',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    type: 'Medical',
    amount: 1800,
    description: 'Medicine purchase',
    date: '2024-03-12',
    status: 'Rejected',
    approvedBy: 'Admin',
    approvedAt: '2024-03-14',
    remarks: 'Documentation incomplete'
  },
  {
    id: '6',
    employeeId: '3',
    employeeName: 'Mike Chen',
    type: 'Travel',
    amount: 1200,
    description: 'Local conveyance',
    date: '2024-03-20',
    status: 'Pending',
    remarks: 'Under review'
  },
];

// Employee list for dropdown
const employeesList = [
  { id: '1', name: 'John Smith', designation: 'CEO' },
  { id: '2', name: 'Sarah Johnson', designation: 'HR Manager' },
  { id: '3', name: 'Mike Chen', designation: 'Engineering Director' },
  { id: '4', name: 'Lisa Anderson', designation: 'Sales Director' },
  { id: '5', name: 'David Brown', designation: 'Marketing Director' },
];

export default function ReimbursementsPage() {
  const [reimbursements, setReimbursements] = useState(initialReimbursements);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    type: 'Travel',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  
  // Filter reimbursements
  const filteredReimbursements = reimbursements.filter(item => {
    const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Approved</Badge>;
      case 'Paid':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">💰 Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Travel': return <Car className="w-4 h-4 text-blue-600" />;
      case 'Medical': return <Heart className="w-4 h-4 text-red-600" />;
      case 'Food': return <Utensils className="w-4 h-4 text-orange-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const handleAddReimbursement = (e: React.FormEvent) => {
    e.preventDefault();
    const newReimbursement = {
      id: (reimbursements.length + 1).toString(),
      employeeId: formData.employeeId,
      employeeName: formData.employeeName,
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      status: 'Pending',
      remarks: formData.remarks || 'Waiting for approval'
    };
    setReimbursements([newReimbursement, ...reimbursements]);
    setShowAddModal(false);
    setFormData({
      employeeId: '',
      employeeName: '',
      type: 'Travel',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    alert('Reimbursement request submitted successfully!');
  };
  
  const handleEmployeeChange = (selectedId: string) => {
    const selectedEmp = employeesList.find(emp => emp.id === selectedId);
    setFormData({
      ...formData,
      employeeId: selectedId,
      employeeName: selectedEmp?.name || ''
    });
  };
  
  const handleStatusUpdate = (id: string, newStatus: string) => {
    setReimbursements(reimbursements.map(item => 
      item.id === id 
        ? { ...item, status: newStatus, approvedBy: 'Admin', approvedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
    alert(`Reimbursement ${newStatus} successfully!`);
    setShowViewModal(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reimbursement request?')) {
      setReimbursements(reimbursements.filter(item => item.id !== id));
      alert('Reimbursement deleted successfully!');
    }
  };
  
  // Statistics
  const totalRequests = reimbursements.length;
  const totalAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = reimbursements.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0);
  const approvedAmount = reimbursements.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.amount, 0);
  const paidAmount = reimbursements.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reimbursements</h1>
          <p className="text-gray-600 mt-1">Manage employee reimbursement requests</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">All requests</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">Processed payments</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by employee or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Travel">Travel</option>
              <option value="Medical">Medical</option>
              <option value="Food">Food</option>
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Reimbursements Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReimbursements.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {item.employeeName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.employeeName}</p>
                          <p className="text-xs text-gray-500">ID: {item.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(item.type)}
                        <span>{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm truncate max-w-[200px]">{item.description}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">{formatCurrency(item.amount)}</span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(item.date)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReimbursement(item);
                            setShowViewModal(true);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        {item.status === 'Pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, 'Approved')}
                              className="h-8 w-8 p-0"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, 'Rejected')}
                              className="h-8 w-8 p-0"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Reimbursement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">New Reimbursement Request</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddReimbursement} className="p-6 space-y-4">
              <div>
                <Label>Employee *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                  value={formData.employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.designation}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label>Expense Type *</Label>
                <select
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="Travel">Travel</option>
                  <option value="Medical">Medical</option>
                  <option value="Food">Food</option>
                </select>
              </div>
              
              <div>
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe the expense..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <Label>Upload Bill (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center mt-1 cursor-pointer hover:border-blue-500">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload bill/receipt</p>
                  <input type="file" className="hidden" />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Submit Request</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Details Modal */}
      {showViewModal && selectedReimbursement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Reimbursement Details</h2>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Employee Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedReimbursement.employeeName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{selectedReimbursement.employeeName}</p>
                  <p className="text-sm text-gray-500">Employee ID: {selectedReimbursement.employeeId}</p>
                </div>
              </div>
              
              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Expense Type</p>
                  <div className="flex items-center gap-1 mt-1">
                    {getTypeIcon(selectedReimbursement.type)}
                    <span className="font-medium">{selectedReimbursement.type}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedReimbursement.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedReimbursement.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  {getStatusBadge(selectedReimbursement.status)}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm mt-1">{selectedReimbursement.description}</p>
              </div>
              
              {selectedReimbursement.remarks && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium">Remarks</p>
                  <p className="text-sm text-yellow-800">{selectedReimbursement.remarks}</p>
                </div>
              )}
              
              {selectedReimbursement.approvedBy && (
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Approved By:</span>
                    <span className="font-medium">{selectedReimbursement.approvedBy}</span>
                  </div>
                  {selectedReimbursement.approvedAt && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">Approved On:</span>
                      <span>{formatDate(selectedReimbursement.approvedAt)}</span>
                    </div>
                  )}
                </div>
              )}
              
              {selectedReimbursement.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate(selectedReimbursement.id, 'Approved')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => handleStatusUpdate(selectedReimbursement.id, 'Rejected')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
              
              {selectedReimbursement.status === 'Approved' && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleStatusUpdate(selectedReimbursement.id, 'Paid')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}