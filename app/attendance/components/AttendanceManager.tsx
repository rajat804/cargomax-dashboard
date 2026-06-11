"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

/* ---------------- TYPES ---------------- */

type Attendance = {
  id: number;
  date: string;
  status: "present" | "absent" | "late";
  checkIn: string | null;
  checkOut: string | null;
};

type LeaveRequest = {
  id: number;
  from: string;
  to: string;
  reason: string;
  reasonType: string;
  appliedOn: string;
  status: "approved" | "rejected" | "pending";
  remarks: string;
};

type LeaveForm = {
  startDate: string;
  endDate: string;
  reasonType: string;
  remarks: string;
};

/* ---------------- COMPONENT ---------------- */

export default function AttendanceManager() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<
    "present" | "absent" | "late"
  >("present");
  const [activeTab, setActiveTab] = useState<"attendance" | "leaves">(
    "attendance"
  );

  const [leaveForm, setLeaveForm] = useState<LeaveForm>({
    startDate: "",
    endDate: "",
    reasonType: "sick",
    remarks: "",
  });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetchAttendance();
    fetchLeaveRequests();
  }, []);

  const fetchAttendance = async () => {
    const mockAttendance: Attendance[] = [
      {
        id: 1,
        date: "2025-10-09",
        status: "present",
        checkIn: "09:00 AM",
        checkOut: "06:00 PM",
      },
      {
        id: 2,
        date: "2025-10-08",
        status: "present",
        checkIn: "09:15 AM",
        checkOut: "06:00 PM",
      },
      {
        id: 3,
        date: "2025-10-07",
        status: "absent",
        checkIn: null,
        checkOut: null,
      },
      {
        id: 4,
        date: "2025-10-06",
        status: "late",
        checkIn: "10:30 AM",
        checkOut: "06:30 PM",
      },
    ];

    setAttendance(mockAttendance);
  };

  const fetchLeaveRequests = async () => {
    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: 1,
        from: "2025-10-24",
        to: "2025-10-24",
        reason: "Injured",
        reasonType: "sick",
        appliedOn: "2025-10-09",
        status: "rejected",
        remarks: "Need medical certificate",
      },
      {
        id: 2,
        from: "2025-10-15",
        to: "2025-10-17",
        reason: "Family function",
        reasonType: "personal",
        appliedOn: "2025-10-10",
        status: "approved",
        remarks: "Enjoy!",
      },
      {
        id: 3,
        from: "2025-11-01",
        to: "2025-11-03",
        reason: "Not feeling well",
        reasonType: "sick",
        appliedOn: "2025-10-28",
        status: "pending",
        remarks: "Will provide certificate",
      },
    ];

    setLeaveRequests(mockLeaveRequests);
  };

  /* ---------------- FUNCTIONS ---------------- */

  const markAttendance = (
    date: Date,
    status: "present" | "absent" | "late"
  ) => {
    const newRecord: Attendance = {
      id: attendance.length + 1,
      date: format(date, "yyyy-MM-dd"),
      status,
      checkIn: status === "absent" ? null : "09:00 AM",
      checkOut: status === "absent" ? null : "06:00 PM",
    };

    setAttendance([newRecord, ...attendance]);
    setShowAttendanceModal(false);
  };

  const submitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const newRequest: LeaveRequest = {
      id: leaveRequests.length + 1,
      from: leaveForm.startDate,
      to: leaveForm.endDate,
      reason: leaveForm.remarks,
      reasonType: leaveForm.reasonType,
      appliedOn: format(new Date(), "yyyy-MM-dd"),
      status: "pending",
      remarks: leaveForm.remarks,
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setShowLeaveModal(false);
    setLeaveForm({
      startDate: "",
      endDate: "",
      reasonType: "sick",
      remarks: "",
    });
  };

  const updateLeaveStatus = (id: number, status: "approved" | "rejected") => {
    setLeaveRequests(
      leaveRequests.map((req) => (req.id === id ? { ...req, status } : req))
    );
  };

  /* ---------------- BADGES ---------------- */

  const getStatusBadge = (status: string) => {
    if (status === "approved")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
          ✅ Approved
        </span>
      );

    if (status === "rejected")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
          ❌ Rejected
        </span>
      );

    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
        ⏳ Pending
      </span>
    );
  };

  const getAttendanceBadge = (status: string) => {
    if (status === "present")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
          ✅ Present
        </span>
      );

    if (status === "absent")
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 border border-red-200">
          ❌ Absent
        </span>
      );

    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
        ⏰ Late
      </span>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-6 mb-6 shadow-lg border border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Attendance Management System
            </h1>
          </div>
          <p className="text-blue-200">
            Track attendance, manage leave requests, and view records
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === "attendance"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            📊 Attendance Records
          </button>
          <button
            onClick={() => setActiveTab("leaves")}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              activeTab === "leaves"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            📝 Leave Requests
          </button>
        </div>

        {/* Attendance Section */}
        {activeTab === "attendance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mark Attendance Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                    <span>✅</span> Mark Attendance
                  </h2>
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm shadow-sm"
                  >
                    + Mark Today's Attendance
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm">
                  Today's date:{" "}
                  <span className="font-semibold text-blue-600">
                    {format(new Date(), "MMMM dd, yyyy")}
                  </span>
                </p>
              </div>
            </div>

            {/* Apply for Leave Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                    <span>🏖️</span> Apply for Leave
                  </h2>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium text-sm shadow-sm"
                  >
                    + Apply for Leave
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                    <p className="text-2xl font-bold text-green-600">
                      {leaveRequests.filter((l) => l.status === "approved")
                        .length}
                    </p>
                    <p className="text-xs text-gray-600">Approved</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-200">
                    <p className="text-2xl font-bold text-yellow-600">
                      {leaveRequests.filter((l) => l.status === "pending")
                        .length}
                    </p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                    <p className="text-2xl font-bold text-red-600">
                      {leaveRequests.filter((l) => l.status === "rejected")
                        .length}
                    </p>
                    <p className="text-xs text-gray-600">Rejected</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Records List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-teal-50 px-6 py-4 border-b border-green-200">
                <h2 className="text-xl font-bold text-green-900 flex items-center gap-2">
                  <span>📊</span> Attendance Records
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all border border-gray-100"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {record.date}
                        </p>
                        {record.checkIn && (
                          <p className="text-xs text-gray-500">
                            In: {record.checkIn} | Out: {record.checkOut}
                          </p>
                        )}
                      </div>
                      <div>{getAttendanceBadge(record.status)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests Section */}
        {activeTab === "leaves" && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-200">
              <h2 className="text-xl font-bold text-orange-900 flex items-center gap-2">
                <span>📝</span> Leave Requests
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getStatusBadge(request.status)}
                          <span className="text-xs text-gray-500">
                            Applied: {request.appliedOn}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">From:</span>{" "}
                          {request.from}
                          <span className="font-semibold ml-2">To:</span>{" "}
                          {request.to}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-semibold">Reason:</span>{" "}
                          {request.reason}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-semibold">Type:</span>{" "}
                          {request.reasonType}
                        </p>
                        {request.remarks && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-semibold">Remarks:</span>{" "}
                            {request.remarks}
                          </p>
                        )}
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateLeaveStatus(request.id, "approved")
                            }
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateLeaveStatus(request.id, "rejected")
                            }
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[450px] shadow-2xl border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Mark Attendance</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as "present" | "absent" | "late"
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="present">✅ Present</option>
                  <option value="absent">❌ Absent</option>
                  <option value="late">⏰ Late</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => markAttendance(selectedDate, selectedStatus)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[500px] shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
            </div>
            <form onSubmit={submitLeaveRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason Type *
                </label>
                <select
                  required
                  value={leaveForm.reasonType}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, reasonType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="sick">🤒 Sick Leave</option>
                  <option value="casual">🏖️ Casual Leave</option>
                  <option value="earned">⭐ Earned Leave</option>
                  <option value="personal">👨‍👩‍👧 Personal Leave</option>
                  <option value="other">📝 Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.remarks}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, remarks: e.target.value })
                  }
                  placeholder="Enter reason for leave..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}