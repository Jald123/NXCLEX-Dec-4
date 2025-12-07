const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'data', 'items.json');
const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
items[0].status = 'published_student';
fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
console.log('Updated item status');
