import { useEffect, useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { PWAInstallBanner } from "@/components/pwa-install-banner";
import { useAuth } from "@/hooks/use-auth";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

interface TrainingSession {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  gender: "male" | "female" | "mixed";
  status: "suggested" | "approved" | "cancelled";
  availablePlayerCount: number;
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, loading: authLoading } = useAuth();
  const [weekNumber, setWeekNumber] = useState(getCurrentWeek());
  const [year, setYear] = useState(new Date().getFullYear());

  const suggestedTrainingsQuery = trpc.trainingSessions.getSuggested.useQuery(
    { weekNumber, year },
    { enabled: !!user }
  );

  const confirmMutation = trpc.confirmations.confirm.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      suggestedTrainingsQuery.refetch();
    },
  });

  const cancelMutation = trpc.confirmations.cancel.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      suggestedTrainingsQuery.refetch();
    },
  });

  useEffect(() => {
    if (authLoading || !user) return;
    if (!user.gender) {
      router.replace("/gender-selection");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
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

  const handleConfirmAttendance = (trainingId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    confirmMutation.mutate({ trainingSessionId: trainingId });
  };

  const handleCancelAttendance = (trainingId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    cancelMutation.mutate({ trainingSessionId: trainingId });
  };

  const getGenderEmoji = (gender: string) => {
    return gender === "male" ? "👨" : gender === "female" ? "👩" : "👥";
  };

  const getDayName = (dayOfWeek: number) => {
    return DAYS[dayOfWeek] || "Día";
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <ScreenContainer className="p-0">
      <PWAInstallBanner />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Próximos Entrenamientos</Text>
            <Text className="text-sm text-muted">Semana {weekNumber}</Text>
          </View>

          {/* Upload Calendar Banner */}
          <Pressable
            onPress={() => router.push("/(tabs)/calendar")}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View className="gap-2">
                <Text className="text-base font-semibold text-background">📅 Sube tu horario de clases</Text>
                <Text className="text-xs text-background opacity-90">
                  Ayuda a optimizar los entrenamientos del equipo
                </Text>
              </View>
            </Pressable>

          {/* Training Sessions List */}
          {suggestedTrainingsQuery.isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-2">Cargando entrenamientos...</Text>
            </View>
          ) : suggestedTrainingsQuery.data && suggestedTrainingsQuery.data.length > 0 ? (
            <View className="gap-3">
              {suggestedTrainingsQuery.data.map((training: TrainingSession) => (
                <Pressable
                  key={training.id}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.surface,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 16,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View className="gap-3">
                    {/* Time and Gender */}
                    <View className="flex-row justify-between items-start">
                      <View className="gap-1">
                        <Text className="text-lg font-bold text-foreground">
                          {getDayName(training.dayOfWeek)} {formatTime(training.startTime)}
                        </Text>
                        <Text className="text-xs text-muted">
                          Duración: {calculateDuration(training.startTime, training.endTime)} min
                        </Text>
                      </View>
                      <Text className="text-2xl">{getGenderEmoji(training.gender)}</Text>
                    </View>

                    {/* Player Count */}
                    <View className="bg-background rounded-lg px-3 py-2 self-start">
                      <Text className="text-sm font-semibold text-foreground">
                        👥 {training.availablePlayerCount} jugadores disponibles
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2 pt-2">
                      <Pressable
                        onPress={() => handleConfirmAttendance(training.id)}
                        disabled={confirmMutation.isPending}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            backgroundColor: colors.success,
                            borderRadius: 8,
                            paddingVertical: 10,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text className="text-center font-semibold text-background text-sm">
                          {confirmMutation.isPending ? "..." : "✓ Confirmar"}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleCancelAttendance(training.id)}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            backgroundColor: colors.error,
                            borderRadius: 8,
                            paddingVertical: 10,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text className="text-center font-semibold text-background text-sm">✕ Cancelar</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="items-center justify-center py-12 gap-3">
              <Text className="text-5xl">📭</Text>
              <Text className="text-lg font-semibold text-foreground">Sin entrenamientos sugeridos</Text>
              <Text className="text-sm text-muted text-center">
                Sube tu horario para que podamos optimizar los entrenamientos
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.floor(diff / oneWeek) + 1;
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}
