// app/payroll/process/page.tsx
'use client';

import { useState } from 'react';
import { payrollRecords, salaryStructures } from '@/lib/payrollMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Play, 
  Settings, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function PayrollProcessPage() {
  const [selectedMonth, setSelectedMonth] = useState('2024-03');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  
  const totalEmployees = payrollRecords.length;
  const totalSalary = payrollRecords.reduce((sum, p) => sum + p.netPayable, 0);
  const totalDeductions = payrollRecords.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalBonus = payrollRecords.reduce((sum, p) => sum + p.performanceBonus + p.incentive, 0);
  
  const handleProcessPayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessed(true);
      setTimeout(() => setProcessed(false), 3000);
    }, 2000);
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Process Payroll</h1>
        <p className="text-gray-600 mt-1">Run automated payroll processing for the selected month</p>
      </div>
      
      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Payroll Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Payroll Month</Label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg mt-1"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="2024-03">March 2024</option>
                  <option value="2024-02">February 2024</option>
                  <option value="2024-01">January 2024</option>
                </select>
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" defaultValue="2024-03-31" className="mt-1" />
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Inclusions</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" /> Include Performance Bonus
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" /> Include Overtime Payments
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" /> Include Reimbursements
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" /> Calculate TDS
                </label>
              </div>
            </div>
            
            <Button 
              onClick={handleProcessPayroll} 
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>Processing... <div className="animate-spin rounded-full h-4 w-4 border-2 border-white ml-2"></div></>
              ) : processed ? (
                <><CheckCircle className="w-4 h-4 mr-2" /> Payroll Processed Successfully!</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Run Payroll Processing</>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Employees:</span>
              <span className="font-bold text-lg">{totalEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Salary:</span>
              <span className="font-bold text-green-600">₹{(totalSalary / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Deductions:</span>
              <span className="font-bold text-red-600">₹{(totalDeductions / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bonuses:</span>
              <span className="font-bold text-purple-600">₹{(totalBonus / 1000).toFixed(0)}K</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Net Payroll:</span>
                <span className="font-bold text-xl text-blue-600">₹{((totalSalary - totalDeductions + totalBonus) / 1000).toFixed(0)}K</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Processing Results */}
      {processed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Payroll processed successfully!</p>
                <p className="text-sm text-green-700">Payslips have been generated for all employees.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Tax Calculations Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Calculations (TDS)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3">Employee</th>
                  <th className="text-left py-2 px-3">Annual Income</th>
                  <th className="text-left py-2 px-3">Taxable Income</th>
                  <th className="text-left py-2 px-3">TDS Amount</th>
                  <th className="text-left py-2 px-3">Monthly TDS</th>
                </tr>
              </thead>
              <tbody>
                {salaryStructures.map((emp) => {
                  const annualIncome = emp.totalEarnings * 12;
                  const taxableIncome = annualIncome - (emp.pf * 12 + 50000);
                  const tdsAmount = taxableIncome > 500000 ? (taxableIncome - 500000) * 0.1 : 0;
                  return (
                    <tr key={emp.id} className="border-b">
                      <td className="py-2 px-3">{emp.employeeName}</td>
                      <td className="py-2 px-3">₹{(annualIncome / 1000).toFixed(0)}K</td>
                      <td className="py-2 px-3">₹{(taxableIncome / 1000).toFixed(0)}K</td>
                      <td className="py-2 px-3">₹{(tdsAmount / 1000).toFixed(0)}K</td>
                      <td className="py-2 px-3">₹{(tdsAmount / 12).toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}