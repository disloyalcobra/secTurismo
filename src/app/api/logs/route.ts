import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const LOG_FILE_PATH = path.join(process.cwd(), 'src/data/access_logs.json');

export async function GET() {
  try {
    const data = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    const logs = JSON.parse(data);
    
    // Devolver los logs ordenados de más reciente a más antiguo
    const sortedLogs = [...logs].reverse();
    
    return NextResponse.json(sortedLogs, { status: 200 });
  } catch (error) {
    console.error('Error leyendo bitácora:', error);
    return NextResponse.json([], { status: 200 });
  }
}
