import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
	page,
	totalPages,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	return (
		<nav
			className="pagination"
			aria-label="Pagination"
		>
			<button
				type="button"
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
			>
				<ChevronLeft size={16} />
				Previous
			</button>
			<span>
				Page {page} of {totalPages}
			</span>
			<button
				type="button"
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
			>
				Next
				<ChevronRight size={16} />
			</button>
		</nav>
	);
}
