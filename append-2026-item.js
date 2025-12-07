const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'apps/admin-dashboard/data/items.json');
const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));

const newItem = {
    id: `item-2026-${Date.now()}`,
    entryMode: 'ai_generated',
    status: 'published_student',
    questionType: 'Multiple Choice',
    examProfile: 'nclex_2026',
    stem: 'A 2026+ specific question about new clinical judgment protocols...',
    options: [
        { id: '1', text: 'Option A', isTrap: false },
        { id: '2', text: 'Option B', isTrap: true },
        { id: '3', text: 'Option C', isTrap: false },
        { id: '4', text: 'Option D', isTrap: false }
    ],
    rationale: '2026 rationale...',
    createdBy: 'Script',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString()
};

items.push(newItem);
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));
console.log(`Created 2026 item: ${newItem.id}`);
