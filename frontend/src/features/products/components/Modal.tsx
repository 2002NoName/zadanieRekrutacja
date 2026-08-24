"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
	children,
	onClose,
}: {
	children: ReactNode;
	onClose: () => void;
}) {
	const modalRef = useRef<HTMLElement>(null);
	const previouslyFocused = useRef<HTMLElement | null>(null);

	useEffect(() => {
		previouslyFocused.current =
			document.activeElement as HTMLElement | null;
		modalRef.current?.focus();
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
			if (event.key !== "Tab" || !modalRef.current) return;
			const focusable = modalRef.current.querySelectorAll<HTMLElement>(
				'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
			);
			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			previouslyFocused.current?.focus();
		};
	}, [onClose]);

	return (
		<div
			className="modal-backdrop"
			role="presentation"
			onMouseDown={onClose}
		>
			<section
				ref={modalRef}
				className="modal"
				role="dialog"
				aria-modal="true"
				aria-label="Product dialog"
				tabIndex={-1}
				onMouseDown={(event) => event.stopPropagation()}
			>
				<button
					className="icon-button close-button"
					type="button"
					aria-label="Close modal"
					onClick={onClose}
				>
					<X size={18} />
				</button>
				{children}
			</section>
		</div>
	);
}
