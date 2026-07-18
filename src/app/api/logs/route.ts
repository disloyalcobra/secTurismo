// src/app/api/logs/route.ts
// Bitácora administrativa — lee de la tabla audit_logs en Turso.
import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db, schema } from '@/db';

const { auditLogs } = schema;

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp));
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error leyendo bitácora:', error);
    return NextResponse.json([], { status: 200 });
  }
}
