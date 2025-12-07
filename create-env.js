const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps/admin-dashboard/.env.local');
const content = `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretkey123
ADMIN_EMAIL=admin@nclex.com
ADMIN_PASSWORD=Admin123!
`;

fs.writeFileSync(envPath, content);
console.log('Created .env.local');
