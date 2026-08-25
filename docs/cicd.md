# CI/CD

Navigation: [README](../README.md) | [Stack](stack.md) | [Security](security.md) | [API](api.md) | [Data Model](database.md) | [Observability](observability.md) | [Operations](manual.md)

## Overview

CI/CD is split into three independent workflows, each scoped to a single stage of the pipeline:

| Workflow                                                            | Trigger                                                                            | Purpose                          |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- |
| [`push-checks.yml`](../.github/workflows/push-checks.yml)           | Push to any branch except `main`, manual dispatch                                  | Build, lint, and secret scanning |
| [`pr-checks.yml`](../.github/workflows/pr-checks.yml)               | Pull request targeting any branch (including `main`), merge queue, manual dispatch | Dependency audit and CodeQL      |
| [`image-build-sign.yml`](../.github/workflows/image-build-sign.yml) | Push to `main`, manual dispatch                                                    | Signed image archives            |

`main` only receives commits through a pull request from `dev`, which `pr-checks.yml` still gates. Direct pushes are excluded from `push-checks.yml` since `main` never receives them; the resulting push after merge is instead covered by `image-build-sign.yml`.

## Push checks

`push-checks.yml` runs on every push to a branch other than `main` (for example `dev` or a feature branch):

1. `build-lint-check` installs dependencies (`npm ci`), lints (`npm run lint`), and builds (`npm run build`) the frontend, then the backend.
2. `secret-scan` checks complete Git history with Gitleaks.

Configure `build-lint-check` and `secret-scan` as required branch-protection status checks so a push that fails either job is rejected.

## Pull request checks

`pr-checks.yml` runs on pull requests targeting any branch, including `main`, and on merge queue groups:

1. `dependency-audit` runs `npm audit --audit-level=high` for the frontend and backend, rejecting high or critical vulnerabilities.
2. `codeql` runs JavaScript/TypeScript analysis with no build capture and uploads results to GitHub Code Scanning.

Configure `dependency-audit` and `codeql` as required branch-protection status checks so a pull request cannot merge while either job fails.

## Image build and sign

`image-build-sign.yml` runs on every push to `main`, which normally happens when a `dev` pull request is merged after passing `pr-checks.yml`.

The job creates OCI archives for the API and frontend images tagged with the triggering commit SHA. It does not publish images to a registry. Cosign signs each archive with keyless Sigstore signing and writes a bundle alongside it. The archives and bundles are uploaded as a workflow artifact for 14 days.

GitHub Actions obtains a short-lived OpenID Connect identity through the `id-token: write` permission; no private signing key is stored in repository secrets. A later deployment process can validate an archive with its Cosign bundle before loading or publishing it.

It can also be triggered manually with `workflow_dispatch`, in which case it builds from the ref that started the run.
