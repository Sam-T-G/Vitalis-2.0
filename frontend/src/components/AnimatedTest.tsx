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
