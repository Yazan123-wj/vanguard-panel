# Vanguard Panel

Admin CMS UI for Vanguard (`/admin` in the Next.js app).

This repository contains the panel source extracted from the main frontend:

- `src/app/admin` — routes (login, dashboard, projects, services, blogs, settings)
- `src/components/admin` — forms, shell, UI
- `src/styles/admin.css` — panel styles
- `src/lib/admin-api.ts` — Django API client

## Run it
The panel is served by the frontend app:

1. Clone and run [vanguard-Front](https://github.com/Yazan123-wj/vanguard-Front)
2. Run [vanguard-back](https://github.com/Yazan123-wj/vanguard-back) on `:8001`
3. Open `http://localhost:3000/admin`

Keep this repo in sync when panel UI changes.
