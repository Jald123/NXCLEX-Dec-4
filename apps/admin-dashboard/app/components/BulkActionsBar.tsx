'use client';

import type { ItemStatus } from '@nclex/shared-api-types';

interface BulkActionsBarProps {
    selectedCount: number;
    onClearSelection: () => void;
    onStatusChange: (targetStatus: ItemStatus) => void;
    onBulkAIAudit?: () => void;
    onBulkAIFix?: () => void;
    availableTransitions: ItemStatus[];
}

const STATUS_LABELS: Record<ItemStatus, string> = {
    'draft': 'Draft',
    'ai_audit': 'AI Audit',
    'ai_fix': 'AI Fix',
    'human_signoff': 'Human Signoff',
    'approved': 'Approved',
    'published_student': 'Published (Student)',
    'published_trial': 'Published (Trial)'
};

export default function BulkActionsBar({
    selectedCount,
    onClearSelection,
    onStatusChange,
    onBulkAIAudit,
    onBulkAIFix,
    availableTransitions
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
                    </span>

                    {availableTransitions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <label htmlFor="bulk-status" className="text-sm text-blue-800">
                                Change status to:
                            </label>
                            <select
                                id="bulk-status"
                                className="border border-blue-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onStatusChange(e.target.value as ItemStatus);
                                        e.target.value = ''; // Reset selection
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="">Select status...</option>
                                {availableTransitions.map(status => (
                                    <option key={status} value={status}>
                                        {STATUS_LABELS[status]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Bulk AI Operations */}
                    {onBulkAIAudit && (
                        <button
                            onClick={onBulkAIAudit}
                            className="px-4 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                        >
                            🤖 Bulk AI Audit
                        </button>
                    )}
                    {onBulkAIFix && (
                        <button
                            onClick={onBulkAIFix}
                            className="px-4 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
                        >
                            ✨ Bulk AI Fix
                        </button>
                    )}
                </div>

                <button
                    onClick={onClearSelection}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    Clear Selection
                </button>
            </div>
        </div>
    );
}

