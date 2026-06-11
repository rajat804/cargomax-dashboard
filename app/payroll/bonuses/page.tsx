// app/payroll/bonuses/page.tsx
'use client';

import { useState } from 'react';
import { bonusIncentives } from '@/lib/payrollMockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Gift, Award, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function BonusesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  
  const filteredBonuses = bonusIncentives.filter(bonus => 
    selectedType === 'all' || bonus.type === selectedType
  );
  
  const totalBonuses = bonusIncentives.reduce((sum, b) => sum + b.amount, 0);
  const approvedBonuses = bonusIncentives.filter(b => b.status === 'Approved').length;
  const paidBonuses = bonusIncentives.filter(b => b.status === 'Paid').length;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bonuses & Incentives</h1>
          <p className="text-gray-600 mt-1">Manage employee bonuses, incentives, and rewards</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bonus
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bonuses</p>
                <p className="text-2xl font-bold">₹{(totalBonuses / 1000).toFixed(0)}K</p>
              </div>
              <Gift className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Awards</p>
                <p className="text-2xl font-bold">{bonusIncentives.length}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedBonuses}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold">{paidBonuses}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filter */}
      <div className="flex gap-3">
        <Button variant={selectedType === 'all' ? 'default' : 'outline'} onClick={() => setSelectedType('all')}>All</Button>
        <Button variant={selectedType === 'Performance Bonus' ? 'default' : 'outline'} onClick={() => setSelectedType('Performance Bonus')}>Performance</Button>
        <Button variant={selectedType === 'Diwali Bonus' ? 'default' : 'outline'} onClick={() => setSelectedType('Diwali Bonus')}>Festival</Button>
        <Button variant={selectedType === 'Incentive' ? 'default' : 'outline'} onClick={() => setSelectedType('Incentive')}>Incentive</Button>
      </div>
      
      {/* Bonuses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBonuses.map((bonus) => (
          <Card key={bonus.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bonus.employeeName}</h3>
                    <p className="text-sm text-gray-500">{bonus.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">₹{bonus.amount.toLocaleString()}</p>
                  <Badge variant={bonus.status === 'Paid' ? 'success' : 'warning'}>{bonus.status}</Badge>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm"><span className="font-medium">Reason:</span> {bonus.reason}</p>
                <p className="text-sm"><span className="font-medium">Month:</span> {bonus.month}</p>
                <p className="text-sm"><span className="font-medium">Approved By:</span> {bonus.approvedBy}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1">Edit</Button>
                <Button variant="outline" className="flex-1">Process Payment</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Add Bonus Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Add Bonus/Incentive</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">✕</button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); alert('Bonus added!'); }}>
              <div><Label>Employee</Label><select className="w-full px-3 py-2 border rounded-lg mt-1"><option>John Smith</option><option>Sarah Johnson</option><option>Mike Chen</option></select></div>
              <div><Label>Bonus Type</Label><select className="w-full px-3 py-2 border rounded-lg mt-1"><option>Performance Bonus</option><option>Festival Bonus</option><option>Diwali Bonus</option><option>Incentive</option><option>Referral Bonus</option></select></div>
              <div><Label>Amount (₹)</Label><Input type="number" placeholder="Enter amount" className="mt-1" /></div>
              <div><Label>Reason</Label><textarea rows={3} className="w-full px-3 py-2 border rounded-lg mt-1" placeholder="Enter reason for bonus..."></textarea></div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add Bonus</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}