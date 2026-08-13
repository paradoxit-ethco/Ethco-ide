import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const baseContext = (): TrpcContext => ({
  user: { id: 1, openId: "test-user", email: "test@example.com", name: "Test User", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), passwordPlaceholder: null },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: { clearCookie: () => undefined } as TrpcContext["res"],
});

describe("plants and profile procedures", () => {
  it("returns the curated fallback collection when no rows are available", async () => {
    const result = await appRouter.createCaller(baseContext()).plants.list();
    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result[0]).toHaveProperty("slug");
    expect(result[0]).toHaveProperty("imageUrl");
  });

  it("rejects profile names that are too short", async () => {
    await expect(appRouter.createCaller(baseContext()).profile.updateName({ name: "A" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("describes password management as OAuth-owned", async () => {
    const result = await appRouter.createCaller(baseContext()).profile.passwordStatus();
    expect(result).toEqual({ managedBy: "Manus OAuth", canSetPasswordHere: false });
  });

  it("validates CRUD inputs before reaching the database", async () => {
    const adminContext = baseContext();
    if (adminContext.user) adminContext.user.role = "admin";
    const caller = appRouter.createCaller(adminContext);
    await expect(caller.plants.create({ slug: "x", name: "x", nameAm: "x", description: "x", descriptionAm: "x", imageUrl: "not-a-url", height: "1m", care: "Easy", featured: false })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.plants.update({ id: 0, name: "No" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.plants.remove({ id: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.profile.setPasswordPlaceholder({ passwordPlaceholder: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
