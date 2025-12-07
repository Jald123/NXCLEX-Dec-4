const fs = require('fs');
const path = require('path');

// Admin Dashboard .env.local
const adminEnvPath = path.join(__dirname, 'apps/admin-dashboard/.env.local');
const adminContent = `NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretkey123
ADMIN_EMAIL=admin@nclex.com
ADMIN_PASSWORD=Admin123!
GEMINI_API_KEY=your_gemini_api_key_here
`;

// Student Portal .env.local
const studentEnvPath = path.join(__dirname, 'apps/student-portal/.env.local');
const studentContent = `NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=studentsecretkey456
`;

try {
    fs.writeFileSync(adminEnvPath, adminContent);
    console.log('✅ Created Admin Dashboard .env.local');
} catch (error) {
    console.error('❌ Failed to create Admin .env.local:', error.message);
}

try {
    fs.writeFileSync(studentEnvPath, studentContent);
    console.log('✅ Created Student Portal .env.local');
} catch (error) {
    console.error('❌ Failed to create Student .env.local:', error.message);
}

console.log('\n📝 Note: Please restart both dev servers for changes to take effect.');
