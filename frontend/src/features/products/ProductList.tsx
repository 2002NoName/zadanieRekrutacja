"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { DeleteProductModal } from "./components/DeleteProductModal";
import { Pagination } from "./components/Pagination";
import { ProductFormModal } from "./components/ProductFormModal";
import { ProductTable } from "./components/ProductTable";
import { ProductToolbar } from "./components/ProductToolbar";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { apiRequest } from "./lib/api";
import { productSchema, type ProductPayload } from "./lib/product-schema";
import type { ListResponse, ModalState } from "./types";

export function ProductList() {
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [modal, setModal] = useState<ModalState>(null);
	const [feedbackState, setFeedback] = useState("");
	const debouncedSearch = useDebouncedValue(search, 300);
	const queryClient = useQueryClient();
	const products = useQuery<ListResponse>({
		queryKey: ["products", page, debouncedSearch],
		queryFn: () =>
			apiRequest(
				`/api/products?page=${page}&limit=20&search=${encodeURIComponent(debouncedSearch)}`,
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
			payload: ProductPayload;
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
				<ProductToolbar
					search={search}
					feedback={feedback}
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
				/>
				<ProductTable
					products={products.data?.data ?? []}
					onEdit={(product) => {
						setFeedback("");
						setModal({ type: "edit", product });
					}}
					onDelete={(product) => {
						setFeedback("");
						setModal({ type: "delete", product });
					}}
				/>
				<Pagination
					page={page}
					totalPages={products.data?.meta.totalPages ?? 1}
					onPageChange={setPage}
				/>
			</section>
			{modal && modal.type !== "delete" && (
				<ProductFormModal
					modal={modal}
					isSaving={save.isPending}
					onClose={() => setModal(null)}
					onSubmit={submitProduct}
				/>
			)}
			{modal?.type === "delete" && (
				<DeleteProductModal
					product={modal.product}
					isDeleting={remove.isPending}
					onClose={() => setModal(null)}
					onSubmit={submitDelete}
				/>
			)}
		</main>
	);
}
