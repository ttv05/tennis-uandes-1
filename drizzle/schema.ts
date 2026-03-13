import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  gender: mysqlEnum("gender", ["male", "female"]),
  role: mysqlEnum("role", ["user", "admin", "captain"]).default("user").notNull(),
  teamId: int("teamId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Teams table
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  captainId: int("captainId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// Availability table (time blocks when users are free)
export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0=Monday, 4=Friday
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 5 }).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  source: mysqlEnum("source", ["manual", "ocr", "calendar_sync"]).default("manual").notNull(),
  weekNumber: int("weekNumber").notNull(), // ISO week number
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Availability = typeof availability.$inferSelect;
export type InsertAvailability = typeof availability.$inferInsert;

// Calendar uploads (track OCR history)
export const calendarUploads = mysqlTable("calendar_uploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  imageUrl: text("imageUrl").notNull(), // S3 URL
  ocrResult: json("ocrResult"), // Parsed OCR data
  weekNumber: int("weekNumber").notNull(),
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarUpload = typeof calendarUploads.$inferSelect;
export type InsertCalendarUpload = typeof calendarUploads.$inferInsert;

// Training sessions (suggested or approved trainings)
export const trainingSessions = mysqlTable("training_sessions", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
  gender: mysqlEnum("gender", ["male", "female", "mixed"]).notNull(),
  status: mysqlEnum("status", ["suggested", "approved", "cancelled"]).default("suggested").notNull(),
  availablePlayerCount: int("availablePlayerCount").notNull(),
  approvedBy: int("approvedBy"), // Captain ID
  weekNumber: int("weekNumber").notNull(),
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;

// Training confirmations (user attendance)
export const trainingConfirmations = mysqlTable("training_confirmations", {
  id: int("id").autoincrement().primaryKey(),
  trainingSessionId: int("trainingSessionId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["confirmed", "cancelled", "pending"]).default("pending").notNull(),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingConfirmation = typeof trainingConfirmations.$inferSelect;
export type InsertTrainingConfirmation = typeof trainingConfirmations.$inferInsert;
