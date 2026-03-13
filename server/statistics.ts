import { getDb } from './db';
import { users, trainingConfirmations, trainingSessions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface AttendanceStats {
  totalTrainings: number;
  confirmedTrainings: number;
  cancelledTrainings: number;
  attendanceRate: number;
  recentTrend: number;
}

export interface PlayerStats {
  userId: number;
  userName: string;
  gender: string;
  totalConfirmed: number;
  totalCancelled: number;
  attendanceRate: number;
  lastConfirmed: string | null;
}

export interface TrainingStats {
  totalTrainings: number;
  averageAttendance: number;
  maleTrainings: number;
  femaleTrainings: number;
  mixedTrainings: number;
  totalPlayers: number;
}

export async function getUserAttendanceStats(userId: number): Promise<AttendanceStats> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');
    const allConfirmations = await db
      .select({
        status: trainingConfirmations.status,
        confirmedAt: trainingConfirmations.confirmedAt,
      })
      .from(trainingConfirmations)
      .where(eq(trainingConfirmations.userId, userId));

    const totalTrainings = allConfirmations.length;
    const confirmedTrainings = allConfirmations.filter((c) => c.status === 'confirmed').length;
    const cancelledTrainings = allConfirmations.filter((c) => c.status === 'cancelled').length;

    const attendanceRate = totalTrainings > 0 ? (confirmedTrainings / totalTrainings) * 100 : 0;

    // Calculate recent trend (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const recentConfirmations = allConfirmations.filter(
      (c: any) => c.confirmedAt && new Date(c.confirmedAt as any) > fourWeeksAgo && c.status === 'confirmed'
    );

    const recentTrend =
      recentConfirmations.length > 0 ? (recentConfirmations.length / 4) * 100 : 0;

    return {
      totalTrainings,
      confirmedTrainings,
      cancelledTrainings,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      recentTrend: Math.round(recentTrend * 100) / 100,
    };
  } catch (error) {
    console.error('[Statistics] Error getting user attendance stats:', error);
    throw error;
  }
}

export async function getTeamPlayerStats(teamId: number): Promise<PlayerStats[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');
    const teamUsers = await db
      .select()
      .from(users)
      .where(eq(users.teamId, teamId));

    const playerStats: PlayerStats[] = [];

    for (const user of teamUsers) {
      const confirmations = await db
        .select()
        .from(trainingConfirmations)
        .where(eq(trainingConfirmations.userId, user.id));

      const confirmed = confirmations.filter((c: any) => c.status === 'confirmed').length;
      const cancelled = confirmations.filter((c: any) => c.status === 'cancelled').length;
      const total = confirmed + cancelled;

      const attendanceRate = total > 0 ? (confirmed / total) * 100 : 0;

      const lastConfirmed = confirmations
        .filter((c: any) => c.status === 'confirmed')
        .sort((a: any, b: any) => new Date(b.confirmedAt!).getTime() - new Date(a.confirmedAt!).getTime())[0]
        ?.confirmedAt?.toISOString() || null;

      playerStats.push({
        userId: user.id,
        userName: (user.email || 'User').split('@')[0],
        gender: user.gender || 'unknown',
        totalConfirmed: confirmed,
        totalCancelled: cancelled,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        lastConfirmed,
      });
    }

    return playerStats.sort((a, b) => b.attendanceRate - a.attendanceRate);
  } catch (error) {
    console.error('[Statistics] Error getting team player stats:', error);
    throw error;
  }
}

export async function getTeamTrainingStats(teamId: number): Promise<TrainingStats> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');
    const sessions = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.teamId, teamId));

    const totalTrainings = sessions.length;
    const maleTrainings = sessions.filter((s: any) => s.gender === 'male').length;
    const femaleTrainings = sessions.filter((s: any) => s.gender === 'female').length;
    const mixedTrainings = sessions.filter((s: any) => s.gender === 'mixed').length;

    let totalAttendance = 0;
    let totalCount = 0;

    for (const session of sessions) {
      const confirmations = await db
        .select()
        .from(trainingConfirmations)
        .where(eq(trainingConfirmations.trainingSessionId, session.id));

      const confirmed = confirmations.filter((c: any) => c.status === 'confirmed').length;
      totalAttendance += confirmed;
      totalCount += confirmations.length;
    }

    const averageAttendance =
      totalCount > 0 ? Math.round((totalAttendance / totalCount) * 100) / 100 : 0;

    const teamUsers = await db
      .select()
      .from(users)
      .where(eq(users.teamId, teamId));

    return {
      totalTrainings,
      averageAttendance,
      maleTrainings,
      femaleTrainings,
      mixedTrainings,
      totalPlayers: teamUsers.length,
    };
  } catch (error) {
    console.error('[Statistics] Error getting team training stats:', error);
    throw error;
  }
}

export async function getAttendanceTrend(
  userId: number,
  weeks: number = 12
): Promise<Array<{ week: number; confirmed: number; cancelled: number }>> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');
    const confirmations = await db
      .select()
      .from(trainingConfirmations)
      .where(eq(trainingConfirmations.userId, userId));

    const trend: Array<{ week: number; confirmed: number; cancelled: number }> = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weeks - i) * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekConfirmations = confirmations.filter((c: any) => {
        const date = new Date(c.confirmedAt!);
        return date >= weekStart && date < weekEnd;
      });

      trend.push({
        week: i + 1,
        confirmed: weekConfirmations.filter((c: any) => c.status === 'confirmed').length,
        cancelled: weekConfirmations.filter((c: any) => c.status === 'cancelled').length,
      });
    }

    return trend;
  } catch (error) {
    console.error('[Statistics] Error getting attendance trend:', error);
    throw error;
  }
}
