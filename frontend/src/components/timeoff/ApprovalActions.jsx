import React, { useState } from 'react';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import Textarea from '@components/common/Textarea';
import { Check, X } from 'lucide-react';

const ApprovalActions = ({ timeOffId, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(timeOffId);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    await onReject(timeOffId, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
    setLoading(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="success"
          icon={Check}
          onClick={handleApprove}
          loading={loading}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="danger"
          icon={X}
          onClick={() => setShowRejectModal(true)}
        >
          Reject
        </Button>
      </div>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Time Off Request"
      >
        <Textarea
          label="Rejection Reason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          rows={4}
          placeholder="Please provide a reason for rejection..."
          required
        />
        <div className="flex gap-4 mt-6">
          <Button onClick={handleReject} loading={loading} variant="danger">
            Confirm Rejection
          </Button>
          <Button onClick={() => setShowRejectModal(false)} variant="outline">
            Cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ApprovalActions;