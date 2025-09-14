# Phase 1A: Project Initialization

## 🎯 Objective

Initialize a Next.js 15 project with TypeScript and TailwindCSS in the correct directory structure.

## 📋 Prerequisites

- Node.js 20.10+ installed
- npm 10.0+ or yarn 4.0+
- VS Code with recommended extensions
- Access to terminal/command line

## 🚀 Implementation Steps

### Step 1: Navigate to Project Directory

```bash
cd "/Users/sam/Documents/repositories/Vitalis 2.0/Vitalis-2.0"
```

### Step 2: Create Frontend Directory

```bash
mkdir frontend
cd frontend
```

### Step 3: Initialize Next.js 15 Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Expected Output**: Project structure with:

- `src/` directory
- `app/` directory (App Router)
- `components/` directory
- `lib/` directory
- TypeScript configuration
- TailwindCSS configuration
- ESLint configuration

### Step 4: Verify Installation

```bash
npm run dev
```

**Expected Result**: Development server starts on `http://localhost:3000` with Next.js welcome page.

## ✅ Validation Criteria

### Must Have:

- [ ] Project created in `frontend/` directory
- [ ] Next.js 15 with App Router structure
- [ ] TypeScript configuration present
- [ ] TailwindCSS configuration present
- [ ] Development server runs successfully
- [ ] No build errors in terminal

### Quality Checks:

- [ ] All dependencies installed without warnings
- [ ] TypeScript compilation successful
- [ ] ESLint configuration working
- [ ] Import alias `@/*` functioning

## 🔧 Common Issues & Solutions

### Issue: "Command not found: npx"

**Solution**: Install Node.js 20.10+ from nodejs.org

### Issue: "Permission denied"

**Solution**: Use `sudo` (macOS/Linux) or run as administrator (Windows)

### Issue: "Port 3000 already in use"

**Solution**: Kill existing process or use different port: `npm run dev -- -p 3001`

## 📁 Expected Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   └── lib/
├── public/
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🎯 Success Metrics

- Development server runs without errors
- Welcome page loads correctly
- TypeScript compilation successful
- All configuration files present and valid

## ➡️ Next Phase

Proceed to **Phase 1B: Dependencies & Configuration** only after all validation criteria are met.

---

**⚠️ Critical**: Do not proceed to the next phase until this phase is completely validated and working perfectly. Take time to ensure world-class setup.
