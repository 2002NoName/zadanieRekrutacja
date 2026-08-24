# CI/CD

Navigation: [README](../README.md) | [Stack](stack.md) | [Security](security.md) | [API](api.md) | [Data Model](database.md) | [Observability](observability.md) | [Operations](manual.md)

## Triggers

The workflow in `.github/workflows/CI.yml` runs on pushes to `dev` and `main`, pull requests targeting `dev` or `main`, GitHub Merge Queue `merge_group` events, and manual dispatches.

An ordinary push to `dev` runs the fast feedback path: build and lint for the frontend and backend. A pull request to `dev` or `main`, a merge queue group, a push to `main`, or a manual dispatch runs the complete quality and security path.

## Quality gate

The `quality-gate` job runs the following checks for the frontend and then the backend on every workflow trigger:

1. `npm ci` installs dependencies from each lockfile.
2. `npm run lint` applies repository lint rules.
3. `npm run build` compiles production artifacts and TypeScript.

`dependency-audit` runs only for pull requests, merge queue groups, `main`, and manual runs. It executes `npm audit --audit-level=high` for both applications and rejects high or critical dependency vulnerabilities.

Any failed step fails its job. Configure `quality-gate`, `dependency-audit`, `secret-scan`, and `codeql` as required branch-protection status checks for `main`.

## Security analysis

`secret-scan` checks complete Git history with Gitleaks on integration events. `codeql` runs JavaScript/TypeScript analysis with no build capture on integration events and uploads results to GitHub Code Scanning.

## Image delivery

`image-build-sign` runs only on a push to `main` and requires successful `quality-gate`, `dependency-audit`, `secret-scan`, and `codeql` jobs.

The job creates OCI archives for the API and frontend images tagged with the commit SHA. It does not publish images to a registry. Cosign signs each archive with keyless Sigstore signing and writes a bundle alongside it. The archives and bundles are uploaded as a workflow artifact for 14 days.

GitHub Actions obtains a short-lived OpenID Connect identity through the `id-token: write` permission; no private signing key is stored in repository secrets. A later deployment process can validate an archive with its Cosign bundle before loading or publishing it.
