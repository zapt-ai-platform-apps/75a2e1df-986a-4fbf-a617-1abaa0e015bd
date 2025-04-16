import OpenAI from 'openai';
import Sentry from './_sentry.js';
import { authenticateUser } from './_apiUtils.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reports } from '../drizzle/schema.js';

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

    const { projectDetails } = req.body;
    
    if (!projectDetails) {
      return res.status(400).json({ error: 'Missing project details' });
    }

    // Use environment variable API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(400).json({ 
        error: 'OpenAI API key is not configured. Please contact support.' 
      });
    }

    console.log('Generating report with GPT-4o for project:', projectDetails.projectName);
    
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Create a structured input for GPT-4o
    const prompt = buildReportPrompt(projectDetails);

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a UK construction contract expert assistant that analyzes construction contract issues and provides detailed professional analysis and recommendations. 
          You provide detailed, well-organized reports that follow a consistent structure. Focus on being thorough and specific to the contract type and issue described.
          Your reports are concise yet comprehensive, with practical recommendations that can be implemented.
          For each issue, structure your response with clear section headings and well-organized content.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Parse the response and structure it as needed
    const response = completion.choices[0].message.content;
    console.log('Successfully generated report response');
    
    // Parse the GPT response into our expected format
    const analysis = parseGptReportResponse(response, projectDetails);
    
    // Create the full report object
    const reportId = Date.now().toString();
    const generatedReport = {
      id: reportId,
      date: new Date().toISOString(),
      projectDetails: { ...projectDetails },
      analysis: analysis,
    };

    // Save report to database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    await db.insert(reports).values({
      id: reportId,
      userId: user.id,
      date: new Date(generatedReport.date),
      projectDetails: generatedReport.projectDetails,
      analysis: generatedReport.analysis
    });

    return res.status(200).json(generatedReport);
    
  } catch (error) {
    console.error('Error generating report:', error);
    Sentry.captureException(error);
    
    // Check if the error is authentication related
    if (error.message.includes('Authorization')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate report', 
      details: error.message 
    });
  }
}

function buildReportPrompt(projectDetails) {
  return `
I need a detailed UK construction contract analysis for a real project with the following details:

PROJECT INFORMATION:
Project Name: ${projectDetails.projectName}
Project Description: ${projectDetails.projectDescription}
Contract Type: ${projectDetails.contractType}
Organization Role: ${projectDetails.organizationRole}

ISSUES TO ANALYZE:
${projectDetails.issues.map((issue, index) => `
ISSUE ${index + 1}:
Description: ${issue.description}
Actions Taken: ${issue.actionsTaken || 'None'}
`).join('\n')}

For each issue, please provide a thorough analysis with the following sections:
1. Detailed Analysis: Specific analysis of the issue focusing on the relevant contract provisions
2. Legal Context: Relevant legal framework, legislation, and case law applicable to this specific issue
3. Relevant Contract Clauses: List of specific clauses from the contract type that apply to this issue (provide actual clause numbers and names)
4. Clause Explanations: Brief explanation of how each identified clause applies to this issue
5. Recommendations: Specific, actionable recommendations to address the issue
6. Potential Outcomes: Realistic assessment of possible outcomes
7. Timeline Suggestions: Recommended timeline for addressing the issue
8. Risk Assessment: Analysis of risks associated with the issue and different courses of action

Please be specific, practical, and focused on UK construction contract law and practice. Format your response with clear section headings for each part of the analysis.
`;
}

function parseGptReportResponse(responseText, projectDetails) {
  // Create an array to hold the analysis for each issue
  const analysisArray = [];
  
  // Split the response by issue if multiple issues were provided
  const issueResponses = projectDetails.issues.length > 1 
    ? splitResponseByIssues(responseText, projectDetails.issues.length)
    : [responseText];
  
  // Process each issue's response
  projectDetails.issues.forEach((issue, index) => {
    if (index >= issueResponses.length) return;
    
    const responseForIssue = issueResponses[index];
    
    // Extract each section from the response
    const detailedAnalysis = extractSection(responseForIssue, "Detailed Analysis", true);
    const legalContext = extractSection(responseForIssue, "Legal Context", true);
    const relevantClauses = extractListItems(responseForIssue, "Relevant Contract Clauses");
    const clauseExplanations = extractListItems(responseForIssue, "Clause Explanations");
    const recommendations = extractListItems(responseForIssue, "Recommendations");
    const potentialOutcomes = extractSection(responseForIssue, "Potential Outcomes", true);
    const timelineSuggestions = extractSection(responseForIssue, "Timeline Suggestions", true);
    const riskAssessment = extractSection(responseForIssue, "Risk Assessment", true);
    
    // Create the analysis object
    analysisArray.push({
      issue: issue.description,
      actionsTaken: issue.actionsTaken,
      detailedAnalysis,
      legalContext,
      relevantClauses: relevantClauses.length > 0 ? relevantClauses : generateFallbackClauses(projectDetails.contractType, issue.description),
      clauseExplanations,
      recommendations: recommendations.length > 0 ? recommendations : ["Seek professional legal advice specific to your contract situation."],
      potentialOutcomes,
      timelineSuggestions,
      riskAssessment
    });
  });
  
  return analysisArray;
}

function splitResponseByIssues(text, issueCount) {
  const issueResponses = [];
  
  // Try to split by issue headings
  const issueRegex = /ISSUE\s*\d+:|Issue\s*\d+:|Analysis for Issue\s*\d+:|Regarding Issue\s*\d+:/gi;
  let matches = [...text.matchAll(issueRegex)];
  
  if (matches.length >= issueCount) {
    // We found issue separators, split by them
    matches.forEach((match, i) => {
      const startPos = match.index;
      const endPos = i < matches.length - 1 ? matches[i + 1].index : text.length;
      issueResponses.push(text.substring(startPos, endPos).trim());
    });
  } else {
    // If we can't clearly split by issue markers, try to divide the text evenly
    const approximateIssueLength = Math.floor(text.length / issueCount);
    for (let i = 0; i < issueCount; i++) {
      const startPos = i * approximateIssueLength;
      const endPos = (i === issueCount - 1) ? text.length : (i + 1) * approximateIssueLength;
      issueResponses.push(text.substring(startPos, endPos).trim());
    }
  }
  
  return issueResponses;
}

function extractSection(text, sectionName, allowMultiParagraph = false) {
  // Create regex to find the section - looking for the heading followed by text
  const sectionRegex = new RegExp(`${sectionName}[\\s\\n]*:?[\\s\\n]*(.*?)(?=\\n\\s*\\d+\\.\\s*[A-Z]|\\n\\s*[A-Z][a-z]+\\s*[A-Z][a-z]+|\\n\\s*$|$)`, 's');
  const match = text.match(sectionRegex);
  
  if (match && match[1]) {
    const content = match[1].trim();
    
    if (allowMultiParagraph) {
      return content;
    } else {
      // For single paragraph sections, just take the first paragraph
      const firstParagraph = content.split(/\n\s*\n/)[0];
      return firstParagraph.trim();
    }
  }
  
  // If section name wasn't found with a colon, try without
  const altSectionRegex = new RegExp(`${sectionName}[\\s\\n]*(.*?)(?=\\n\\s*\\d+\\.\\s*[A-Z]|\\n\\s*[A-Z][a-z]+\\s*[A-Z][a-z]+|\\n\\s*$|$)`, 's');
  const altMatch = text.match(altSectionRegex);
  
  if (altMatch && altMatch[1]) {
    const content = altMatch[1].trim();
    
    if (allowMultiParagraph) {
      return content;
    } else {
      const firstParagraph = content.split(/\n\s*\n/)[0];
      return firstParagraph.trim();
    }
  }
  
  return "";
}

function extractListItems(text, sectionName) {
  // Try to find the section
  const sectionRegex = new RegExp(`${sectionName}[\\s\\n]*:?[\\s\\n]*(.*?)(?=\\n\\s*\\d+\\.\\s*[A-Z]|\\n\\s*[A-Z][a-z]+\\s*[A-Z][a-z]+|\\n\\s*$|$)`, 's');
  const match = text.match(sectionRegex);
  
  if (!match || !match[1]) {
    return [];
  }
  
  const content = match[1].trim();
  
  // Look for bulleted or numbered list items
  const listItemRegex = /(?:^|\n)\s*(?:[\d•\-\*]+\.?\s*|\-\s+)(.*?)(?=\n\s*(?:[\d•\-\*]+\.?\s*|\-\s+)|$)/gs;
  const listMatches = [...content.matchAll(listItemRegex)];
  
  if (listMatches.length > 0) {
    return listMatches.map(m => m[1].trim()).filter(item => item.length > 0);
  }
  
  // If no list items found, try to split by newlines
  const lines = content.split('\n').map(line => line.trim())
    .filter(line => line.length > 0 && !line.match(/^[\d•\-\*]+\.?\s*$/));
  
  return lines;
}

function generateFallbackClauses(contractType, issueDescription) {
  const issueKeywords = issueDescription.toLowerCase();
  
  if (contractType.includes('JCT')) {
    if (issueKeywords.includes('payment')) return ['Clause 4.8', 'Clause 4.9', 'Clause 4.10', 'Clause 4.11'];
    if (issueKeywords.includes('delay')) return ['Clause 2.26', 'Clause 2.27', 'Clause 2.28', 'Clause 2.29'];
    if (issueKeywords.includes('variation')) return ['Clause 3.14', 'Clause 3.15', 'Clause 3.16', 'Clause 5.6'];
    if (issueKeywords.includes('defect')) return ['Clause 2.38', 'Clause 2.39', 'Clause 2.40', 'Clause 3.18'];
    return ['Clause 1.7', 'Clause 2.1', 'Clause 8.4', 'Clause 8.9'];
  }
  
  if (contractType.includes('NEC')) {
    if (issueKeywords.includes('payment')) return ['Clause 50.1', 'Clause 51.1', 'Clause 51.2', 'Clause 51.3'];
    if (issueKeywords.includes('delay')) return ['Clause 60.1', 'Clause 61.3', 'Clause 62.2', 'Clause 63.3'];
    if (issueKeywords.includes('variation')) return ['Clause 60.1(1)', 'Clause 61.2', 'Clause 63.1', 'Clause 63.7'];
    if (issueKeywords.includes('defect')) return ['Clause 40.1', 'Clause 42.1', 'Clause 43.1', 'Clause 44.1'];
    return ['Clause 10.1', 'Clause 15.1', 'Clause 91.1', 'Clause 93.1'];
  }
  
  return ['General Contract Provisions', 'Specific Terms of Agreement', 'Implied Terms', 'Payment Terms'];
}