import React from 'react';
import { EHRDetails } from '@nclex/shared-api-types';

interface EHRHeaderProps {
    details: EHRDetails;
}

export const EHRHeader: React.FC<EHRHeaderProps> = ({ details }) => {
    return (
        <div className="w-full font-sans mb-6 shadow-md">
            {/* Top Bar - Dark Blue */}
            <div className="bg-[#0f172a] text-white p-4 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    {/* Avatar Placeholder */}
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>

                    {/* Patient Info */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">{details.patientName}</h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-300">
                            <div className="flex gap-1">
                                <span className="text-gray-400">DOB:</span>
                                <span>{details.dob}</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-gray-400">MRN:</span>
                                <span>{details.mrn}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                <span>{details.gender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                <span>{details.age}</span>
                            </div>
                        </div>

                        {/* Alerts Row */}
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center bg-red-900/30 border border-red-800 rounded px-2 py-0.5">
                                <span className="text-red-400 text-xs font-bold mr-1">⚠ ALLERGIES:</span>
                                <span className="text-white text-xs font-medium">{details.allergies}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">Code Status:</span>
                                <span className="text-white font-bold">{details.codeStatus}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admission Box */}
                <div className="bg-slate-800/50 border border-slate-700 rounded px-3 py-2 text-right min-w-[120px]">
                    <div className="flex items-center justify-end gap-2 text-gray-400 text-xs mb-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Admitted:</span>
                    </div>
                    <div className="text-white font-medium text-sm">{details.admissionDate}</div>
                </div>
            </div>

            {/* Tabs Row */}
            <div className="flex border-b border-gray-200 bg-white">
                <div className="px-6 py-3 border-b-2 border-blue-600 text-blue-700 font-bold text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    HISTORY/NOTES
                </div>
                {['VITALS', 'LABS', 'MEDS', 'I/O'].map((tab) => (
                    <div key={tab} className="px-6 py-3 text-gray-500 font-medium text-sm hover:text-gray-700 cursor-not-allowed flex items-center gap-2 flex-col md:flex-row">
                        {/* Icons could be added here */}
                        {tab}
                    </div>
                ))}
            </div>

            {/* Diagnosis Section */}
            <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex gap-2">
                    <div className="w-1 bg-blue-600 rounded-full"></div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Diagnosis</h3>
                        <p className="text-gray-800 text-sm leading-relaxed">
                            {details.diagnosis}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
