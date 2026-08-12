# Auto Scope

Auto Scope is a dark-premium automotive catalogue built with Next.js. It lets users browse manufacturers, move through model families and generations, choose an automobile variant, select an engine configuration, and inspect the complete vehicle profile.

## Catalogue flow

```text
Brand → Model family → Generation → Automobile variant → Engine → Details
```

For example:

1. Open the Acura TLX model family at `/brands/2/models/acua-tlx`.
2. Choose its automobile variant to open `/autos/24`.
3. Select one of the available engine configurations.
4. View the complete profile at a route such as `/autos/24/engines/39`.

The final profile includes the selected engine specifications, automobile photo gallery, description, press release, and catalogue timestamps.

## Features

- Browse and search automobile brands.
- Browse model families globally or filter them by brand.
- Sort and paginate catalogue results.
- Explore generations and their automobile variants.
- Choose an engine before loading the full automobile profile.
- Share a specific automobile and engine combination through a nested URL.
- View responsive remote-image galleries with thumbnail navigation.
- Expand long descriptions and press releases independently.
- Review engine, transmission, brake, dimension, and weight specifications.
- Accessible loading, empty, error, and retry states.
- Responsive dark-premium interface with a sticky shared navigation bar.

## Requirements

- Node.js with npm
- The Automobile Specifications API running at `http://localhost:8080`

The frontend currently consumes the API directly from `http://localhost:8080/api/v1`. The backend must allow requests from `http://localhost:3000` through its CORS configuration.

API documentation is available while the backend is running:

- Swagger UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- OpenAPI JSON: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

## Getting started

Install the dependencies:

```bash
npm install
```

Start the Automobile Specifications API on port `8080`, then run the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Auto Scope landing page |
| `/brands` | Searchable and sortable manufacturer directory |
| `/brands/[id]` | Model families for one manufacturer |
| `/brands/[id]/models/[familyKey]` | Generations and automobile variants for a model family |
| `/autos` | Global model-family directory |
| `/autos/[id]` | Engine-selection view for an automobile variant |
| `/autos/[id]/engines/[engineId]` | Full automobile profile for the selected engine |

## API endpoints used

The main frontend requests are:

```text
GET /api/v1/brands
GET /api/v1/brands/{id}
GET /api/v1/model-families
GET /api/v1/brands/{brandId}/model-families/{familyKey}
GET /api/v1/automobiles/{id}
GET /api/v1/automobiles/{automobileId}/engines
GET /api/v1/engines/{id}
```

Collection endpoints support the API's pagination, name filtering, and whitelisted sorting parameters.

## Project structure

```text
app/                  App Router pages and shared layout
components/brand/     Brand directory components
components/models/    Model-family, generation, and variant components
components/autos/     Engine selection and automobile detail components
lib/                  Automobile Specifications API client functions
public/               Static assets
```

The application uses CSS Modules for component styling, `next/image` for optimized remote automobile images, and Geist fonts through `next/font`.

## Available scripts

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Run ESLint
```

Before handing off changes, run:

```bash
npm run lint
npm run build
git diff --check
```

`npm run build` requires network access when the configured Geist fonts are not already cached.

## Technology

- Next.js 16 App Router
- React 19
- JavaScript and JSX
- CSS Modules
- Automobile Specifications REST API
