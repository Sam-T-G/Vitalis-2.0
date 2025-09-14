# Phase 3A: Framer Motion Setup

## 🎯 Objective

Set up Framer Motion with proper TypeScript integration and create the foundation for smooth, physics-based animations throughout the application.

## 📋 Prerequisites

- Phase 1B completed successfully
- Framer Motion installed
- TypeScript configuration working
- Development server running

## 🚀 Implementation Steps

### Step 1: Create Animation Utilities File

Create `src/lib/animations.ts`:

```typescript
import { Variants } from "framer-motion";

// Page transition animations
export const pageVariants: Variants = {
	initial: {
		opacity: 0,
		y: 20,
		scale: 0.98,
	},
	in: {
		opacity: 1,
		y: 0,
		scale: 1,
	},
	out: {
		opacity: 0,
		y: -20,
		scale: 1.02,
	},
};

export const pageTransition = {
	type: "tween",
	ease: "anticipate",
	duration: 0.4,
};

// Chat message animations
export const messageVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 30,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.95,
		transition: {
			duration: 0.2,
		},
	},
};

// Emergency alert animations
export const emergencyVariants: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.8,
		rotateX: -90,
	},
	visible: {
		opacity: 1,
		scale: 1,
		rotateX: 0,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 25,
		},
	},
	pulse: {
		scale: [1, 1.05, 1],
		transition: {
			duration: 1,
			repeat: Infinity,
			ease: "easeInOut",
		},
	},
};

// Stagger animations for lists
export const containerVariants: Variants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

export const itemVariants: Variants = {
	hidden: {
		opacity: 0,
		y: 20,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 30,
		},
	},
};

// Modal animations
export const modalVariants: Variants = {
	hidden: {
		opacity: 0,
		scale: 0.8,
		y: 20,
	},
	visible: {
		opacity: 1,
		scale: 1,
		y: 0,
		transition: {
			type: "spring",
			stiffness: 400,
			damping: 30,
		},
	},
	exit: {
		opacity: 0,
		scale: 0.8,
		y: 20,
		transition: {
			duration: 0.2,
		},
	},
};

// Overlay animations
export const overlayVariants: Variants = {
	hidden: {
		opacity: 0,
	},
	visible: {
		opacity: 1,
		transition: {
			duration: 0.2,
		},
	},
	exit: {
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};

// Loading spinner animation
export const spinnerVariants: Variants = {
	animate: {
		rotate: 360,
		transition: {
			duration: 1,
			repeat: Infinity,
			ease: "linear",
		},
	},
};

// Typing indicator animation
export const typingVariants: Variants = {
	animate: {
		y: [0, -10, 0],
		transition: {
			duration: 0.6,
			repeat: Infinity,
			ease: "easeInOut",
		},
	},
};
```

### Step 2: Create Animation Hooks

Create `src/hooks/useAnimations.ts`:

```typescript
import { useInView } from "framer-motion";
import { useRef } from "react";

export const useScrollAnimation = () => {
	const ref = useRef(null);
	const isInView = useInView(ref, { once: true, amount: 0.1 });
	return { ref, isInView };
};

export const useHoverAnimation = () => {
	return {
		whileHover: { scale: 1.05 },
		whileTap: { scale: 0.95 },
		transition: { type: "spring", stiffness: 400, damping: 25 },
	};
};

export const useStaggerAnimation = (delay: number = 0) => {
	return {
		initial: "hidden",
		animate: "visible",
		variants: {
			hidden: { opacity: 0 },
			visible: {
				opacity: 1,
				transition: {
					staggerChildren: 0.1,
					delayChildren: delay,
				},
			},
		},
	};
};
```

### Step 3: Update TailwindCSS Configuration

Update `tailwind.config.ts` to include animation utilities:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				// Custom medical theme colors
				medical: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
				},
				emergency: {
					50: "#fef2f2",
					100: "#fee2e2",
					200: "#fecaca",
					300: "#fca5a5",
					400: "#f87171",
					500: "#ef4444",
					600: "#dc2626",
					700: "#b91c1c",
					800: "#991b1b",
					900: "#7f1d1d",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			animation: {
				"pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
				"bounce-gentle": "bounce 2s infinite",
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"fade-in": "fade-in 0.5s ease-out",
				"slide-in": "slide-in 0.3s ease-out",
				"scale-in": "scale-in 0.2s ease-out",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"fade-in": {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				"slide-in": {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(0)" },
				},
				"scale-in": {
					"0%": { transform: "scale(0.95)", opacity: "0" },
					"100%": { transform: "scale(1)", opacity: "1" },
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};

export default config;
```

### Step 4: Create Test Animation Component

Create `src/components/AnimatedTest.tsx` to verify setup:

```typescript
"use client";

import { motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/animations";

export default function AnimatedTest() {
	return (
		<motion.div
			initial="initial"
			animate="in"
			exit="out"
			variants={pageVariants}
			transition={pageTransition}
			className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
			<motion.h1
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="text-3xl font-bold mb-4">
				Framer Motion Setup Complete!
			</motion.h1>
			<motion.p
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
				className="text-lg">
				Animations are working perfectly. You can now proceed to the next phase.
			</motion.p>
		</motion.div>
	);
}
```

### Step 5: Test the Setup

Update `src/app/page.tsx` to include the test component:

```typescript
import AnimatedTest from "@/components/AnimatedTest";

export default function Home() {
	return (
		<main className="container mx-auto p-8">
			<AnimatedTest />
		</main>
	);
}
```

## ✅ Validation Criteria

### Must Have:

- [ ] Animation utilities file created with all variants
- [ ] Animation hooks created and working
- [ ] TailwindCSS configuration updated with custom animations
- [ ] Test component renders with smooth animations
- [ ] No TypeScript errors
- [ ] No console warnings

### Quality Checks:

- [ ] Animations are smooth and performant
- [ ] All animation variants properly typed
- [ ] Hooks provide reusable animation logic
- [ ] TailwindCSS animations complement Framer Motion
- [ ] Test component demonstrates working setup

## 🔧 Common Issues & Solutions

### Issue: "framer-motion not found"

**Solution**: Ensure framer-motion is installed: `npm install framer-motion`

### Issue: "TypeScript errors with Variants"

**Solution**: Import types correctly: `import { Variants } from "framer-motion"`

### Issue: "Animations not smooth"

**Solution**: Check for conflicting CSS transitions and ensure proper GPU acceleration

## 🧪 Testing Commands

```bash
# Test TypeScript compilation
npx tsc --noEmit

# Test development server
npm run dev

# Test build process
npm run build
```

## 🎯 Success Metrics

- All animation variants properly defined
- Test component animates smoothly
- No TypeScript or build errors
- Performance is optimal (60fps animations)
- Animation hooks work correctly

## ➡️ Next Phase

Proceed to **Phase 3B: Animation Presets** only after all validation criteria are met.

---

**⚠️ Critical**: Ensure all animations are smooth and performant. Any performance issues must be resolved before proceeding.
