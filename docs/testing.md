# Testing

## Running Tests

```bash
npm test        # Run once
npm test:watch  # Watch mode
```

## Test Structure

```
tests/
├── global-setup.ts    # MongoDB in-memory server (or CI service container)
├── setup.ts           # Mocks, env, beforeEach
├── helpers.ts         # Seed functions, actAs, makeUser, etc.
├── safe-redirect.test.ts
├── permissions.test.ts
├── tenant-isolation.test.ts
└── metadata.test.ts
```

## Mocks Explained

| Module | Why |
|--------|-----|
| `next/cache` | `revalidatePath`/`revalidateTag` called in actions — no-op in tests |
| `next/navigation` | `redirect`, `notFound`, `unstable_rethrow` throw special errors to simulate Next control flow |
| `react.cache` | Server Components' `cache()` is a no-op outside RSC |
| `@/lib/auth` | `auth()` mocked via `vi.mock`, `actAs(user)` sets resolved value |
| `@/lib/cloudinary` | File uploads don't hit real Cloudinary |

## Database

- **Not mocked**: Real MongoDB via `mongodb-memory-server` (local) or `mongo:7` service container (CI)
- Each test file shares one DB; `resetDb()` clears all collections in `beforeEach`
- `process.env.MONGODB_URI` always points to test DB (overrides `.env.local`)
- Safety check: test refuses to run if DB name lacks "test"

## TEST_MONGODB_URI

- **Local**: Not set → `mongodb-memory-server` starts automatically
- **CI**: Set to `mongodb://127.0.0.1:27017/clarix_test` (mongo:7 service container)
- Overriding: Set `TEST_MONGODB_URI` env var to use external MongoDB

## Adding a New Test

1. Create `tests/feature.test.ts`
2. Import helpers: `actAs`, `makeUser`, `makeWorkspace`, `makeProject`, `makeTask`, `resetDb`
3. Use `seed()` pattern in `beforeEach` to create test data
3. Use `actAs(user)` / `actAs(null)` to simulate auth state
4. Call server actions directly: `await createTask(...)`, `await updateTask(...)`, etc.
4. Assert with `expect(result.success).toBe(true)` or `expect(result).toEqual({...})`

## Running Tests Locally

```bash
npm install -D vitest mongodb-memory-server --legacy-peer-deps
npm test
```

First run downloads MongoDB binary (~100 MB). Subsequent runs are fast.

## CI

`.github/workflows/ci.yml`:
- Uses `mongo:7` service container (fast, no download)
- Runs `npm test` with `TEST_MONGODB_URI` pointing to service container
- Runs `npm run build` with dummy env vars