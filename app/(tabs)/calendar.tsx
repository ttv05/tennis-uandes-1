import { useState } from "react";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

export default function CalendarScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [weekNumber, setWeekNumber] = useState(getCurrentWeek());
  const [year, setYear] = useState(new Date().getFullYear());

  const availabilityQuery = trpc.availability.getWeekly.useQuery(
    { weekNumber, year },
    { enabled: !!user }
  );

  const handlePreviousWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (weekNumber > 1) {
      setWeekNumber(weekNumber - 1);
    } else {
      setWeekNumber(52);
      setYear(year - 1);
    }
  };

  const handleNextWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (weekNumber < 52) {
      setWeekNumber(weekNumber + 1);
    } else {
      setWeekNumber(1);
      setYear(year + 1);
    }
  };

  const getAvailabilityForSlot = (dayOfWeek: number, hour: number) => {
    if (!availabilityQuery.data) return null;

    const startTime = `${String(hour).padStart(2, "0")}:00`;
    const endTime = `${String(hour + 1).padStart(2, "0")}:00`;

    return availabilityQuery.data.find(
      (block) =>
        block.dayOfWeek === dayOfWeek &&
        block.startTime <= startTime &&
        block.endTime >= endTime &&
        block.isAvailable
    );
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Tu Disponibilidad</Text>
            <Text className="text-sm text-muted">Semana {weekNumber}</Text>
          </View>

          {/* Week Navigation */}
          <View className="flex-row justify-between items-center gap-2">
            <Pressable
              onPress={handlePreviousWeek}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className="font-semibold text-foreground">← Anterior</Text>
            </Pressable>

            <Text className="text-sm font-semibold text-muted">
              Semana {weekNumber} de {year}
            </Text>

            <Pressable
              onPress={handleNextWeek}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text className="font-semibold text-foreground">Siguiente →</Text>
            </Pressable>
          </View>

          {/* Calendar Grid */}
          {availabilityQuery.isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-muted mt-2">Cargando disponibilidad...</Text>
            </View>
          ) : (
            <View className="bg-surface rounded-2xl overflow-hidden border border-border">
              {/* Time Header */}
              <View className="flex-row bg-background border-b border-border">
                <View className="w-12 h-12 justify-center items-center border-r border-border">
                  <Text className="text-xs font-bold text-muted">Hora</Text>
                </View>
                {DAYS.map((day, idx) => (
                  <View
                    key={idx}
                    className="flex-1 h-12 justify-center items-center border-r border-border"
                  >
                    <Text className="text-xs font-bold text-foreground text-center">{day.slice(0, 3)}</Text>
                  </View>
                ))}
              </View>

              {/* Time Slots */}
              {HOURS.map((hour) => (
                <View key={hour} className="flex-row border-b border-border">
                  <View className="w-12 h-12 justify-center items-center border-r border-border bg-background">
                    <Text className="text-xs font-semibold text-muted">{hour}:00</Text>
                  </View>
                  {DAYS.map((_, dayIdx) => {
                    const availability = getAvailabilityForSlot(dayIdx, hour);
                    return (
                      <View
                        key={`${dayIdx}-${hour}`}
                        className="flex-1 h-12 border-r border-border justify-center items-center"
                        style={{
                          backgroundColor: availability ? colors.success : colors.background,
                        }}
                      >
                        {availability && <Text className="text-xs text-background">✓</Text>}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {/* Legend */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Leyenda:</Text>
            <View className="flex-row gap-3">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors.success }}
                />
                <Text className="text-sm text-muted">Disponible</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: colors.background }}
                />
                <Text className="text-sm text-muted">Ocupado</Text>
              </View>
            </View>
          </View>
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
