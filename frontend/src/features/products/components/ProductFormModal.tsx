import type { FormEvent } from "react";
import { Modal } from "./Modal";
import type { ModalState } from "../types";

export function ProductFormModal({
	modal,
	isSaving,
	onClose,
	onSubmit,
}: {
	modal: Exclude<ModalState, { type: "delete" } | null>;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
	const product = modal.type === "edit" ? modal.product : null;
	return (
		<Modal onClose={onClose}>
			<form
				className="modal-form"
				onSubmit={onSubmit}
			>
				<h2>{product ? "Edit product" : "Add product"}</h2>
				<label>
					Name
					<input
						name="name"
						defaultValue={product?.name ?? ""}
						required
					/>
				</label>
				<label>
					Category
					<input
						name="category"
						defaultValue={product?.category ?? ""}
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
						defaultValue={product?.price ?? ""}
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
						defaultValue={product?.stock ?? ""}
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
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						className="primary-button"
						disabled={isSaving}
					>
						{isSaving ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
