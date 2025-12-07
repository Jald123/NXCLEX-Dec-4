# NCLEX NGN Platform

A monorepo for the NCLEX NGN education platform with multiple applications and shared packages.

## Structure

```
nclex-ngn-platform/
├── apps/
│   ├── admin-dashboard/     # Admin portal for content creation
│   ├── student-portal/      # Student learning platform
│   └── free-trial-shell/    # Free trial experience
├── packages/
│   ├── shared-ui/           # Shared React components
│   └── shared-api-types/    # Shared TypeScript types
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Servers

Run all apps:
```bash
npm run dev
```

Run individual apps:
```bash
npm run dev:admin    # Admin dashboard on port 3000
npm run dev:student  # Student portal on port 3001
npm run dev:trial    # Free trial on port 3002
```

### Build

```bash
npm run build
```

## Apps

### Admin Dashboard
- NCLEX NGN Generator Engine
- Trap Hunter Creator Engine
- Mnemonic Creator Engine
- QA Workflow

### Student Portal
- Question practice
- Progress tracking

### Free Trial Shell
- Demo questions
- Trial experience

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Postgres + Prisma (coming soon)
- **Package Manager**: npm workspaces
