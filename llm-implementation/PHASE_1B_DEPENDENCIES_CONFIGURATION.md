# Phase 1B: Dependencies & Configuration

## 🎯 Objective

Install and configure all modern dependencies for the Vitalis frontend with proper version management and optimal setup.

## 📋 Prerequisites

- Phase 1A completed successfully
- Project running in development mode
- Terminal access in frontend directory

## 🚀 Implementation Steps

### Step 1: Install Core Dependencies

```bash
# Core UI and Animation Libraries
npm install framer-motion
npm install @radix-ui/react-dialog @radix-ui/react-button @radix-ui/react-icons
npm install @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install @radix-ui/react-tooltip @radix-ui/react-progress
npm install lucide-react

# Form Handling and Validation
npm install react-hook-form @hookform/resolvers
npm install zod

# State Management
npm install zustand

# Utility Libraries
npm install clsx tailwind-merge
npm install class-variance-authority
npm install cmdk

# Real-time Features
npm install socket.io-client

# PWA Support
npm install next-pwa
```

### Step 2: Install Development Dependencies

```bash
npm install -D @types/node
npm install -D @types/react @types/react-dom
npm install -D prettier eslint-config-prettier
npm install -D @tailwindcss/typography @tailwindcss/forms
```

### Step 3: Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

**Configuration Options**:

- TypeScript: Yes
- Style: Default
- CSS variables: Yes
- Import alias: @/
- Component path: src/components/ui
- Utils path: src/lib/utils

### Step 4: Install Essential shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
```

### Step 5: Verify Installation

```bash
npm run build
```

**Expected Result**: Build completes successfully without errors.

## ✅ Validation Criteria

### Must Have:

- [ ] All dependencies installed without conflicts
- [ ] shadcn/ui initialized successfully
- [ ] All UI components added to project
- [ ] Build process completes successfully
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Quality Checks:

- [ ] Package.json contains all required dependencies
- [ ] node_modules directory properly populated
- [ ] shadcn/ui components directory created
- [ ] Utils file created in src/lib/utils.ts
- [ ] All imports resolve correctly

## 🔧 Common Issues & Solutions

### Issue: "shadcn/ui command not found"

**Solution**: Use `npx shadcn-ui@latest` instead of global installation

### Issue: "Dependency conflicts"

**Solution**: Delete node_modules and package-lock.json, then `npm install`

### Issue: "TypeScript errors after installation"

**Solution**: Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

## 📁 Expected File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       └── ...
│   ├── lib/
│   │   └── utils.ts
│   └── ...
├── components.json
└── package.json (updated with new dependencies)
```

## 🧪 Testing Commands

```bash
# Test TypeScript compilation
npx tsc --noEmit

# Test ESLint
npm run lint

# Test build process
npm run build

# Test development server
npm run dev
```

## 🎯 Success Metrics

- All dependencies installed successfully
- Build process completes without errors
- TypeScript compilation successful
- ESLint passes without warnings
- shadcn/ui components accessible

## ➡️ Next Phase

Proceed to **Phase 1C: Project Structure** only after all validation criteria are met.

---

**⚠️ Critical**: Ensure all dependencies are properly installed and configured before proceeding. Any installation issues must be resolved completely.
