import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  teams,
  availability,
  calendarUploads,
  trainingSessions,
  trainingConfirmations,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * User Management (Tenis Uandes)
 */

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] || null;
}

export async function updateUserGender(userId: number, gender: "male" | "female"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ gender }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "captain"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserTeam(userId: number, teamId: number | null): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ teamId }).where(eq(users.id, userId));
}

/**
 * Team Management
 */

export async function createTeam(data: { name: string; description?: string; captainId: number }): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(teams).values(data);
  return (result as any).insertId;
}

export async function getTeamById(teamId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  return result[0] || null;
}

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users).where(eq(users.teamId, teamId));
}

/**
 * Availability Management
 */

export async function saveAvailability(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(availability).values(data);
  return (result as any).insertId;
}

export async function getUserAvailability(userId: number, weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(availability)
    .where(and(eq(availability.userId, userId), eq(availability.weekNumber, weekNumber), eq(availability.year, year)));
}

export async function deleteUserAvailability(userId: number, weekNumber: number, year: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(availability)
    .where(
      and(eq(availability.userId, userId), eq(availability.weekNumber, weekNumber), eq(availability.year, year))
    );
}

/**
 * Calendar Uploads
 */

export async function saveCalendarUpload(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(calendarUploads).values(data);
  return (result as any).insertId;
}

export async function getLatestCalendarUpload(userId: number, weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(calendarUploads)
    .where(
      and(eq(calendarUploads.userId, userId), eq(calendarUploads.weekNumber, weekNumber), eq(calendarUploads.year, year))
    )
    .orderBy(calendarUploads.createdAt)
    .limit(1);

  return result[0] || null;
}

/**
 * Training Sessions
 */

export async function createTrainingSession(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trainingSessions).values(data);
  return (result as any).insertId;
}

export async function getTeamTrainingSessions(teamId: number, weekNumber: number, year: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(trainingSessions)
    .where(
      and(
        eq(trainingSessions.teamId, teamId),
        eq(trainingSessions.weekNumber, weekNumber),
        eq(trainingSessions.year, year)
      )
    );
}

export async function updateTrainingSessionStatus(sessionId: number, status: "suggested" | "approved" | "cancelled"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(trainingSessions).set({ status }).where(eq(trainingSessions.id, sessionId));
}

export async function approveTrainingSession(sessionId: number, captainId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(trainingSessions)
    .set({ status: "approved", approvedBy: captainId })
    .where(eq(trainingSessions.id, sessionId));
}

/**
 * Training Confirmations
 */

export async function confirmTrainingAttendance(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(trainingConfirmations).values(data);
  return (result as any).insertId;
}

export async function getTrainingConfirmations(trainingSessionId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(trainingConfirmations)
    .where(eq(trainingConfirmations.trainingSessionId, trainingSessionId));
}

export async function getUserTrainingConfirmation(trainingSessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(trainingConfirmations)
    .where(
      and(eq(trainingConfirmations.trainingSessionId, trainingSessionId), eq(trainingConfirmations.userId, userId))
    )
    .limit(1);

  return result[0] || null;
}

export async function updateTrainingConfirmationStatus(confirmationId: number, status: "confirmed" | "cancelled" | "pending"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(trainingConfirmations)
    .set({ status, confirmedAt: status === "confirmed" ? new Date() : null })
    .where(eq(trainingConfirmations.id, confirmationId));
}

/**
 * Analytics & Helpers
 */

export async function getAvailablePlayersForTimeSlot(
  teamId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  weekNumber: number,
  year: number,
  gender?: "male" | "female"
) {
  const db = await getDb();
  if (!db) return [];

  // Get team members
  const members = await getTeamMembers(teamId);

  // Filter by availability
  const availableMembers = [];

  for (const member of members) {
    if (gender && member.gender !== gender) continue;

    const memberAvailability = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.userId, member.id),
          eq(availability.dayOfWeek, dayOfWeek),
          eq(availability.weekNumber, weekNumber),
          eq(availability.year, year),
          eq(availability.isAvailable, true)
        )
      );

    // Check if any availability block covers the requested time
    const isCovered = memberAvailability.some((block) => {
      return block.startTime <= startTime && block.endTime >= endTime;
    });

    if (isCovered) {
      availableMembers.push(member);
    }
  }

  return availableMembers;
}
