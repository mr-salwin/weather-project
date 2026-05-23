import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface WeatherResponse {
  latitude: number;
  longitude: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
    time: string;
  };
  hourly: {
    temperature_2m: number[];
    weathercode: number[];
    time: string[];
  };
  daily: {
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    time: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const latitude = url.searchParams.get("lat");
    const longitude = url.searchParams.get("lon");

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch weather data from Open-Meteo API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;

    const response = await fetch(weatherUrl);
    const data: WeatherResponse = await response.json();

    // Process current weather
    const currentWeather = {
      temperature: Math.round(data.current_weather.temperature),
      windspeed: Math.round(data.current_weather.windspeed),
      weatherCode: data.current_weather.weathercode,
      time: data.current_weather.time,
    };

    // Get today's hourly forecast (next 24 hours)
    const currentHour = new Date().getHours();
    const hourlyForecast = [];
    for (let i = 0; i < 24; i++) {
      const hourIndex = currentHour + i;
      if (hourIndex < data.hourly.time.length) {
        hourlyForecast.push({
          time: data.hourly.time[hourIndex],
          temperature: Math.round(data.hourly.temperature_2m[hourIndex]),
          weatherCode: data.hourly.weathercode[hourIndex],
        });
      }
    }

    // Process daily forecast
    const dailyForecast = data.daily.time.map((time, index) => ({
      date: time,
      maxTemp: Math.round(data.daily.temperature_2m_max[index]),
      minTemp: Math.round(data.daily.temperature_2m_min[index]),
      weatherCode: data.daily.weathercode[index],
    }));

    return new Response(
      JSON.stringify({
        current: currentWeather,
        hourly: hourlyForecast,
        daily: dailyForecast,
        location: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch weather data" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
