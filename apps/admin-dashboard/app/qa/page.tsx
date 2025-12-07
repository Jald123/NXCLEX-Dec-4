import { Card } from '@nclex/shared-ui'

export default function QAWorkflowPage() {
    return (
        <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QA Workflow</h1>
            <p className="text-gray-600 mb-6">Review and approve questions before publishing</p>

            <div className="mb-6 flex gap-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                    Pending Review (0)
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                    In Progress (0)
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                    Approved (0)
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                    Rejected (0)
                </button>
            </div>

            <Card title="QA Queue">
                <div className="space-y-4">
                    <div className="text-center py-12 text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-sm">No questions in QA queue</p>
                        <p className="mt-1 text-xs">Questions submitted for review will appear here</p>
                    </div>
                </div>
            </Card>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card title="Workflow Steps">
                    <ol className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                            <span>Draft created by content creator</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                            <span>Submitted to QA queue</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                            <span>Reviewed by QA team</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                            <span>Approved for publishing</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                            <span>Published to Student/Free Trial</span>
                        </li>
                    </ol>
                </Card>

                <Card title="QA Guidelines">
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>✓ Check for accuracy</li>
                        <li>✓ Verify evidence-based content</li>
                        <li>✓ Review trap effectiveness</li>
                        <li>✓ Ensure clarity</li>
                        <li>✓ Validate difficulty level</li>
                    </ul>
                </Card>

                <Card title="Quick Stats">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Avg Review Time:</span>
                            <span className="font-semibold">--</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Approval Rate:</span>
                            <span className="font-semibold">--</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">This Week:</span>
                            <span className="font-semibold">0 reviewed</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
