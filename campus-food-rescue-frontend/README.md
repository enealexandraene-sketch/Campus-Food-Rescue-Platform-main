# Campus Food Rescue — standalone frontend

A separate, beginner-friendly EJS + CSS + vanilla JavaScript UI based on the provided campus food rescue project requirements. **Nothing in your uploaded project has been edited.**

## Run the demo

Install Node.js 20+ and run:

```bash
cd campus-food-rescue-frontend
npm install
npm run dev
```

Open **http://localhost:3000**. If port 3000 is in use, run `PORT=3001 npm run dev` (macOS/Linux) or set `PORT` in your terminal on Windows.

## What is included

- EJS-rendered pages (server renders HTML templates, no React/build tooling)
- Fully responsive layouts designed for 360px and up, with cream/green/blue/pink botanical styling
- Student sign-up/login **UI only**
- Browse and search food; filter by allergen, provider, time, distance
- Favorite providers and preferred sorting
- Food details, allergen labels, reserve/cancel interactions
- Student reservation statuses and impact dashboard
- Provider dashboard, listing create/edit/hide/delete, pickup management, shop settings
- Maintainer review queue and issue reports
- Editable demo data persisted in **localStorage** in your current browser

## Important: demo versus real functionality

This is **frontend code only**. `demo-server.js` is a tiny Express server solely for EJS templating and static file delivery; it has **no business logic, APIs or database**. The UI interactions are **simulated locally** in `public/js/app.js`. It does not verify university emails, hash passwords, authenticate sessions, persist real users, prevent race conditions across users, send notifications, or enforce role permissions. **Never use this demo as a live production application.**

The provider/maintainer links in the navigation exist for preview of all UI roles; a real backend must restrict access according to authenticated roles. Current filters use preset demo distances, not geolocation. Photos use optional external URLs; the SVG plants are bundled locally. Impact uses a clearly labeled dummy conversion of 0.4 kg CO₂ per collected meal, not a verified environmental estimate.

## Folder structure

```
campus-food-rescue-frontend/
├── demo-server.js              # EJS preview server only
├── package.json
├── views/
│   ├── index.ejs               # All EJS page layouts
│   └── partials/
│       ├── header.ejs
│       ├── footer.ejs
│       └── provider-nav.ejs
└── public/
    ├── css/styles.css          # Design system and responsive layout
    ├── js/app.js                # All demo UI interactions
    └── img/
        ├── monstera.svg
        └── sansevieria.svg
```

## Later integration with your team's app

Your team's `app` already uses **Express and EJS** (according to `app/package.json`). When integrating, copy only the UI templates and static assets into the locations your team chooses; ask the backend owner to connect the EJS views to authenticated routes and replace all `localStorage` data mutations in `app.js` with calls to real server endpoints. The domain implementation is **not** imported or altered here.

Example possible backend contracts (not implemented):

| UI action | Suggested server operation |
|---|---|
| Browse listings | `GET /api/listings` |
| View one listing | `GET /api/listings/:id` |
| Register student | `POST /api/auth/register/student` |
| Log in | `POST /api/auth/login` |
| Reserve portion | `POST /api/listings/:id/reservations` |
| Cancel reservation | `DELETE /api/reservations/:id` |
| Get your reservations | `GET /api/reservations/me` |
| Favorite provider | `POST /api/providers/:id/favorite` |
| Create/update listing | `POST /api/provider/listings`, `PATCH /api/provider/listings/:id` |
| Record pickup | `PATCH /api/provider/reservations/:id` |
| Review provider request | `PATCH /api/admin/providers/:id` |

All endpoint names above are **suggestions**, not routes from the supplied backend. Real reservation logic must atomically prevent overbooking, validate allergens, enforce provider limits and restrictions, confirm pickup windows and roles, handle cancellations and audit trails, and comply with privacy requirements.

## Reset demo

Click **Demo account ▾** in the top bar to reset all local demo data and return to welcome, or clear your browser's site storage.
