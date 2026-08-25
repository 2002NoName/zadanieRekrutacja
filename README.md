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

CI/CD runs as three focused workflows. [push-checks.yml](.github/workflows/push-checks.yml) builds, lints, and scans for secrets on every push to a branch other than `main`. [pr-checks.yml](.github/workflows/pr-checks.yml) runs dependency auditing and CodeQL analysis on pull requests targeting any branch other than `main` and on merge queue groups. [image-build-sign.yml](.github/workflows/image-build-sign.yml) builds and signs container image archives on every push to `main`.

Signed OCI image archives are attached to the `image-build-sign` workflow run; they are not published to a registry. See [docs/cicd.md](docs/cicd.md) for the full pipeline and required branch-protection status checks.

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
