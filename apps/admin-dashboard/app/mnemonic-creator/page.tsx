'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';
import type { MnemonicDraft, EntryMode, MnemonicStatus, AuditIssue } from '@nclex/shared-api-types';
import ProfileBanner from '../components/ProfileBanner';

const STATUS_COLUMNS: { status: MnemonicStatus; label: string; color: string }[] = [
    { status: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { status: 'ai_audit', label: 'AI Audit', color: 'bg-blue-100 text-blue-800' },
    { status: 'ai_fix', label: 'AI Fix', color: 'bg-purple-100 text-purple-800' },
    { status: 'human_signoff', label: 'Human Signoff', color: 'bg-orange-100 text-orange-800' },
    { status: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { status: 'published_student', label: 'Published (Student)', color: 'bg-emerald-100 text-emerald-800' },
    { status: 'published_trial', label: 'Published (Trial)', color: 'bg-teal-100 text-teal-800' },
];

const getStatusColor = (status: MnemonicStatus): string => {
    const column = STATUS_COLUMNS.find(col => col.status === status);
    return column?.color || 'bg-gray-100 text-gray-800';
};

const getEntryModeColor = (mode: EntryMode): string => {
    return mode === 'ai_generated' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800';
};

const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'low': return 'text-yellow-600';
        case 'medium': return 'text-orange-600';
        case 'high': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

export default function MnemonicCreatorPage() {
    const [mnemonics, setMnemonics] = useState<MnemonicDraft[]>([]);
    const [selectedMnemonic, setSelectedMnemonic] = useState<MnemonicDraft | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch mnemonics on mount
    useEffect(() => {
        fetchMnemonics();
    }, []);

    const fetchMnemonics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/mnemonics');
            const data = await response.json();
            setMnemonics(data.mnemonics || []);
        } catch (error) {
            console.error('Failed to fetch mnemonics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewMnemonic = async (entryMode: EntryMode) => {
        const newMnemonic: MnemonicDraft = {
            id: `mnem-${Date.now()}`,
            concept: entryMode === 'ai_generated'
                ? 'Hyperkalemia Signs & Symptoms'
                : 'Enter concept here...',
            entryMode,
            status: 'draft',
            mnemonicText: entryMode === 'ai_generated'
                ? 'MACHINE: Muscle weakness, Arrhythmias, Confusion, Hyperreflexia, Intestinal colic, Numbness, ECG changes'
                : 'Enter mnemonic text...',
            explanation: entryMode === 'ai_generated'
                ? 'Use MACHINE to remember the key signs and symptoms of hyperkalemia (elevated potassium). Each letter represents a major clinical manifestation.'
                : 'Enter explanation...',
            createdBy: 'Admin User',
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/mnemonics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMnemonic)
            });
            const savedMnemonic = await response.json();
            setMnemonics([...mnemonics, savedMnemonic]);
        } catch (error) {
            console.error('Failed to create mnemonic:', error);
        }
    };

    const updateMnemonicStatus = async (mnemonicId: string, newStatus: MnemonicStatus) => {
        try {
            await fetch(`/api/mnemonics/${mnemonicId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            // Optimistic update
            setMnemonics(mnemonics.map(m =>
                m.id === mnemonicId
                    ? { ...m, status: newStatus, lastUpdatedAt: new Date().toISOString() }
                    : m
            ));

            if (selectedMnemonic?.id === mnemonicId) {
                setSelectedMnemonic({ ...selectedMnemonic, status: newStatus, lastUpdatedAt: new Date().toISOString() });
            }
        } catch (error) {
            console.error('Failed to update mnemonic status:', error);
        }
    };

    const runAIAudit = async (mnemonicId: string) => {
        const mnemonicToAudit = mnemonics.find(m => m.id === mnemonicId);
        if (!mnemonicToAudit) return;

        try {
            const response = await fetch('/api/ai-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'mnemonic', data: mnemonicToAudit })
            });

            if (!response.ok) throw new Error('Audit failed');

            const auditReport = await response.json();

            // Update mnemonic with new audit report
            const updatedMnemonic = { ...mnemonicToAudit, auditReport, lastUpdatedAt: new Date().toISOString() };

            // Save to storage
            await fetch(`/api/mnemonics/${mnemonicId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auditReport })
            });

            setMnemonics(mnemonics.map(m =>
                m.id === mnemonicId ? updatedMnemonic : m
            ));

            if (selectedMnemonic?.id === mnemonicId) {
                setSelectedMnemonic(updatedMnemonic);
            }

            // Auto-transition to ai_audit status if not already there
            if (mnemonicToAudit.status === 'draft') {
                updateMnemonicStatus(mnemonicId, 'ai_audit');
            }
        } catch (error) {
            console.error('Failed to run AI audit:', error);
        }
    };

    const openMnemonicDetail = (mnemonic: MnemonicDraft) => {
        setSelectedMnemonic(mnemonic);
        setIsDrawerOpen(true);
    };

    const getMnemonicsByStatus = (status: MnemonicStatus) => {
        return mnemonics.filter(m => m.status === status);
    };

    // Run AI Fix
    const handleGenerateFix = async (mnemonicId: string) => {
        const mnemonicToFix = mnemonics.find(m => m.id === mnemonicId);
        if (!mnemonicToFix || !mnemonicToFix.auditReport) return;

        try {
            const response = await fetch('/api/ai-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'mnemonic',
                    data: mnemonicToFix,
                    auditReport: mnemonicToFix.auditReport
                })
            });

            if (!response.ok) throw new Error('Fix generation failed');

            const fixedMnemonic = await response.json();

            // Update mnemonic with fixed content
            const updatedMnemonic = {
                ...fixedMnemonic,
                id: mnemonicToFix.id,
                createdBy: mnemonicToFix.createdBy,
                createdAt: mnemonicToFix.createdAt,
                auditReport: mnemonicToFix.auditReport,
                status: 'ai_fix',
                lastUpdatedAt: new Date().toISOString()
            };

            // Save to storage
            await fetch(`/api/mnemonics/${mnemonicId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMnemonic)
            });

            setMnemonics(mnemonics.map(m =>
                m.id === mnemonicId ? updatedMnemonic : m
            ));

            if (selectedMnemonic?.id === mnemonicId) {
                setSelectedMnemonic(updatedMnemonic);
            }
        } catch (error) {
            console.error('Failed to generate AI fix:', error);
        }
    };

    // Publish mnemonic
    const handlePublish = async (mnemonicId: string, targetStatus: 'published_student' | 'published_trial') => {
        try {
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: mnemonicId,
                    type: 'mnemonic',
                    status: targetStatus
                })
            });

            if (!response.ok) throw new Error('Publishing failed');

            const updatedMnemonic = await response.json();

            setMnemonics(mnemonics.map(m =>
                m.id === mnemonicId ? updatedMnemonic : m
            ));

            if (selectedMnemonic?.id === mnemonicId) {
                setSelectedMnemonic(updatedMnemonic);
            }
        } catch (error) {
            console.error('Failed to publish mnemonic:', error);
        }
    };

    const getAvailableActions = (mnemonic: MnemonicDraft) => {
        const actions: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' }[] = [];

        switch (mnemonic.status) {
            case 'draft':
                actions.push({
                    label: 'Send to AI Audit',
                    onClick: () => runAIAudit(mnemonic.id),
                    variant: 'primary',
                });
                break;
            case 'ai_audit':
                actions.push({
                    label: 'Generate AI Fix',
                    onClick: () => handleGenerateFix(mnemonic.id),
                    variant: 'primary',
                });
                break;
            case 'ai_fix':
                actions.push({
                    label: 'Send to Human Signoff',
                    onClick: () => updateMnemonicStatus(mnemonic.id, 'human_signoff'),
                    variant: 'primary',
                });
                break;
            case 'human_signoff':
                actions.push({
                    label: 'Approve',
                    onClick: () => updateMnemonicStatus(mnemonic.id, 'approved'),
                    variant: 'primary',
                });
                break;
            case 'approved':
                actions.push({
                    label: 'Publish to Student',
                    onClick: () => handlePublish(mnemonic.id, 'published_student'),
                    variant: 'primary',
                });
                actions.push({
                    label: 'Publish to Free Trial',
                    onClick: () => handlePublish(mnemonic.id, 'published_trial'),
                    variant: 'secondary',
                });
                break;
            case 'published_student':
            case 'published_trial':
                actions.push({
                    label: 'Unpublish (Revert to Approved)',
                    onClick: () => updateMnemonicStatus(mnemonic.id, 'approved'),
                    variant: 'secondary',
                });
                break;
        }

        return actions;
    };


    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mnemonic Creator Engine</h1>
                <p className="text-gray-600">Create evidence-informed mnemonics for key concepts</p>
            </div>

            {/* Profile Banner */}
            <ProfileBanner />

            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>NOTE:</strong> Scaffolding only — AI and database integration will be added later.
                </p>
            </div>

            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => createNewMnemonic('ai_generated')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                >
                    <span>✨</span>
                    New AI Mnemonic
                </button>
                <button
                    onClick={() => createNewMnemonic('manual_entered')}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium flex-items-center gap-2"
                >
                    <span>✍️</span>
                    New Manual Mnemonic
                </button>
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto">
                <div className="inline-flex gap-4 pb-4 min-w-full">
                    {STATUS_COLUMNS.map(column => (
                        <div key={column.status} className="flex-shrink-0 w-72">
                            <div className={`${column.color} rounded-t-lg px-4 py-2 font-semibold`}>
                                {column.label}
                                <span className="ml-2 text-sm">({getMnemonicsByStatus(column.status).length})</span>
                            </div>
                            <div className="bg-gray-50 rounded-b-lg p-3 min-h-[200px] space-y-3">
                                {getMnemonicsByStatus(column.status).map(mnemonic => (
                                    <div
                                        key={mnemonic.id}
                                        onClick={() => openMnemonicDetail(mnemonic)}
                                        className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEntryModeColor(mnemonic.entryMode)}`}>
                                                {mnemonic.entryMode === 'ai_generated' ? '✨ AI' : '✍️ Manual'}
                                            </span>
                                            {mnemonic.auditReport && (
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${mnemonic.auditReport.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                                                    mnemonic.auditReport.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {mnemonic.auditReport.overallRisk.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 mb-1">
                                            {mnemonic.concept}
                                        </p>
                                        <p className="text-xs text-gray-600 line-clamp-1">
                                            {mnemonic.mnemonicText}
                                        </p>
                                    </div>
                                ))}
                                {getMnemonicsByStatus(column.status).length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No mnemonics
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Drawer */}
            {isDrawerOpen && selectedMnemonic && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDrawerOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Mnemonic Details</h2>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEntryModeColor(selectedMnemonic.entryMode)}`}>
                                            {selectedMnemonic.entryMode === 'ai_generated' ? '✨ AI Generated' : '✍️ Manual Entry'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedMnemonic.status)}`}>
                                            {STATUS_COLUMNS.find(c => c.status === selectedMnemonic.status)?.label}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <Card title="Basic Information" className="mb-6">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mnemonic ID:</span>
                                        <span className="font-mono text-gray-900">{selectedMnemonic.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created By:</span>
                                        <span className="text-gray-900">{selectedMnemonic.createdBy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="text-gray-900">{new Date(selectedMnemonic.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Concept" className="mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-lg font-semibold text-blue-900">
                                        {selectedMnemonic.concept}
                                    </p>
                                </div>
                            </Card>

                            <Card title="Mnemonic" className="mb-6">
                                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                                    <p className="text-base font-medium text-purple-900">
                                        {selectedMnemonic.mnemonicText}
                                    </p>
                                </div>
                            </Card>

                            <Card title="Explanation" className="mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                                    {selectedMnemonic.explanation}
                                </div>
                            </Card>

                            <Card title="AI Audit Report" className="mb-6">
                                {selectedMnemonic.auditReport ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-700">Overall Risk:</span>
                                            <span className={`px-3 py-1 rounded-full font-semibold ${selectedMnemonic.auditReport.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                                                selectedMnemonic.auditReport.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {selectedMnemonic.auditReport.overallRisk.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Issues Detected:</h4>
                                            <div className="space-y-3">
                                                {selectedMnemonic.auditReport.issues.map(issue => (
                                                    <div key={issue.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-300">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <span className="text-xs font-semibold text-gray-600 uppercase">
                                                                {issue.category.replace(/_/g, ' ')}
                                                            </span>
                                                            <span className={`text-xs font-semibold ${getSeverityColor(issue.severity)}`}>
                                                                {issue.severity.toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-800 mb-2">{issue.message}</p>
                                                        {issue.suggested_fix && (
                                                            <div className="bg-blue-50 rounded p-2 mt-2">
                                                                <p className="text-xs text-blue-800">
                                                                    <strong>Suggested Fix:</strong> {issue.suggested_fix}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-sm">AI Audit has not run yet.</p>
                                    </div>
                                )}
                            </Card>

                            <Card title="Actions" className="mb-6">
                                <div className="space-y-3">
                                    {getAvailableActions(selectedMnemonic).map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                action.onClick();
                                                setIsDrawerOpen(false);
                                            }}
                                            className={`w-full px-4 py-2 rounded-lg font-medium ${action.variant === 'primary'
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                }`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                    {getAvailableActions(selectedMnemonic).length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No actions available for this status.
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
