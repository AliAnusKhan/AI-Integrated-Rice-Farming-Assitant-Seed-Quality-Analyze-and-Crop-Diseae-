import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, Wind, CloudFog, CloudLightning } from "lucide-react";

const API_KEY = "dcf3b7302a03472bd95a6c50bfaed1a5";

function WeatherIcon({ condition, size = 32 }: { condition: string; size?: number }) {
  const c = condition?.toLowerCase() || "";
  if (c.includes("thunder") || c.includes("storm"))
    return <CloudLightning className="text-purple-400" size={size} />;
  if (c.includes("rain") || c.includes("drizzle"))
    return <CloudRain className="text-blue-400" size={size} />;
  if (c.includes("snow"))
    return <CloudSnow className="text-blue-200" size={size} />;
  if (c.includes("fog") || c.includes("mist") || c.includes("haze") || c.includes("smoke"))
    return <CloudFog className="text-gray-400" size={size} />;
  if (c.includes("cloud"))
    return <Cloud className="text-gray-400" size={size} />;
  if (c.includes("wind"))
    return <Wind className="text-teal-400" size={size} />;
  return <Sun className="text-yellow-400" size={size} />;
}

export default function Header({ city = "Karachi" }: { city?: string }) {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    )
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => {
        console.log("Weather API response:", data); // debug ke liye
        setWeather(data);
      })
      .catch(() => setError(true));
  }, [city]);

  const temp = weather?.main?.temp != null ? Math.round(weather.main.temp) : "--";
  const condition = weather?.weather?.[0]?.main || "Clear";
  const description = weather?.weather?.[0]?.description || "";

  return (
    <div className="flex items-center gap-2">
      <WeatherIcon condition={condition} size={28} />
      <div className="text-right">
        <p className="text-2xl font-bold text-slate-800">
          {error ? "N/A" : `${temp}°C`}
        </p>
        <p className="text-xs text-slate-500 capitalize">{description || city}</p>
      </div>
    </div>
  );
}