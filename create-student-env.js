const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'apps/student-portal/.env.local');
const content = `NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=studentsecretkey456
`;

fs.writeFileSync(envPath, content);
console.log('Created Student Portal .env.local');
