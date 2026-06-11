// app/lifecycle/page.tsx
'use client';

import { useState } from 'react';
import { lifecycleEvents, employees } from '@/lib/mockData';
import { 
  Calendar, 
  User, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Award,
  Clock,
  BarChart3,
  Filter,
  Search,
  X
} from 'lucide-react';

export default function LifecyclePage() {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  
  // Get unique years from events
  const years = ['all', ...new Set(lifecycleEvents.map(e => new Date(e.eventDate).getFullYear().toString()))];
  
  // Filter events
  const filteredEvents = lifecycleEvents.filter(event => {
    const matchesEmployee = selectedEmployee === 'all' || event.employeeId === selectedEmployee;
    const matchesEvent = selectedEvent === 'all' || event.eventType === selectedEvent;
    const matchesSearch = searchTerm === '' || 
      event.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || new Date(event.eventDate).getFullYear().toString() === selectedYear;
    
    return matchesEmployee && matchesEvent && matchesSearch && matchesYear;
  });
  
  // Sort events by date (newest first)
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
  );
  
  const getEventIcon = (type: string) => {
    switch(type) {
      case 'Hired': return <UserCheck className="w-5 h-5 text-green-600" />;
      case 'Confirmed': return <Award className="w-5 h-5 text-blue-600" />;
      case 'Promoted': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'Transferred': return <RefreshCw className="w-5 h-5 text-orange-600" />;
      case 'Resigned': return <UserX className="w-5 h-5 text-red-600" />;
      case 'Terminated': return <UserX className="w-5 h-5 text-red-600" />;
      default: return <RefreshCw className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getEventColor = (type: string) => {
    switch(type) {
      case 'Hired': return 'bg-green-100 border-green-200';
      case 'Confirmed': return 'bg-blue-100 border-blue-200';
      case 'Promoted': return 'bg-purple-100 border-purple-200';
      case 'Transferred': return 'bg-orange-100 border-orange-200';
      case 'Resigned': return 'bg-red-100 border-red-200';
      case 'Terminated': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };
  
  const getEventBadgeColor = (type: string) => {
    switch(type) {
      case 'Hired': return 'bg-green-600';
      case 'Confirmed': return 'bg-blue-600';
      case 'Promoted': return 'bg-purple-600';
      case 'Transferred': return 'bg-orange-600';
      case 'Resigned': return 'bg-red-600';
      case 'Terminated': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  // Calculate lifecycle statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.employmentStatus === 'Active').length;
  const newHires = employees.filter(e => new Date(e.hireDate) > new Date('2024-01-01')).length;
  
  const hiresByYear = lifecycleEvents
    .filter(e => e.eventType === 'Hired')
    .reduce((acc, event) => {
      const year = new Date(event.eventDate).getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  
  const promotionsThisYear = lifecycleEvents.filter(e => 
    e.eventType === 'Promoted' && 
    new Date(e.eventDate).getFullYear() === new Date().getFullYear()
  ).length;
  
  const turnoverRate = ((totalEmployees - activeEmployees) / totalEmployees * 100).toFixed(1);
  
  const avgTenure = employees.reduce((acc, emp) => {
    const hireDate = new Date(emp.hireDate);
    const years = (new Date().getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return acc + years;
  }, 0) / employees.length;
  
  const eventCounts = {
    Hired: lifecycleEvents.filter(e => e.eventType === 'Hired').length,
    Confirmed: lifecycleEvents.filter(e => e.eventType === 'Confirmed').length,
    Promoted: lifecycleEvents.filter(e => e.eventType === 'Promoted').length,
    Transferred: lifecycleEvents.filter(e => e.eventType === 'Transferred').length,
    Resigned: lifecycleEvents.filter(e => e.eventType === 'Resigned').length,
    Terminated: lifecycleEvents.filter(e => e.eventType === 'Terminated').length,
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employee Lifecycle</h1>
        <p className="text-gray-600 mt-1">Track employee journey from hire to exit</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-900">{activeEmployees}</p>
              <p className="text-xs text-green-600 mt-1">out of {totalEmployees} total</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Hires (2024)</p>
              <p className="text-2xl font-bold text-gray-900">{newHires}</p>
              <p className="text-xs text-blue-600 mt-1">+{Math.floor(newHires / 2)} from last year</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Tenure</p>
              <p className="text-2xl font-bold text-gray-900">{avgTenure.toFixed(1)} yrs</p>
              <p className="text-xs text-purple-600 mt-1">Company average</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Turnover Rate</p>
              <p className="text-2xl font-bold text-gray-900">{turnoverRate}%</p>
              <p className="text-xs text-orange-600 mt-1">Industry avg: 15%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Promotions This Year</p>
              <p className="text-2xl font-bold text-purple-900">{promotionsThisYear}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Events Tracked</p>
              <p className="text-2xl font-bold text-blue-900">{lifecycleEvents.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Avg. Time to Promotion</p>
              <p className="text-2xl font-bold text-green-900">2.4 yrs</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* Event Distribution */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Event Distribution</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(eventCounts).map(([event, count]) => (
            <div key={event} className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm ${getEventColor(event)}`}>
                <span className="font-medium">{event}</span>
                <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-50 rounded-full text-xs">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by employee name or remarks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="Hired">Hired</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Promoted">Promoted</option>
            <option value="Transferred">Transferred</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
          </select>
          
          <select 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year === 'all' ? 'All Years' : year}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Timeline */}
      {sortedEvents.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Event Timeline</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Showing {sortedEvents.length} events in chronological order
            </p>
          </div>
          
          <div className="p-6">
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {sortedEvents.map((event, index) => (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10">
                      <div className={`w-12 h-12 rounded-full border-2 ${getEventColor(event.eventType)} flex items-center justify-center bg-white shadow-sm`}>
                        {getEventIcon(event.eventType)}
                      </div>
                    </div>
                    
                    {/* Event card */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-gray-900">{event.employeeName}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getEventBadgeColor(event.eventType)}`}>
                              {event.eventType}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.eventDate)}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500">{getRelativeTime(event.eventDate)}</span>
                            </div>
                            
                            {(event.oldValue || event.newValue) && (
                              <div className="mt-2 text-sm bg-white rounded p-2">
                                {event.oldValue && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">From:</span>
                                    <span className="line-through text-gray-400">{event.oldValue}</span>
                                  </div>
                                )}
                                {event.newValue && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-500">To:</span>
                                    <span className="font-medium text-gray-900">{event.newValue}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {event.remarks && (
                              <div className="mt-2 flex items-start gap-2">
                                <span className="text-gray-400 text-sm">💬</span>
                                <p className="text-sm text-gray-600 italic">"{event.remarks}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Employee quick info */}
                        <div className="md:text-right">
                          <div className="text-xs text-gray-500">
                            Employee ID: {event.employeeId}
                          </div>
                          <button 
                            onClick={() => setSelectedEmployee(event.employeeId)}
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                          >
                            View all events for this employee
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Yearly Hiring Trend */}
      <div className="mt-6 bg-white rounded-lg border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Yearly Hiring Trend</h3>
        <div className="flex items-end gap-4">
          {Object.entries(hiresByYear).map(([year, count]) => (
            <div key={year} className="flex-1 text-center">
              <div 
                className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-700"
                style={{ height: `${(count / Math.max(...Object.values(hiresByYear))) * 150}px` }}
              >
                <div className="text-white text-sm font-bold pt-2">{count}</div>
              </div>
              <div className="mt-2 text-sm text-gray-600">{year}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg border p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Event Types Legend</h4>
        <div className="flex flex-wrap gap-4">
          {Object.keys(eventCounts).map(event => (
            <div key={event} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(event)}`}>
                {getEventIcon(event)}
              </div>
              <span className="text-sm text-gray-600">{event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}