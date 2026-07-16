/* eslint-disable */
import fs from 'fs/promises';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'src/data/access_logs.json');

export async function logAdminAction(
  username: string,
  ip: string,
  action: string,
  entity: string
) {
  try {
    let logs = [];
    try {
      const data = await fs.readFile(LOG_FILE_PATH, 'utf-8');
      logs = JSON.parse(data);
    } catch (error) {
      // Ignorar error si el archivo no existe o está vacío
    }

    logs.push({
      timestamp: new Date().toISOString(),
      username: username || 'admin',
      ip: ip || '127.0.0.1',
      status: 'SUCCESS', // Para mantener compatibilidad con login logs
      action: action,
      entity: entity,
    });

    // Mantener solo los últimos 500 registros para evitar consumo excesivo de disco
    if (logs.length > 500) {
      logs = logs.slice(logs.length - 500);
    }

    await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error guardando bitácora de auditoría:', error);
  }
}
