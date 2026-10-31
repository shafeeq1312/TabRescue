import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '../common/Modal';
import Button from '../common/Button';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Session?',
  message = 'Are you sure you want to delete this session? This action cannot be undone.',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mb-4">
          <FiAlertTriangle />
        </div>

        <h3 className="text-lg font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{message}</p>

        <div className="flex items-center justify-center gap-3 w-full mt-6">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
