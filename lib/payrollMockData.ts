// lib/payrollMockData.ts
import { SalaryStructure, PayrollRecord, ReimbursementRequest, BonusIncentive } from '@/types';

export const salaryStructures: SalaryStructure[] = [
  {
    id: 'sal1',
    employeeId: '1',
    employeeName: 'John Smith',
    basicSalary: 50000,
    hra: 25000,
    da: 5000,
    conveyance: 3200,
    medicalAllowance: 1250,
    specialAllowance: 10000,
    otherAllowances: 0,
    totalEarnings: 94450,
    pf: 7200,
    esi: 0,
    professionalTax: 200,
    tds: 5000,
    loanDeduction: 0,
    otherDeductions: 0,
    totalDeductions: 12400,
    netSalary: 82050,
    effectiveFrom: '2024-01-01'
  },
  {
    id: 'sal2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    basicSalary: 35000,
    hra: 17500,
    da: 3500,
    conveyance: 3200,
    medicalAllowance: 1250,
    specialAllowance: 5000,
    otherAllowances: 0,
    totalEarnings: 65450,
    pf: 5040,
    esi: 1120,
    professionalTax: 200,
    tds: 2000,
    loanDeduction: 0,
    otherDeductions: 0,
    totalDeductions: 8360,
    netSalary: 57090,
    effectiveFrom: '2024-01-01'
  },
  {
    id: 'sal3',
    employeeId: '3',
    employeeName: 'Mike Chen',
    basicSalary: 45000,
    hra: 22500,
    da: 4500,
    conveyance: 3200,
    medicalAllowance: 1250,
    specialAllowance: 8000,
    otherAllowances: 0,
    totalEarnings: 84450,
    pf: 6480,
    esi: 0,
    professionalTax: 200,
    tds: 3500,
    loanDeduction: 5000,
    otherDeductions: 0,
    totalDeductions: 15180,
    netSalary: 69270,
    effectiveFrom: '2024-01-01'
  }
];

export const payrollRecords: PayrollRecord[] = [
  {
    id: 'pay1',
    employeeId: '1',
    employeeName: 'John Smith',
    department: 'Executive',
    designation: 'CEO',
    month: '2024-03',
    salaryStructure: salaryStructures[0],
    presentDays: 22,
    absentDays: 0,
    leaveDays: 0,
    overtime: 5,
    performanceBonus: 10000,
    festivalBonus: 0,
    incentive: 5000,
    otherBonus: 0,
    travelReimbursement: 2500,
    medicalReimbursement: 1000,
    otherReimbursement: 0,
    grossEarnings: 112950,
    totalDeductions: 12400,
    netPayable: 100550,
    paymentMode: 'Bank Transfer',
    bankAccount: 'XXXX1234',
    status: 'Paid',
    processedBy: 'Admin',
    processedAt: '2024-03-28'
  },
  {
    id: 'pay2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    department: 'Human Resources',
    designation: 'HR Manager',
    month: '2024-03',
    salaryStructure: salaryStructures[1],
    presentDays: 21,
    absentDays: 1,
    leaveDays: 0,
    overtime: 2,
    performanceBonus: 5000,
    festivalBonus: 0,
    incentive: 2000,
    otherBonus: 0,
    travelReimbursement: 1500,
    medicalReimbursement: 500,
    otherReimbursement: 0,
    grossEarnings: 73950,
    totalDeductions: 8360,
    netPayable: 65590,
    paymentMode: 'Bank Transfer',
    bankAccount: 'XXXX5678',
    status: 'Paid',
    processedBy: 'Admin',
    processedAt: '2024-03-28'
  }
];

export const reimbursementRequests: ReimbursementRequest[] = [
  {
    id: 'reim1',
    employeeId: '3',
    employeeName: 'Mike Chen',
    type: 'Travel',
    amount: 3500,
    description: 'Client meeting travel expenses',
    date: '2024-03-15',
    documentUrl: '/docs/travel.pdf',
    status: 'Approved',
    approvedBy: 'John Smith',
    approvedAt: '2024-03-20'
  },
  {
    id: 'reim2',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'Medical',
    amount: 2500,
    description: 'Health checkup',
    date: '2024-03-10',
    status: 'Paid',
    approvedBy: 'Admin',
    approvedAt: '2024-03-15'
  }
];

export const bonusIncentives: BonusIncentive[] = [
  {
    id: 'bonus1',
    employeeId: '1',
    employeeName: 'John Smith',
    type: 'Performance Bonus',
    amount: 10000,
    month: '2024-03',
    reason: 'Exceptional quarterly performance',
    approvedBy: 'Board',
    status: 'Approved'
  },
  {
    id: 'bonus2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    type: 'Diwali Bonus',
    amount: 5000,
    month: '2024-03',
    reason: 'Festival bonus',
    approvedBy: 'HR',
    status: 'Paid'
  }
];