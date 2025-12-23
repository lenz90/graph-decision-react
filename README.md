# Decision Graph

A minimal Next.js scaffold for a visual decision board. This initial release focuses on routing and
placeholder UI so future graph logic can be layered in.

## Tech stack
- Next.js (App Router, TypeScript)
- Tailwind CSS
- shadcn/ui primitives
- ESLint + Prettier

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Routes
- `/` redirects to `/onboarding`.
- `/onboarding` introduces the product tone and philosophy selectors.
- `/board` renders the React Flow-powered decision board canvas. Open this route directly to explore the
  graph view.

## Notes
- No backend, authentication, or API calls are included yet.
- UI is static and ready to be extended with real graph logic later.
