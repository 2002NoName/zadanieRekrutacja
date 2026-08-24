# Operations Manual

Navigation: [README](../README.md) | [Stack](stack.md) | [Security](security.md) | [API](api.md) | [Data Model](database.md) | [Observability](observability.md)

## Start the environment

From the repository root:

```bash
docker compose up --build --remove-orphans
```

The web client is available at `http://localhost:3000`, the API at `http://localhost:4000`, and Kibana at `http://localhost:5601`.

For a local frontend outside Docker, copy `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_API_URL` to the API URL. The local environment file is ignored by Git.

The one-shot `observability-setup` service performs the Elasticsearch GeoIP and Kibana Saved Objects bootstrap after the Elasticsearch and Kibana healthchecks pass. It exits after configuration is complete. Use `docker compose rm -f observability-setup` to remove the completed container from the local Docker list.

## Manage products

The web client loads the first page of the catalog on startup. It requests 20 records per page; the API default is 25 and supports limits from 1 to 100. Search is evaluated by the API. Use the edit action to load a record into the form, submit the form to create or update a product, and use delete to remove a record. Stock levels below 10 units are highlighted.

Create, edit, and delete actions open modals. Each modal includes a `Simulate failure` option for producing controlled API error events in Kibana; this hook is enabled only in the local Docker Compose configuration through `ENABLE_FAILURE_SIMULATION=true`.

The API handlers are separated by operation. Health, product list, detail, create, update, and delete requests each have a dedicated endpoint module; shared validation, error responses, logging, and in-memory storage remain outside endpoint files.

## Observe the API

Pino emits JSON containing the service name, timestamp, severity, request metadata, response status, and duration. Filebeat reads Docker container logs and sends decoded events to Elasticsearch.

The bootstrap imports two dashboards after Kibana reports healthy:

- `API Logs` presents successful requests, failed requests, total API traffic, an outcome trend, and an API log table.
- `Docker Runtime Logs` presents container runtime volume, a per-container trend, and the latest startup and runtime output.

Kibana Maps also includes `API Request Locations`. It combines an Elastic Maps Service road-map background with an Elasticsearch document layer over `client.geo.location`; the tooltip shows client IP, country, browser, operating system, and response status.

The `API Client Metadata` saved search lists client IP, country, browser, operating system, requested path, and response code.

The complete Kibana configuration is versioned in `ops/kibana/saved-objects.ndjson` and is imported idempotently during stack startup.

The API dashboard follows a focused operational layout: KPI tiles provide the current counts, the full-width time-series panel shows the success/failure trend, and the full-width `API Errors` table follows it. The table uses readable labels for operation, client IP, country, browser, operating system, request path, HTTP status, error message, stack trace, and backend system message. Each panel filters on `service.name: crud-api`, preventing infrastructure logs from affecting API metrics.

Filebeat stores its registry in the `filebeatdata` Docker volume. This preserves file offsets between restarts and prevents previously indexed Docker log lines from being counted again. Detailed event fields, dashboards, and map behavior are documented in [observability.md](observability.md).

Useful Kibana filters are:

- `event.outcome: success` for successful API responses.
- `event.outcome: failure` for failed API responses.
- `user_agent.name` and `user_agent.os.name` for browser and operating-system metadata.
- `client.geo.country_name` for public client IP geolocation.

Local Docker and loopback addresses are randomly assigned to real Polish cities so `API Request Locations` has varied test data during development. Public addresses use the GeoIP database; a trusted reverse proxy can provide the original client address in deployed environments.

## Delivery workflow

The container job exports the API and frontend images as OCI archives, signs each archive with Cosign, and uploads the archives and signature bundles as a workflow artifact. It does not publish images to a registry. A later deployment process should verify the Cosign bundle before loading an archive. Runtime catalog changes are lost when the API process restarts.
