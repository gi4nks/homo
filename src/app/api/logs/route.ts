import { getRecentLogs } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const logs = getRecentLogs(100); // Last 100 log entries

    return new Response(JSON.stringify({ logs }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to fetch logs:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
