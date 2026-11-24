import { beforeEach, describe, expect, it, vi } from "vitest";

vi.unmock("@/lib/cloudinary");
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      destroy: vi.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

import { v2 as cloudinary } from "cloudinary";
import { deleteFile } from "@/lib/cloudinary";

describe("deleteFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("raw file (PDF/DOCX) ko raw resource_type se delete karta hai", async () => {
    await deleteFile("clarix/ws/tasks/report", "raw");
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      "clarix/ws/tasks/report",
      { resource_type: "raw" },
    );
  });

  it("image attachment ko image resource_type se delete karta hai", async () => {
    await deleteFile("clarix/ws/tasks/photo", "image");
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      "clarix/ws/tasks/photo",
      { resource_type: "image" },
    );
  });

  it("purana attachment jisme resourceType save hi nahi hua, image maan ke delete karta hai", async () => {
    await deleteFile("clarix/ws/tasks/old-file");
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      "clarix/ws/tasks/old-file",
      { resource_type: "image" },
    );
  });
});
