import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no mode atual (development/production)
  // O terceiro parâmetro '' permite carregar variáveis do sistema que não começam com VITE_
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      // SEGURANÇA: A chave agora é injetada via variável de ambiente,
      // não ficando mais exposta no código fonte do repositório.
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ""),
      'process.env.GEMINI_API_KEY2': JSON.stringify(env.GEMINI_API_KEY2 || ""),
      'process.env.GEMINI_API_KEY_CHAT': JSON.stringify(env.GEMINI_API_KEY_CHAT || ""),
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || "")
    }
  };
});
