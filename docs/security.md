# Security Model

Navigation: [README](../README.md) | [Stack](stack.md) | [API](api.md) | [Data Model](database.md) | [Observability](observability.md) | [Operations](manual.md)

## Configuration and secrets

Runtime configuration is supplied through environment variables. Local `.env` files are excluded from version control, while `.env.example` files document safe defaults and variable names.

The failure-simulation header is accepted only when `ENABLE_FAILURE_SIMULATION=true`; it is enabled by default in the local Compose configuration for diagnostics and should remain disabled in deployed environments.

## Input validation

The web client validates form data with Zod before sending a request. The API validates every query parameter and mutation body independently. JSON request bodies are limited to 32 KB; product fields also have explicit length, numeric, and range limits.

## HTTP protections

- Helmet provides baseline security headers.
- CORS accepts only the origins configured through `CORS_ORIGIN`.
- Express rate limiting allows 120 requests per client per minute.
- No endpoint returns stack traces or internal runtime details.

## Logging

API logs use structured JSON with ECS-aligned `log.level` and `event.outcome` fields:

- `event.outcome: success`: completed API responses below HTTP 400.
- `event.outcome: failure`: failed API requests and process-level failures.

Filebeat decodes the JSON payload before indexing it in Elasticsearch. The Filebeat registry is stored in a Docker volume so restarts do not re-ingest previously processed log lines. The API dashboard filters `service.name: crud-api`; the Docker Runtime dashboard filters the project container names.

## Client metadata and geolocation

Completed API request logs include `client.ip`, `user_agent.name`, `user_agent.version`, and `user_agent.os.*`. Elasticsearch enriches public `client.ip` values with `client.geo.*` through the `crud-api-geoip` ingest pipeline.

For local observability, Docker and loopback addresses are randomly assigned to a curated set of Polish cities. `TRUST_PROXY=false` is the safe local default: Express uses the direct peer address and ignores client-controlled forwarding headers. When the API runs behind a trusted reverse proxy, set `TRUST_PROXY=true` so Express uses the forwarded client address. Enable it only when the proxy removes client-supplied forwarding headers.

Client IP addresses, User-Agent values, and server-side stack traces are operational metadata. Access to Kibana and log retention should be restricted according to the environment's privacy and data-retention policy. Stack traces are logged for diagnostics and are not returned by API responses.

## Supply-chain controls

Gitleaks scans the complete Git history for committed secrets. CodeQL analyzes JavaScript and TypeScript and publishes findings to GitHub Code Scanning. After these checks and the build checks pass on `main`, images are exported as OCI archives, signed with keyless Cosign/Sigstore signing, and uploaded with their bundles as workflow artifacts. Images are not published to GHCR by the current workflow. GitHub OIDC supplies the short-lived signing identity; no private signing key is stored in repository secrets.

Branch protection should require `build-lint-check`, `secret-scan`, and `codeql` before a pull request can be merged.
