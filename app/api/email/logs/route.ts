import { NextRequest, NextResponse } from 'next/server';
import { loadEmailLogs } from '@/lib/services/emailService';

export async function GET(req: NextRequest) {
  try {
    const logs = loadEmailLogs();
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Could not load email logs' }, { status: 500 });
  }
}

