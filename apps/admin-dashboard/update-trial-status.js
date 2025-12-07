const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, 'data', 'items.json');

try {
    const data = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(data);
    console.log('Available IDs:', items.map(i => i.id));

    // Find item-1764739056705 and update status
    const itemIndex = items.findIndex(item => item.id === 'item-1764739056705');
    if (itemIndex !== -1) {
        items[itemIndex].status = 'published_trial';
        fs.writeFileSync(itemsPath, JSON.stringify(items, null, 4));
        console.log('Successfully updated item-1764739056705 to published_trial');
    } else {
        console.error('Item item-1764739056705 not found');
    }
} catch (error) {
    console.error('Error updating items:', error);
}
