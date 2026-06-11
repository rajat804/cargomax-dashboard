// app/payroll/payslips/page.tsx
'use client';

import { useState } from 'react';
import { payrollRecords } from '@/lib/payrollMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Eye, Printer, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PayslipsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  
  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = selectedMonth === 'all' || record.month === selectedMonth;
    return matchesSearch && matchesMonth;
  });
  
  const handleDownload = (record: any) => {
    console.log('Downloading payslip for:', record.employeeName);
    alert(`Downloading payslip for ${record.employeeName}`);
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
          <p className="text-gray-600 mt-1">Generate and manage employee payslips</p>
        </div>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Generate All
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              className="px-4 py-2 border rounded-lg"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              <option value="2024-03">March 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-01">January 2024</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{record.employeeName}</h3>
                  <p className="text-sm text-gray-500">{record.designation}</p>
                  <p className="text-xs text-gray-400">{record.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Month</p>
                  <p className="font-medium">{record.month}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Net Payable</span>
                  <span className="text-xl font-bold text-green-600">₹{record.netPayable.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Earnings:</span>
                  <span className="font-medium">₹{record.grossEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Deductions:</span>
                  <span className="text-red-600">₹{record.totalDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Mode:</span>
                  <span>{record.paymentMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    record.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{record.status}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/payroll/payslips/${record.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1" onClick={() => handleDownload(record)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="icon">
                  <Printer className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}