import type { WeatherData } from '@/types/weather';

export function getDailyAdvice(weather?: WeatherData): { emoji: string; text: string } {
  if (!weather) {
    return {
      emoji: '✨',
      text: '今日も素敵な一日をお過ごしください！',
    };
  }

  const current = weather.current;
  const today = weather.daily[0];
  const hour = new Date().getHours();

  // 1. 深夜・早朝
  if (hour >= 22 || hour < 5) {
    return {
      emoji: '🌙',
      text: '今日もお疲れ様でした。暖かくしてゆっくりお休みください',
    };
  }

  // 2. 雨・雪・降水確率高い
  if (
    current.weatherCode >= 51 || // Drizzle, Rain, Snow, Thunderstorm
    (today && today.precipitationProbability >= 60)
  ) {
    return {
      emoji: '☂️',
      text: '雨の予報です。お出かけの際は折りたたみ傘をお忘れなく！',
    };
  }

  // 3. 寒暖差が大きい (最高気温と最低気温の差が 10℃ 以上)
  if (today && today.tempMax - today.tempMin >= 10) {
    return {
      emoji: '🧣',
      text: `日中と朝晩の寒暖差（${today.tempMax - today.tempMin}℃）にご注意。脱ぎ着しやすい上着が安心です`,
    };
  }

  // 4. 猛暑 / 暑い
  if (current.temperature >= 30 || (today && today.tempMax >= 30)) {
    return {
      emoji: '🥤',
      text: '厳しい暑さになりそうです。こまめな水分補給と熱中症対策を！',
    };
  }

  // 5. 寒い
  if (current.temperature <= 10) {
    return {
      emoji: '🧤',
      text: '冷え込んでいます。首元や手足を暖かくしてお出かけください',
    };
  }

  // 6. UV指数が高い (6以上)
  if (today && today.uvIndexMax >= 6) {
    return {
      emoji: '☀️',
      text: '日差しが強めです。紫外線対策（日傘や日焼け止め）がおすすめです',
    };
  }

  // 7. 空気が乾燥 (湿度40%以下)
  if (current.humidity <= 40) {
    return {
      emoji: '💧',
      text: '空気が乾燥しています。お肌の保湿とこまめな水分補給を心がけましょう',
    };
  }

  // 8. 穏やかな晴れ
  if (current.weatherCode <= 2) {
    return {
      emoji: '☀️',
      text: '気持ちの良い青空が広がります。散歩や換気にぴったりの陽気です',
    };
  }

  return {
    emoji: '🌤️',
    text: '過ごしやすい一日になりそうです。良い一日をお過ごしください！',
  };
}
