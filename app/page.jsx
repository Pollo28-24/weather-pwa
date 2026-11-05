
"use client";
import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import { getWeatherByCity, getWeatherByCoords } from "@/lib/weather";
import InstallPrompt from "./components/InstallPrompt";

const WEATHER_CACHE_KEY = "last_weather";

function subscribeToWeatherCache(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener("weather-cache-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("weather-cache-change", onChange);
  };
}

function getWeatherCacheSnapshot() {
  return window.localStorage.getItem(WEATHER_CACHE_KEY);
}

function getServerWeatherCacheSnapshot() {
  return null;
}

export default function Home() {
  const [city, setCity] = useState("");
  const cachedWeather = useSyncExternalStore(
    subscribeToWeatherCache,
    getWeatherCacheSnapshot,
    getServerWeatherCacheSnapshot
  );
  const weather = useMemo(() => {
    if (!cachedWeather) return null;

    try {
      return JSON.parse(cachedWeather);
    } catch (error) {
      console.error("No se pudo leer el clima guardado en el navegador.", error);
      return null;
    }
  }, [cachedWeather]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    executeFetch(() => getWeatherByCity(city));
  };

  const handleGeoLocation = () => {
    setError("");

    if (!window.isSecureContext) {
      setError(
        "La ubicación requiere una conexión segura. Abre la app desde localhost o utiliza HTTPS."
      );
      return;
    }

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setLoading(true);
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLoadingLocation(false);
        executeFetch(() => getWeatherByCoords(latitude, longitude));
      },
      (geoError) => {
        const messages = {
          1: "Permiso de ubicación denegado. Autoriza el acceso a la ubicación en tu navegador.",
          2: "No se pudo determinar tu ubicación. Comprueba que el servicio de ubicación esté activo.",
          3: "La solicitud de ubicación tardó demasiado. Inténtalo de nuevo.",
        };
        setError(messages[geoError.code] || "No se pudo obtener tu ubicación.");
        setLoading(false);
        setLoadingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  const executeFetch = async (apiCall) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiCall();
      window.localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(data));
      window.dispatchEvent(new Event("weather-cache-change"));
    } catch (err) {
      setError(err.message || "Error al obtener datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center">
      {/* Encabezado */}
      <header className="w-full max-w-md flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-sky-400">WeatherPWA</h1>
        <InstallPrompt />
      </header>

      {/* Controles de Búsqueda y Ubicación */}
      <section className="w-full max-w-md space-y-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Ejemplo: Oaxaca, Madrid..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Buscar
          </button>
        </form>

        <button
          onClick={handleGeoLocation}
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 rounded-lg text-sm text-sky-400 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingLocation ? "Obteniendo ubicación..." : "📍 Usar mi ubicación actual"}
        </button>
      </section>

      {/* Indicadores de Estado */}
      {loading && <p className="text-slate-400 animate-pulse">Cargando datos del clima...</p>}
      {error && <p className="text-red-400 font-medium bg-red-950/50 p-3 rounded-lg border border-red-800">{error}</p>}

      {/* Tarjeta con los Datos del Clima */}
      {weather && !loading && (
        <article className="w-full max-w-md bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl text-center space-y-4">
          <h2 className="text-3xl font-bold">
            {weather.name}, {weather.sys.country}
          </h2>
          <div className="flex justify-center items-center">
            <Image
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              width={100}
              height={100}
            />
            <span className="text-5xl font-extrabold">
              {Math.round(weather.main.temp)}°C
            </span>
          </div>
          <p className="capitalize text-slate-300">
            {weather.weather[0].description}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700 text-sm">
            <div>
              Humedad: <strong className="text-white">{weather.main.humidity}%</strong>
            </div>
            <div>
              Viento: <strong className="text-white">{weather.wind.speed} m/s</strong>
            </div>
          </div>
        </article>
      )}
    </main>
  );
}