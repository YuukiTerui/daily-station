export interface IndoorEnvironmentData {
  temperature: number; // °C
  humidity: number; // %
  comfortStatus: 'comfortable' | 'warm' | 'cold' | 'dry' | 'humid';
  comfortLabel: string;
  comfortEmoji: string; // 😊, 😐, 🥶, 🥵
  comfortColor: string; // Tailwind class
  batteryLevel?: number; // % (SwitchBot meter mock)
}

export function useIndoorEnvironment(): IndoorEnvironmentData {
  // Phase 1: Realistic mock data
  const temperature = 22.8;
  const humidity = 48;

  let comfortStatus: IndoorEnvironmentData['comfortStatus'] = 'comfortable';
  let comfortLabel = '快適';
  let comfortEmoji = '😊';
  let comfortColor = 'text-emerald-500 bg-emerald-50 border-emerald-200';

  if (temperature > 26) {
    comfortStatus = 'warm';
    comfortLabel = 'やや暑い';
    comfortEmoji = '🥵';
    comfortColor = 'text-amber-500 bg-amber-50 border-amber-200';
  } else if (temperature < 18) {
    comfortStatus = 'cold';
    comfortLabel = 'やや寒い';
    comfortEmoji = '🥶';
    comfortColor = 'text-blue-500 bg-blue-50 border-blue-200';
  } else if (humidity < 40) {
    comfortStatus = 'dry';
    comfortLabel = '乾燥気味';
    comfortEmoji = '😐';
    comfortColor = 'text-orange-500 bg-orange-50 border-orange-200';
  } else if (humidity > 65) {
    comfortStatus = 'humid';
    comfortLabel = '多湿';
    comfortEmoji = '😐';
    comfortColor = 'text-sky-500 bg-sky-50 border-sky-200';
  }

  return {
    temperature,
    humidity,
    comfortStatus,
    comfortLabel,
    comfortEmoji,
    comfortColor,
    batteryLevel: 92,
  };
}
