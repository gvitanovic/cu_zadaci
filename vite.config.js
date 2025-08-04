// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                job: 'src/pages/job.html',
                registration: 'src/pages/registration.html',
                weather: 'src/pages/weather.html',
                "registration-weather-container": 'src/pages/registration-weather-container.html'
            }
        }
    }
})