"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	Pencil,
	Plus,
	Search,
	Trash2,
	X,
} from "lucide-react";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const productSchema = z.object({
	name: z.string().trim().min(2, "Enter a product name.").max(120),
	category: z.string().trim().min(2, "Enter a category.").max(80),
	price: z.coerce
		.number()
		.finite()
		.nonnegative("Price must be zero or higher.")
		.max(1_000_000, "Price cannot exceed 1,000,000."),
	stock: z.coerce
		.number()
		.int()
		.nonnegative("Stock must be a whole number.")
		.max(1_000_000, "Stock cannot exceed 1,000,000."),
});

type Product = {
	id: string;
	name: string;
	category: string;
	price: number;
	stock: number;
};
type ListResponse = {
	data: Product[];
	meta: { page: number; limit: number; total: number; totalPages: number };
};
type ModalState =
	| { type: "create" }
	| { type: "edit"; product: Product }
	| { type: "delete"; product: Product }
	| null;

async function apiRequest(
	path: string,
	options?: RequestInit,
	simulateFailure = false,
) {
	const response = await fetch(`${API_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(simulateFailure ? { "X-Simulate-Failure": "true" } : {}),
		},
	});
	if (!response.ok) {
		const body = await response.text();
		let message = body || "Request failed.";
		try {
			message =
				(JSON.parse(body) as { userMessage?: string }).userMessage ??
				message;
		} catch {}
		throw new Error(message);
	}
	return response.status === 204 ? null : response.json();
}

function Modal({
	children,
	onClose,
}: {
	children: React.ReactNode;
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

export function ProductList() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [modal, setModal] = useState<ModalState>(null);
	const [feedbackState, setFeedback] = useState("");
	const queryClient = useQueryClient();
	const products = useQuery<ListResponse>({
		queryKey: ["products", page, search],
		queryFn: () =>
			apiRequest(
				`/api/products?page=${page}&limit=20&search=${encodeURIComponent(search)}`,
			),
		placeholderData: (previous) => previous,
	});
	const feedback = products.isError
		? "Unable to load products. Please check the API connection."
		: feedbackState;
	const save = useMutation({
		mutationFn: ({
			payload,
			simulateFailure,
		}: {
			payload: z.infer<typeof productSchema>;
			simulateFailure: boolean;
		}) =>
			apiRequest(
				modal?.type === "edit"
					? `/api/products/${modal.product.id}`
					: "/api/products",
				{
					method: modal?.type === "edit" ? "PUT" : "POST",
					body: JSON.stringify(payload),
				},
				simulateFailure,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			setFeedback("Product saved.");
			setModal(null);
		},
		onError: (error: Error) => {
			setFeedback(error.message);
			setModal(null);
		},
	});
	const remove = useMutation({
		mutationFn: ({
			id,
			simulateFailure,
		}: {
			id: string;
			simulateFailure: boolean;
		}) =>
			apiRequest(
				`/api/products/${id}`,
				{ method: "DELETE" },
				simulateFailure,
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["products"] });
			setFeedback("Product deleted.");
			setModal(null);
		},
		onError: (error: Error) => {
			setFeedback(error.message);
			setModal(null);
		},
	});

	function submitProduct(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const parsed = productSchema.safeParse(Object.fromEntries(form));
		if (!parsed.success) {
			setFeedback(parsed.error.issues[0]?.message ?? "Check the form.");
			return;
		}
		save.mutate({
			payload: parsed.data,
			simulateFailure: form.get("simulateFailure") === "on",
		});
	}

	function submitDelete(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (modal?.type === "delete")
			remove.mutate({
				id: modal.product.id,
				simulateFailure:
					new FormData(event.currentTarget).get("simulateFailure") ===
					"on",
			});
	}

	return (
		<main className="product-page">
			<header className="page-header">
				<h1>Product list</h1>
				<button
					className="primary-button"
					type="button"
					onClick={() => {
						setFeedback("");
						setModal({ type: "create" });
					}}
				>
					<Plus size={17} />
					Add product
				</button>
			</header>
			<section
				className="product-table"
				aria-label="Products"
			>
				<div className="table-toolbar">
					<label className="search-field">
						<Search size={17} />
						<input
							value={search}
							onChange={(event) => {
								setSearch(event.target.value);
								setPage(1);
							}}
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
				<div className="table-scroll">
					<table>
						<thead>
							<tr>
								<th>Product</th>
								<th>Category</th>
								<th>Price</th>
								<th>Stock</th>
								<th>
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{products.data?.data.map((product) => (
								<tr key={product.id}>
									<td>
										<strong>{product.name}</strong>
										<small>#{product.id}</small>
									</td>
									<td>{product.category}</td>
									<td>${product.price.toFixed(2)}</td>
									<td
										className={
											product.stock < 10
												? "low-stock"
												: ""
										}
									>
										{product.stock}
									</td>
									<td className="row-actions">
										<button
											className="icon-button"
											type="button"
											aria-label={`Edit ${product.name}`}
											title="Edit"
											onClick={() => {
												setFeedback("");
												setModal({
													type: "edit",
													product,
												});
											}}
										>
											<Pencil size={16} />
										</button>
										<button
											className="icon-button destructive"
											type="button"
											aria-label={`Delete ${product.name}`}
											title="Delete"
											onClick={() => {
												setFeedback("");
												setModal({
													type: "delete",
													product,
												});
											}}
										>
											<Trash2 size={16} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{products.data?.data.length === 0 && (
						<p className="empty-state">No products found.</p>
					)}
				</div>
				<nav
					className="pagination"
					aria-label="Pagination"
				>
					<button
						type="button"
						disabled={page <= 1}
						onClick={() => setPage(page - 1)}
					>
						<ChevronLeft size={16} />
						Previous
					</button>
					<span>
						Page {page} of {products.data?.meta.totalPages ?? 1}
					</span>
					<button
						type="button"
						disabled={page >= (products.data?.meta.totalPages ?? 1)}
						onClick={() => setPage(page + 1)}
					>
						Next
						<ChevronRight size={16} />
					</button>
				</nav>
			</section>
			{modal && modal.type !== "delete" && (
				<Modal onClose={() => setModal(null)}>
					<form
						className="modal-form"
						onSubmit={submitProduct}
					>
						<h2>
							{modal.type === "edit"
								? "Edit product"
								: "Add product"}
						</h2>
						<label>
							Name
							<input
								name="name"
								defaultValue={
									modal.type === "edit"
										? modal.product.name
										: ""
								}
								required
							/>
						</label>
						<label>
							Category
							<input
								name="category"
								defaultValue={
									modal.type === "edit"
										? modal.product.category
										: ""
								}
								required
							/>
						</label>
						<label>
							Price
							<input
								name="price"
								type="number"
								min="0"
								step="0.01"
								defaultValue={
									modal.type === "edit"
										? modal.product.price
										: ""
								}
								required
							/>
						</label>
						<label>
							Stock
							<input
								name="stock"
								type="number"
								min="0"
								step="1"
								defaultValue={
									modal.type === "edit"
										? modal.product.stock
										: ""
								}
								required
							/>
						</label>
						<label className="failure-option">
							<input
								name="simulateFailure"
								type="checkbox"
							/>
							Simulate failure
						</label>
						<div className="modal-actions">
							<button
								type="button"
								onClick={() => setModal(null)}
							>
								Cancel
							</button>
							<button
								className="primary-button"
								disabled={save.isPending}
							>
								{save.isPending ? "Saving..." : "Save"}
							</button>
						</div>
					</form>
				</Modal>
			)}
			{modal?.type === "delete" && (
				<Modal onClose={() => setModal(null)}>
					<form
						className="modal-form"
						onSubmit={submitDelete}
					>
						<h2>Delete product</h2>
						<p>
							Delete <strong>{modal.product.name}</strong>?
						</p>
						<label className="failure-option">
							<input
								name="simulateFailure"
								type="checkbox"
							/>
							Simulate failure
						</label>
						<div className="modal-actions">
							<button
								type="button"
								onClick={() => setModal(null)}
							>
								Cancel
							</button>
							<button
								className="destructive-button"
								disabled={remove.isPending}
							>
								{remove.isPending ? "Deleting..." : "Delete"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</main>
	);
}
