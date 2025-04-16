import OpenAI from 'openai';
import Sentry from './_sentry.js';
import { authenticateUser } from './_apiUtils.js';

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
    
    if (!report || !report.projectDetails || !report.analysis) {
      return res.status(400).json({ error: 'Missing report data' });
    }

    // Use environment variable API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(400).json({ 
        error: 'OpenAI API key is not configured. Please contact support.' 
      });
    }

    console.log('Generating draft letter with GPT-4o for project:', report.projectDetails.projectName);
    
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Create a structured input for GPT-4o
    const prompt = buildLetterPrompt(report);

    // Call GPT-4o
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a UK construction contract expert that drafts professional formal letters regarding contract disputes. 
          You draft clear, concise, and professional letters that follow proper UK business letter format and reference the appropriate contract clauses.
          Your letters are factual, respectful, and focused on resolving issues through the appropriate contractual mechanisms.
          The letter should be formatted correctly with appropriate sections including To, Subject, Greeting, Body, Closing, and Sender information.
          Maintain a professional tone throughout the letter, avoiding overly aggressive language while being firm and clear about contract requirements.`
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    // Parse the response
    const response = completion.choices[0].message.content;
    console.log('Successfully generated draft letter');
    
    // Parse the GPT response into our expected format
    const draftCommunication = parseGptLetterResponse(response, report);

    return res.status(200).json(draftCommunication);
    
  } catch (error) {
    console.error('Error generating draft letter:', error);
    Sentry.captureException(error);
    
    // Check if the error is authentication related
    if (error.message.includes('Authorization')) {
      return res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate draft letter', 
      details: error.message 
    });
  }
}

function buildLetterPrompt(report) {
  const recipientRole = getDraftRecipient(report.projectDetails.organizationRole);
  
  return `
Draft a formal letter regarding a UK construction contract issue with the following details:

PROJECT INFORMATION:
Project Name: ${report.projectDetails.projectName}
Contract Type: ${report.projectDetails.contractType}
Your Role: ${report.projectDetails.organizationRole}
Recipient: ${recipientRole}

ISSUES TO ADDRESS:
${report.analysis.map((analysis, index) => `
ISSUE ${index + 1}:
Description: ${analysis.issue}
Actions Taken: ${analysis.actionsTaken || 'None'}
Relevant Contract Clauses: ${analysis.relevantClauses.join(', ')}
Key Recommendations: ${analysis.recommendations.slice(0, 2).join(' ')}
`).join('\n')}

The letter should include:
1. Appropriate salutation for the recipient
2. Clear reference to the project and contract
3. Formal introduction stating your role and purpose of the letter
4. Well-structured paragraphs addressing each issue with reference to specific contract clauses
5. Clear requests for action with reasonable timeframes
6. Professional closing
7. Space for signature with your organization role
8. Reference number and date

Format the letter as a complete draft communication with the following structure:
- To
- Subject
- Greeting
- Body (with appropriate paragraphs and formatting)
- Closing
- Sender information

Use formal UK business letter conventions and professional language throughout.
`;
}

function parseGptLetterResponse(responseText, report) {
  // Extract the main parts of the letter
  const to = extractLetterPart(responseText, "To:", "Subject:") || getDraftRecipient(report.projectDetails.organizationRole);
  const subject = extractLetterPart(responseText, "Subject:", "Dear") || 
                  `${report.projectDetails.projectName} - ${report.projectDetails.contractType} - Contract Notice`;
  
  // Extract greeting (salutation)
  let greeting = "";
  if (responseText.includes("Dear")) {
    const greetingMatch = responseText.match(/Dear\s+[^,\n]+(,|\n|$)/);
    if (greetingMatch) {
      greeting = greetingMatch[0].trim();
      if (!greeting.endsWith(',')) {
        greeting += ',';
      }
    }
  }
  if (!greeting) {
    greeting = `Dear ${to},`;
  }
  
  // Extract the body (everything between greeting and closing)
  let body = "";
  const closingPhrases = ["Yours sincerely", "Yours faithfully", "Regards", "Kind regards", "Best regards", "Yours truly"];
  let closingIndex = -1;
  let closingPhrase = "";
  
  for (const phrase of closingPhrases) {
    const index = responseText.indexOf(phrase);
    if (index !== -1 && (closingIndex === -1 || index < closingIndex)) {
      closingIndex = index;
      closingPhrase = phrase;
    }
  }
  
  if (closingIndex !== -1) {
    // Extract content between greeting and closing as the body
    const greetingEndIndex = responseText.indexOf(greeting) + greeting.length;
    body = responseText.substring(greetingEndIndex, closingIndex).trim();
    
    // Remove any "Subject:" or "Re:" lines from the beginning of the body if they got included
    body = body.replace(/^(Subject|Re):[^\n]*\n/, '').trim();
  } else {
    // If no closing found, take everything after the greeting
    const greetingEndIndex = responseText.indexOf(greeting) + greeting.length;
    body = responseText.substring(greetingEndIndex).trim();
    
    // Remove any "Subject:" or "Re:" lines from the beginning of the body if they got included
    body = body.replace(/^(Subject|Re):[^\n]*\n/, '').trim();
  }
  
  // Extract closing (everything after the closing phrase until signature block)
  let closing = "";
  if (closingIndex !== -1) {
    const nextLineIndex = responseText.indexOf('\n', closingIndex);
    if (nextLineIndex !== -1) {
      closing = responseText.substring(closingIndex, nextLineIndex).trim();
    } else {
      closing = closingPhrase;
    }
  } else if (closingPhrases.some(phrase => responseText.includes(phrase))) {
    // Try to extract closing if we missed it in the first pass
    for (const phrase of closingPhrases) {
      if (responseText.includes(phrase)) {
        closing = phrase;
        break;
      }
    }
  } else {
    closing = "Yours faithfully,";
  }
  
  // Extract sender information (everything after closing)
  let sender = "";
  if (closingIndex !== -1) {
    const nextLineIndex = responseText.indexOf('\n', closingIndex);
    if (nextLineIndex !== -1) {
      sender = responseText.substring(nextLineIndex).trim();
    }
  }
  
  // If sender wasn't extracted properly, create a default one
  if (!sender) {
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
    
    const refNumber = `REF: ${report.projectDetails.projectName.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    sender = `[NAME]\n[POSITION]\n[COMPANY]\n${refNumber}\nDate: ${formattedDate}`;
  }
  
  return {
    to,
    subject,
    greeting,
    body,
    closing,
    sender
  };
}

function extractLetterPart(text, startMarker, endMarker) {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return "";
  
  const endIndex = text.indexOf(endMarker, startIndex);
  if (endIndex === -1) return "";
  
  return text.substring(startIndex + startMarker.length, endIndex).trim();
}

function getDraftRecipient(role) {
  if (role.includes('Client') || role.includes('Employer')) {
    return 'The Contractor';
  } else if (role.includes('Contractor')) {
    return 'The Employer/Client';
  } else if (role.includes('Sub-contractor')) {
    return 'The Main Contractor';
  } else if (role.includes('Contract Administrator') || role.includes('Architect')) {
    return 'The Relevant Party';
  }
  return 'The Contract Administrator';
}