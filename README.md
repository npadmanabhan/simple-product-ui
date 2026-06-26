# product-ui

A product management SPA — create, edit, search, and delete products backed by [product-api](https://github.com/npadmanabhan/simple-product-api).

## Stack

- **UI**: React 19, React Router 7
- **Build**: Vite 8
- **Styling**: Tailwind CSS 4
- **HTTP**: Axios
- **E2E tests**: Playwright

## Setup

```bash
npm install
```

Copy the example env file and point it at the API:

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
# http://localhost:5173
```

## Environment Variables

| Variable       | Description                         | Default                  |
|----------------|-------------------------------------|--------------------------|
| `VITE_API_URL` | Base URL of the product-api service | `http://localhost:3000`  |

> **Note:** `VITE_API_URL` is resolved at **build time** by Vite and baked into the JavaScript bundle. To target a different API URL you must rebuild the app (or Docker image) with the correct value — changing it at runtime has no effect.

## Production build

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## E2E tests

Requires the API and a MongoDB instance to be running (see [product-api](https://github.com/npadmanabhan/simple-product-api)).

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # Playwright UI mode
```

## Docker

The image is a two-stage build: Node.js compiles the Vite bundle, then nginx serves the static files on port **8080**.

### Build

Pass the API URL as a build argument so it is embedded in the bundle:

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:3000 \
  -t product-ui .
```

### Run locally

```bash
docker run --rm -p 8080:8080 product-ui
```

Open [http://localhost:8080](http://localhost:8080).

Verify the container is healthy:

```bash
curl http://localhost:8080/healthz
# ok
```

### Cloud Run

The container listens on port **8080**, which is Cloud Run's default. No `PORT` variable is needed.

Set `VITE_API_URL` to the deployed Cloud Run URL of product-api **at image build time**:

```bash
docker build \
  --build-arg VITE_API_URL=https://product-api-<hash>-uc.a.run.app \
  -t product-ui .
```

Cloud Run health check path: `GET /healthz`

---

## CI/CD

The pipeline (`.github/workflows/ci.yml`) runs on every push and pull request to `main`:

1. **Lint & Build** — `npm run lint` + `npm run build` (runs on PRs and pushes)
2. **Build & Push** — builds the Docker image and pushes to Google Artifact Registry (pushes to `main` only)

`VITE_API_URL` is read from the `VITE_API_URL` GitHub Actions variable and baked into the bundle at Docker build time. Images are tagged `latest` and `sha-<short>`.

### Required GitHub configuration

Set the following in **Settings → Secrets and variables → Actions**:

| Name | Type | Value |
|------|------|-------|
| `WIF_PROVIDER` | Secret | `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | Secret | `github-actions@PROJECT_ID.iam.gserviceaccount.com` |
| `GCP_PROJECT_ID` | Variable | your GCP project ID |
| `GAR_REGION` | Variable | Artifact Registry region, e.g. `us-central1` |
| `GAR_REPO` | Variable | Artifact Registry repository name, e.g. `product-images` |
| `VITE_API_URL` | Variable | deployed Cloud Run URL of product-api |

> The one-time GCP setup (Artifact Registry repo, Workload Identity Pool, Service Account) is the same as for product-api — see [simple-product-api](https://github.com/npadmanabhan/simple-product-api#cicd). Run the final `add-iam-policy-binding` step a second time, substituting `npadmanabhan/simple-product-ui` as the repository.
