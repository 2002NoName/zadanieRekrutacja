import { Search } from "lucide-react";

export function ProductToolbar({
	search,
	feedback,
	onSearchChange,
}: {
	search: string;
	feedback: string;
	onSearchChange: (search: string) => void;
}) {
	return (
		<div className="table-toolbar">
			<label className="search-field">
				<Search size={17} />
				<input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search products"
					aria-label="Search products"
				/>
			</label>
			{feedback && (
				<p
					className="feedback"
					role="status"
				>
					{feedback}
				</p>
			)}
		</div>
	);
}
