'use client';

import { useState } from 'react';
import { Card } from '@nclex/shared-ui';
import type { NclexItemDraft } from '@nclex/shared-api-types';
import { parseCSV, generateSampleCSV, type ValidationError as CSVError } from '../../lib/csvParser';
import { validateJSON, generateSampleJSON, type ValidationError as JSONError } from '../../lib/jsonValidator';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (questions: NclexItemDraft[]) => void;
}

export default function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
    const [activeTab, setActiveTab] = useState<'csv' | 'json'>('csv');
    const [csvFile, setCSVFile] = useState<File | null>(null);
    const [jsonText, setJsonText] = useState('');
    const [validationErrors, setValidationErrors] = useState<(CSVError | JSONError)[]>([]);
    const [previewQuestions, setPreviewQuestions] = useState<NclexItemDraft[]>([]);
    const [isValidating, setIsValidating] = useState(false);

    if (!isOpen) return null;

    const handleCSVUpload = async (file: File) => {
        setCSVFile(file);
        setIsValidating(true);
        setValidationErrors([]);
        setPreviewQuestions([]);

        try {
            const text = await file.text();
            const result = parseCSV(text);

            setValidationErrors(result.errors);
            setPreviewQuestions(result.questions);
        } catch (error) {
            setValidationErrors([{ line: 0, field: 'file', message: 'Failed to read CSV file' }]);
        } finally {
            setIsValidating(false);
        }
    };

    const handleJSONPaste = () => {
        setIsValidating(true);
        setValidationErrors([]);
        setPreviewQuestions([]);

        const result = validateJSON(jsonText);
        setValidationErrors(result.errors);
        setPreviewQuestions(result.questions);
        setIsValidating(false);
    };

    const handleImport = () => {
        if (previewQuestions.length > 0) {
            onImport(previewQuestions);
            handleClose();
        }
    };

    const handleClose = () => {
        setCSVFile(null);
        setJsonText('');
        setValidationErrors([]);
        setPreviewQuestions([]);
        setActiveTab('csv');
        onClose();
    };

    const downloadSample = () => {
        const content = activeTab === 'csv' ? generateSampleCSV() : generateSampleJSON();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sample-questions.${activeTab}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Questions</h2>
                            <p className="text-sm text-gray-600">Upload CSV file or paste JSON data</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b">
                        <button
                            onClick={() => setActiveTab('csv')}
                            className={`px-4 py-2 font-medium ${activeTab === 'csv'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📄 Upload CSV
                        </button>
                        <button
                            onClick={() => setActiveTab('json')}
                            className={`px-4 py-2 font-medium ${activeTab === 'json'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            📋 Paste JSON
                        </button>
                    </div>

                    {/* CSV Upload Tab */}
                    {activeTab === 'csv' && (
                        <div className="space-y-4">
                            <Card title="Upload CSV File">
                                <div className="space-y-4">
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const file = e.dataTransfer.files[0];
                                            if (file && file.name.endsWith('.csv')) {
                                                handleCSVUpload(file);
                                            }
                                        }}
                                        onClick={() => document.getElementById('csv-upload')?.click()}
                                    >
                                        <input
                                            id="csv-upload"
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleCSVUpload(file);
                                            }}
                                        />
                                        <div className="text-4xl mb-2">📁</div>
                                        <p className="text-gray-700 font-medium">
                                            {csvFile ? csvFile.name : 'Click or drag CSV file here'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Supports CSV files up to 10MB
                                        </p>
                                    </div>

                                    <button
                                        onClick={downloadSample}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                    >
                                        📥 Download Sample CSV
                                    </button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* JSON Paste Tab */}
                    {activeTab === 'json' && (
                        <div className="space-y-4">
                            <Card title="Paste JSON Data">
                                <div className="space-y-4">
                                    <textarea
                                        value={jsonText}
                                        onChange={(e) => setJsonText(e.target.value)}
                                        placeholder='Paste your JSON here... Example: [{"questionType": "Multiple Choice", "stem": "...", ...}]'
                                        className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleJSONPaste}
                                            disabled={!jsonText.trim()}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                                        >
                                            ✓ Validate JSON
                                        </button>
                                        <button
                                            onClick={downloadSample}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                                        >
                                            📥 Sample
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && (
                        <Card title="❌ Validation Errors" className="mt-6">
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {validationErrors.map((error, index) => (
                                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-800">
                                            <strong>
                                                {activeTab === 'csv'
                                                    ? `Line ${(error as CSVError).line}`
                                                    : `Question ${(error as JSONError).index + 1}`}
                                                :
                                            </strong> {error.field} - {error.message}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Preview */}
                    {previewQuestions.length > 0 && (
                        <Card title={`✅ Preview (${previewQuestions.length} questions)`} className="mt-6">
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {previewQuestions.slice(0, 5).map((q, index) => (
                                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs font-semibold text-blue-600 uppercase">
                                                {q.questionType}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {q.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-900 font-medium mb-2">
                                            {q.stem.substring(0, 100)}...
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            {q.options.length} options • {q.options.filter(o => o.isCorrect === true).length} correct
                                        </p>
                                    </div>
                                ))}
                                {previewQuestions.length > 5 && (
                                    <p className="text-sm text-gray-500 text-center">
                                        ... and {previewQuestions.length - 5} more questions
                                    </p>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleImport}
                            disabled={previewQuestions.length === 0 || isValidating}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            ✨ Import {previewQuestions.length} Question{previewQuestions.length !== 1 ? 's' : ''}
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
