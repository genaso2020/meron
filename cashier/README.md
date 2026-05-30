# Meron Cashier Terminal (Frontend)

## Requirements

- Node.js 18+

## Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Notes

- This project is **frontend-only** for now and uses a **mock API** located in `src/api/mockServer.js`.
- When you’re ready to connect to your main server + MySQL, we’ll replace `createApiClient({ mode: 'mock' })` with a real HTTP client and map the endpoints.
