export type Product = {
	id: string;
	name: string;
	category: string;
	price: number;
	stock: number;
};

export type ListResponse = {
	data: Product[];
	meta: { page: number; limit: number; total: number; totalPages: number };
};

export type ModalState =
	| { type: "create" }
	| { type: "edit"; product: Product }
	| { type: "delete"; product: Product }
	| null;
