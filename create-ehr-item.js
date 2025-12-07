const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'apps/admin-dashboard/data/items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

const newItem = {
    id: `item-${Date.now()}`,
    entryMode: 'ai_generated',
    status: 'published_student',
    questionType: 'Multiple Choice',
    stem: 'A 78-year-old female patient is admitted with exacerbation of COPD...',
    options: [
        { id: '1', text: 'Administer oxygen', isTrap: false },
        { id: '2', text: 'Administer morphine', isTrap: true, trapReason: 'Respiratory depression risk' },
        { id: '3', text: 'Place in supine position', isTrap: true, trapReason: 'Worsens breathing' },
        { id: '4', text: 'Encourage deep breathing', isTrap: false }
    ],
    rationale: 'Oxygen is priority...',
    ehrDetails: {
        patientName: 'Eleanor Vance',
        dob: '1946-03-12',
        mrn: 'EV789012',
        gender: 'Female',
        age: '78 yrs',
        admissionDate: 'Today',
        allergies: 'NKA',
        codeStatus: 'FULL CODE',
        diagnosis: 'COPD Exacerbation, Hypertension'
    },
    createdBy: 'Script',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
};

items.push(newItem);
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
console.log(`Created item: ${newItem.id}`);
