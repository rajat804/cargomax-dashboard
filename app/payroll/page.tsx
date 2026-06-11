// app/payroll/page.tsx
'use client';

import { useState } from 'react';
import { payrollRecords, salaryStructures } from '@/lib/payrollMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function PayrollDashboard() {
  const [selectedMonth, setSelectedMonth] = useState('2024-03');
  
  const totalPayroll = payrollRecords.reduce((sum, p) => sum + p.netPayable, 0);
  const processedCount = payrollRecords.filter(p => p.status === 'Paid').length;
  const pendingCount = payrollRecords.filter(p => p.status === 'Pending').length;
  const avgSalary = totalPayroll / payrollRecords.length;
  
  const stats = [
    {
      title: 'Total Payroll',
      value: `₹${(totalPayroll / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Employees',
      value: payrollRecords.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Avg Salary',
      value: `₹${(avgSalary / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Processed',
      value: `${processedCount}/${payrollRecords.length}`,
      icon: CheckCircle,
      color: 'bg-emerald-500'
    }
  ];
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Processed': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Manage salary, bonuses, and employee payments</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="2024-03">March 2024</option>
            <option value="2024-02">February 2024</option>
            <option value="2024-01">January 2024</option>
          </select>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/payroll/process">
          <Card className="hover:shadow-lg cursor-pointer transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Process Payroll</h3>
              <p className="text-sm text-gray-500 mt-1">Run automated payroll for this month</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/payroll/salary-structure">
          <Card className="hover:shadow-lg cursor-pointer transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Salary Structure</h3>
              <p className="text-sm text-gray-500 mt-1">Configure employee salary components</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/payroll/bonuses">
          <Card className="hover:shadow-lg cursor-pointer transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Bonuses</h3>
              <p className="text-sm text-gray-500 mt-1">Manage bonuses and incentives</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Recent Payroll Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Gross Salary</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Deductions</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Net Payable</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{record.employeeName}</p>
                        <p className="text-xs text-gray-500">{record.designation}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{record.department}</td>
                    <td className="py-3 px-4 text-sm font-medium">₹{record.grossEarnings.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">₹{record.totalDeductions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm font-bold text-green-600">₹{record.netPayable.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        <span className="text-sm">{record.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/payroll/payslips/${record.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}