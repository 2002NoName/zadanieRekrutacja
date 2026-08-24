# Data Model

Navigation: [README](../README.md) | [Stack](stack.md) | [Security](security.md) | [API](api.md) | [Observability](observability.md) | [Operations](manual.md)

## Storage

The API uses a process-local `Map<string, Product>` keyed by `id`. The catalog is generated during startup and contains 2,000 records. There is no external database connection, schema migration, or persistence layer.

## Product

| Field       | Type          | Rules                  | Description            |
| ----------- | ------------- | ---------------------- | ---------------------- |
| `id`        | string        | Generated identifier   | Primary in-memory key  |
| `name`      | string        | 2-120 characters       | Product name           |
| `category`  | string        | 2-80 characters        | Catalog category       |
| `price`     | number        | Finite, 0 to 1,000,000 | Unit price             |
| `stock`     | integer       | 0 to 1,000,000         | Available quantity     |
| `createdAt` | ISO timestamp | Generated at creation  | Creation time          |
| `updatedAt` | ISO timestamp | Updated on writes      | Last modification time |

There are no relations, foreign keys, indexes, or database-level uniqueness constraints. List queries filter the in-memory collection and then return the requested slice.

## Lifecycle

Create and update operations validate product fields before changing the map. Delete removes the entry by identifier. Restarting the API regenerates the catalog and discards runtime changes.
