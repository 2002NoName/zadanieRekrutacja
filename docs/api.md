# REST API

Navigation: [README](../README.md) | [Stack](stack.md) | [Security](security.md) | [Data Model](database.md) | [Observability](observability.md) | [Operations](manual.md)

Base URL: `http://localhost:4000`

## Conventions

Successful `/api/*` responses contain a `data` property, except for `204 No Content`; `/health` returns its status fields directly. Error responses use `systemMessage` for logs and diagnostics and `userMessage` for display in the web client. Request logs record the HTTP method through `event.action`. The API has no authentication middleware; network exposure should be restricted accordingly.

For local diagnostic exercises, mutation requests can include `X-Simulate-Failure: true` when `ENABLE_FAILURE_SIMULATION=true`. The API then returns `500 Internal Server Error` and records the failure in the structured log stream. The product form and delete-confirmation modal expose this option.

## Health

### `GET /health`

Returns the process status and current catalog size.

```json
{ "status": "ok", "records": 10000 }
```

Status: `200 OK`.

## Products

### `GET /api/products`

Returns a paginated product collection.

| Query parameter | Type    | Default | Constraints            |
| --------------- | ------- | ------- | ---------------------- |
| `page`          | integer | `1`     | Minimum `1`            |
| `limit`         | integer | `25`    | Range `1-100`          |
| `search`        | string  | none    | Maximum 120 characters |

Example: `GET /api/products?page=1&limit=20&search=hardware`

```json
{
	"data": [
		{
			"id": "1",
			"name": "Product 1",
			"category": "Hardware",
			"price": 10.72,
			"stock": 1
		}
	],
	"meta": { "page": 1, "limit": 20, "total": 10000, "totalPages": 500 }
}
```

Status codes: `200 OK`, `400 Bad Request` for invalid query parameters.

### `GET /api/products/:id`

Returns one product by its string identifier. Status codes: `200 OK` or `404 Not Found`.

### `POST /api/products`

Creates a product.

```json
{ "name": "Keyboard", "category": "Hardware", "price": 49.99, "stock": 12 }
```

Status codes: `201 Created`, `400 Bad Request` for invalid input, `500 Internal Server Error` when failure simulation is selected.

### `PUT /api/products/:id`

Replaces the editable product fields using the same body schema as `POST`. Status codes: `200 OK`, `400 Bad Request`, `404 Not Found`, or `500 Internal Server Error` when failure simulation is selected.

### `DELETE /api/products/:id`

Deletes a product. Status codes: `204 No Content`, `404 Not Found`, or `500 Internal Server Error` when failure simulation is selected.

All writes affect the current API process and disappear after a restart. The web client invalidates the product query after a successful write.
