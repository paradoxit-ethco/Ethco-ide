import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPlant, InsertUser, plants, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { plantSeeds } from "../shared/i18n";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod", "passwordPlaceholder"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = values.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserName(openId: string, name: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ name }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function updatePasswordPlaceholder(openId: string, passwordPlaceholder: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set({ passwordPlaceholder }).where(eq(users.openId, openId));
  return getUserByOpenId(openId);
}

export async function listPlants() {
  const db = await getDb();
  if (!db) return plantSeeds.map((plant, index) => ({ ...plant, id: index + 1 }));
  const rows = await db.select().from(plants).orderBy(desc(plants.featured), desc(plants.createdAt));
  if (rows.length === 0) return plantSeeds.map((plant, index) => ({ ...plant, id: index + 1 }));
  return rows;
}

export async function getPlantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(plants).where(eq(plants.id, id)).limit(1);
  return rows[0];
}

export async function createPlant(input: InsertPlant) {
  const db = await getDb();
  if (!db) return { ...input, id: Date.now() };
  await db.insert(plants).values(input);
  const rows = await db.select().from(plants).where(eq(plants.slug, input.slug)).limit(1);
  return rows[0];
}

export async function updatePlant(id: number, input: Partial<InsertPlant>) {
  const db = await getDb();
  if (!db) return { id, ...input };
  await db.update(plants).set(input).where(eq(plants.id, id));
  return getPlantById(id);
}

export async function deletePlant(id: number) {
  const db = await getDb();
  if (!db) return { id };
  await db.delete(plants).where(eq(plants.id, id));
  return { id };
}
