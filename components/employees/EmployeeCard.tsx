// components/employees/EmployeeCard.tsx
'use client';

import { Employee } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, Briefcase, MapPin } from 'lucide-react';
import Link from 'next/link';

interface EmployeeCardProps {
  employee: Employee;
}

export default function EmployeeCard({ employee }: EmployeeCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {employee.firstName[0]}{employee.lastName[0]}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-gray-600">{employee.designation}</p>
              <Badge variant="success" className="mt-1">{employee.employmentStatus}</Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{employee.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{employee.departmentName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Joined: {new Date(employee.hireDate).toLocaleDateString()}</span>
          </div>
          {employee.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{employee.address.city}, {employee.address.country}</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link href={`/employees/${employee.id}`}>
            <Button variant="outline" className="w-full">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}