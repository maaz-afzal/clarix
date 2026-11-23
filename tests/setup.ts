import { beforeEach, inject, vi } from "vitest";

const uri = inject("mongoUri");

// Safety: tests collections khaali kar dete hain, kabhi asli database par nahi chalne chahiye
const dbName = new URL(uri).pathname.replace("/", "");
if (!dbName.includes("test")) {
  throw new Error(`Refusing to run tests against database "${dbName}"`);
}

process.env.MONGODB_URI = uri;
process.env.AUTH_SECRET = "test-secret";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  // Sirf Next ke apne control-flow errors dobara fenko
  unstable_rethrow: (error: unknown) => {
    if (error instanceof Error && error.message.startsWith("NEXT_")) throw error;
  },
}));

// Server Components ke bahar React.cache ki zaroorat nahi: seedha function chalao
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  cache: <T>(fn: T) => fn,
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@/lib/cloudinary", () => ({
  default: {},
  uploadFile: vi.fn(),
  deleteFile: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
});