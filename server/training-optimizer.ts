import * as db from "./db";

export interface TrainingSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  availableCount: number;
  availablePlayerIds: number[];
  gender: "male" | "female" | "mixed";
  score: number; // Higher is better
}

/**
 * Optimize training schedule based on team availability
 * Returns ranked list of best training times
 */
export async function optimizeTeamSchedule(
  teamId: number,
  weekNumber: number,
  year: number,
  minDuration: number = 60 // minutes
): Promise<TrainingSlot[]> {
  try {
    // Get all team members
    const teamMembers = await db.getTeamMembers(teamId);
    if (teamMembers.length === 0) {
      return [];
    }

    // Separate by gender
    const maleMembers = teamMembers.filter((m) => m.gender === "male");
    const femaleMembers = teamMembers.filter((m) => m.gender === "female");

    // Get availability for all members
    const availabilityMap = new Map<number, any[]>();
    for (const member of teamMembers) {
      const availability = await db.getUserAvailability(member.id, weekNumber, year);
      availabilityMap.set(member.id, availability);
    }

    // Generate candidate time slots (hourly from 8:00 to 20:00)
    const candidates: TrainingSlot[] = [];

    for (let day = 0; day < 5; day++) {
      // Mon-Fri
      for (let hour = 8; hour < 20; hour++) {
        const startTime = `${String(hour).padStart(2, "0")}:00`;
        const endTime = `${String(hour + 1).padStart(2, "0")}:00`;

        // Check who's available at this time
        const availableMales = maleMembers.filter((member) => {
          const blocks = availabilityMap.get(member.id) || [];
          return blocks.some(
            (b) =>
              b.dayOfWeek === day &&
              b.isAvailable &&
              b.startTime <= startTime &&
              b.endTime >= endTime
          );
        });

        const availableFemales = femaleMembers.filter((member) => {
          const blocks = availabilityMap.get(member.id) || [];
          return blocks.some(
            (b) =>
              b.dayOfWeek === day &&
              b.isAvailable &&
              b.startTime <= startTime &&
              b.endTime >= endTime
          );
        });

        // Only suggest if at least 2 people available
        if (availableMales.length >= 2) {
          candidates.push({
            dayOfWeek: day,
            startTime,
            endTime,
            availableCount: availableMales.length,
            availablePlayerIds: availableMales.map((m) => m.id),
            gender: "male",
            score: calculateScore(availableMales.length, maleMembers.length),
          });
        }

        if (availableFemales.length >= 2) {
          candidates.push({
            dayOfWeek: day,
            startTime,
            endTime,
            availableCount: availableFemales.length,
            availablePlayerIds: availableFemales.map((m) => m.id),
            gender: "female",
            score: calculateScore(availableFemales.length, femaleMembers.length),
          });
        }

        // Mixed training if we have both genders
        if (availableMales.length >= 1 && availableFemales.length >= 1) {
          candidates.push({
            dayOfWeek: day,
            startTime,
            endTime,
            availableCount: availableMales.length + availableFemales.length,
            availablePlayerIds: [...availableMales.map((m) => m.id), ...availableFemales.map((m) => m.id)],
            gender: "mixed",
            score: calculateScore(
              availableMales.length + availableFemales.length,
              teamMembers.length
            ),
          });
        }
      }
    }

    // Sort by score (descending)
    candidates.sort((a, b) => b.score - a.score);

    // Return top 10 suggestions
    return candidates.slice(0, 10);
  } catch (error) {
    console.error("[TrainingOptimizer] Error optimizing schedule:", error);
    throw error;
  }
}

/**
 * Calculate score for a training slot
 * Higher score = better slot
 */
function calculateScore(availableCount: number, totalCount: number): number {
  // Percentage of team available
  const percentageAvailable = availableCount / totalCount;

  // Bonus for having more people
  const countBonus = Math.min(availableCount / 10, 1); // Max bonus at 10 people

  // Combine scores
  return percentageAvailable * 100 + countBonus * 20;
}

/**
 * Create training sessions from optimized slots
 */
export async function createTrainingSessionsFromOptimization(
  teamId: number,
  slots: TrainingSlot[],
  weekNumber: number,
  year: number
): Promise<number[]> {
  const sessionIds: number[] = [];

  for (const slot of slots) {
    try {
      const sessionId = await db.createTrainingSession({
        teamId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        gender: slot.gender,
        availablePlayerCount: slot.availableCount,
        weekNumber,
        year,
      });

      sessionIds.push(sessionId);
    } catch (error) {
      console.error("[TrainingOptimizer] Error creating session:", error);
    }
  }

  return sessionIds;
}
