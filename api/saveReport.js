import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reports } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateUser } from './_apiUtils.js';
import Sentry from './_sentry.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { report } = req.body;
    
    if (!report || !report.id || !report.projectDetails || !report.analysis) {
      return res.status(400).json({ error: 'Invalid report data' });
    }

    // Connect to database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Check if report already exists
    const existingReport = await db.select()
      .from(reports)
      .where(eq(reports.id, report.id))
      .limit(1);

    if (existingReport.length > 0) {
      // If report exists, check if it belongs to this user
      if (existingReport[0].userId !== user.id) {
        client.end();
        return res.status(403).json({ error: 'You do not have permission to update this report' });
      }

      // Update the report
      await db.update(reports)
        .set({
          projectDetails: report.projectDetails,
          analysis: report.analysis,
          date: new Date(report.date)
        })
        .where(eq(reports.id, report.id));
    } else {
      // Insert new report
      await db.insert(reports).values({
        id: report.id,
        userId: user.id,
        date: new Date(report.date),
        projectDetails: report.projectDetails,
        analysis: report.analysis
      });
    }

    client.end();
    return res.status(200).json({ success: true, id: report.id });
    
  } catch (error) {
    console.error('Error saving report:', error);
    Sentry.captureException(error);
    
    if (error.message.includes('Authorization')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to save report', 
      details: error.message 
    });
  }
}