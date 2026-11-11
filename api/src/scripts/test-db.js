import 'dotenv/config';
import sequelize from '../config/database.js';

try {
  await sequelize.authenticate();

  console.log('Conexión a MySQL exitosa');
  console.log('Base de datos:', process.env.DB_NAME);
} catch (error) {
  console.error('Error al conectar con MySQL');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
