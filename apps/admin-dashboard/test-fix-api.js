// const fetch = require('node-fetch'); // Native fetch in Node 20

async function testFixApi() {
    console.log('Testing AI Fix API...');
    try {
        const response = await fetch('http://localhost:3000/api/ai-fix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'item',
                data: {
                    id: 'test-item',
                    stem: 'A nurse is caring for a client with heart failure. Which assessment finding requires immediate intervention?',
                    options: [
                        { id: '1', text: 'Blood pressure 128/82 mmHg', isTrap: false },
                        { id: '2', text: 'Crackles in bilateral lung bases', isTrap: false }
                    ],
                    rationale: 'Crackles indicate pulmonary edema.'
                },
                auditReport: {
                    overallRisk: 'medium',
                    issues: [
                        {
                            id: 'issue-1',
                            category: 'clinical_accuracy',
                            severity: 'medium',
                            message: 'Rationale could be more detailed.',
                            suggested_fix: 'Explain WHY crackles indicate pulmonary edema.'
                        }
                    ]
                }
            })
        });

        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            const text = await response.text();
            console.error('Response body:', text);
            return;
        }

        const data = await response.json();
        console.log('API Success!');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

testFixApi();
