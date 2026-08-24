# Observability

Navigation: [README](../README.md) | [Stack](stack.md) | [Security](security.md) | [API](api.md) | [Data Model](database.md) | [Operations](manual.md)

## Pipeline

The API writes structured Pino events to standard output. Docker stores container output in JSON log files. Filebeat reads those files with the `filestream` input, decodes the nested JSON payload, adds Docker metadata, and sends the event to Elasticsearch.

Before Filebeat starts, the `observability-setup` service waits for Elasticsearch and Kibana healthchecks. It creates the `crud-api-geoip` ingest pipeline and imports `ops/kibana/saved-objects.ndjson` with overwrite enabled. The operation is idempotent.

## Event schema

API request events include the following fields:

| Field                       | Description                                                 |
| --------------------------- | ----------------------------------------------------------- |
| `service.name`              | API service identifier: `crud-api`                          |
| `log.level`                 | Pino severity: `info`, `warn`, `error`, or `fatal`          |
| `event.outcome`             | `success` for HTTP responses below 400; otherwise `failure` |
| `event.action`              | HTTP request method: `GET`, `POST`, `PUT`, or `DELETE`      |
| `http.response.status_code` | HTTP response status                                        |
| `client.ip`                 | Client IP resolved by Express                               |
| `client.geo.*`              | GeoIP country and coordinates for public IP addresses       |
| `user_agent.*`              | Browser and operating-system metadata                       |

Public addresses use the GeoIP database. Local Docker and loopback addresses are randomly assigned to a curated set of real Polish cities, allowing the request map to be exercised during local development. A reverse-proxy deployment can set `TRUST_PROXY=true` after the proxy is configured to sanitize forwarding headers.

## Failure simulation

The create, update, and delete modals provide a `Simulate failure` option. The API accepts the `X-Simulate-Failure: true` header only when `ENABLE_FAILURE_SIMULATION=true`, which is enabled by local Compose for diagnostics and should be disabled in deployed environments. When selected, the web client adds the header and the API returns `500 Internal Server Error`. Every controlled `400`, `404`, and `500` response emits a server-side diagnostic event with error message, stack trace, operation, request method and path, HTTP status, and technical response message. Stack traces remain in Kibana and are never returned to the client.

## Kibana content

The imported Saved Objects provide:

- `API Logs`: KPI tiles, a full-width success/failure trend, and an `API Errors` table filtered by `service.name: crud-api` and `event.outcome: failure`.
- `Docker Runtime Logs`: service runtime volume, per-container activity trend, and latest container output.
- `API Client Metadata`: request-level IP, country, browser, operating system, route, and response status.
- `API Request Locations`: Elastic Maps Service road-map background and geolocated API request markers.

## Operational commands

Start or refresh the stack:

```bash
docker compose up --build --remove-orphans
```

Inspect running and completed services:

```bash
docker compose ps -a
```

Remove the completed bootstrap container after a successful run:

```bash
docker compose rm -f observability-setup
```

The Filebeat registry is persisted in the `filebeatdata` Docker volume. It records log offsets and prevents duplicate ingestion after a Filebeat restart.

The `API Logs` Data View assigns readable column labels, including `Operation`, `Client IP`, `Country`, `Browser`, `Operating system`, `Request path`, `HTTP status`, `Error`, `Stack trace`, and `Backend system message`. The `Stack trace` column uses `error.stack_trace`, while `Backend system message` uses `error.response.system_message`. `HTTP status` is the single response-status field used by the diagnostic tables.
