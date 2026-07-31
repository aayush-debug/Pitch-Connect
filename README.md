# Pitch Perfect Connect

Build a two-sided web app called LetsPitch, using Supabase for the database and authentication.

There are two user types: Founders and Investors. On signup, ask the user to pick which type they are, and route them to a different onboarding flow depending on the choice.

Create these Supabase tables:

- founders (id, user_id, name, created_at)

- startups (id, founder_id, name, one_liner, sector, stage, ask_amount, deck_url, video_url, created_at)

- investors (id, user_id, name, created_at)

- investor_preferences (id, investor_id, sectors[], stages[], min_ticket, max_ticket)

- matches (id, startup_id, investor_id, status, created_at) -- status is one of: pending, matched, passed

Founder onboarding: after signup, let them create a startup profile with name, one-liner, sector, stage, and ask amount (skip file uploads for now, we'll add those next).

Investor onboarding: after signup, let them set their preferences (sectors, stages, ticket size range).

Use Supabase Auth for login/signup (email + password is fine for now).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cce76e23-af9b-4614-8315-4bd8ebcbf072).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
