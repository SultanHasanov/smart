import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/smart/', // 👈 обязательно укажи путь как у репозитория
  plugins: [react()],
});
