import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { processCalendarImage, convertOCRBlocksToAvailability } from "./ocr-processor";
import * as stats from "./statistics";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    setGender: protectedProcedure
      .input(z.object({ gender: z.enum(["male", "female"]) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserGender(ctx.user.id, input.gender);
        return { success: true };
      }),
  }),

  availability: router({
    getWeekly: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getUserAvailability(ctx.user.id, input.weekNumber, input.year);
      }),
    save: protectedProcedure
      .input(
        z.object({
          weekNumber: z.number(),
          year: z.number(),
          blocks: z.array(
            z.object({
              dayOfWeek: z.number(),
              startTime: z.string(),
              endTime: z.string(),
              isAvailable: z.boolean(),
              source: z.enum(["manual", "ocr", "calendar_sync"]),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.deleteUserAvailability(ctx.user.id, input.weekNumber, input.year);
        for (const block of input.blocks) {
          await db.saveAvailability({
            userId: ctx.user.id,
            dayOfWeek: block.dayOfWeek,
            startTime: block.startTime,
            endTime: block.endTime,
            isAvailable: block.isAvailable,
            source: block.source,
            weekNumber: input.weekNumber,
            year: input.year,
          });
        }
        return { success: true, blocksSaved: input.blocks.length };
      }),
  }),
  trainingSessions: router({
    getSuggested: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user?.teamId) return [];
        return db.getTeamTrainingSessions(user.teamId, input.weekNumber, input.year);
      }),
    create: protectedProcedure
      .input(
        z.object({
          teamId: z.number(),
          dayOfWeek: z.number(),
          startTime: z.string(),
          endTime: z.string(),
          gender: z.enum(["male", "female", "mixed"]),
          availablePlayerCount: z.number(),
          weekNumber: z.number(),
          year: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const sessionId = await db.createTrainingSession(input);
        return { sessionId, success: true };
      }),
    approve: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (user?.role !== "captain") throw new Error("Only captains can approve trainings");
        await db.approveTrainingSession(input.sessionId, ctx.user.id);
        return { success: true };
      }),
    reject: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateTrainingSessionStatus(input.sessionId, "cancelled");
        return { success: true };
      }),
  }),
  optimization: router({
    getSuggestions: protectedProcedure
      .input(z.object({ weekNumber: z.number(), year: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user?.teamId) return [];
        // Import here to avoid circular deps
        const { optimizeTeamSchedule } = await import("./training-optimizer");
        return optimizeTeamSchedule(user.teamId, input.weekNumber, input.year);
      }),
    generateSessions: protectedProcedure
      .input(
        z.object({
          weekNumber: z.number(),
          year: z.number(),
          count: z.number().default(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (user?.role !== "captain") throw new Error("Only captains can generate sessions");
        if (!user?.teamId) throw new Error("User not in a team");
        const { optimizeTeamSchedule, createTrainingSessionsFromOptimization } = await import(
          "./training-optimizer"
        );
        const slots = await optimizeTeamSchedule(user.teamId, input.weekNumber, input.year);
        const topSlots = slots.slice(0, input.count);
        const sessionIds = await createTrainingSessionsFromOptimization(
          user.teamId,
          topSlots,
          input.weekNumber,
          input.year
        );
        return { sessionIds, count: sessionIds.length };
      }),
  }),
  calendar: router({
    processOCR: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          weekNumber: z.number(),
          year: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const ocrResult = await processCalendarImage(input.imageUrl);
        const uploadId = await db.saveCalendarUpload({
          userId: ctx.user.id,
          imageUrl: input.imageUrl,
          weekNumber: input.weekNumber,
          year: input.year,
          ocrResult: ocrResult,
        });
        const availabilityBlocks = convertOCRBlocksToAvailability(
          ocrResult.blocks,
          input.weekNumber,
          input.year
        );
        return {
          uploadId,
          blocks: availabilityBlocks,
          confidence: ocrResult.confidence,
          message: "Calendar processed successfully. Please review and confirm your availability.",
        };
      }),
  }),
  statistics: router({
    getUserStats: protectedProcedure.query(async ({ ctx }) => {
      return stats.getUserAttendanceStats(ctx.user.id);
    }),
    getTeamPlayerStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.teamId) {
        return [];
      }
      return stats.getTeamPlayerStats(ctx.user.teamId);
    }),
    getTeamTrainingStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.teamId) {
        return {
          totalTrainings: 0,
          averageAttendance: 0,
          maleTrainings: 0,
          femaleTrainings: 0,
          mixedTrainings: 0,
          totalPlayers: 0,
        };
      }
      return stats.getTeamTrainingStats(ctx.user.teamId);
    }),
    getAttendanceTrend: protectedProcedure
      .input(z.object({ weeks: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return stats.getAttendanceTrend(ctx.user.id, input.weeks || 12);
      }),
  }),
  confirmations: router({
    confirm: protectedProcedure
      .input(z.object({ trainingSessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getUserTrainingConfirmation(input.trainingSessionId, ctx.user.id);
        if (existing) {
          await db.updateTrainingConfirmationStatus(existing.id, "confirmed");
        } else {
          await db.confirmTrainingAttendance({
            trainingSessionId: input.trainingSessionId,
            userId: ctx.user.id,
            status: "confirmed",
            confirmedAt: new Date(),
          });
        }
        return { success: true };
      }),
    cancel: protectedProcedure
      .input(z.object({ trainingSessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const confirmation = await db.getUserTrainingConfirmation(input.trainingSessionId, ctx.user.id);
        if (confirmation) {
          await db.updateTrainingConfirmationStatus(confirmation.id, "cancelled");
        }
        return { success: true };
      }),
    getForTraining: protectedProcedure
      .input(z.object({ trainingSessionId: z.number() }))
      .query(async ({ input }) => {
        return db.getTrainingConfirmations(input.trainingSessionId);
      }),
  })
});

export type AppRouter = typeof appRouter;
