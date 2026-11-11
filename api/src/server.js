
import 'dotenv/config';

import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================');
  console.log(' MINI AULA - API REST');
  console.log('====================================');
  console.log(`Servidor en: http://localhost:${PORT}`);
  console.log(`Prueba API: http://localhost:${PORT}/api/health`);
});
