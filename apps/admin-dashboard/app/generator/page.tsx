'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@nclex/shared-ui';
import type { NclexItemDraft, EntryMode, ItemStatus, AuditIssue } from '@nclex/shared-api-types';
import ProfileBanner from '../components/ProfileBanner';
import CaseStudyModal from '../components/CaseStudyModal';
import AIGeneratedItemModal from '../components/AIGeneratedItemModal';
import BulkActionsBar from '../components/BulkActionsBar';
import ImportModal from '../components/ImportModal';

// Status column configuration
const STATUS_COLUMNS: { status: ItemStatus; label: string; color: string }[] = [
    { status: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { status: 'ai_audit', label: 'AI Audit', color: 'bg-blue-100 text-blue-800' },
    { status: 'ai_fix', label: 'AI Fix', color: 'bg-purple-100 text-purple-800' },
    { status: 'human_signoff', label: 'Human Signoff', color: 'bg-orange-100 text-orange-800' },
    { status: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { status: 'published_student', label: 'Published (Student)', color: 'bg-emerald-100 text-emerald-800' },
    { status: 'published_trial', label: 'Published (Trial)', color: 'bg-teal-100 text-teal-800' },
];

// Helper to get status badge color
const getStatusColor = (status: ItemStatus): string => {
    const column = STATUS_COLUMNS.find(col => col.status === status);
    return column?.color || 'bg-gray-100 text-gray-800';
};

// Helper to get entry mode badge color
const getEntryModeColor = (mode: EntryMode): string => {
    return mode === 'ai_generated' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800';
};

// Helper to get severity color
const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
        case 'low': return 'text-yellow-600';
        case 'medium': return 'text-orange-600';
        case 'high': return 'text-red-600';
        default: return 'text-gray-600';
    }
};

// Valid status transitions
const VALID_TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
    'draft': ['ai_audit'],
    'ai_audit': ['ai_fix'],
    'ai_fix': ['human_signoff'],
    'human_signoff': ['approved'],
    'approved': ['published_student', 'published_trial'],
    'published_student': [],
    'published_trial': []
};

export default function GeneratorPage() {
    const [items, setItems] = useState<NclexItemDraft[]>([]);
    const [selectedItem, setSelectedItem] = useState<NclexItemDraft | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Fetch items on mount
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            setItems(data.items || []);
        } catch (error) {
            console.error('Failed to fetch items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new item
    const createNewItem = async (entryMode: EntryMode) => {
        const newItem: NclexItemDraft = {
            id: `item-${Date.now()}`,
            entryMode,
            status: 'draft',
            questionType: 'Multiple Choice',
            stem: entryMode === 'ai_generated'
                ? 'A nurse is caring for a client with heart failure. Which assessment finding requires immediate intervention?'
                : 'Enter your question stem here...',
            options: [
                { id: '1', text: 'Blood pressure 128/82 mmHg', isTrap: false },
                { id: '2', text: 'Heart rate 88 beats/min', isTrap: false },
                { id: '3', text: 'Crackles in bilateral lung bases', isTrap: false },
                { id: '4', text: 'Weight gain of 0.5 kg in 24 hours', isTrap: true, trapReason: 'Partial knowledge trap' },
            ],
            rationale: entryMode === 'ai_generated'
                ? 'Crackles in bilateral lung bases indicate pulmonary edema, a serious complication requiring immediate intervention.'
                : 'Enter rationale here...',
            createdBy: 'Admin User',
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
        };

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            const savedItem = await response.json();
            setItems([...items, savedItem]);
        } catch (error) {
            console.error('Failed to create item:', error);
        }
    };

    // Update item status
    const updateItemStatus = async (itemId: string, newStatus: ItemStatus) => {
        try {
            await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            // Optimistic update
            setItems(items.map(item =>
                item.id === itemId
                    ? { ...item, status: newStatus, lastUpdatedAt: new Date().toISOString() }
                    : item
            ));

            // Update selected item if it's the one being modified
            if (selectedItem?.id === itemId) {
                setSelectedItem({ ...selectedItem, status: newStatus, lastUpdatedAt: new Date().toISOString() });
            }
        } catch (error) {
            console.error('Failed to update item status:', error);
        }
    };

    // Run AI Audit with real Gemini API
    const runAIAudit = async (itemId: string) => {
        const itemToAudit = items.find(i => i.id === itemId);
        if (!itemToAudit) return;

        try {
            // Call real AI audit API
            const response = await fetch('/api/ai-audit-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ item: itemToAudit, type: 'item' })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Audit failed');
            }

            const auditReport = await response.json();

            // Update item with audit report AND move to ai_audit status
            const updatedItem = {
                ...itemToAudit,
                auditReport,
                status: 'ai_audit' as ItemStatus,
                lastUpdatedAt: new Date().toISOString()
            };

            // Save to storage
            await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auditReport, status: 'ai_audit' })
            });

            // Update local state
            setItems(items.map(item =>
                item.id === itemId ? updatedItem : item
            ));

            if (selectedItem?.id === itemId) {
                setSelectedItem(updatedItem);
            }

            alert('AI Audit completed successfully!');
        } catch (error) {
            console.error('Failed to run AI audit:', error);
            alert(`AI Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Open item detail drawer
    const openItemDetail = (item: NclexItemDraft) => {
        setSelectedItem(item);
        setIsDrawerOpen(true);
    };

    // Handle AI-generated items
    const handleAIGenerate = async (generatedItems: NclexItemDraft[]) => {
        try {
            const savePromises = generatedItems.map(item =>
                fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                }).then(res => res.json())
            );
            const savedItems = await Promise.all(savePromises);
            setItems([...items, ...savedItems]);
        } catch (error) {
            console.error('Failed to save AI-generated items:', error);
        }
    };

    // Handle case study import
    const handleCaseStudyImport = async (caseStudyItems: NclexItemDraft[]) => {
        try {
            const savePromises = caseStudyItems.map(item =>
                fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                }).then(res => res.json())
            );
            const savedItems = await Promise.all(savePromises);
            setItems([...items, ...savedItems]);
        } catch (error) {
            console.error('Failed to save case study items:', error);
        }
    };

    // Toggle item selection
    const toggleItemSelection = (itemId: string) => {
        const newSelection = new Set(selectedItemIds);
        if (newSelection.has(itemId)) {
            newSelection.delete(itemId);
        } else {
            newSelection.add(itemId);
        }
        setSelectedItemIds(newSelection);
    };

    // Select all items in a column
    const selectAllInColumn = (status: ItemStatus) => {
        const columnItems = getItemsByStatus(status);
        const newSelection = new Set(selectedItemIds);
        const allSelected = columnItems.every(item => selectedItemIds.has(item.id));

        if (allSelected) {
            // Deselect all in column
            columnItems.forEach(item => newSelection.delete(item.id));
        } else {
            // Select all in column
            columnItems.forEach(item => newSelection.add(item.id));
        }
        setSelectedItemIds(newSelection);
    };

    // Get available transitions for selected items
    const getAvailableTransitionsForSelection = (): ItemStatus[] => {
        if (selectedItemIds.size === 0) return [];

        const selectedItems = items.filter(item => selectedItemIds.has(item.id));
        const allStatuses = selectedItems.map(item => item.status);
        const uniqueStatuses = Array.from(new Set(allStatuses));

        // Find common valid transitions across all selected items
        if (uniqueStatuses.length === 0) return [];

        let commonTransitions = VALID_TRANSITIONS[uniqueStatuses[0]];
        for (let i = 1; i < uniqueStatuses.length; i++) {
            const transitions = VALID_TRANSITIONS[uniqueStatuses[i]];
            commonTransitions = commonTransitions.filter(t => transitions.includes(t));
        }

        return commonTransitions;
    };

    // Handle bulk status update
    const handleBulkStatusUpdate = async (targetStatus: ItemStatus) => {
        const itemsToUpdate = items.filter(item => {
            if (!selectedItemIds.has(item.id)) return false;
            const validTransitions = VALID_TRANSITIONS[item.status];
            return validTransitions.includes(targetStatus);
        });

        if (itemsToUpdate.length === 0) {
            alert('No valid items to update to this status.');
            return;
        }

        // Update backend
        const updatePromises = itemsToUpdate.map(item =>
            fetch(`/api/items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: targetStatus })
            })
        );

        try {
            await Promise.all(updatePromises);

            // Update local state
            setItems(items.map(item => {
                if (!selectedItemIds.has(item.id)) return item;
                const validTransitions = VALID_TRANSITIONS[item.status];
                if (!validTransitions.includes(targetStatus)) return item;

                return {
                    ...item,
                    status: targetStatus,
                    lastUpdatedAt: new Date().toISOString()
                };
            }));

            setSelectedItemIds(new Set());
        } catch (error) {
            console.error('Failed to update items:', error);
            alert('Failed to update some items. Please try again.');
        }
    };

    // Get items by status
    const getItemsByStatus = (status: ItemStatus) => {
        return items.filter(item => item.status === status);
    };

    // Run AI Fix with real Gemini API
    const handleGenerateFix = async (itemId: string) => {
        const itemToFix = items.find(i => i.id === itemId);
        if (!itemToFix || !itemToFix.auditReport) {
            alert('Please run AI Audit first');
            return;
        }

        try {
            // Call real AI fix API
            const response = await fetch('/api/ai-fix-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item: itemToFix,
                    auditReport: itemToFix.auditReport,
                    type: 'item'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Fix generation failed');
            }

            const fixedItem = await response.json();

            // Update item with fixed content AND move to ai_fix status
            const updatedItem = {
                ...fixedItem,
                id: itemToFix.id,
                createdBy: itemToFix.createdBy,
                createdAt: itemToFix.createdAt,
                auditReport: itemToFix.auditReport,
                status: 'ai_fix' as ItemStatus,
                lastUpdatedAt: new Date().toISOString()
            };

            // Save to storage
            await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedItem)
            });

            // Update local state
            setItems(items.map(item =>
                item.id === itemId ? updatedItem : item
            ));

            if (selectedItem?.id === itemId) {
                setSelectedItem(updatedItem);
            }

            alert(`AI Fix applied successfully! ${fixedItem.fixSummary || ''}`);
        } catch (error) {
            console.error('Failed to generate AI fix:', error);
            alert(`AI Fix failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    // Publish item
    const handlePublish = async (itemId: string, targetStatus: 'published_student' | 'published_trial') => {
        try {
            const response = await fetch('/api/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: itemId,
                    type: 'item',
                    status: targetStatus
                })
            });

            if (!response.ok) throw new Error('Publishing failed');

            const updatedItem = await response.json();

            // Update local state
            setItems(items.map(item =>
                item.id === itemId ? updatedItem : item
            ));

            if (selectedItem?.id === itemId) {
                setSelectedItem(updatedItem);
            }
        } catch (error) {
            console.error('Failed to publish item:', error);
        }
    };

    // Delete item
    const handleDelete = async (itemId: string) => {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        try {
            // Delete from backend
            await fetch(`/api/items/${itemId}`, {
                method: 'DELETE'
            });

            // Remove from local state
            setItems(items.filter(item => item.id !== itemId));

            // Close drawer if this item was selected
            if (selectedItem?.id === itemId) {
                setIsDrawerOpen(false);
                setSelectedItem(null);
            }

            alert('Item deleted successfully');
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Failed to delete item');
        }
    };

    // Handle import from CSV/JSON
    const handleImport = async (questions: NclexItemDraft[]) => {
        try {
            // Save all imported questions
            const savePromises = questions.map(question =>
                fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(question)
                }).then(res => res.json())
            );

            const savedItems = await Promise.all(savePromises);
            setItems([...items, ...savedItems]);
            alert(`Successfully imported ${savedItems.length} question(s)!`);
        } catch (error) {
            console.error('Failed to import questions:', error);
            alert('Failed to import some questions. Please try again.');
        }
    };

    // Bulk AI Audit
    const handleBulkAIAudit = async () => {
        if (selectedItemIds.size === 0) {
            alert('Please select items to audit');
            return;
        }

        if (!confirm(`Run AI Audit on ${selectedItemIds.size} item(s)? This may take a few minutes.`)) {
            return;
        }

        try {
            const response = await fetch('/api/bulk-ai-audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemIds: Array.from(selectedItemIds),
                    type: 'item'
                })
            });

            const result = await response.json();

            // Refresh items
            await fetchItems();
            setSelectedItemIds(new Set());

            alert(`Bulk AI Audit complete!\nSuccessful: ${result.summary.successful}\nFailed: ${result.summary.failed}`);
        } catch (error) {
            console.error('Bulk AI audit failed:', error);
            alert('Bulk AI audit failed. Please try again.');
        }
    };

    // Bulk AI Fix
    const handleBulkAIFix = async () => {
        if (selectedItemIds.size === 0) {
            alert('Please select items to fix');
            return;
        }

        if (!confirm(`Run AI Fix on ${selectedItemIds.size} item(s)? This may take a few minutes.`)) {
            return;
        }

        try {
            const response = await fetch('/api/bulk-ai-fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemIds: Array.from(selectedItemIds),
                    type: 'item'
                })
            });

            const result = await response.json();

            // Refresh items
            await fetchItems();
            setSelectedItemIds(new Set());

            alert(`Bulk AI Fix complete!\nSuccessful: ${result.summary.successful}\nFailed: ${result.summary.failed}`);
        } catch (error) {
            console.error('Bulk AI fix failed:', error);
            alert('Bulk AI fix failed. Please try again.');
        }
    };


    // Send back to previous status
    const handleSendBack = async (itemId: string, targetStatus: ItemStatus) => {
        try {
            await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: targetStatus })
            });

            // Update local state
            setItems(items.map(item =>
                item.id === itemId
                    ? { ...item, status: targetStatus, lastUpdatedAt: new Date().toISOString() }
                    : item
            ));

            if (selectedItem?.id === itemId) {
                setSelectedItem({ ...selectedItem, status: targetStatus, lastUpdatedAt: new Date().toISOString() });
            }

            alert(`Item sent back to ${targetStatus}`);
        } catch (error) {
            console.error('Failed to send back item:', error);
            alert('Failed to send back item');
        }
    };

    // Get send-back options based on current status
    const getSendBackOptions = (currentStatus: ItemStatus): { label: string; targetStatus: ItemStatus }[] => {
        switch (currentStatus) {
            case 'ai_audit':
                return [{ label: 'Send Back to Draft', targetStatus: 'draft' }];
            case 'ai_fix':
                return [
                    { label: 'Send Back to AI Audit', targetStatus: 'ai_audit' },
                    { label: 'Send Back to Draft', targetStatus: 'draft' }
                ];
            case 'human_signoff':
                return [
                    { label: 'Send Back to AI Fix', targetStatus: 'ai_fix' },
                    { label: 'Send Back to Draft', targetStatus: 'draft' }
                ];
            case 'approved':
                return [{ label: 'Send Back to Human Signoff', targetStatus: 'human_signoff' }];
            case 'published_student':
            case 'published_trial':
                return [{ label: 'Unpublish (Back to Approved)', targetStatus: 'approved' }];
            default:
                return [];
        }
    };

    // Get available actions for current status
    const getAvailableActions = (item: NclexItemDraft) => {
        const actions: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' }[] = [];

        switch (item.status) {
            case 'draft':
                actions.push({
                    label: 'Send to AI Audit',
                    onClick: () => runAIAudit(item.id),
                    variant: 'primary',
                });
                break;
            case 'ai_audit':
                actions.push({
                    label: 'Generate AI Fix',
                    onClick: () => handleGenerateFix(item.id),
                    variant: 'primary',
                });
                break;
            case 'ai_fix':
                actions.push({
                    label: 'Send to Human Signoff',
                    onClick: () => updateItemStatus(item.id, 'human_signoff'),
                    variant: 'primary',
                });
                break;
            case 'human_signoff':
                actions.push({
                    label: 'Approve',
                    onClick: () => updateItemStatus(item.id, 'approved'),
                    variant: 'primary',
                });
                break;
            case 'approved':
                actions.push({
                    label: 'Publish to Student',
                    onClick: () => handlePublish(item.id, 'published_student'),
                    variant: 'primary',
                });
                actions.push({
                    label: 'Publish to Free Trial',
                    onClick: () => handlePublish(item.id, 'published_trial'),
                    variant: 'secondary',
                });
                break;
            case 'published_student':
            case 'published_trial':
                actions.push({
                    label: 'Unpublish (Revert to Approved)',
                    onClick: () => updateItemStatus(item.id, 'approved'),
                    variant: 'secondary',
                });
                break;
        }

        return actions;
    };

    return (
        <div className="px-4 py-6 sm:px-0">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">NCLEX NGN Generator Engine</h1>
                <p className="text-gray-600">Create and manage NCLEX NGN questions through the complete workflow</p>
            </div>

            {/* Profile Banner */}
            <ProfileBanner />

            {/* Action Buttons */}
            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                >
                    <span>✨</span>
                    New AI‑Generated Item
                </button>
                <button
                    onClick={() => createNewItem('manual_entered')}
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium flex items-center gap-2"
                >
                    <span>✏️</span>
                    New Manual Entry Item
                </button>
                <button
                    onClick={() => setIsCaseStudyModalOpen(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
                >
                    <span>🎯</span>
                    Generate Case Study (6 Items)
                </button>
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                >
                    <span>📥</span>
                    Import Questions
                </button>
            </div>

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedItemIds.size}
                onClearSelection={() => setSelectedItemIds(new Set())}
                onStatusChange={handleBulkStatusUpdate}
                onBulkAIAudit={handleBulkAIAudit}
                onBulkAIFix={handleBulkAIFix}
                availableTransitions={getAvailableTransitionsForSelection()}
            />


            {/* Kanban Board */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading items...</p>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <div className="inline-flex gap-4 pb-4 min-w-full">
                        {STATUS_COLUMNS.map(column => (
                            <div key={column.status} className="flex-shrink-0 w-72">
                                <div className={`${column.color} rounded-t-lg px-4 py-2 font-semibold flex items-center justify-between`}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={getItemsByStatus(column.status).length > 0 && getItemsByStatus(column.status).every(item => selectedItemIds.has(item.id))}
                                            onChange={() => selectAllInColumn(column.status)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="cursor-pointer"
                                        />
                                        <span>{column.label}</span>
                                    </div>
                                    <span className="text-sm">({getItemsByStatus(column.status).length})</span>
                                </div>
                                <div className="bg-gray-50 rounded-b-lg p-3 min-h-[200px] space-y-3">
                                    {getItemsByStatus(column.status).map(item => (
                                        <div
                                            key={item.id}
                                            className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow border ${selectedItemIds.has(item.id) ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItemIds.has(item.id)}
                                                    onChange={() => toggleItemSelection(item.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="mt-1 cursor-pointer"
                                                />
                                                <div className="flex-1" onClick={() => openItemDetail(item)}>
                                                    <div className="flex items-start justify-between mb-2">
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEntryModeColor(item.entryMode)}`}>
                                                            {item.entryMode === 'ai_generated' ? '✨ AI' : '✍️ Manual'}
                                                        </span>
                                                        {item.auditReport && (
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.auditReport.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                                                                item.auditReport.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                                    'bg-green-100 text-green-800'
                                                                }`}>
                                                                {item.auditReport.overallRisk.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-800 line-clamp-2 mb-2">
                                                        {item.stem}
                                                    </p>
                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                        <span>{item.questionType}</span>
                                                        <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    {item.presentationStyle === 'ehr_case' && (
                                                        <div className="mt-2">
                                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                                                                EHR-style
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {getItemsByStatus(column.status).length === 0 && (
                                        <div className="text-center text-gray-400 text-sm py-8">
                                            No items
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Item Detail Drawer */}
            {isDrawerOpen && selectedItem && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDrawerOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Details</h2>
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEntryModeColor(selectedItem.entryMode)}`}>
                                            {selectedItem.entryMode === 'ai_generated' ? '✨ AI Generated' : '✍️ Manual Entry'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedItem.status)}`}>
                                            {STATUS_COLUMNS.find(c => c.status === selectedItem.status)?.label}
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

                            {/* Basic Info */}
                            <Card title="Basic Information" className="mb-6">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Item ID:</span>
                                        <span className="font-mono text-gray-900">{selectedItem.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Question Type:</span>
                                        <span className="text-gray-900">{selectedItem.questionType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created By:</span>
                                        <span className="text-gray-900">{selectedItem.createdBy}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Created:</span>
                                        <span className="text-gray-900">{new Date(selectedItem.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="text-gray-900">{new Date(selectedItem.lastUpdatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* EHR Preview for EHR-style items */}
                            {selectedItem.presentationStyle === 'ehr_case' && (
                                <Card title="EHR Patient Chart Preview" className="mb-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full font-medium">
                                            EHR-STYLE ITEM
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-3 text-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="font-semibold text-gray-700">Patient Name:</span>
                                                <span className="ml-2 text-gray-900">Smith, John A.</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">MRN:</span>
                                                <span className="ml-2 text-gray-900 font-mono">12345678</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">DOB:</span>
                                                <span className="ml-2 text-gray-900">01/15/1965 (Age: 58)</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Sex:</span>
                                                <span className="ml-2 text-gray-900">Male</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Code Status:</span>
                                                <span className="ml-2 text-gray-900">Full Code</span>
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-700">Allergies:</span>
                                                <span className="ml-2 text-red-600 font-medium">Penicillin, Sulfa</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-gray-300">
                                            <p className="text-xs text-gray-600 italic">
                                                Note: This is placeholder EHR header data. Real EHR-formatted stems will be generated by AI.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Question Content */}
                            <Card title="Question Content" className="mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Stem</label>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                                            {selectedItem.stem}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                        <div className="space-y-2">
                                            {selectedItem.options.map((option, idx) => (
                                                <div key={option.id} className="bg-gray-50 rounded-lg p-3">
                                                    <div className="flex items-start gap-2">
                                                        <span className="font-medium text-gray-700">{String.fromCharCode(65 + idx)}.</span>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-800">{option.text}</p>
                                                            {option.isTrap && (
                                                                <p className="text-xs text-orange-600 mt-1">
                                                                    🎯 Trap: {option.trapReason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rationale</label>
                                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                                            {selectedItem.rationale}
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* AI Audit Section */}
                            <Card title="AI Audit Report" className="mb-6">
                                {selectedItem.auditReport ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-700">Overall Risk:</span>
                                            <span className={`px-3 py-1 rounded-full font-semibold ${selectedItem.auditReport.overallRisk === 'high' ? 'bg-red-100 text-red-800' :
                                                selectedItem.auditReport.overallRisk === 'medium' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {selectedItem.auditReport.overallRisk.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">Issues Detected:</h4>
                                            <div className="space-y-3">
                                                {selectedItem.auditReport.issues.map(issue => (
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
                                        <p className="text-xs mt-1">Send this item to AI Audit to generate a report.</p>
                                    </div>
                                )}
                            </Card>

                            {/* Actions */}
                            <Card title="Actions" className="mb-6">
                                <div className="space-y-3">
                                    {getAvailableActions(selectedItem).map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                action.onClick();
                                                // Don't close drawer for audit/fix actions so user can see results
                                                if (!action.label.includes('Audit') && !action.label.includes('Fix')) {
                                                    setIsDrawerOpen(false);
                                                }
                                            }}
                                            className={`w-full px-4 py-2 rounded-lg font-medium ${action.variant === 'primary'
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                }`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                    {getAvailableActions(selectedItem).length === 0 && (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No actions available for this status.
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Send Back Options */}
                            {getSendBackOptions(selectedItem.status).length > 0 && (
                                <Card title="Send Back" className="mb-6">
                                    <div className="space-y-2">
                                        {getSendBackOptions(selectedItem.status).map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendBack(selectedItem.id, option.targetStatus)}
                                                className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 border border-yellow-300"
                                            >
                                                ← {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Delete */}
                            <Card title="Danger Zone" className="mb-6">
                                <button
                                    onClick={() => handleDelete(selectedItem.id)}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                                >
                                    🗑️ Delete Item
                                </button>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    This action cannot be undone
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generated Item Modal */}
            <AIGeneratedItemModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onGenerate={handleAIGenerate}
            />

            {/* Case Study Generation Modal */}
            <CaseStudyModal
                isOpen={isCaseStudyModalOpen}
                onClose={() => setIsCaseStudyModalOpen(false)}
                onImport={handleCaseStudyImport}
            />

            {/* Import Modal */}
            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={handleImport}
            />
        </div>
    );
}
