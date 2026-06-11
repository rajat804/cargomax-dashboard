// app/payroll/reports/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Download,
  Printer,
  Banknote,
  Users,
  TrendingUp,
  TrendingDown,
  Gift,
  PieChart,
  LineChart as LineChartIcon,
  BarChart3,
  Filter,
  Search,
  Award,
  DollarSign,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function PayrollReportsPage() {
  const [reportType, setReportType] = useState('summary');
  const [selectedMonth, setSelectedMonth] = useState('2024-03');
  const [selectedYear, setSelectedYear] = useState('2024');
  
  // Monthly data for charts
  const monthlyData = [
    { month: 'Jan', salary: 425000, bonus: 25000, reimbursements: 8000, total: 458000 },
    { month: 'Feb', salary: 430000, bonus: 30000, reimbursements: 7500, total: 467500 },
    { month: 'Mar', salary: 445000, bonus: 45000, reimbursements: 9000, total: 499000 },
    { month: 'Apr', salary: 440000, bonus: 28000, reimbursements: 8500, total: 476500 },
    { month: 'May', salary: 455000, bonus: 35000, reimbursements: 8200, total: 498200 },
    { month: 'Jun', salary: 460000, bonus: 32000, reimbursements: 7800, total: 499800 },
  ];
  
  // Department wise data
  const departmentData = [
    { name: 'Executive', count: 5, payroll: 512500, avgSalary: 102500 },
    { name: 'Engineering', count: 45, payroll: 2250000, avgSalary: 50000 },
    { name: 'Sales', count: 28, payroll: 1400000, avgSalary: 50000 },
    { name: 'Marketing', count: 15, payroll: 750000, avgSalary: 50000 },
    { name: 'HR', count: 12, payroll: 600000, avgSalary: 50000 },
    { name: 'Finance', count: 10, payroll: 500000, avgSalary: 50000 },
  ];
  
  // Deduction breakdown data
  const deductionData = [
    { name: 'PF', amount: 85000, percentage: 42, color: '#8884d8' },
    { name: 'TDS', amount: 65000, percentage: 32, color: '#82ca9d' },
    { name: 'Professional Tax', amount: 12000, percentage: 6, color: '#ffc658' },
    { name: 'ESI', amount: 15000, percentage: 7, color: '#ff7300' },
    { name: 'Loan Deductions', amount: 25000, percentage: 13, color: '#0088fe' },
  ];
  
  // Bonus distribution data
  const bonusData = [
    { name: 'Performance Bonus', amount: 85000, count: 12 },
    { name: 'Diwali Bonus', amount: 45000, count: 8 },
    { name: 'Incentive', amount: 35000, count: 15 },
    { name: 'Annual Bonus', amount: 65000, count: 5 },
    { name: 'Referral Bonus', amount: 15000, count: 3 },
  ];
  
  // Top earning employees
  const topEarners = [
    { name: 'John Smith', designation: 'CEO', salary: 82050, bonus: 15000, total: 97050 },
    { name: 'Mike Chen', designation: 'Engineering Director', salary: 69270, bonus: 10000, total: 79270 },
    { name: 'Lisa Anderson', designation: 'Sales Director', salary: 68500, bonus: 8000, total: 76500 },
    { name: 'Sarah Johnson', designation: 'HR Manager', salary: 57090, bonus: 7000, total: 64090 },
    { name: 'David Brown', designation: 'Marketing Director', salary: 56000, bonus: 6000, total: 62000 },
  ];
  
  // Bonus list data
  const bonusList = [
    { id: '1', employeeName: 'John Smith', type: 'Performance Bonus', amount: 15000, month: '2024-03', status: 'Paid' },
    { id: '2', employeeName: 'Sarah Johnson', type: 'Diwali Bonus', amount: 7000, month: '2024-03', status: 'Paid' },
    { id: '3', employeeName: 'Mike Chen', type: 'Performance Bonus', amount: 10000, month: '2024-03', status: 'Approved' },
    { id: '4', employeeName: 'Lisa Anderson', type: 'Incentive', amount: 8000, month: '2024-03', status: 'Approved' },
    { id: '5', employeeName: 'David Brown', type: 'Performance Bonus', amount: 6000, month: '2024-03', status: 'Paid' },
  ];
  
  // Calculate totals
  const totalPayroll = monthlyData.reduce((sum, d) => sum + d.salary, 0);
  const totalBonus = monthlyData.reduce((sum, d) => sum + d.bonus, 0);
  const totalReimbursements = monthlyData.reduce((sum, d) => sum + d.reimbursements, 0);
  const totalDeductions = deductionData.reduce((sum, d) => sum + d.amount, 0);
  const averageSalary = totalPayroll / 6 / 5;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatNumber = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };
  
  const handleExport = (format: string) => {
    alert(`Exporting report as ${format}...`);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  // Colors for pie chart
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];
  
  // Custom label for pie chart - FIXED VERSION
  const renderCustomLabel = (entry: any) => {
    const { name, percent } = entry;
    if (!percent) return name;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };
  
  return (
    <div className="p-6 space-y-6 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive payroll analytics and insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => handleExport('PDF')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button 
          variant={reportType === 'summary' ? 'default' : 'outline'} 
          onClick={() => setReportType('summary')}
          className="gap-2"
        >
          <PieChart className="w-4 h-4" />
          Summary
        </Button>
        <Button 
          variant={reportType === 'monthly' ? 'default' : 'outline'} 
          onClick={() => setReportType('monthly')}
          className="gap-2"
        >
          <LineChartIcon className="w-4 h-4" />
          Monthly Trends
        </Button>
        <Button 
          variant={reportType === 'department' ? 'default' : 'outline'} 
          onClick={() => setReportType('department')}
          className="gap-2"
        >
          <Users className="w-4 h-4" />
          Department Wise
        </Button>
        <Button 
          variant={reportType === 'deductions' ? 'default' : 'outline'} 
          onClick={() => setReportType('deductions')}
          className="gap-2"
        >
          <TrendingDown className="w-4 h-4" />
          Deductions
        </Button>
        <Button 
          variant={reportType === 'bonus' ? 'default' : 'outline'} 
          onClick={() => setReportType('bonus')}
          className="gap-2"
        >
          <Gift className="w-4 h-4" />
          Bonuses
        </Button>
        <Button 
          variant={reportType === 'employees' ? 'default' : 'outline'} 
          onClick={() => setReportType('employees')}
          className="gap-2"
        >
          <Users className="w-4 h-4" />
          Employee Report
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 print:hidden">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-sm">Select Month</Label>
            <select 
              className="px-3 py-2 border rounded-lg mt-1"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="2024-03">March 2024</option>
              <option value="2024-02">February 2024</option>
              <option value="2024-01">January 2024</option>
            </select>
          </div>
          <div>
            <Label className="text-sm">Select Year</Label>
            <select 
              className="px-3 py-2 border rounded-lg mt-1"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </div>
      
      {/* ============ SUMMARY REPORT ============ */}
      {reportType === 'summary' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Payroll</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPayroll)}</p>
                    <p className="text-xs text-green-600 mt-1">+8.5% from last month</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Banknote className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bonuses</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBonus)}</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Deductions</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDeductions)}</p>
                    <p className="text-xs text-red-600 mt-1">+3.2% from last month</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Salary</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(averageSalary)}</p>
                    <p className="text-xs text-green-600 mt-1">+5% from last month</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Payroll Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatNumber(value)} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Area type="monotone" dataKey="salary" name="Salary" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="bonus" name="Bonus" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Deduction Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={deductionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomLabel}
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="name"
                      >
                        {deductionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* ============ MONTHLY TRENDS ============ */}
      {reportType === 'monthly' && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payroll Analysis - {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatNumber(value)} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="salary" name="Salary" fill="#8884d8" />
                  <Bar dataKey="bonus" name="Bonus" fill="#82ca9d" />
                  <Bar dataKey="reimbursements" name="Reimbursements" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Month</th>
                    <th className="text-right py-3 px-4">Salary</th>
                    <th className="text-right py-3 px-4">Bonus</th>
                    <th className="text-right py-3 px-4">Reimbursements</th>
                    <th className="text-right py-3 px-4">Total</th>
                    <th className="text-right py-3 px-4">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{data.month} {selectedYear}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(data.salary)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(data.bonus)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(data.reimbursements)}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatCurrency(data.total)}</td>
                      <td className="py-3 px-4 text-right">
                        {index > 0 && (
                          <span className="text-green-600 text-sm">
                            +{(((data.total - monthlyData[index-1].total) / monthlyData[index-1].total) * 100).toFixed(1)}%
                          </span>
                        )}
                       </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(monthlyData.reduce((s, d) => s + d.salary, 0))}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(monthlyData.reduce((s, d) => s + d.bonus, 0))}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(monthlyData.reduce((s, d) => s + d.reimbursements, 0))}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(monthlyData.reduce((s, d) => s + d.total, 0))}</td>
                    <td className="py-3 px-4 text-right"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* ============ DEPARTMENT WISE ============ */}
      {reportType === 'department' && (
        <Card>
          <CardHeader>
            <CardTitle>Department Wise Payroll Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatNumber(value)} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="payroll" name="Total Payroll" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Department</th>
                    <th className="text-right py-3 px-4">Employees</th>
                    <th className="text-right py-3 px-4">Total Payroll</th>
                    <th className="text-right py-3 px-4">Average Salary</th>
                    <th className="text-right py-3 px-4">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium">{dept.name}</td>
                      <td className="py-3 px-4 text-right">{dept.count}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(dept.payroll)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(dept.avgSalary)}</td>
                      <td className="py-3 px-4 text-right">
                        {((dept.payroll / departmentData.reduce((s, d) => s + d.payroll, 0)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="py-3 px-4">Total</td>
                    <td className="py-3 px-4 text-right">{departmentData.reduce((s, d) => s + d.count, 0)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(departmentData.reduce((s, d) => s + d.payroll, 0))}</td>
                    <td className="py-3 px-4 text-right">-</td>
                    <td className="py-3 px-4 text-right">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* ============ DEDUCTIONS REPORT ============ */}
      {reportType === 'deductions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deduction Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={deductionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={renderCustomLabel}
                        outerRadius={100}
                        dataKey="amount"
                        nameKey="name"
                      >
                        {deductionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Deduction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deductionData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm">{formatCurrency(item.amount)} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total Deductions</span>
                      <span>{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* ============ BONUS REPORT ============ */}
      {reportType === 'bonus' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatCurrency(totalBonus)}</p>
                <p className="text-sm text-gray-600">Total Bonuses</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{bonusList.length}</p>
                <p className="text-sm text-gray-600">Total Awards</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatCurrency(totalBonus / 5)}</p>
                <p className="text-sm text-gray-600">Avg Bonus per Employee</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bonus Distribution by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bonusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis tickFormatter={(value) => formatNumber(value)} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="amount" name="Amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bonusList.map((bonus) => (
                    <div key={bonus.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{bonus.employeeName}</p>
                        <p className="text-sm text-gray-500">{bonus.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(bonus.amount)}</p>
                        <Badge variant={bonus.status === 'Paid' ? 'success' : 'warning'} className="text-xs">
                          {bonus.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* ============ EMPLOYEE REPORT ============ */}
      {reportType === 'employees' && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Payroll Summary</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search employees..." className="pl-10 w-full md:w-96" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Designation</th>
                    <th className="text-right py-3 px-4">Basic Salary</th>
                    <th className="text-right py-3 px-4">Bonus</th>
                    <th className="text-right py-3 px-4">Deductions</th>
                    <th className="text-right py-3 px-4">Net Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {topEarners.map((employee, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {employee.name.charAt(0)}
                          </div>
                          <span className="font-medium">{employee.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{employee.designation}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(employee.salary)}</td>
                      <td className="py-3 px-4 text-right text-green-600">+{formatCurrency(employee.bonus)}</td>
                      <td className="py-3 px-4 text-right text-red-600">-{formatCurrency(employee.salary * 0.15)}</td>
                      <td className="py-3 px-4 text-right font-bold">{formatCurrency(employee.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right">Total:</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(topEarners.reduce((s, e) => s + e.total, 0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-400 print:block hidden pt-8">
        <p>Generated on {new Date().toLocaleString()} | Payroll Report</p>
        <p>This is a system generated report</p>
      </div>
    </div>
  );
}