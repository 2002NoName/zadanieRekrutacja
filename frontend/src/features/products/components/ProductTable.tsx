import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../types";

export function ProductTable({
	products,
	onEdit,
	onDelete,
}: {
	products: Product[];
	onEdit: (product: Product) => void;
	onDelete: (product: Product) => void;
}) {
	return (
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
					{products.map((product) => (
						<tr key={product.id}>
							<td>
								<strong>{product.name}</strong>
								<small>#{product.id}</small>
							</td>
							<td>{product.category}</td>
							<td>${product.price.toFixed(2)}</td>
							<td
								className={
									product.stock < 10 ? "low-stock" : ""
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
									onClick={() => onEdit(product)}
								>
									<Pencil size={16} />
								</button>
								<button
									className="icon-button destructive"
									type="button"
									aria-label={`Delete ${product.name}`}
									title="Delete"
									onClick={() => onDelete(product)}
								>
									<Trash2 size={16} />
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{products.length === 0 && (
				<p className="empty-state">No products found.</p>
			)}
		</div>
	);
}
