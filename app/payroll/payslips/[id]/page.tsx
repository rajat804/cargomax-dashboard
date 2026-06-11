// app/payroll/payslips/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { payrollRecords } from '@/lib/payrollMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function PayslipDetailPage() {
  const { id } = useParams();
  const record = payrollRecords.find(r => r.id === id);
  
  if (!record) {
    return <div className="p-6 text-center">Payslip not found</div>;
  }
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link href="/payroll/payslips">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payslips
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
        
        {/* Payslip Card */}
        <Card className="print:shadow-none">
          <CardHeader className="text-center border-b">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900">PAYSLIP</h1>
              <p className="text-gray-500">Monthly Salary Statement</p>
            </div>
            <div className="flex justify-between items-start">
              <div className="text-left">
                <p className="text-sm text-gray-500">Employee Name</p>
                <p className="font-semibold">{record.employeeName}</p>
                <p className="text-sm text-gray-500 mt-2">Designation</p>
                <p className="text-sm">{record.designation}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Pay Period</p>
                <p className="font-semibold">{record.month}</p>
                <p className="text-sm text-gray-500 mt-2">Department</p>
                <p className="text-sm">{record.department}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-600 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Earnings
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>Basic Salary:</span><span>₹{record.salaryStructure.basicSalary.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>HRA:</span><span>₹{record.salaryStructure.hra.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>DA:</span><span>₹{record.salaryStructure.da.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Conveyance:</span><span>₹{record.salaryStructure.conveyance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Medical Allowance:</span><span>₹{record.salaryStructure.medicalAllowance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Special Allowance:</span><span>₹{record.salaryStructure.specialAllowance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Performance Bonus:</span><span className="text-green-600">+₹{record.performanceBonus.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Incentive:</span><span className="text-green-600">+₹{record.incentive.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Reimbursements:</span><span className="text-green-600">+₹{(record.travelReimbursement + record.medicalReimbursement).toLocaleString()}</span></div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Gross Earnings:</span>
                      <span className="text-green-600">₹{record.grossEarnings.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Deductions */}
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-600 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" /> Deductions
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span>PF:</span><span>₹{record.salaryStructure.pf.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>ESI:</span><span>₹{record.salaryStructure.esi.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Professional Tax:</span><span>₹{record.salaryStructure.professionalTax.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>TDS:</span><span>₹{record.salaryStructure.tds.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Loan Deduction:</span><span>₹{record.salaryStructure.loanDeduction.toLocaleString()}</span></div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Deductions:</span>
                      <span className="text-red-600">₹{record.totalDeductions.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Net Payable */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Payment Mode: {record.paymentMode}</p>
                  {record.bankAccount && <p className="text-sm text-gray-600">Bank Account: {record.bankAccount}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Net Payable</p>
                  <p className="text-3xl font-bold text-blue-600">₹{record.netPayable.toLocaleString()}</p>
                  <Badge variant="success" className="mt-1">{record.status}</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-400 print:block hidden">
              <p>This is a computer generated document. No signature required.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}