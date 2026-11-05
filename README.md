# WeatherPWA

Aplicación web progresiva para consultar el clima actual por ciudad o por ubicación. Guarda el último pronóstico en el navegador y puede instalarse en dispositivos compatibles.

## Requisitos

- Node.js y npm
- Una clave de API de [OpenWeather](https://openweathermap.org/api)

## Desarrollo local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y asigna tu clave:

   ```dotenv
   OPENWEATHER_API_KEY=tu_clave_de_openweathermap
   ```

3. Inicia Next.js:

   ```bash
   npm run dev
   ```

   Abre http://localhost:3000. La geolocalización requiere HTTPS o `localhost`.

## Verificación de producción

```bash
npm run lint
npm run build
npm run start
```

El service worker se registra en producción. En desarrollo local no se activa para evitar que el caché interfiera con los cambios.

## Despliegue en Vercel

1. Importa el repositorio en Vercel. El proyecto se detecta como Next.js; conserva los valores de instalación, build y salida sugeridos por Vercel.
2. En **Settings → Environment Variables**, agrega `OPENWEATHER_API_KEY` con tu clave de OpenWeather para los entornos que quieras desplegar.
3. Ejecuta un nuevo despliegue después de agregar o cambiar la variable.

La clave se usa únicamente en la ruta de servidor `/api/weather`; no se expone en el JavaScript del navegador. La consulta del clima necesita conexión a OpenWeather; el shell de la aplicación y sus recursos estáticos se pueden reutilizar desde caché cuando no hay conexión.
