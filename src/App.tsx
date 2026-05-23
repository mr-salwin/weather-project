import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
  CloudLightning,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Clock,
  Calendar,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import type { WeatherData, SavedLocation } from './types/weather';
import { getWeatherInfo } from './utils/weatherCodes';

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number, locationName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/weather?lat=${lat}&lon=${lon}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setWeatherData(data);
      if (locationName) {
        setCurrentLocation({ lat, lon, name: locationName });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  }, []);

  const getGeolocation = useCallback(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lon: longitude, name: 'Current Location' });
        await fetchWeather(latitude, longitude, 'Current Location');
      },
      (err) => {
        setError('Unable to retrieve your location. Please search for a city.');
        setLoading(false);
      }
    );
  }, [fetchWeather]);

  useEffect(() => {
    getGeolocation();
  }, [getGeolocation]);

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError('Location not found. Please try a different search.');
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = data.results[0];
      const fullName = `${name}${country ? `, ${country}` : ''}`;
      setCurrentLocation({ lat: latitude, lon: longitude, name: fullName });
      await fetchWeather(latitude, longitude, fullName);
      setSearchQuery('');
      setShowSearch(false);
    } catch (err) {
      setError('Failed to search for location');
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number, size: number = 24) => {
    const info = getWeatherInfo(code);
    const IconComponent = info.icon;
    return <IconComponent size={size} />;
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const currentWeatherInfo = weatherData ? getWeatherInfo(weatherData.current.weatherCode) : null;

  return (
    <div className="min-h-screen transition-all duration-1000">
      {/* Dynamic Background */}
      <div
        className={`fixed inset-0 bg-gradient-to-br ${
          currentWeatherInfo ? currentWeatherInfo.bgGradient : 'from-sky-400 to-blue-600'
        } transition-all duration-1000`}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CloudSun className="text-white drop-shadow-lg" size={32} />
              <h1 className="text-2xl font-light text-white tracking-wide">Weather</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-105"
                aria-label="Search location"
              >
                <Search className="text-white" size={20} />
              </button>
              <button
                onClick={getGeolocation}
                className="p-2.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-105"
                aria-label="Use current location"
              >
                <Navigation className="text-white" size={20} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="max-w-6xl mx-auto mt-4 animate-fadeIn">
              <form onSubmit={searchLocation} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a city..."
                  className="w-full px-5 py-3 pl-12 bg-white/95 backdrop-blur-md rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg text-lg"
                  autoFocus
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {loading && !weatherData && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="text-white animate-spin" size={48} />
              </div>
            )}

            {error && (
              <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center text-white">
                <p className="text-lg">{error}</p>
                <button
                  onClick={() => setShowSearch(true)}
                  className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-xl hover:bg-gray-100 transition-colors font-medium"
                >
                  Search for a location
                </button>
              </div>
            )}

            {weatherData && currentWeatherInfo && currentLocation && !loading && (
              <div className="animate-fadeIn space-y-8">
                {/* Current Weather Card */}
                <div className="bg-white/25 backdrop-blur-md rounded-3xl p-8 shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="text-white/80" size={20} />
                        <h2 className="text-xl text-white/90 font-medium">{currentLocation.name}</h2>
                      </div>
                      <p className="text-white/70 text-sm">
                        {new Date().toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-start justify-end gap-2">
                        {getWeatherIcon(weatherData.current.weatherCode, 64)}
                        <span className="text-7xl font-light text-white tracking-tighter">
                          {weatherData.current.temperature}°
                        </span>
                      </div>
                      <p className="text-white/90 text-lg mt-2 font-medium">
                        {currentWeatherInfo.label}
                      </p>
                    </div>
                  </div>

                  {/* Weather Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Wind className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Wind</p>
                        <p className="text-white font-medium">{weatherData.current.windspeed} km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Thermometer className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Feels Like</p>
                        <p className="text-white font-medium">{weatherData.current.temperature}°</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Cloud className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Coverage</p>
                        <p className="text-white font-medium">{weatherData.current.weatherCode}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <Droplets className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-wide">Humidity</p>
                        <p className="text-white font-medium">65%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hourly Forecast */}
                <div className="bg-white/25 backdrop-blur-md rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-5">
                    <Clock className="text-white/80" size={20} />
                    <h3 className="text-lg text-white font-medium">Hourly Forecast</h3>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                    {weatherData.hourly.slice(0, 12).map((hour, index) => (
                      <div
                        key={hour.time}
                        className="flex-shrink-0 bg-white/20 rounded-2xl p-4 min-w-[80px] text-center hover:bg-white/30 transition-colors"
                      >
                        <p className="text-white/70 text-xs mb-2">
                          {index === 0 ? 'Now' : formatTime(hour.time)}
                        </p>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(hour.weatherCode, 28)}
                        </div>
                        <p className="text-white font-medium text-lg">{hour.temperature}°</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 7-Day Forecast */}
                <div className="bg-white/25 backdrop-blur-md rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-5">
                    <Calendar className="text-white/80" size={20} />
                    <h3 className="text-lg text-white font-medium">7-Day Forecast</h3>
                  </div>

                  <div className="space-y-3">
                    {weatherData.daily.map((day, index) => (
                      <div
                        key={day.date}
                        className="flex items-center justify-between py-3 px-4 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3 w-1/3">
                          {getWeatherIcon(day.weatherCode, 32)}
                          <span className="text-white/90 font-medium">
                            {formatDate(day.date)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-sm">{day.minTemp}°</span>
                          <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-300 to-orange-300 rounded-full transition-all duration-300"
                              style={{
                                width: `${((day.maxTemp - day.minTemp) / 20) * 100}%`,
                                minWidth: '20%',
                              }}
                            />
                          </div>
                          <span className="text-white font-medium">{day.maxTemp}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weather Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'UV Index', value: '4', icon: Sun, sublabel: 'Moderate' },
                    { label: 'Sunrise', value: '6:23 AM', icon: CloudSun, sublabel: '' },
                    { label: 'Sunset', value: '7:45 PM', icon: Cloud, sublabel: '' },
                    { label: 'Visibility', value: '10 km', icon: Navigation, sublabel: 'Clear' },
                    { label: 'Air Quality', value: '42', icon: Wind, sublabel: 'Good' },
                    { label: 'Pressure', value: '1015 hPa', icon: Thermometer, sublabel: '' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/25 backdrop-blur-md rounded-2xl p-5 shadow-lg hover:bg-white/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <item.icon className="text-white/70" size={20} />
                        <ChevronRight className="text-white/40" size={16} />
                      </div>
                      <p className="text-white/60 text-xs uppercase tracking-wide mb-1">{item.label}</p>
                      <p className="text-white text-2xl font-medium">{item.value}</p>
                      {item.sublabel && (
                        <p className="text-white/70 text-sm mt-1">{item.sublabel}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-8 text-center">
          <p className="text-white/50 text-sm">
            Powered by Open-Meteo Weather API
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default App;
