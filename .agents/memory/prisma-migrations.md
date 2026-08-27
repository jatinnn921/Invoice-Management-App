---
name: Prisma migrations
description: Workspace-specific guidance for running Prisma migrations without interactive prompts
---

Use `pnpm --filter @workspace/db exec prisma migrate dev --schema ./prisma/schema.prisma --name <name>` when supplying a migration name. Passing `--name` through a package script with an extra `--` can cause Prisma to ignore the flag and prompt interactively.

**Why:** The package script already contains Prisma's schema flag, and pnpm's argument separator can be forwarded as an extra positional separator that Prisma does not interpret as expected.

**How to apply:** Prefer the package-scoped `exec` form for migrations in this workspace; keep the package script for no-argument convenience only.