const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();
  const parameters = new URLSearchParams({
    units: "metric",
    lang: "es",
  });

  if (city) {
    if (city.length > 100) {
      return Response.json(
        { error: "El nombre de la ciudad es demasiado largo." },
        { status: 400 }
      );
    }
    parameters.set("q", city);
  } else {
    const latitude = searchParams.get("lat");
    const longitude = searchParams.get("lon");

    if (
      latitude === null ||
      longitude === null ||
      latitude.trim() === "" ||
      longitude.trim() === ""
    ) {
      return Response.json(
        { error: "Indica una ciudad o coordenadas válidas." },
        { status: 400 }
      );
    }

    const lat = Number(latitude);
    const lon = Number(longitude);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return Response.json(
        { error: "Las coordenadas indicadas no son válidas." },
        { status: 400 }
      );
    }

    parameters.set("lat", String(lat));
    parameters.set("lon", String(lon));
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("Falta configurar la variable OPENWEATHER_API_KEY.");
    return Response.json(
      { error: "El servicio del clima no está configurado." },
      { status: 500 }
    );
  }

  parameters.set("appid", apiKey);

  try {
    const response = await fetch(`${BASE_URL}?${parameters}`, {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            response.status === 404
              ? "No se encontró la ciudad solicitada."
              : "No se pudo consultar el servicio del clima.",
        },
        { status: response.status }
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("Falló la consulta al servicio de OpenWeather.", error);
    return Response.json(
      { error: "El servicio del clima no está disponible." },
      { status: 502 }
    );
  }
}
