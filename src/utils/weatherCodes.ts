import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  CloudLightning,
  CloudSun,
  Wind,
} from 'lucide-react';

export interface WeatherInfo {
  label: string;
  icon: typeof Sun;
  bgGradient: string;
  textColor: string;
}

const weatherMap: Record<number, WeatherInfo> = {
  0: { label: 'Clear sky', icon: Sun, bgGradient: 'from-sky-400 to-blue-500', textColor: 'text-white' },
  1: { label: 'Mainly clear', icon: Sun, bgGradient: 'from-sky-400 to-blue-500', textColor: 'text-white' },
  2: { label: 'Partly cloudy', icon: CloudSun, bgGradient: 'from-blue-400 to-sky-500', textColor: 'text-white' },
  3: { label: 'Overcast', icon: Cloud, bgGradient: 'from-gray-400 to-gray-600', textColor: 'text-white' },
  45: { label: 'Fog', icon: CloudFog, bgGradient: 'from-gray-400 to-gray-600', textColor: 'text-white' },
  48: { label: 'Depositing rime fog', icon: CloudFog, bgGradient: 'from-gray-500 to-gray-700', textColor: 'text-white' },
  51: { label: 'Light drizzle', icon: CloudDrizzle, bgGradient: 'from-slate-400 to-slate-600', textColor: 'text-white' },
  53: { label: 'Moderate drizzle', icon: CloudDrizzle, bgGradient: 'from-slate-500 to-slate-700', textColor: 'text-white' },
  55: { label: 'Dense drizzle', icon: CloudDrizzle, bgGradient: 'from-slate-600 to-slate-800', textColor: 'text-white' },
  61: { label: 'Slight rain', icon: CloudRain, bgGradient: 'from-blue-500 to-blue-700', textColor: 'text-white' },
  63: { label: 'Moderate rain', icon: CloudRain, bgGradient: 'from-blue-600 to-blue-800', textColor: 'text-white' },
  65: { label: 'Heavy rain', icon: CloudRain, bgGradient: 'from-blue-700 to-blue-900', textColor: 'text-white' },
  71: { label: 'Slight snow', icon: CloudSnow, bgGradient: 'from-blue-200 to-blue-400', textColor: 'text-gray-800' },
  73: { label: 'Moderate snow', icon: CloudSnow, bgGradient: 'from-blue-300 to-blue-500', textColor: 'text-gray-800' },
  75: { label: 'Heavy snow', icon: CloudSnow, bgGradient: 'from-blue-400 to-blue-600', textColor: 'text-white' },
  77: { label: 'Snow grains', icon: CloudSnow, bgGradient: 'from-blue-200 to-slate-400', textColor: 'text-gray-800' },
  80: { label: 'Slight rain showers', icon: CloudRain, bgGradient: 'from-blue-400 to-blue-600', textColor: 'text-white' },
  81: { label: 'Moderate rain showers', icon: CloudRain, bgGradient: 'from-blue-500 to-blue-700', textColor: 'text-white' },
  82: { label: 'Violent rain showers', icon: CloudRain, bgGradient: 'from-blue-600 to-blue-800', textColor: 'text-white' },
  85: { label: 'Slight snow showers', icon: CloudSnow, bgGradient: 'from-blue-300 to-blue-500', textColor: 'text-white' },
  86: { label: 'Heavy snow showers', icon: CloudSnow, bgGradient: 'from-blue-400 to-blue-600', textColor: 'text-white' },
  95: { label: 'CloudLightning', icon: CloudLightning, bgGradient: 'from-slate-700 to-slate-900', textColor: 'text-white' },
  96: { label: 'CloudLightning with slight hail', icon: CloudLightning, bgGradient: 'from-slate-700 to-slate-900', textColor: 'text-white' },
  99: { label: 'CloudLightning with heavy hail', icon: CloudLightning, bgGradient: 'from-slate-800 to-slate-950', textColor: 'text-white' },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return weatherMap[code] || { label: 'Unknown', icon: Cloud, bgGradient: 'from-gray-400 to-gray-600', textColor: 'text-white' };
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
