// lib/mockData.ts
import { Employee, Department, Document, LifecycleEvent, DashboardStats } from '@/types';

export const departments: Department[] = [
  { id: 'dept1', name: 'Executive', code: 'EXEC', description: 'Executive Leadership', headName: 'John Smith', employeeCount: 5 },
  { id: 'dept2', name: 'Human Resources', code: 'HR', description: 'Human Resources Department', headName: 'Sarah Johnson', employeeCount: 12 },
  { id: 'dept3', name: 'Engineering', code: 'ENG', description: 'Software Engineering', headName: 'Mike Chen', employeeCount: 45 },
  { id: 'dept4', name: 'Sales', code: 'SALES', description: 'Sales Department', headName: 'Lisa Anderson', employeeCount: 28 },
  { id: 'dept5', name: 'Marketing', code: 'MKTG', description: 'Marketing Department', headName: 'David Brown', employeeCount: 15 },
  { id: 'dept6', name: 'Finance', code: 'FIN', description: 'Finance & Accounting', headName: 'Robert Wilson', employeeCount: 10 },
];

export const employees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '+1 234-567-8900',
    dateOfBirth: '1980-05-15',
    gender: 'Male',
    maritalStatus: 'Married',
    nationality: 'American',
    hireDate: '2015-03-20',
    confirmationDate: '2015-06-20',
    employmentStatus: 'Active',
    employmentType: 'Permanent',
    departmentId: 'dept1',
    departmentName: 'Executive',
    designationId: 'des1',
    designation: 'CEO',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'Spouse',
      phone: '+1 234-567-8999'
    }
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 234-567-8901',
    dateOfBirth: '1985-08-22',
    gender: 'Female',
    maritalStatus: 'Married',
    nationality: 'American',
    hireDate: '2017-06-10',
    confirmationDate: '2017-09-10',
    employmentStatus: 'Active',
    employmentType: 'Permanent',
    departmentId: 'dept2',
    departmentName: 'Human Resources',
    designationId: 'des2',
    designation: 'HR Manager',
    reportingTo: '1',
    managerName: 'John Smith',
    address: {
      street: '456 Oak Ave',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10002'
    }
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@company.com',
    phone: '+1 234-567-8902',
    dateOfBirth: '1988-03-10',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'Chinese',
    hireDate: '2018-01-15',
    confirmationDate: '2018-04-15',
    employmentStatus: 'Active',
    employmentType: 'Permanent',
    departmentId: 'dept3',
    departmentName: 'Engineering',
    designationId: 'des3',
    designation: 'Engineering Director',
    reportingTo: '1',
    managerName: 'John Smith',
    address: {
      street: '789 Pine Rd',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      zipCode: '94105'
    }
  },
  {
    id: '4',
    employeeId: 'EMP004',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa.anderson@company.com',
    phone: '+1 234-567-8903',
    dateOfBirth: '1990-11-30',
    gender: 'Female',
    maritalStatus: 'Divorced',
    nationality: 'British',
    hireDate: '2019-04-01',
    confirmationDate: '2019-07-01',
    employmentStatus: 'Active',
    employmentType: 'Permanent',
    departmentId: 'dept4',
    departmentName: 'Sales',
    designationId: 'des4',
    designation: 'Sales Director',
    reportingTo: '1',
    managerName: 'John Smith'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@company.com',
    phone: '+1 234-567-8904',
    dateOfBirth: '1987-07-19',
    gender: 'Male',
    maritalStatus: 'Married',
    nationality: 'Canadian',
    hireDate: '2016-09-12',
    confirmationDate: '2016-12-12',
    employmentStatus: 'Active',
    employmentType: 'Permanent',
    departmentId: 'dept5',
    departmentName: 'Marketing',
    designationId: 'des5',
    designation: 'Marketing Director',
    reportingTo: '1',
    managerName: 'John Smith'
  }
];

// Generate 45 engineering employees
for (let i = 6; i <= 50; i++) {
  const roles = ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'QA Engineer', 'DevOps Engineer'];
  const randomRole = roles[Math.floor(Math.random() * roles.length)];
  
  employees.push({
    id: i.toString(),
    employeeId: `EMP${i.toString().padStart(3, '0')}`,
    firstName: `Engineer${i}`,
    lastName: `Last${i}`,
    email: `engineer${i}@company.com`,
    phone: `+1 234-567-${8900 + i}`,
    dateOfBirth: `199${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
    gender: Math.random() > 0.7 ? 'Female' : 'Male',
    maritalStatus: Math.random() > 0.6 ? 'Married' : 'Single',
    nationality: 'American',
    hireDate: `202${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
    employmentStatus: Math.random() > 0.9 ? 'On Leave' : 'Active',
    employmentType: Math.random() > 0.8 ? 'Contract' : 'Permanent',
    departmentId: 'dept3',
    departmentName: 'Engineering',
    designationId: 'des6',
    designation: randomRole,
    reportingTo: '3',
    managerName: 'Mike Chen',
  });
}

export const documents: Document[] = [
  {
    id: 'doc1',
    name: 'Passport - John Smith',
    type: 'ID Proof',
    fileUrl: '/docs/passport.pdf',
    fileSize: 1024000,
    uploadDate: '2024-01-15',
    expiryDate: '2029-01-14',
    employeeId: '1',
    employeeName: 'John Smith'
  },
  {
    id: 'doc2',
    name: 'Employment Contract - Sarah Johnson',
    type: 'Contract',
    fileUrl: '/docs/contract.pdf',
    fileSize: 2048000,
    uploadDate: '2024-01-20',
    employeeId: '2',
    employeeName: 'Sarah Johnson'
  },
  {
    id: 'doc3',
    name: 'Master Degree Certificate - Mike Chen',
    type: 'Certificate',
    fileUrl: '/docs/degree.pdf',
    fileSize: 512000,
    uploadDate: '2024-02-01',
    employeeId: '3',
    employeeName: 'Mike Chen'
  }
];

export const lifecycleEvents: LifecycleEvent[] = [
  {
    id: 'life1',
    employeeId: '1',
    employeeName: 'John Smith',
    eventType: 'Hired',
    eventDate: '2015-03-20',
    remarks: 'Joined as CEO'
  },
  {
    id: 'life2',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    eventType: 'Hired',
    eventDate: '2017-06-10',
    remarks: 'Joined as HR Executive'
  },
  {
    id: 'life3',
    employeeId: '2',
    employeeName: 'Sarah Johnson',
    eventType: 'Promoted',
    eventDate: '2020-01-15',
    oldValue: 'HR Executive',
    newValue: 'HR Manager',
    remarks: 'Promotion to HR Manager'
  },
  {
    id: 'life4',
    employeeId: '3',
    employeeName: 'Mike Chen',
    eventType: 'Hired',
    eventDate: '2018-01-15',
    remarks: 'Joined as Engineering Director'
  }
];

export const dashboardStats: DashboardStats = {
  totalEmployees: employees.length,
  activeEmployees: employees.filter(e => e.employmentStatus === 'Active').length,
  departments: departments.length,
  averageTenure: 3.5,
  genderRatio: {
    male: employees.filter(e => e.gender === 'Male').length,
    female: employees.filter(e => e.gender === 'Female').length,
    other: employees.filter(e => e.gender === 'Other').length
  },
  employmentType: {
    Permanent: employees.filter(e => e.employmentType === 'Permanent').length,
    Contract: employees.filter(e => e.employmentType === 'Contract').length,
    Intern: employees.filter(e => e.employmentType === 'Intern').length,
    Temporary: employees.filter(e => e.employmentType === 'Temporary').length,
    Consultant: employees.filter(e => e.employmentType === 'Consultant').length
  },
  recentHires: employees.filter(e => new Date(e.hireDate) > new Date('2024-01-01')).length,
  upcomingBirthdays: employees.filter(e => {
    const today = new Date();
    const birthday = new Date(e.dateOfBirth);
    return birthday.getMonth() === today.getMonth();
  }).length
};