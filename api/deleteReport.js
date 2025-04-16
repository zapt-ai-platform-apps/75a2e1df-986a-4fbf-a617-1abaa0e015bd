import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reports } from '../drizzle/schema.js';
import { and, eq } from 'drizzle-orm';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { reportId } = req.query;
    
    if (!reportId) {
      return res.status(400).json({ error: 'Report ID is required' });
    }

    // Connect to database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Delete report only if it belongs to the authenticated user
    const result = await db.delete(reports)
      .where(
        and(
          eq(reports.id, reportId),
          eq(reports.userId, user.id)
        )
      );

    client.end();
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Error deleting report:', error);
    Sentry.captureException(error);
    
    if (error.message.includes('Authorization')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to delete report', 
      details: error.message 
    });
  }
}