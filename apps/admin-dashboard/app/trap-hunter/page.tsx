'use client';

import { useState, useEffect } from 'react';
import { Card } from '@nclex/shared-ui';
import type { TrapSetDraft, EntryMode, TrapStatus, AuditIssue } from '@nclex/shared-api-types';
import ProfileBanner from '../components/ProfileBanner';

// Status column configuration (reuse from Generator)
const STATUS_COLUMNS: { status: TrapStatus; label: string; color: string }[] = [
    { status: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { status: 'ai_audit', label: 'AI Audit', color: 'bg-blue-100 text-blue-800' },
    { status: 'ai_fix', label: 'AI Fix', color: 'bg-purple-100 text-purple-800' },
    { status: 'human_signoff', label: 'Human Signoff', color: 'bg-orange-100 text-orange-800' },
    { status: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { status: 'published_student', label: 'Published (Student)', color: 'bg-emerald-100 text-emerald-800' },
    { status: 'published_trial', label: 'Published (Trial)', color: 'bg-teal-100 text-teal-800' },
];

const getStatusColor = (status: TrapStatus): string => {
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

export default function TrapHunterPage() {
    const [trapSets, setTrapSets] = useState<TrapSetDraft[]>([]);
    const [selectedTrapSet, setSelectedTrapSet] = useState<TrapSetDraft | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch trap sets on mount
    useEffect(() => {
        fetchTrapSets();
    }, []);

    const fetchTrapSets = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/trap-sets');
            const data = await response.json();
            setTrapSets(data.trapSets || []);
        } catch (error) {
            console.error('Failed to fetch trap sets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewTrapSet = async (entryMode: EntryMode) => {
        const newTrapSet: TrapSetDraft = {
            id: `trap-${Date.now()}`,
            itemId: `item-${Math.floor(Math.random() * 1000)}`,
            entryMode,
            status: 'draft',
            stemSnippet: entryMode === 'ai_generated'
                ? 'A nurse is caring for a client with heart failure...'
                : 'Enter question snippet...',
            options: [
                { id: '1', text: 'Blood pressure 128/82 mmHg', isTrap: false },
                { id: '2', text: 'Heart rate 88 beats/min', isTrap: false },
                { id: '3', text: 'Crackles in bilateral lung bases', isTrap: false },
                { id: '4', text: 'Weight gain of 0.5 kg in 24 hours', isTrap: true, trapReason: 'Partial knowledge trap' },
            ],
            trapOptionsIds: ['4'],
            createdBy: 'Admin User',
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/trap-sets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTrapSet)
            });
            const savedTrapSet = await response.json();
            setTrapSets([...trapSets, savedTrapSet]);
        } catch (error) {
            console.error('Failed to create trap set:', error);
        }
    };

    const updateTrapSetStatus = async (trapSetId: string, newStatus: TrapStatus) => {
        try {
            await fetch(`/api/trap-sets/${trapSetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            // Optimistic update
            setTrapSets(trapSets.map(ts =>
                ts.id === trapSetId
                    ? { ...ts, status: newStatus, lastUpdatedAt: new Date().toISOString() }
                    : ts
            ));

            if (selectedTrapSet?.id === trapSetId) {
                setSelectedTrapSet({ ...selectedTrapSet, status: newStatus, lastUpdatedAt: new Date().toISOString() });
            }
        } catch (error) {
            console.error('Failed to update trap set status:', error);
        }
    };

    const runAIAudit = async (trapSetId: string) => {
        const trapSetToAudit = trapSets.find(ts => ts.id === trapSetId);
        if (!trapSetToAudit) return;

        try {
            const response = await fetch('/api/ai-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'trap', data: trapSetToAudit })
            });

            if (!response.ok) throw new Error('Audit failed');

            const auditReport = await response.json();

            // Update trap set with new audit report
            const updatedTrapSet = { ...trapSetToAudit, auditReport, lastUpdatedAt: new Date().toISOString() };

            // Save to storage
            await fetch(`/api/trap-sets/${trapSetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auditReport })
            });

            setTrapSets(trapSets.map(ts =>
                ts.id === trapSetId ? updatedTrapSet : ts
            ));

            if (selectedTrapSet?.id === trapSetId) {
                setSelectedTrapSet(updatedTrapSet);
            }

            // Auto-transition to ai_audit status if not already there
            if (trapSetToAudit.status === 'draft') {
                updateTrapSetStatus(trapSetId, 'ai_audit');
            }
        } catch (error) {
            console.error('Failed to run AI audit:', error);
        }
    };

    const openTrapSetDetail = (trapSet: TrapSetDraft) => {
        setSelectedTrapSet(trapSet);
        setIsDrawerOpen(true);
    };

    const getTrapSetsByStatus = (status: TrapStatus) => {
        return trapSets.filter(ts => ts.status === status);
    };

    // Run AI Fix
    const handleGenerateFix = async (trapSetId: string) => {
        const trapSetToFix = trapSets.find(ts => ts.id === trapSetId);
        if (!trapSetToFix || !trapSetToFix.auditReport) return;

        try {
            const response = await fetch('/api/ai-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'trap',
                    data: trapSetToFix,
                    auditReport: trapSetToFix.auditReport
                })
            });

            if (!response.ok) throw new Error('Fix generation failed');

            const fixedTrapSet = await response.json();

            // Update trap set with fixed content
            const updatedTrapSet = {
                ...fixedTrapSet,
                id: trapSetToFix.id,
                createdBy: trapSetToFix.createdBy,
                createdAt: trapSetToFix.createdAt,
                auditReport: trapSetToFix.auditReport,
                status: 'ai_fix',
                lastUpdatedAt: new Date().toISOString()
            };

            // Save to storage
            await fetch(`/api/trap-sets/${trapSetId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTrapSet)
            });

            setTrapSets(trapSets.map(ts =>
                ts.id === trapSetId ? updatedTrapSet : ts
            ));

            if (selectedTrapSet?.id === trapSetId) {
                setSelectedTrapSet(updatedTrapSet);
            }
        } catch (error) {
            console.error('Failed to generate AI fix:', error);
        }
    };

    // Publish trap set
    const handlePublish = async (trapSetId: string, targetStatus: 'published_student' | 'published_trial') => {
        try {
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: trapSetId,
                    type: 'trap-set',
                    status: targetStatus
                })
            });

            if (!response.ok) throw new Error('Publishing failed');

            const updatedTrapSet = await response.json();

            setTrapSets(trapSets.map(ts =>
                ts.id === trapSetId ? updatedTrapSet : ts
            ));

            if (selectedTrapSet?.id === trapSetId) {
                setSelectedTrapSet(updatedTrapSet);
            }
        } catch (error) {
            console.error('Failed to publish trap set:', error);
        }
    };

    const getAvailableActions = (trapSet: TrapSetDraft) => {
        const actions: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' }[] = [];

        switch (trapSet.status) {
            case 'draft':
                actions.push({
                    label: 'Send to AI Audit',
                    onClick: () => runAIAudit(trapSet.id),
                    variant: 'primary',
                });
                break;
            case 'ai_audit':
                actions.push({
                    label: 'Generate AI Fix',
                    onClick: () => handleGenerateFix(trapSet.id),
                    variant: 'primary',
                });
                break;
            case 'ai_fix':
                actions.push({
                    label: 'Send to Human Signoff',
                    onClick: () => updateTrapSetStatus(trapSet.id, 'human_signoff'),
                    variant: 'primary',
                });
                break;
            case 'human_signoff':
                actions.push({
                    label: 'Approve',
                    onClick: () => updateTrapSetStatus(trapSet.id, 'approved'),
                    variant: 'primary',
                });
                break;
            case 'approved':
                actions.push({
                    label: 'Publish to Student',
                    onClick: () => handlePublish(trapSet.id, 'published_student'),
                    variant: 'primary',
                });
                actions.push({
                    label: 'Publish to Free Trial',
                    onClick: () => handlePublish(trapSet.id, 'published_trial'),
                    variant: 'secondary',
                });
                break;
            case 'published_student':
            case 'published_trial':
                actions.push({
                    label: 'Unpublish (Revert to Approved)',
                    onClick: () => updateTrapSetStatus(trapSet.id, 'approved'),
                    variant: 'secondary',
                });
                break;
        }

        return actions;
    };


    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Trap Hunter Creator Engine</h1>
                <p className="text-gray-600">Analyze and generate distractors and traps for questions</p>
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
                    onClick={() => createNewTrapSet('ai_generated')}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                >
                    <span>✨</span>
                    New AI Trap Set
                </button>
                <button
                    onClick={() => createNewTrapSet('manual_entered')}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium flex items-center gap-2"
                >
                    <span>✍️</span>
                    New Manual Trap Set
                </button>
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto">
                <div className="inline-flex gap-4 pb-4 min-w-full">
                    {STATUS_COLUMNS.map(column => (
                        <div key={column.status} className="flex-shrink-0 w-72">
                            <div className={`${column.color} rounded-t-lg px-4 py-2 font-semibold`}>
                                {column.label}
                                <span className="ml-2 text-sm">({getTrapSetsByStatus(column.status).length})</span>
                            </div>
                            <div className="bg-gray-50 rounded-b-lg p-3 min-h-[200px] space-y-3">
                                {getTrapSetsByStatus(column.status).map(trapSet => (
                                    <div
                                        key={trapSet.id}
                                        onClick={() => openTrapSetDetail(trapSet)}
                                        className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEntryModeColor(trapSet.entryMode)}`}>
                                                {trapSet.entryMode === 'ai_generated' ? '✨ AI' : '✍️ Manual'}
                                            </span>
                                            {trapSet.auditReport && (
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${trapSet.auditReport.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                                                    trapSet.auditReport.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {trapSet.auditReport.overallRisk.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                                            {trapSet.stemSnippet}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            {trapSet.options.length} options / {trapSet.trapOptionsIds.length} traps
                                        </div>
                                    </div>
                                ))}
                                {getTrapSetsByStatus(column.status).length === 0 && (
                                    <div className="text-center text-gray-400 text-sm py-8">
                                        No trap sets
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail Drawer */}
            {isDrawerOpen && selectedTrapSet && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDrawerOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Trap Set Details</h2>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEntryModeColor(selectedTrapSet.entryMode)}`}>
                                            {selectedTrapSet.entryMode === 'ai_generated' ? '✨ AI Generated' : '✍️ Manual Entry'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedTrapSet.status)}`}>
                                            {STATUS_COLUMNS.find(c => c.status === selectedTrapSet.status)?.label}
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
                                        <span className="text-gray-600">Trap Set ID:</span>
                                        <span className="font-mono text-gray-900">{selectedTrapSet.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Linked Item ID:</span>
                                        <span className="font-mono text-gray-900">{selectedTrapSet.itemId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created By:</span>
                                        <span className="text-gray-900">{selectedTrapSet.createdBy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="text-gray-900">{new Date(selectedTrapSet.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Question Snippet" className="mb-6">
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                                    {selectedTrapSet.stemSnippet}
                                </div>
                            </Card>

                            <Card title="Options & Traps" className="mb-6">
                                <div className="space-y-2">
                                    {selectedTrapSet.options.map((option, idx) => {
                                        const isTrap = selectedTrapSet.trapOptionsIds.includes(option.id);
                                        return (
                                            <div key={option.id} className={`rounded-lg p-3 ${isTrap ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}`}>
                                                <div className="flex items-start gap-2">
                                                    <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}.</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-800">{option.text}</p>
                                                        {isTrap && (
                                                            <p className="text-xs text-orange-700 mt-1 font-medium">
                                                                🎯 TRAP: {option.trapReason || 'Distractor'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            <Card title="AI Audit Report" className="mb-6">
                                {selectedTrapSet.auditReport ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-700">Overall Risk:</span>
                                            <span className={`px-3 py-1 rounded-full font-semibold ${selectedTrapSet.auditReport.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                                                selectedTrapSet.auditReport.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {selectedTrapSet.auditReport.overallRisk.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Issues Detected:</h4>
                                            <div className="space-y-3">
                                                {selectedTrapSet.auditReport.issues.map(issue => (
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
                                    {getAvailableActions(selectedTrapSet).map((action, idx) => (
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
                                    {getAvailableActions(selectedTrapSet).length === 0 && (
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
