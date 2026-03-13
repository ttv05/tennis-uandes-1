import { useEffect, useState } from 'react';
import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/use-auth';

interface PlayerStat {
  userId: number;
  userName: string;
  gender: string;
  totalConfirmed: number;
  totalCancelled: number;
  attendanceRate: number;
  lastConfirmed: string | null;
}

interface TeamStats {
  totalTrainings: number;
  averageAttendance: number;
  maleTrainings: number;
  femaleTrainings: number;
  mixedTrainings: number;
  totalPlayers: number;
}

interface UserStats {
  totalTrainings: number;
  confirmedTrainings: number;
  cancelledTrainings: number;
  attendanceRate: number;
  recentTrend: number;
}

export default function StatisticsScreen() {
  const colors = useColors();
  const { user, loading: authLoading } = useAuth();
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const userStatsQuery = trpc.statistics.getUserStats.useQuery(undefined, {
    enabled: !!user,
  });

  const teamPlayerStatsQuery = trpc.statistics.getTeamPlayerStats.useQuery(undefined, {
    enabled: !!user,
  });

  const teamTrainingStatsQuery = trpc.statistics.getTeamTrainingStats.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (userStatsQuery.data) {
      setUserStats(userStatsQuery.data);
    }
  }, [userStatsQuery.data]);

  useEffect(() => {
    if (teamPlayerStatsQuery.data) {
      setPlayerStats(teamPlayerStatsQuery.data);
    }
  }, [teamPlayerStatsQuery.data]);

  useEffect(() => {
    if (teamTrainingStatsQuery.data) {
      setTeamStats(teamTrainingStatsQuery.data);
    }
  }, [teamTrainingStatsQuery.data]);

  useEffect(() => {
    if (!userStatsQuery.isLoading && !teamPlayerStatsQuery.isLoading && !teamTrainingStatsQuery.isLoading) {
      setLoading(false);
    }
  }, [userStatsQuery.isLoading, teamPlayerStatsQuery.isLoading, teamTrainingStatsQuery.isLoading]);

  if (authLoading || loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!user) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">Por favor inicia sesión</Text>
      </ScreenContainer>
    );
  }

  const getGenderLabel = (gender: string) => {
    return gender === 'male' ? '👨 Hombre' : gender === 'female' ? '👩 Mujer' : '👥 Mixto';
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Estadísticas</Text>
            <Text className="text-sm text-muted">Tu desempeño y el del equipo</Text>
          </View>

          {/* Personal Stats */}
          {userStats && (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">Tu Desempeño</Text>

              <View
                className="rounded-2xl p-6 gap-4"
                style={{ backgroundColor: colors.surface }}
              >
                {/* Attendance Rate */}
                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-muted">Tasa de Asistencia</Text>
                    <Text className="text-2xl font-bold text-primary">
                      {userStats.attendanceRate.toFixed(1)}%
                    </Text>
                  </View>
                  <View
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: colors.border }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(userStats.attendanceRate, 100)}%`,
                        backgroundColor: colors.primary,
                      }}
                    />
                  </View>
                </View>

                {/* Stats Grid */}
                <View className="flex-row gap-4">
                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Confirmados</Text>
                    <Text className="text-2xl font-bold text-success">
                      {userStats.confirmedTrainings}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Cancelados</Text>
                    <Text className="text-2xl font-bold text-error">
                      {userStats.cancelledTrainings}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Tendencia</Text>
                    <Text className="text-2xl font-bold text-primary">
                      {userStats.recentTrend.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Team Stats */}
          {teamStats && (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">Estadísticas del Equipo</Text>

              <View
                className="rounded-2xl p-6 gap-4"
                style={{ backgroundColor: colors.surface }}
              >
                {/* Training Distribution */}
                <View className="gap-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm font-semibold text-foreground">
                      Entrenamientos por Género
                    </Text>
                    <Text className="text-sm text-muted">{teamStats.totalTrainings} total</Text>
                  </View>

                  {/* Male Trainings */}
                  <View className="gap-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-foreground">👨 Hombres</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {teamStats.maleTrainings}
                      </Text>
                    </View>
                    <View
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.border }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${
                            teamStats.totalTrainings > 0
                              ? (teamStats.maleTrainings / teamStats.totalTrainings) * 100
                              : 0
                          }%`,
                          backgroundColor: '#3B82F6',
                        }}
                      />
                    </View>
                  </View>

                  {/* Female Trainings */}
                  <View className="gap-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-foreground">👩 Mujeres</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {teamStats.femaleTrainings}
                      </Text>
                    </View>
                    <View
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.border }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${
                            teamStats.totalTrainings > 0
                              ? (teamStats.femaleTrainings / teamStats.totalTrainings) * 100
                              : 0
                          }%`,
                          backgroundColor: '#EC4899',
                        }}
                      />
                    </View>
                  </View>

                  {/* Mixed Trainings */}
                  <View className="gap-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-foreground">👥 Mixtos</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {teamStats.mixedTrainings}
                      </Text>
                    </View>
                    <View
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.border }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${
                            teamStats.totalTrainings > 0
                              ? (teamStats.mixedTrainings / teamStats.totalTrainings) * 100
                              : 0
                          }%`,
                          backgroundColor: '#F59E0B',
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Team Info */}
                <View className="flex-row gap-4 pt-4 border-t" style={{ borderTopColor: colors.border }}>
                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Asistencia Promedio</Text>
                    <Text className="text-2xl font-bold text-primary">
                      {teamStats.averageAttendance.toFixed(1)}%
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Jugadores</Text>
                    <Text className="text-2xl font-bold text-primary">{teamStats.totalPlayers}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Player Rankings */}
          {playerStats.length > 0 && (
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">Ranking de Asistencia</Text>

              <View className="gap-2">
                {playerStats.slice(0, 5).map((player, index) => (
                  <View
                    key={player.userId}
                    className="flex-row items-center gap-3 p-4 rounded-xl"
                    style={{ backgroundColor: colors.surface }}
                  >
                    {/* Rank */}
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="text-sm font-bold text-background">#{index + 1}</Text>
                    </View>

                    {/* Player Info */}
                    <View className="flex-1 gap-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {player.userName}
                      </Text>
                      <Text className="text-xs text-muted">{getGenderLabel(player.gender)}</Text>
                    </View>

                    {/* Attendance Rate */}
                    <View className="items-end gap-1">
                      <Text className="text-lg font-bold text-primary">
                        {player.attendanceRate.toFixed(0)}%
                      </Text>
                      <Text className="text-xs text-muted">
                        {player.totalConfirmed}/{player.totalConfirmed + player.totalCancelled}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {playerStats.length > 5 && (
                <Text className="text-xs text-muted text-center">
                  +{playerStats.length - 5} más
                </Text>
              )}
            </View>
          )}

          {/* Empty State */}
          {playerStats.length === 0 && !teamStats && (
            <View
              className="rounded-2xl p-8 items-center gap-3"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className="text-lg font-semibold text-foreground">Sin datos</Text>
              <Text className="text-sm text-muted text-center">
                Las estadísticas aparecerán cuando haya entrenamientos confirmados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
