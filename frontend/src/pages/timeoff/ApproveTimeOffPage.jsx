// src/pages/timeoff/ApproveTimeOffPage.jsx - Complete version
import React, { useState, useEffect } from 'react';
import { getAllTimeOffRequests, approveTimeOff, rejectTimeOff } from '@api/timeoffAPI';
import { useNotification } from '@hooks/useNotification';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import { formatDate } from '@utils/formatters';
import ApprovalActions from '@components/timeoff/ApprovalActions';

const ApproveTimeOffPage = () => {
  const { showSuccess, showError } = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getAllTimeOffRequests({ status: 'Pending' });
      setRequests(response.data || []);
    } catch (error) {
      showError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveTimeOff(id);
      showSuccess('Time off approved successfully');
      fetchRequests();
    } catch (error) {
      showError(error.message || 'Failed to approve');
    }
  };

  const handleReject = async (id, reason) => {
    try {
      await rejectTimeOff(id, reason);
      showSuccess('Time off rejected');
      fetchRequests();
    } catch (error) {
      showError(error.message || 'Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approve Time Off Requests</h1>
        <p className="text-gray-600">Review and manage pending leave requests</p>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No pending requests
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {request.employee?.first_name} {request.employee?.last_name}
                      </h3>
                      <Badge status={request.time_off_type} />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Period:</span>{' '}
                        {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </p>
                      <p>
                        <span className="font-medium">Duration:</span> {request.days} day(s)
                      </p>
                      {request.reason && (
                        <p>
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Requested on: {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>
                  <ApprovalActions
                    timeOffId={request.id}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ApproveTimeOffPage;