import type { WeatherCondition } from '@/types/weather';

export function getWeatherCondition(code: number, isDay = true): WeatherCondition {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return {
        label: isDay ? '快晴' : '快晴（夜）',
        iconName: isDay ? 'Sun' : 'Moon',
      };
    case 1:
      return {
        label: isDay ? '晴れ' : '晴れ（夜）',
        iconName: isDay ? 'SunMedium' : 'Moon',
      };
    case 2:
      return {
        label: '一部曇り',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
      };
    case 3:
      return {
        label: '曇り',
        iconName: 'Cloud',
      };
    case 45:
    case 48:
      return {
        label: '霧',
        iconName: 'CloudFog',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: '霧雨',
        iconName: 'CloudDrizzle',
      };
    case 56:
    case 57:
      return {
        label: '着氷性の霧雨',
        iconName: 'CloudDrizzle',
      };
    case 61:
      return {
        label: '小雨',
        iconName: 'CloudRain',
      };
    case 63:
      return {
        label: '雨',
        iconName: 'CloudRain',
      };
    case 65:
      return {
        label: '大雨',
        iconName: 'CloudRain',
      };
    case 66:
    case 67:
      return {
        label: '着氷性の雨',
        iconName: 'CloudHail',
      };
    case 71:
      return {
        label: '小雪',
        iconName: 'CloudSnow',
      };
    case 73:
      return {
        label: '雪',
        iconName: 'CloudSnow',
      };
    case 75:
      return {
        label: '大雪',
        iconName: 'Snowflake',
      };
    case 77:
      return {
        label: '霧雪',
        iconName: 'Snowflake',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'にわか雨',
        iconName: 'CloudLightning',
      };
    case 85:
    case 86:
      return {
        label: 'にわか雪',
        iconName: 'CloudSnow',
      };
    case 95:
      return {
        label: '雷雨',
        iconName: 'CloudLightning',
      };
    case 96:
    case 99:
      return {
        label: '雷雨と雹',
        iconName: 'CloudLightning',
      };
    default:
      return {
        label: '不明',
        iconName: 'HelpCircle',
      };
  }
}

export function formatTimeHour(timeString: string): string {
  const date = new Date(timeString);
  return `${date.getHours().toString().padStart(2, '0')}:00`;
}

export function formatDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${days[date.getDay()]}曜日`;
}

export function formatShortDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[date.getDay()];
}

export function getWindDirectionText(degrees: number): string {
  const directions = [
    '北',
    '北北東',
    '北東',
    '東北東',
    '東',
    '東南東',
    '南東',
    '南南東',
    '南',
    '南南西',
    '南西',
    '西南西',
    '西',
    '西北西',
    '北西',
    '北北西',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function formatVisibility(meters: number): string {
  if (meters >= 10000) {
    return '>10km';
  }
  return `${Math.round(meters / 1000)}km`;
}
