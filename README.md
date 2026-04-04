# Vivago Digital OS

Next.js 15 starter with TypeScript, shadcn/ui primitives, Tailwind CSS, and Prisma configured for MySQL.

## Getting started

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.

## Included setup

- App Router with a polished landing page in `src/app/page.tsx`
- shadcn-compatible UI primitives in `src/components/ui`
- Prisma client helper in `src/lib/prisma.ts`
- MySQL schema in `prisma/schema.prisma`

## Useful commands

- `npm run build`
- `npm run lint`
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:studio`