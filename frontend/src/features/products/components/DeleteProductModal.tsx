import type { FormEvent } from "react";
import { Modal } from "./Modal";
import type { Product } from "../types";

export function DeleteProductModal({
	product,
	isDeleting,
	onClose,
	onSubmit,
}: {
	product: Product;
	isDeleting: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
	return (
		<Modal onClose={onClose}>
			<form
				className="modal-form"
				onSubmit={onSubmit}
			>
				<h2>Delete product</h2>
				<p>
					Delete <strong>{product.name}</strong>?
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
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						className="destructive-button"
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
