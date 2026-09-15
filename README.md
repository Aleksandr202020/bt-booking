# BT Booking

Standalone booking system for BT Automazgātava. Designed to be embedded into the main site later.

## Current architecture

- Nuxt 3 + Nitro
- PostgreSQL
- Secure HttpOnly signed session cookie
- Customer accounts
- Multiple saved vehicles per customer
- Server-side vehicle category and price calculation
- One-hour slots, 09:00–21:00
- 23 and 24 June closed
- Customer upcoming bookings + history
- Customer cancellation
- Admin booking list and status management
- PostgreSQL-backed availability
- Fail-closed database handling: DB outage returns HTTP 503 `DATABASE_UNAVAILABLE`; no fake free slots are generated.

## Prices

- Passenger car: 25 EUR
- Crossover / minivan: 30 EUR
- Commercial / V-Class type: 35 EUR

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set a real PostgreSQL `DATABASE_URL` and a random `SESSION_SECRET` of at least 32 characters.
4. Run `server/schema.sql` once against PostgreSQL.
5. Run `npm install`.
6. Run `npm run dev`.

## Production

Set `DATABASE_URL`, `SESSION_SECRET`, and `ADMIN_EMAIL` in Vercel. Never commit secrets.

To promote a user to admin after registration:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

The admin user must first register normally.

## Important database behavior

The application never interprets a database outage as an empty result. Availability queries fail with `DATABASE_UNAVAILABLE`, booking creation cannot succeed without the database, and the UI does not fall back to locally generated slots when the database cannot be queried.

## Next planned phase

- Admin calendar with blocked individual slots and full days
- Rich customer profile and vehicle editing/removal
- Rebook action from history
- Booking detail page
- Rate limiting for authentication/admin endpoints
- Email/SMS notifications
- Embed/API mode for the main BT Automazgātava website
- Automated tests and CI
