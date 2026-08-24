# Zadanie Rekrutacyjne

## Contents

- [Overview](#overview)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [Observability](#observability)
- [API](#api)
- [CI/CD](#cicd)
- [Security](#security)
- [Documentation](#documentation)

## Overview

The application manages products with the following attributes:

- name
- category
- price
- stock level

The API initializes 2,000 products in memory when the process starts. The web client provides server-side search and pagination, as well as create, edit, and delete workflows.

Data is process-local and is recreated after an API restart.

## Quick start

Prerequisites: Docker Compose. On Windows and macOS, Docker Desktop provides the Docker Engine and Compose integration. On Linux, Docker Engine with the Compose plugin is sufficient.

```bash
docker compose up --build --remove-orphans
```

The `observability-setup` service applies the GeoIP ingest pipeline and Kibana Saved Objects after Elasticsearch and Kibana become healthy.

| Service       | Address                 | Purpose                      |
| ------------- | ----------------------- | ---------------------------- |
| Web client    | `http://localhost:3000` | Product management interface |
| REST API      | `http://localhost:4000` | Product and health endpoints |
| Kibana        | `http://localhost:5601` | Log search and visualization |
| Elasticsearch | `http://localhost:9200` | Log storage                  |

The bootstrap imports the `API Logs` data view, dashboards, saved searches, and the request-location map automatically.

## Architecture

- **Frontend:** Next.js App Router, TypeScript, and TanStack Query. Query data uses a five-minute stale time and is invalidated after successful mutations.
- **Backend:** Node.js, Express, and Zod. The API owns validation, pagination, error responses, and in-memory state.
- **Logging:** Pino and pino-http emit structured JSON. Filebeat reads Docker container logs and forwards them to Elasticsearch.
- **Observability:** Kibana provides queries and dashboards over the Elasticsearch index.
- **Delivery:** GitHub Actions runs quality and security gates, builds local OCI image archives on `main`, and signs them with Cosign.

## Observability

The API emits ECS-aligned request events, including outcome, HTTP status, client IP, User-Agent metadata, and GeoIP enrichment for public addresses. Filebeat transports container logs to Elasticsearch, while Kibana provides two dashboards, client metadata search, and a request location map. See [docs/observability.md](docs/observability.md) for the event schema and operational commands.

## API

The REST API base URL is `http://localhost:4000`. The full endpoint contract, validation rules, status codes, and examples are documented in [docs/api.md](docs/api.md).

## CI/CD

The workflow in [.github/workflows/CI.yml](.github/workflows/CI.yml) runs for pull requests to `dev` and `main`, pushes to `dev` and `main`, merge queue groups, and manual dispatches.

Pushes to `dev` run build and lint for both applications. Pull requests to `dev` or `main`, merge queue groups, pushes to `main`, and manual runs additionally execute dependency auditing, Gitleaks, and CodeQL analysis. Container image creation is allowed only after all required gates pass on a push to `main`.

On a push to `main`, signed OCI image archives are attached to the workflow run; they are not published to a registry. See [docs/cicd.md](docs/cicd.md) for the build and signing process.

## Security

The API uses Helmet, configured CORS, request rate limiting, bounded JSON payloads, and server-side Zod validation. Error responses separate technical `systemMessage` values from user-facing messages. Security controls and their enforcement points are described in [docs/security.md](docs/security.md).

## Documentation

- [Stack and architecture](docs/stack.md)
- [Security model](docs/security.md)
- [REST API](docs/api.md)
- [Data model](docs/database.md)
- [Observability](docs/observability.md)
- [CI/CD](docs/cicd.md)
- [Operations manual](docs/manual.md)
