async function requestWeather(parameters, fallbackMessage) {
  const response = await fetch(`/api/weather?${parameters}`, {
    cache: "no-store",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function getWeatherByCity(city) {
  const parameters = new URLSearchParams({ city: city.trim() });
  return requestWeather(parameters, "No se encontró la ciudad solicitada.");
}

export async function getWeatherByCoords(lat, lon) {
  const parameters = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  });
  return requestWeather(
    parameters,
    "Error al consultar el clima para tu ubicación."
  );
}
