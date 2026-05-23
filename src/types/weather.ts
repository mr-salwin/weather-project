export interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weatherCode: number;
  time: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Location {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
  created_at: string;
}
