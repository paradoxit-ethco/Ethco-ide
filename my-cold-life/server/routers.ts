import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createPlant, deletePlant, listPlants, updatePasswordPlaceholder, updatePlant, updateUserName } from "./db";
import { z } from "zod";

const plantInput = z.object({
  slug: z.string().min(2).max(120),
  name: z.string().min(2).max(160),
  nameAm: z.string().min(2).max(160),
  description: z.string().min(2),
  descriptionAm: z.string().min(2),
  imageUrl: z.string().url(),
  height: z.string().min(1).max(40),
  care: z.enum(["Easy", "Moderate"]),
  featured: z.boolean().default(false),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  plants: router({
    list: publicProcedure.query(() => listPlants()),
    create: adminProcedure.input(plantInput).mutation(({ input }) => createPlant(input)),
    update: adminProcedure.input(plantInput.partial().extend({ id: z.number().int().positive() })).mutation(({ input }) => {
      const { id, ...values } = input;
      return updatePlant(id, values);
    }),
    remove: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => deletePlant(input.id)),
  }),
  profile: router({
    updateName: protectedProcedure.input(z.object({ name: z.string().min(2).max(120) })).mutation(({ ctx, input }) => updateUserName(ctx.user.openId, input.name)),
    setPasswordPlaceholder: protectedProcedure.input(z.object({ passwordPlaceholder: z.string().min(1).max(240) })).mutation(({ ctx, input }) => updatePasswordPlaceholder(ctx.user.openId, input.passwordPlaceholder)),
    passwordStatus: protectedProcedure.query(() => ({ managedBy: "Manus OAuth", canSetPasswordHere: false } as const)),
  }),
});

export type AppRouter = typeof appRouter;
