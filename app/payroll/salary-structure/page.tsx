// app/payroll/salary-structure/page.tsx
'use client';

import { useState } from 'react';
import { salaryStructures } from '@/lib/payrollMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

export default function SalaryStructurePage() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
  const handleEdit = (structure: any) => {
    setSelectedEmployee(structure);
    setEditData({ ...structure });
    setIsEditing(true);
  };
  
  const handleSave = () => {
    console.log('Saved:', editData);
    setIsEditing(false);
    setSelectedEmployee(null);
  };
  
  const calculateNetSalary = (data: any) => {
    const totalEarnings = data.basicSalary + data.hra + data.da + data.conveyance + 
                          data.medicalAllowance + data.specialAllowance + data.otherAllowances;
    const totalDeductions = data.pf + data.esi + data.professionalTax + data.tds + 
                           data.loanDeduction + data.otherDeductions;
    return totalEarnings - totalDeductions;
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Structure</h1>
          <p className="text-gray-600 mt-1">Configure salary components for employees</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Structure
        </Button>
      </div>
      
      {/* Salary Structures List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {salaryStructures.map((structure) => (
          <Card key={structure.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{structure.employeeName}</CardTitle>
                  <p className="text-sm text-gray-500">Employee ID: {structure.employeeId}</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Earnings */}
                <div>
                  <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> Earnings
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span>Basic Salary:</span><span className="font-medium">₹{structure.basicSalary.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>HRA:</span><span>₹{structure.hra.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>DA:</span><span>₹{structure.da.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Conveyance:</span><span>₹{structure.conveyance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Medical Allowance:</span><span>₹{structure.medicalAllowance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Special Allowance:</span><span>₹{structure.specialAllowance.toLocaleString()}</span></div>
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Earnings:</span><span className="text-green-600">₹{structure.totalEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Deductions */}
                <div>
                  <h4 className="font-semibold text-red-600 mb-2 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" /> Deductions
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span>PF:</span><span>₹{structure.pf.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>ESI:</span><span>₹{structure.esi.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Professional Tax:</span><span>₹{structure.professionalTax.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>TDS:</span><span>₹{structure.tds.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Loan Deduction:</span><span>₹{structure.loanDeduction.toLocaleString()}</span></div>
                    <div className="flex justify-between font-medium border-t pt-1 mt-1">
                      <span>Total Deductions:</span><span className="text-red-600">₹{structure.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Net Salary */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Net Salary (Monthly)</span>
                    <span className="text-2xl font-bold text-blue-600">₹{structure.netSalary.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => handleEdit(structure)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Structure
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Edit Modal */}
      {isEditing && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Salary Structure - {selectedEmployee?.employeeName}</h2>
              <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Earnings Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-green-600">Earnings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Basic Salary</Label><Input type="number" value={editData.basicSalary} onChange={(e) => setEditData({...editData, basicSalary: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>HRA</Label><Input type="number" value={editData.hra} onChange={(e) => setEditData({...editData, hra: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>DA</Label><Input type="number" value={editData.da} onChange={(e) => setEditData({...editData, da: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Conveyance</Label><Input type="number" value={editData.conveyance} onChange={(e) => setEditData({...editData, conveyance: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Medical Allowance</Label><Input type="number" value={editData.medicalAllowance} onChange={(e) => setEditData({...editData, medicalAllowance: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Special Allowance</Label><Input type="number" value={editData.specialAllowance} onChange={(e) => setEditData({...editData, specialAllowance: parseInt(e.target.value)})} className="mt-1" /></div>
                  </div>
                </div>
                
                {/* Deductions Section */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-red-600">Deductions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>PF (12%)</Label><Input type="number" value={editData.pf} onChange={(e) => setEditData({...editData, pf: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>ESI</Label><Input type="number" value={editData.esi} onChange={(e) => setEditData({...editData, esi: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Professional Tax</Label><Input type="number" value={editData.professionalTax} onChange={(e) => setEditData({...editData, professionalTax: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>TDS</Label><Input type="number" value={editData.tds} onChange={(e) => setEditData({...editData, tds: parseInt(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Loan Deduction</Label><Input type="number" value={editData.loanDeduction} onChange={(e) => setEditData({...editData, loanDeduction: parseInt(e.target.value)})} className="mt-1" /></div>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between"><span>Total Earnings:</span><span className="font-bold">₹{(editData.basicSalary + editData.hra + editData.da + editData.conveyance + editData.medicalAllowance + editData.specialAllowance).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Total Deductions:</span><span className="font-bold text-red-600">₹{(editData.pf + editData.esi + editData.professionalTax + editData.tds + editData.loanDeduction).toLocaleString()}</span></div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between"><span className="text-lg font-bold">Net Salary:</span><span className="text-2xl font-bold text-blue-600">₹{calculateNetSalary(editData).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}