import { useState } from 'react';
import { reportsAPI } from '../services/api';
import { Flag, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const REASONS = [
  'Misinformation or false medical advice',
  'Spam or irrelevant content',
  'Harassment or hate speech',
  'Inappropriate or offensive content',
  'Privacy violation',
  'Other',
];

export default function ReportModal({ targetType, targetId, onClose }) {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return toast.error('Please select a reason');
    setSubmitting(true);
    try {
      await reportsAPI.create({
        targetType,
        targetId,
        reason: reason === 'Other' && detail ? detail : reason,
      });
      toast.success('Report submitted. Thank you for helping keep the community safe.');
      onClose();
    } catch {
      toast.error('Failed to submit report. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
            <Flag className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Report {targetType}</h3>
            <p className="text-xs text-slate-500">Help us keep Health Hive safe</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Reports are reviewed by admins within 24 hours. False reports may result in account restrictions.</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Reason for reporting</p>
            <div className="space-y-2">
              {REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    reason === r
                      ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {reason === 'Other' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Additional details</label>
              <textarea
                value={detail}
                onChange={e => setDetail(e.target.value)}
                placeholder="Please describe the issue…"
                rows={3}
                maxLength={500}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
              <p className="text-xs text-slate-400">{detail.length}/500</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!reason || submitting}
            className="flex-1 px-4 py-2.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </div>
    </div>
  );
}