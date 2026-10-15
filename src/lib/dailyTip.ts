import type { WeatherData } from '@/types/weather';
import type { IndoorEnvironmentData } from '@/hooks/useIndoorEnvironment';

export interface DailyTip {
  icon: string;
  message: string;
  category: 'weather' | 'clothing' | 'health' | 'night' | 'cheer';
}

/**
 * 気象情報・室内環境・時間帯から、生活に役立つ「今日の一言」を動的に生成します。
 */
export function getDailyTip(
  weather?: WeatherData,
  indoor?: IndoorEnvironmentData,
  date: Date = new Date(),
): DailyTip {
  const hour = date.getHours();
  const current = weather?.current;
  const todayForecast = weather?.daily?.[0];

  // 1. 深夜・早朝 (22:00〜04:59)
  if (hour >= 22 || hour < 5) {
    return {
      icon: '🌙',
      message: '今日もお疲れ様でした。あたたかくしてゆっくりお休みください',
      category: 'night',
    };
  }

  // 2. 雨・雪の予報または降水
  if (current) {
    const isRainingNow =
      current.precipitation > 0 ||
      [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(current.weatherCode);
    const rainProb = todayForecast?.precipitationProbability ?? 0;

    if (isRainingNow) {
      return {
        icon: '☔️',
        message: '雨が降っています。足元に気をつけてお過ごしください',
        category: 'weather',
      };
    }

    if (rainProb >= 60) {
      return {
        icon: '☂️',
        message: `雨の予報（降水確率 ${rainProb}%）です。お出かけには傘をお持ちください`,
        category: 'weather',
      };
    }

    if (rainProb >= 40) {
      return {
        icon: '🌂',
        message: `折りたたみ傘があると安心です（降水確率 ${rainProb}%）`,
        category: 'weather',
      };
    }
  }

  // 3. 気温・寒暖差・熱中症チェック
  if (todayForecast && current) {
    const tempDiff = todayForecast.tempMax - todayForecast.tempMin;

    // 猛暑
    if (todayForecast.tempMax >= 32 || current.temperature >= 30) {
      return {
        icon: '🥤',
        message: '厳しい暑さです。こまめな水分補給と冷房活用で熱中症予防を',
        category: 'health',
      };
    }

    // 夏日
    if (todayForecast.tempMax >= 27) {
      return {
        icon: '☀️',
        message: '日中は汗ばむ陽気になりそうです。涼しい服装でお過ごしください',
        category: 'clothing',
      };
    }

    // 寒暖差が大きい（10℃以上）
    if (tempDiff >= 10) {
      return {
        icon: '🧥',
        message: `1日の気温差が ${tempDiff}℃ あります。脱ぎ着しやすい上着が活躍します`,
        category: 'clothing',
      };
    }

    // 寒冷
    if (current.temperature <= 10 || todayForecast.tempMin <= 5) {
      return {
        icon: '🧣',
        message: '冷え込みが強まっています。マフラーや厚手の上着であたたかく',
        category: 'clothing',
      };
    }
  }

  // 4. 紫外線チェック (日中)
  if (todayForecast && todayForecast.uvIndexMax >= 6 && hour >= 9 && hour <= 16) {
    return {
      icon: '🕶️',
      message: '紫外線が強めです。日傘や日焼け止めなどのUV対策を',
      category: 'health',
    };
  }

  // 5. 室内環境チェック（乾燥・多湿）
  if (indoor) {
    if (indoor.humidity < 38) {
      return {
        icon: '💧',
        message: '空気が乾燥気味です。加湿やこまめな水分補給で喉をケアしましょう',
        category: 'health',
      };
    }
    if (indoor.humidity > 68 && (current?.temperature ?? 20) >= 23) {
      return {
        icon: '🍃',
        message: '湿度がやや高めです。換気や除湿で快適な空気環境を',
        category: 'health',
      };
    }
  }

  // 6. 時間帯に応じたポジティブな一言
  if (hour >= 5 && hour < 9) {
    return {
      icon: '🌅',
      message: 'おはようございます！今日も素敵な一日をお過ごしください',
      category: 'cheer',
    };
  }

  if (hour >= 18 && hour < 22) {
    return {
      icon: '🌆',
      message: '夕暮れ時です。一日の疲れをゆっくり癒してくださいね',
      category: 'cheer',
    };
  }

  // デフォルト（心地よい日）
  return {
    icon: '✨',
    message: '穏やかで心地よい一日です。リフレッシュしながら頑張りましょう',
    category: 'cheer',
  };
}
