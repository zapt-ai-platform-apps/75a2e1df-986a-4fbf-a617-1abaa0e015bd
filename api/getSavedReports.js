import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reports } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Fetch reports for the authenticated user
    const userReports = await db.select()
      .from(reports)
      .where(eq(reports.userId, user.id))
      .orderBy(reports.createdAt);

    client.end();
    return res.status(200).json(userReports);
    
  } catch (error) {
    console.error('Error fetching saved reports:', error);
    Sentry.captureException(error);
    
    if (error.message.includes('Authorization')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch saved reports', 
      details: error.message 
    });
  }
}