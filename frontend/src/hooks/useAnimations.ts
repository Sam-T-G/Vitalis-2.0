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
