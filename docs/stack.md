# Stack and Architecture

Navigation: [README](../README.md) | [Security](security.md) | [API](api.md) | [Data Model](database.md) | [Observability](observability.md) | [Operations](manual.md)

## Components

| Layer                   | Technology                                | Responsibility                                                                                                   |
| ----------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Web client              | Next.js, TypeScript                       | Rendering, product workflows, client-side validation                                                             |
| Data access             | TanStack Query                            | Fetching, caching, loading states, mutation invalidation                                                         |
| API                     | Node.js, Express, TypeScript              | REST endpoints, validation, pagination, in-memory state                                                          |
| Validation              | Zod                                       | Shared shape validation at input boundaries                                                                      |
| Logging                 | Pino, pino-http                           | Structured request and process diagnostics                                                                       |
| Log shipping            | Filebeat                                  | Reading Docker logs and forwarding decoded JSON; persistent registry prevents duplicate ingestion after restarts |
| Log storage             | Elasticsearch                             | Indexed event storage and search                                                                                 |
| Visualization           | Kibana                                    | Queries, data views, and dashboards                                                                              |
| Observability bootstrap | curl container, Elasticsearch/Kibana APIs | One-time GeoIP pipeline and Saved Objects import after service healthchecks pass                                 |
| Delivery                | GitHub Actions, Docker, Cosign            | Quality gates, OCI archive creation, and signing                                                                 |

## Request flow

The browser calls the Express API directly. List requests include a page, page size, and optional search phrase. TanStack Query caches each result for five minutes and invalidates product queries after a successful create, update, or delete operation.

The API validates query parameters and request bodies with Zod before mutating state. It emits JSON logs to standard output. Docker captures the output, Filebeat decodes the JSON payload, and Elasticsearch indexes the resulting events for Kibana. The `observability-setup` service configures the GeoIP ingest pipeline and imports Kibana Saved Objects once both dependencies are healthy.

## Backend structure

The Express backend is organized by responsibility:

| Path                                | Responsibility                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `backend/src/index.ts`              | Process lifecycle hooks and HTTP server startup                                                   |
| `backend/src/app.ts`                | Middleware order and route registration                                                           |
| `backend/src/modules/health/get.ts` | Health endpoint                                                                                   |
| `backend/src/modules/products/*.ts` | One CRUD operation per endpoint module                                                            |
| `backend/src/lib`                   | Product store, schemas support, request context, error responses, logging, and failure simulation |
| `backend/src/schemas`               | Zod request and query schemas                                                                     |
| `backend/src/middlewares`           | Request logging, not-found handling, and central error handling                                   |

The in-memory product store is initialized once when the API process starts. Endpoint modules share it through `lib/products.ts`.

## Runtime characteristics

The catalog is held in a process-local `Map`. Two thousand records are generated during startup. A process restart creates a fresh catalog, so the service has no database connection or migration step.
