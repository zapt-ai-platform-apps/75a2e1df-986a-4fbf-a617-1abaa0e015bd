import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // Consent state
  const [hasConsented, setHasConsented] = useState(false);
  
  // Project details state
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    projectDescription: '',
    contractType: '',
    organizationRole: '',
    issues: [{ description: '', actionsTaken: '' }]
  });
  
  // Generated report state
  const [report, setReport] = useState(null);
  const [draftCommunication, setDraftCommunication] = useState(null);
  const [shouldGenerateLetter, setShouldGenerateLetter] = useState(null);
  
  // Saved reports
  const [savedReports, setSavedReports] = useState(() => {
    try {
      const saved = localStorage.getItem('savedReports');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error loading saved reports:', error);
      return [];
    }
  });

  // Save reports to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error saving reports to localStorage:', error);
    }
  }, [savedReports]);
  
  // Provide consent management
  const giveConsent = () => setHasConsented(true);
  const revokeConsent = () => setHasConsented(false);
  
  // Update project details
  const updateProjectDetails = (details) => {
    setProjectDetails(prev => ({ ...prev, ...details }));
  };
  
  // Add a new issue to the project
  const addIssue = () => {
    setProjectDetails(prev => ({
      ...prev,
      issues: [...prev.issues, { description: '', actionsTaken: '' }]
    }));
  };
  
  // Update a specific issue
  const updateIssue = (index, field, value) => {
    setProjectDetails(prev => {
      const updatedIssues = [...prev.issues];
      updatedIssues[index] = { 
        ...updatedIssues[index], 
        [field]: value 
      };
      return { ...prev, issues: updatedIssues };
    });
  };
  
  // Remove an issue
  const removeIssue = (index) => {
    setProjectDetails(prev => {
      const updatedIssues = prev.issues.filter((_, i) => i !== index);
      return { ...prev, issues: updatedIssues };
    });
  };
  
  // Generate report
  const generateReport = async () => {
    try {
      // This would typically be an API call to a backend service
      // For demonstration purposes, we'll simulate the report generation
      console.log('Generating report for:', projectDetails);
      
      // Simulate report generation
      const generatedReport = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        projectDetails: { ...projectDetails },
        analysis: projectDetails.issues.map(issue => {
          const relevantClauses = generateRelevantClauses(projectDetails.contractType, issue.description);
          const recommendations = generateRecommendations(projectDetails.contractType, projectDetails.organizationRole, issue.description);
          
          // Generate more detailed analysis
          return {
            issue: issue.description,
            actionsTaken: issue.actionsTaken,
            detailedAnalysis: generateDetailedAnalysis(issue.description, projectDetails.contractType, projectDetails.organizationRole),
            legalContext: generateLegalContext(projectDetails.contractType, issue.description),
            relevantClauses: relevantClauses,
            clauseExplanations: generateClauseExplanations(relevantClauses, projectDetails.contractType),
            recommendations: recommendations,
            potentialOutcomes: generatePotentialOutcomes(issue.description, projectDetails.contractType, projectDetails.organizationRole),
            timelineSuggestions: generateTimelineSuggestions(issue.description),
            riskAssessment: generateRiskAssessment(issue.description, projectDetails.contractType, projectDetails.organizationRole)
          };
        }),
      };
      
      setReport(generatedReport);
      
      return generatedReport;
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error generating report:', error);
      throw error;
    }
  };
  
  // Generate draft communication
  const generateDraftCommunication = (reportData) => {
    try {
      // Determine the appropriate recipient and format
      const recipientRole = getDraftRecipient(projectDetails.organizationRole);
      const formattedDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', 
        month: 'long', 
        year: 'numeric'
      });
      
      // Ref number based on project name and date
      const refNumber = `REF: ${projectDetails.projectName.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      // Create a professional salutation
      let salutation = '';
      if (recipientRole.includes('Contract Administrator') || recipientRole.includes('Architect')) {
        salutation = `Dear ${recipientRole},`;
      } else {
        salutation = "Dear Sir/Madam,";
      }

      // Build a professional opening paragraph
      let opening = `Re: ${projectDetails.projectName} - ${projectDetails.contractType}\n\n`;
      opening += `I am writing to you in my capacity as ${projectDetails.organizationRole} in connection with the above-referenced project. `;
      
      if (reportData.analysis.length === 1) {
        opening += `I wish to formally raise the following contractual matter that requires your attention and resolution in accordance with the contract.`;
      } else {
        opening += `I wish to formally raise the following contractual matters that require your attention and resolution in accordance with the contract.`;
      }

      // Generate a detailed body with precise contractual references
      let body = `\n\n`;
      
      // Add each issue with proper formatting
      reportData.analysis.forEach((analysis, index) => {
        // Use proper heading formatting instead of asterisks
        body += `Issue ${index + 1}: ${analysis.issue}\n\n`;
        
        // Reference to relevant contract clauses
        if (analysis.relevantClauses && analysis.relevantClauses.length > 0) {
          body += `In accordance with ${analysis.relevantClauses.join(', ')} of the contract, `;
        }
        
        // Include actions taken if any
        if (analysis.actionsTaken && analysis.actionsTaken.trim()) {
          body += `we have already undertaken the following actions: ${analysis.actionsTaken}. `;
        }
        
        // Add a short version of the detailed analysis
        if (analysis.detailedAnalysis) {
          const summarizedAnalysis = analysis.detailedAnalysis.split('.')[0] + '.';
          body += `${summarizedAnalysis} `;
        }
        
        // Convert to direct address format and add specific recommendation from the analysis
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          // Create a professional, directly addressed recommendation
          let recommendation = analysis.recommendations[0];
          
          // Replace third-person references with direct address
          recommendation = recommendation
            .replace(/For your specific issue, /g, '')
            .replace(/the contractor's/gi, 'your')
            .replace(/contractor /gi, 'you ')
            .replace(/the employer's/gi, 'our')
            .replace(/employer /gi, 'we ')
            .replace(/submit/gi, 'please submit')
            .replace(/ensure/gi, 'please ensure')
            .replace(/implement/gi, 'please implement')
            .replace(/document/gi, 'please document')
            .replace(/compile/gi, 'please compile')
            .replace(/maintain/gi, 'please maintain');
          
          body += `\n\nWe request that ${recommendation} `;
          
          if (analysis.recommendations.length > 1) {
            // Convert second recommendation to direct address format
            let secondRecommendation = analysis.recommendations[1]
              .replace(/For your specific issue, /g, '')
              .replace(/the contractor's/gi, 'your')
              .replace(/contractor /gi, 'you ')
              .replace(/the employer's/gi, 'our')
              .replace(/employer /gi, 'we ')
              .replace(/submit/gi, 'please submit')
              .replace(/ensure/gi, 'please ensure')
              .replace(/implement/gi, 'please implement')
              .replace(/document/gi, 'please document')
              .replace(/compile/gi, 'please compile')
              .replace(/maintain/gi, 'please maintain');
              
            body += `Additionally, we ask that ${secondRecommendation} `;
          }
        }
        
        // Reference timeframe if available
        if (analysis.timelineSuggestions) {
          const timeMatch = analysis.timelineSuggestions.match(/Within (\d+)(-\d+)? days/i);
          if (timeMatch) {
            body += `\n\nIn accordance with contractual timeframes, we request your response within ${timeMatch[1].toLowerCase()} days of receipt of this communication. `;
          } else {
            body += `\n\nWe request your prompt attention to this matter in accordance with the contractual requirements. `;
          }
        } else {
          body += `\n\nWe request your prompt attention to this matter in accordance with the contractual requirements. `;
        }
        
        body += `\n\n`;
      });
      
      // Add a professional closing paragraph
      let closing = `Should you require any further information or clarification on the above matters, please do not hesitate to contact me. `;
      closing += `I look forward to your response and to resolving these issues in a timely and amicable manner in accordance with the contract.\n\n`;
      closing += `This letter is sent without prejudice to any other rights or remedies available under the contract or at law.`;
      
      // Full signature block
      const sender = `Yours faithfully,\n\n[NAME]\n[POSITION]\n[COMPANY]\n${refNumber}\nDate: ${formattedDate}`;
      
      // Create the full draft communication
      const draft = {
        to: recipientRole,
        subject: `${projectDetails.projectName} - ${projectDetails.contractType} - Contract Notice`,
        greeting: salutation,
        body: opening + body + closing,
        closing: "",
        sender: sender
      };
      
      setDraftCommunication(draft);
      return draft;
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error generating draft communication:', error);
      return null;
    }
  };
  
  // Save current report
  const saveCurrentReport = () => {
    if (!report) return;
    
    setSavedReports(prev => {
      // Check if report with same ID already exists
      const exists = prev.some(r => r.id === report.id);
      if (exists) {
        // Update existing report
        return prev.map(r => r.id === report.id ? report : r);
      } else {
        // Add new report
        return [...prev, report];
      }
    });
  };
  
  // Delete a saved report
  const deleteSavedReport = (reportId) => {
    setSavedReports(prev => prev.filter(r => r.id !== reportId));
  };
  
  // Helper functions for detailed report generation
  function generateDetailedAnalysis(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let analysis = "";
    
    // Payment issues analysis - focused specifically on the issue
    if (issueKeywords.includes('payment')) {
      analysis = "Based on the specific payment issue you've described, this analysis focuses on the relevant payment mechanisms and your rights in this particular situation:";
      
      if (issueKeywords.includes('late')) {
        analysis += "\n\nYour issue concerns late payment contrary to the contractual payment terms. This specific situation triggers applicable provisions in your contract and statutory frameworks that provide a remedy for late payment.";
      } 
      else if (issueKeywords.includes('certif')) {
        analysis += "\n\nYour issue involves challenges with the certification process for payment. This specific concern relates to the contractual certification procedure, including what constitutes a valid application, who should issue certificates, timeframes for certification, and the consequences of failure to certify correctly in your situation.";
      }
      else if (issueKeywords.includes('retention')) {
        analysis += "\n\nYour specific issue relates to retention monies. Based on your description, this concerns the contractual mechanism whereby a percentage of payment is withheld to protect against defects.";
      }
      else if (issueKeywords.includes('final account')) {
        analysis += "\n\nYour issue specifically concerns disputes over the final account settlement. This involves the consolidation of all financial adjustments made during your project including variations, extensions of time with associated costs, fluctuations, and other claims relevant to your situation.";
      }
      else {
        analysis += "\n\nYour issue relates to a payment dispute under the contract. Based on your description, this involves disagreements over payment provisions that are specific to your situation.";
      }
      
      analysis += "\n\n";
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "As a " + role + " in this specific situation, your payment rights are governed by the express terms of your contract and the implied terms from applicable legislation. For your particular issue, the Housing Grants, Construction and Regeneration Act 1996 (as amended) provides specific protection regarding payment terms, notice requirements, and the right to refer disputes to adjudication that applies directly to your circumstances.";
        
        if (contractType.includes('JCT')) {
          analysis += " In your JCT contract, the relevant payment provisions for your specific issue are typically found in clauses 4.8-4.13, which specify the application procedures, certification timeframes, and process for challenging valuations through appropriate notices that apply to your situation.";
        } else if (contractType.includes('NEC')) {
          analysis += " In your NEC contract, the payment provisions relevant to your specific issue are primarily addressed in clause 50 (assessment) and clause 51 (payment), with procedures for assessment and certification that apply directly to your situation.";
        }
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "As the " + role + " in this specific situation, your payment obligations are defined within your contract terms. For this particular issue, you have responsibility to make payment within the contractually or statutorily defined period following either certification or a valid application (depending on your contract provisions).";
        
        if (contractType.includes('JCT')) {
          analysis += " In your JCT contract, your payment responsibilities include issuing Payment Notices and Pay Less Notices within statutory timeframes if you intend to pay less than the notified sum, with specific requirements for the content of such notices to be valid in your situation.";
        } else if (contractType.includes('NEC')) {
          analysis += " Under your NEC contract, for this specific issue you must ensure proper certification procedures are followed, with the Project Manager's assessments being made objectively and in accordance with the contract, as failure to do so in your situation could constitute a compensation event.";
        }
      }
      else {
        analysis += "Your role as " + role + " in this specific situation requires understanding of the payment provisions within your contract. For this particular issue, you should ensure that proper procedures are followed for applications, certifications, and payments to address the specific concern raised.";
      }
    } 
    // Delay issues analysis - focused on the specific issue
    else if (issueKeywords.includes('delay')) {
      analysis = "Based on the specific delay issue you've described, this analysis focuses on the relevant time-related provisions in your contract:";
      
      if (issueKeywords.includes('extension') || issueKeywords.includes('eot')) {
        analysis += "\n\nYour specific issue concerns claims for extension of time under the contract. For this particular situation, the extension of time provisions allocate the risk of delay between the parties and provide a mechanism for adjusting the contractual completion date that applies to your circumstances.";
      }
      else if (issueKeywords.includes('liquidated') || issueKeywords.includes('lad') || issueKeywords.includes('damages')) {
        analysis += "\n\nYour specific issue concerns liquidated damages. In your situation, these are the pre-agreed sums that the employer can deduct for late completion, representing a genuine pre-estimate of the employer's loss due to delayed completion.";
      }
      else if (issueKeywords.includes('concurrent')) {
        analysis += "\n\nYour specific issue involves concurrent delays, which in your situation occur when two or more delay events happen simultaneously, with at least one being the contractor's risk and one being the employer's risk. The treatment of these concurrent delays in your situation depends on the specific provisions in your contract.";
      }
      else if (issueKeywords.includes('acceleration')) {
        analysis += "\n\nYour specific issue relates to acceleration measures to mitigate delays. In your situation, this involves increasing resources or adjusting methods to complete works earlier than would otherwise be possible, which may be instructed formally or undertaken constructively in response to a failure to grant appropriate extensions of time.";
      }
      else {
        analysis += "\n\nYour specific issue concerns delay-related matters affecting the project timeline. Based on your description, this involves questions about causes of delay, responsibility allocation, entitlement to additional time, and potential financial implications specific to your situation.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        analysis += "Under your JCT contract, the extension of time mechanism operates through 'Relevant Events' (typically found in clauses 2.26-2.29), which define the circumstances in which the contractor may be entitled to additional time in your specific situation. Meanwhile, 'Relevant Matters' (typically in clauses 4.21-4.22) define circumstances where the contractor may additionally be entitled to loss and expense in your case.";
        
        if (issueKeywords.includes('notice')) {
          analysis += " For your specific situation, the JCT requires the contractor to give notice 'forthwith' when it becomes reasonably apparent that progress is being or is likely to be delayed, providing details of the cause and expected effects. In your case, notice requirements are particularly relevant to preserving entitlement.";
        }
      } 
      else if (contractType.includes('NEC')) {
        analysis += "In your NEC contract, delays are addressed through the Early Warning and Compensation Event mechanisms that apply to your specific situation. For your issue, Clause 61.3 requires the Contractor to notify a compensation event within 8 weeks of becoming aware of the event, with assessment principles in clause 63 requiring a prospective analysis using the Accepted Programme.";
        
        if (issueKeywords.includes('early warning')) {
          analysis += " For your specific issue, the Early Warning procedure (clause 15) is particularly important, as it encourages proactive identification and mitigation of potential issues. In your situation, while failure to give an Early Warning does not preclude entitlement to a Compensation Event, it may reduce the amount due if early notification would have reduced the impact.";
        }
      }
      else {
        analysis += "For your specific delay issue, the relevant contract terms governing delay events, notification requirements, and extension of time entitlements should be carefully reviewed. Key considerations for your situation include: the contractual definition of the completion date; the specific events that entitle the contractor to extension of time; notification requirements and timeframes; and the method of delay analysis prescribed by your contract.";
      }
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + " in this specific situation, your primary responsibilities include proper programming, timely notification of delay events, maintenance of records to evidence both cause and effect of delays, and submission of substantiated extension of time claims in accordance with your contract procedures. For your particular issue, compliance with contractual notification procedures is especially important.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + " in this specific situation, you must ensure that extension of time claims are assessed fairly and in accordance with your contract. For your particular issue, this includes reviewing submitted claims promptly, considering the evidence presented, and making determinations within the timeframes specified in your contract.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + " for this specific situation, you have a duty to administer the contract impartially when assessing delay claims. For your particular issue, this involves objectively evaluating the evidence presented, considering the contractual entitlements, and making determinations in accordance with the contract within the specified timeframes.";
      }
    } 
    // Variation issues analysis - focused on the specific issue
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change') || issueKeywords.includes('extra work')) {
      analysis = "Based on the specific variation issue you've described, this analysis focuses on the relevant change provisions in your contract:";
      
      if (issueKeywords.includes('valuation')) {
        analysis += "\n\nYour specific issue concerns the valuation of variations. For your particular situation, your contract likely provides a hierarchy of methods for valuing variations that applies to your circumstances.";
      }
      else if (issueKeywords.includes('instruct') || issueKeywords.includes('authoriz') || issueKeywords.includes('authoris')) {
        analysis += "\n\nYour specific issue concerns the proper instruction or authorization of variations. For your particular situation, your contract specifies who has authority to instruct variations and the required format of such instructions that applies to your circumstances.";
      }
      else if (issueKeywords.includes('omission')) {
        analysis += "\n\nYour specific issue relates to omissions from the original scope of work. For your particular situation, there may be restrictions in your contract regarding omissions, particularly if the work is omitted to be given to another contractor or if the omission substantially changes the nature of the contract.";
      }
      else if (issueKeywords.includes('design') || issueKeywords.includes('specification')) {
        analysis += "\n\nYour specific issue involves design development or specification changes. For your particular situation, it's important to distinguish between design development (which may fall within the contractor's original obligations, particularly in design and build contracts) and genuine variations that change the employer's requirements.";
      }
      else {
        analysis += "\n\nYour specific issue relates to changes to the originally agreed scope of work. Based on your description, this involves variations resulting from specific factors in your project that necessitate deviation from the original contract documents.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        analysis += "Your JCT contract handles variations through the Architect's/Contract Administrator's Instructions mechanism. For your specific issue, the provisions in section 3.14-3.17 define what constitutes a valid variation instruction, the contractor's right to reasonable objection, and the valuation rules applying to variations in your situation.";
        
        if (issueKeywords.includes('valuation')) {
          analysis += " For your specific valuation issue, the rules in your JCT contract (typically clause 5.6-5.9) provide a hierarchy of methods for valuing variations that applies to your situation.";
        }
      } 
      else if (contractType.includes('NEC')) {
        analysis += "Your NEC contract manages variations through the Compensation Event mechanism. For your specific issue, this provides a structured process for instructing changes (clause 60.1(1)) and evaluating their impact on both time and cost that applies to your situation.";
        
        if (issueKeywords.includes('quotation')) {
          analysis += " For your specific issue, the quotation process for compensation events (clause 62) requires the Contractor to submit quotations showing the time and cost impact. In your situation, the assessment based on the effect on Defined Cost plus Fee is particularly relevant.";
        }
      }
      else {
        analysis += "For your specific variation issue, the relevant provisions within your contract should be carefully reviewed. Key considerations for your situation include: who has authority to instruct variations; the required format of variation instructions; any limitations on the scope of permitted variations; notification and quotation requirements; and valuation methodologies.";
      }
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + " in this specific situation, you should ensure that you only proceed with varied work where there is proper instruction in accordance with your contract. For your particular issue, contemporaneous records of variations are essential, including details of additional resources, time impact, and costs specific to your situation.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + " in this specific situation, you should ensure that variations are properly instructed through authorized representatives and in accordance with contractual procedures. For your particular issue, clear scope definition and agreement on cost and time implications before work proceeds can help minimize disputes.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + " for this specific situation, you have specific powers and duties regarding variations. For your particular issue, these typically include the authority to issue variation instructions, obligation to value variations fairly in accordance with the contract, and responsibility to assess time implications.";
      }
    } 
    // Design issues analysis - focused on the specific issue
    else if (issueKeywords.includes('design') || issueKeywords.includes('specification') || issueKeywords.includes('drawing')) {
      analysis = "Based on the specific design issue you've described, this analysis focuses on the relevant design responsibilities and information provisions in your contract:";
      
      if (issueKeywords.includes('error') || issueKeywords.includes('mistake') || issueKeywords.includes('incorrect')) {
        analysis += "\n\nYour specific issue concerns errors or inadequacies in the design information. For your particular situation, the contractual and legal consequences depend on design responsibility allocation and the standard of care applicable to design obligations in your contract.";
      }
      else if (issueKeywords.includes('coordination')) {
        analysis += "\n\nYour specific issue relates to coordination between different design elements. For your particular situation, design coordination responsibilities should be defined in your contract, particularly if design responsibility is shared between multiple parties.";
      }
      else if (issueKeywords.includes('information') || issueKeywords.includes('drawing') || issueKeywords.includes('detail')) {
        analysis += "\n\nYour specific issue involves the provision or adequacy of design information. For your particular situation, your contract likely specifies timeframes for information release and procedures for requesting additional information that applies to your circumstances.";
      }
      else {
        analysis += "\n\nYour specific issue relates to design matters affecting the project. Based on your description, the allocation of design responsibility is particularly relevant to your situation and has implications for risk allocation, standard of care, and liability.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        if (contractType.includes('Design and Build')) {
          analysis += "Under your JCT Design and Build Contract, the Contractor assumes responsibility for completing the design (clause 2.1). For your specific issue, the standard of care applicable to this design obligation is particularly relevant, as is any design submission procedure and employer's approval specified in your contract.";
        } else {
          analysis += "In your traditional JCT contract, design responsibility typically remains with the Employer and the design team. For your specific issue, the Information Release Schedule (where included) establishes the timetable for provision of information relevant to your situation.";
        }
      } 
      else if (contractType.includes('NEC')) {
        if (contractType.includes('Option X15')) {
          analysis += "In your NEC contract with Option X15 (Design Limitation), the Contractor's liability for design is limited to reasonable skill and care rather than a stricter 'fitness for purpose' obligation. For your specific issue, the scope of the Contractor's design responsibilities as defined in the Works Information/Scope is particularly relevant.";
        } else {
          analysis += "In your NEC contract, the allocation of design responsibility should be defined in the Works Information/Scope. For your specific issue, if the Contractor has design responsibility, they typically warrant that the works will be fit for the purpose specified, unless limited by incorporation of Option X15.";
        }
      }
      else {
        analysis += "For your specific design issue, the relevant provisions governing design responsibility in your contract should be carefully reviewed. Key considerations for your situation include: the explicit allocation of design responsibility; the standard of care applicable to design obligations; any design submission and approval procedures; and the process for handling design changes.";
      }
      
      if (role.includes('Contractor') && (contractType.includes('Design and Build') || issueKeywords.includes('contractor design'))) {
        analysis += "\n\nAs a Contractor with design responsibilities in this specific situation, you should ensure that your design complies with the contractual requirements and applicable standard of care. For your particular issue, professional indemnity insurance and careful review of employer's requirements and site constraints are particularly relevant.";
      } 
      else if (role.includes('Contractor') && !contractType.includes('Design and Build')) {
        analysis += "\n\nAs a Contractor in a traditional contract facing this specific situation, you should promptly notify any discrepancies or inadequacies in the design information provided. For your particular issue, requests for information should be made in accordance with contractual procedures and timeframes, and detailed records should be maintained.";
      }
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + " in this specific situation, your responsibilities regarding design information depend on the procurement route. For your particular issue, in a traditional contract you are responsible for providing adequate and timely design information, while in a design and build contract you must provide clear employer's requirements.";
      }
      else if (role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + " for this specific situation, you have professional obligations regarding design adequacy and coordination. For your particular issue, the standard of care applicable is to exercise reasonable skill and care expected of a competent member of your profession.";
      }
    }
    // Quality/defects issues analysis - focused on the specific issue
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality') || issueKeywords.includes('workmanship')) {
      analysis = "Based on the specific quality/defect issue you've described, this analysis focuses on the relevant quality standards and defects provisions in your contract:";
      
      if (issueKeywords.includes('rectif') || issueKeywords.includes('repair') || issueKeywords.includes('remed')) {
        analysis += "\n\nYour specific issue concerns the rectification of defects in the works. For your particular situation, your contract contains provisions requiring the contractor to remedy defects identified during the works, at practical completion, or during a defects liability period.";
      }
      else if (issueKeywords.includes('reject') || issueKeywords.includes('remov')) {
        analysis += "\n\nYour specific issue involves rejected work or materials that do not comply with contractual requirements. For your particular situation, your contract typically gives the contract administrator power to reject non-compliant work and require its removal or replacement.";
      }
      else if (issueKeywords.includes('practical completion') || issueKeywords.includes('substantial completion')) {
        analysis += "\n\nYour specific issue relates to practical completion certification. For your particular situation, the standard for practical completion typically requires completion of the works without defects, other than minor defects that do not prevent the works from being used for their intended purpose.";
      }
      else {
        analysis += "\n\nYour specific issue relates to quality matters affecting the project. Based on your description, your contract typically requires work to be completed in accordance with the specification, in a proper and workmanlike manner, using materials of the quality and standards described in the contract documents.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        analysis += "Your JCT contract contains specific provisions regarding quality and defects that apply to your situation. For your specific issue, Clause 2.1 typically requires the Contractor to carry out and complete the works in accordance with the Contract Documents, statutory requirements, and instructions. Clause 3.18 gives the Architect/Contract Administrator power to issue instructions requiring the removal of non-compliant work and materials.";
        
        if (issueKeywords.includes('practical completion')) {
          analysis += " For your particular issue concerning practical completion, your JCT contract generally requires the works to be complete for all practical purposes, capable of being occupied and used for their intended purpose, with only minor items outstanding that can be completed without significant disruption.";
        }
      } 
      else if (contractType.includes('NEC')) {
        analysis += "Your NEC contract addresses quality through the concept of 'Defects'. For your specific issue, a Defect is defined as part of the works not in accordance with the Works Information/Scope or applicable law. Clause 43 requires the Contractor and Project Manager to notify each other of Defects they find, with the Supervisor also empowered to identify Defects under clause 42.";
        
        if (issueKeywords.includes('completion')) {
          analysis += " For your particular issue concerning completion, your NEC contract requires the Contractor to have done all the work that the Works Information/Scope states they are to do by the Completion Date and to have corrected notified Defects that would prevent the Employer from using the works.";
        }
      }
      else {
        analysis += "For your specific quality/defect issue, the relevant provisions governing quality and defects in your contract should be carefully reviewed. Key considerations for your situation include: the defined quality standards and testing procedures; the process for identifying and notifying defects; the contractor's obligation to rectify defects and the timeframe for doing so; and any limitations on liability for defects.";
      }
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + " in this specific situation, you have primary responsibility for ensuring that work complies with the contractual requirements and is free from defects. For your particular issue, implementing appropriate quality control procedures, ensuring proper supervision, and promptly addressing any defects identified are especially relevant.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + " in this specific situation, you are entitled to works that comply with the contractual requirements. For your particular issue, ensuring that defects are properly notified in accordance with the contract and that any remedial works are adequately supervised is especially important.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + " for this specific situation, you have specific responsibilities regarding quality control and defects management. For your particular issue, these typically include inspecting the works, identifying defects, issuing instructions for remedial work, and determining whether practical completion has been achieved.";
      }
    }
    // Contract interpretation for specific issue at hand
    else {
      analysis = "Based on the specific contractual issue you've described, this analysis focuses on the relevant interpretative principles and provisions that apply to your situation:";
      
      analysis += "\n\nYour specific issue involves matters of contract interpretation and implementation that require careful analysis of the particular terms and conditions in your agreement that are relevant to your situation. For your particular issue, the following interpretative principles are most relevant:";
      
      analysis += "\n\n• The objective approach - focusing on what a reasonable person with the background knowledge available to the parties would understand the relevant contract terms to mean;";
      analysis += "\n• The whole agreement approach - reading the relevant provisions as part of the entire contract rather than in isolation;";
      analysis += "\n• The business efficacy principle - favoring interpretations that give commercial sense to the agreement in your specific circumstances.";
      
      if (contractType.includes('JCT') || contractType.includes('NEC') || contractType.includes('FIDIC')) {
        analysis += `\n\nYour ${contractType} has established interpretations through case law and industry practice that are relevant to your specific issue. When addressing your particular concern, these established interpretations provide guidance on how the relevant provisions should be applied to your situation.`;
      } else {
        analysis += "\n\nYour bespoke contract should be interpreted according to its specific drafting and the circumstances of your project, with particular focus on the provisions most relevant to your issue.";
      }
      
      analysis += "\n\nFor your specific contractual issue, key areas to consider include:";
      analysis += "\n\n• The hierarchy of contract documents and how conflicts between different documents are resolved in relation to your specific issue;";
      analysis += "\n• Any specifically negotiated amendments to standard terms that are relevant to your issue;";
      analysis += "\n• The objective of the relevant provisions and what they were intended to achieve in circumstances like yours;";
      analysis += "\n• The conduct of the parties to date in relation to your specific issue and whether this establishes a pattern of interpretation.";
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + " facing this specific issue, you should review the contract provisions directly relevant to your concern, gather supporting documentation that evidences your interpretation, and present your position clearly with reference to the specific contract terms that apply to your situation.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + " facing this specific issue, you should ensure that your interpretation of the contract is consistent with both the specific wording of the relevant provisions and the overall scheme of the agreement. For your particular issue, contemporaneous records of discussions during contract formation may provide important context.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + " addressing this specific issue, you may be required to make determinations that involve interpreting the relevant contract provisions. For your particular issue, these determinations should be made impartially, based on a reasonable interpretation of the contract in its commercial context.";
      }
    }
    
    return analysis;
  }
  
  function generateLegalContext(contractType, issueDescription) {
    const issueKeywords = issueDescription.toLowerCase();
    let context = "LEGAL FRAMEWORK DIRECTLY RELEVANT TO YOUR ISSUE:";
    
    // Contractual framework - focused on the specific contract
    if (contractType.includes('JCT') || contractType.includes('NEC') || contractType.includes('FIDIC')) {
      context += `\n\n• Your ${contractType} Contract: This forms the primary legal basis for resolving your specific dispute. The specific clauses identified above establish the parties' respective rights and obligations directly relevant to your issue, the procedures for addressing this particular matter, and the remedies available in your situation.`;
    } else {
      context += "\n\n• Your Specific Contract Agreement: This forms the primary legal basis for resolving your specific dispute. The specific clauses relevant to your issue establish the rights and obligations that apply directly to your situation, the procedures for addressing your particular issue, and the remedies available to you.";
    }
    
    // Issue-specific legislation - only include what's directly relevant
    if (issueKeywords.includes('payment')) {
      context += "\n\n• The Housing Grants, Construction and Regeneration Act 1996 (as amended): For your specific payment issue, this legislation provides statutory rights that apply regardless of your contract terms, including:";
      context += "\n   - Specific requirements for payment mechanisms and notice provisions that apply to your situation";
      context += "\n   - The right to refer your specific dispute to adjudication";
      context += "\n   - The right to suspend performance for non-payment following proper notice if applicable to your situation";
      
      context += "\n\n• The Late Payment of Commercial Debts (Interest) Act 1998: For your specific payment issue, this legislation provides a statutory entitlement to interest on late payments at 8% above the Bank of England base rate, plus potential recovery of costs associated with pursuing payment.";
      
      context += "\n\n• Part II of the Construction Act (Sections 109-113): For your specific payment issue, these sections address:";
      context += "\n   - Requirements for an adequate mechanism for determining what payments become due and when";
      context += "\n   - The requirement for a final date for payment";
      context += "\n   - Provision for notices of intention to withhold payment ('Pay Less Notices')";
      
      // Payment-specific case law
      context += "\n\n• Relevant Case Law: For your specific payment issue, the following cases establish important legal principles that may apply:";
      context += "\n   - S&T (UK) Ltd v Grove Developments Ltd [2018] EWCA Civ 2448: Establishing the importance of valid payment and pay less notices";
      if (issueKeywords.includes('notice') || issueKeywords.includes('notif')) {
        context += "\n   - ISG Construction Ltd v Seevic College [2014] EWHC 4007 (TCC): Highlighting the consequences of failing to issue payment notices";
        context += "\n   - Henia Investments Inc v Beck Interiors Ltd [2015] EWHC 2433 (TCC): Addressing the requirements for a valid payment application";
      }
    }
    
    else if (issueKeywords.includes('delay') || issueKeywords.includes('extension')) {
      context += "\n\n• The Housing Grants, Construction and Regeneration Act 1996: For your specific delay issue, this legislation provides the right to refer your dispute to adjudication at any time, which could be relevant if your extension of time claim remains unresolved.";
      
      // Delay-specific case law
      context += "\n\n• Relevant Case Law: For your specific delay issue, the following cases establish important legal principles that may apply:";
      context += "\n   - Walter Lilly & Co Ltd v Mackay [2012] EWHC 1773 (TCC): Providing guidance on extension of time claims and concurrent delay";
      
      if (issueKeywords.includes('concurrent')) {
        context += "\n   - North Midland Building Ltd v Cyden Homes Ltd [2018] EWCA Civ 1744: Establishing that parties can allocate the risk of concurrent delay through express contractual provisions";
      }
      
      if (issueKeywords.includes('global claim') || issueKeywords.includes('global')) {
        context += "\n   - Multiplex Construction (UK) Ltd v Honeywell Control Systems Ltd [2007] EWHC 447 (TCC): Addressing global claims and the burden of proof in delay claims";
      }
    }
    
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      context += "\n\n• The Housing Grants, Construction and Regeneration Act 1996: For your specific variation issue, this legislation provides the right to refer your dispute to adjudication at any time, which could be relevant if your variation claim remains unresolved.";
      
      context += "\n\n• Common Law Principles Regarding Variations: For your specific variation issue, these principles establish that:";
      context += "\n   - Variations must be instructed in accordance with the contract to be valid";
      context += "\n   - The scope of permitted variations may be limited to changes of a similar nature and scale to the original works";
      
      // Variation-specific case law
      context += "\n\n• Relevant Case Law: For your specific variation issue, the following cases establish important legal principles that may apply:";
      
      if (issueKeywords.includes('verbal') || issueKeywords.includes('instruct') || issueKeywords.includes('authoriz') || issueKeywords.includes('authoris')) {
        context += "\n   - Blue v Ashley [2017] EWHC 1928 (Comm): Emphasizing the importance of following contractual variation procedures";
        context += "\n   - RTS Flexible Systems Ltd v Molkerei Alois Müller GmbH [2010] UKSC 14: Addressing when work proceeds before formal contract execution";
      }
      
      if (issueKeywords.includes('valuation')) {
        context += "\n   - Henry Boot Construction Ltd v Alstom Combined Cycles Ltd [2005] EWCA Civ 814: Addressing the valuation of variations where the contract provides a specific mechanism";
      }
    }
    
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      if (issueKeywords.includes('dwelling') || issueKeywords.includes('residential') || issueKeywords.includes('house')) {
        context += "\n\n• The Defective Premises Act 1972: For your specific quality issue involving a dwelling, Section 1 imposes a duty to ensure the work is done in a workmanlike or professional manner, with proper materials, and that the dwelling is fit for habitation when completed.";
      }
      
      context += "\n\n• The Building Act 1984 and Building Regulations: For your specific quality issue, these establish minimum technical standards for design and construction that may be relevant to determining what constitutes defective work in your situation.";
      
      context += "\n\n• The Supply of Goods and Services Act 1982: For your specific quality issue, this implies terms that services will be carried out with reasonable care and skill, within a reasonable time, and for a reasonable charge, which may be relevant to quality standards in your situation.";
      
      // Defects-specific case law
      context += "\n\n• Relevant Case Law: For your specific quality issue, the following cases establish important legal principles that may apply:";
      
      if (issueKeywords.includes('design') || issueKeywords.includes('specification')) {
        context += "\n   - MT Højgaard A/S v E.ON Climate & Renewables UK Robin Rigg East Ltd [2017] UKSC 59: Addressing fitness for purpose obligations in construction contracts";
      }
      
      if (issueKeywords.includes('rectif') || issueKeywords.includes('repair') || issueKeywords.includes('remed')) {
        context += "\n   - McGlinn v Waltham Contractors Ltd [2007] EWHC 149 (TCC): Providing guidance on the assessment of damages for defective work";
      }
      
      if (issueKeywords.includes('limitation') || issueKeywords.includes('liability')) {
        context += "\n   - Trebor Bassett Holdings Ltd v ADT Fire & Security plc [2012] EWCA Civ 1158: Addressing limitation of liability clauses in relation to defective work";
      }
    }
    
    else if (issueKeywords.includes('design')) {
      context += "\n\n• Common Law Principles Regarding Design Responsibility: For your specific design issue, these principles establish that:";
      context += "\n   - A 'reasonable skill and care' obligation is measured against the standard of a reasonably competent member of the relevant profession";
      context += "\n   - A 'fitness for purpose' obligation is stricter, requiring the design to be suitable for its intended purpose";
      
      // Design-specific case law
      context += "\n\n• Relevant Case Law: For your specific design issue, the following cases establish important legal principles that may apply:";
      context += "\n   - MT Højgaard A/S v E.ON Climate & Renewables UK Robin Rigg East Ltd [2017] UKSC 59: Addressing the distinction between 'reasonable skill and care' and 'fitness for purpose' obligations";
      
      if (contractType.includes('Design and Build') || issueKeywords.includes('contractor design')) {
        context += "\n   - SSE Generation Ltd v Hochtief Solutions AG [2018] CSIH 26: Addressing design obligations in design and build contracts";
      }
    }
    
    // For all issues - include the directly relevant dispute resolution options
    context += "\n\n• Dispute Resolution Options: For your specific issue, you have several options to resolve the dispute:";
    context += "\n   - Adjudication: A statutory right providing a 28-day procedure for an interim binding decision on your specific dispute";
    context += "\n   - Mediation: A non-binding facilitated negotiation process that may help preserve commercial relationships while resolving your specific issue";
    
    if (contractType.includes('arbitration') || issueKeywords.includes('arbitration')) {
      context += "\n   - Arbitration: If provided for in your contract, a private binding dispute resolution process for your specific issue";
    }
    
    context += "\n   - Litigation: Court proceedings, typically in the Technology and Construction Court for significant construction disputes like yours";
    
    return context;
  }
  
  function generateClauseExplanations(relevantClauses, contractType) {
    // Generate explanations for each clause - focusing specifically on how they apply to the issue
    return relevantClauses.map(clause => {
      let explanation = "";
      
      if (contractType.includes('JCT')) {
        if (clause.includes('4.8') || clause.includes('4.9') || clause.includes('4.10') || clause.includes('4.11') || clause.includes('4.12') || clause.includes('4.13')) {
          explanation = `${clause}: This provision is directly relevant to your payment issue. It establishes the payment application, certification, and payment process, including timeframes that apply specifically to your situation. For your specific issue, these clauses must be read in conjunction with the Construction Act requirements regarding payment notices and pay less notices.`;
        } 
        else if (clause.includes('2.26') || clause.includes('2.27') || clause.includes('2.28') || clause.includes('2.29')) {
          explanation = `${clause}: This clause is directly relevant to your delay issue. It defines 'Relevant Events' that entitle the contractor to additional time, the notification requirements, and the procedure for assessment that apply specifically to your situation. For your specific issue, key aspects include the contractor's notification obligations and the contract administrator's duty to make a 'fair and reasonable' assessment.`;
        } 
        else if (clause.includes('2.30') || clause.includes('2.31')) {
          explanation = `${clause}: This clause is directly relevant to your acceleration issue. It addresses acceleration of the works, which involves completing the project earlier than would otherwise be possible. For your specific situation, this clause provides for negotiations regarding a Confirmed Acceptance, which is relevant to resolving your particular issue.`;
        }
        else if (clause.includes('3.14') || clause.includes('3.15') || clause.includes('3.16')) {
          explanation = `${clause}: This provision is directly relevant to your variation issue. It establishes the contract administrator's power to issue instructions changing the works, the contractor's duty to comply, and the basis for valuation that applies specifically to your situation. For your specific issue, variations must be properly instructed in writing to create an entitlement to additional payment.`;
        } 
        else if (clause.includes('2.38') || clause.includes('2.39') || clause.includes('2.40')) {
          explanation = `${clause}: This clause is directly relevant to your defects issue. It addresses the defects liability period (or 'rectification period'), during which the contract administrator may issue instructions requiring the contractor to remedy defects at no additional cost. For your specific situation, this clause establishes rights and obligations regarding defect rectification that apply to your particular issue.`;
        }
        else if (clause.includes('4.21') || clause.includes('4.22') || clause.includes('4.23')) {
          explanation = `${clause}: This provision is directly relevant to your loss and expense issue. It governs loss and expense claims, which allow the contractor to recover additional costs caused by matters for which the employer is responsible. For your specific situation, this clause establishes the process for claiming and assessing loss and expense that applies to your particular issue.`;
        }
        else if (clause.includes('6.4') || clause.includes('6.5')) {
          explanation = `${clause}: This provision is directly relevant to your payment issue. It addresses the contractor's right to suspend performance for non-payment, a right reinforced by the Construction Act. For your specific situation, this clause establishes the notice requirements and entitlements regarding suspension that apply to your particular issue.`;
        }
        else if (clause.includes('8.9') || clause.includes('8.10') || clause.includes('8.11')) {
          explanation = `${clause}: This clause is directly relevant to your termination issue. It addresses termination rights, which allow a party to bring the contract to an end in specified circumstances. For your specific situation, this clause establishes the grounds, procedures, and consequences of termination that apply to your particular issue.`;
        }
        else {
          explanation = `${clause}: This provision in your JCT contract is directly relevant to your specific issue. It should be interpreted in the context of your particular situation and the specific facts of your case, considering the commercial purpose of the provision and how it applies to your circumstances.`;
        }
      } 
      else if (contractType.includes('NEC')) {
        if (clause.includes('10.1')) {
          explanation = `${clause}: This fundamental provision stating that the parties shall act in a 'spirit of mutual trust and co-operation' is directly relevant to your issue. For your specific situation, this obligation creates enforceable obligations of good faith that apply to how your particular issue should be approached and resolved.`;
        }
        else if (clause.includes('50') || clause.includes('51')) {
          explanation = `${clause}: This provision is directly relevant to your payment issue. It establishes the assessment cycle, items to be included in assessments, and timing for payment following assessment that apply specifically to your situation. For your specific issue, the Project Manager's obligation to make proactive assessments in accordance with the contract is particularly relevant.`;
        } 
        else if (clause.includes('60') || clause.includes('61') || clause.includes('62')) {
          explanation = `${clause}: This clause is directly relevant to your compensation event issue. It defines Compensation Events, notification requirements, and the quotation procedure that apply specifically to your situation. For your specific issue, timely notification and preparation of quotations in accordance with these provisions is critical to preserving entitlement.`;
        } 
        else if (clause.includes('63')) {
          explanation = `${clause}: This clause is directly relevant to your compensation event assessment issue. It establishes the principles for assessing Compensation Events, requiring forecasts of the effect on Defined Cost and any delay. For your specific situation, this prospective approach to assessment is particularly relevant to how your issue should be evaluated.`;
        } 
        else if (clause.includes('15')) {
          explanation = `${clause}: This provision is directly relevant to your early warning issue. It establishes the procedure requiring both parties to notify each other of matters that could increase costs, delay completion, or impair performance. For your specific situation, the Early Warning process is particularly relevant to how your issue should have been managed.`;
        }
        else if (clause.includes('30') || clause.includes('31') || clause.includes('32')) {
          explanation = `${clause}: This clause is directly relevant to your programming issue. It addresses programming requirements, including submission, content, and updating procedures. For your specific situation, the role of the Accepted Programme in assessing delays and Compensation Events is particularly relevant to resolving your issue.`;
        }
        else if (clause.includes('40') || clause.includes('41') || clause.includes('42') || clause.includes('43')) {
          explanation = `${clause}: This provision is directly relevant to your quality/defects issue. It establishes quality standards, testing procedures, identification and notification of Defects, and correction obligations that apply specifically to your situation. For your specific issue, the definition of a Defect as part of the works not in accordance with the Scope is particularly relevant.`;
        }
        else if (clause.includes('91') || clause.includes('92') || clause.includes('93')) {
          explanation = `${clause}: This clause is directly relevant to your termination issue. It specifies the grounds on which each party may terminate, the required notice procedure, and the financial consequences that apply specifically to your situation. For your specific issue, the termination grounds and procedures are particularly relevant to determining the lawfulness of the termination.`;
        }
        else {
          explanation = `${clause}: This provision in your NEC contract is directly relevant to your specific issue. It should be interpreted in accordance with NEC principles of clarity and proactive management, focusing specifically on how it applies to your particular situation and the facts of your case.`;
        }
      } 
      else if (contractType.includes('FIDIC')) {
        if (clause.includes('2.5') || clause.includes('3.5') || clause.includes('20.1')) {
          explanation = `${clause}: This provision is directly relevant to your claims issue. It establishes notification and claims procedures that are fundamental to preserving entitlements. For your specific situation, the time limits for notice (often 28 days) and the Engineer's duty to make a fair determination are particularly relevant to your issue.`;
        }
        else if (clause.includes('8.4') || clause.includes('8.5')) {
          explanation = `${clause}: This clause is directly relevant to your extension of time issue. It specifies the events that qualify for EOT and the notification and assessment procedures that apply specifically to your situation. For your specific issue, the requirements to demonstrate that a qualifying event has caused delay and to provide timely notice are particularly relevant.`;
        }
        else if (clause.includes('13.1') || clause.includes('13.2') || clause.includes('13.3')) {
          explanation = `${clause}: This provision is directly relevant to your variation issue. It establishes the Engineer's right to initiate variations, the Contractor's obligation to execute them, and the valuation methodology that apply specifically to your situation. For your specific issue, the valuation hierarchy is particularly relevant to determining the proper value of the variation.`;
        }
        else if (clause.includes('14')) {
          explanation = `${clause}: This clause is directly relevant to your payment issue. It governs the Contract Price and payment procedures, including applications, certification, timing, and consequences of late payment that apply specifically to your situation. For your specific issue, the content requirements for payment certificates and timing for payment are particularly relevant.`;
        }
        else if (clause.includes('16') || clause.includes('19')) {
          explanation = `${clause}: This provision is directly relevant to your suspension/force majeure issue. It addresses the circumstances in which the Contractor may suspend work or either party may claim relief due to exceptional events. For your specific situation, the notice requirements and entitlements are particularly relevant to resolving your issue.`;
        }
        else if (clause.includes('4.1') || clause.includes('4.2')) {
          explanation = `${clause}: This clause is directly relevant to your contractor obligations issue. It establishes the Contractor's general obligations, including the duty to execute the Works in accordance with the Contract. For your specific situation, the standard of care required and compliance obligations are particularly relevant to your issue.`;
        }
        else if (clause.includes('7') || clause.includes('9')) {
          explanation = `${clause}: This provision is directly relevant to your testing/completion issue. It deals with testing, completion, and defects liability, establishing procedures for tests, completion certificates, and defects rectification. For your specific situation, the procedures and standards for completion and defect identification are particularly relevant.`;
        }
        else {
          explanation = `${clause}: This provision in your FIDIC contract is directly relevant to your specific issue. It should be interpreted according to your contract's governing law and FIDIC principles, focusing specifically on how it applies to your particular situation and the facts of your case.`;
        }
      }
      else {
        explanation = `${clause}: This provision in your specific contract establishes important rights and obligations directly relevant to your issue. To properly apply this clause to your situation, the precise wording should be considered in the context of your specific circumstances, your contract's commercial purpose, and the particular facts of your case.`;
      }
      
      return explanation;
    });
  }
  
  function generatePotentialOutcomes(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let outcomes = "Based on your specific issue and the applicable contractual framework, potential outcomes directly relevant to your situation include:";
    
    // Payment issues outcomes - focused on the specific issue
    if (issueKeywords.includes('payment')) {
      outcomes += "\n\n1. Negotiated Resolution";
      outcomes += "\n   • A direct agreement between parties on the disputed payment based on contractual entitlements.";
      outcomes += "\n   • For your specific situation, this could involve agreement on the precise valuation or a commercial compromise.";
      
      outcomes += "\n\n2. Application of Contractual Mechanisms";
      outcomes += "\n   • Utilization of the specific payment notice procedures under your contract and the Construction Act.";
      outcomes += "\n   • For your situation, this could result in 'default payment' if proper notices were not issued.";
      
      outcomes += "\n\n3. Formal Dispute Resolution";
      outcomes += "\n   • If other approaches fail, progression to adjudication, which is particularly suitable for payment disputes.";
      outcomes += "\n   • For your specific situation, an adjudicator would determine the amount due based on your contract terms and the evidence presented.";
    } 
    // Delay issues outcomes - focused on the specific issue
    else if (issueKeywords.includes('delay')) {
      outcomes += "\n\n1. Extension of Time Award";
      outcomes += "\n   • Assessment and award of additional time to complete the works without liability for liquidated damages.";
      outcomes += "\n   • For your specific situation, this could involve full or partial extension based on your entitlement and evidence.";
      
      if (issueKeywords.includes('compensation') || issueKeywords.includes('loss') || issueKeywords.includes('expense')) {
        outcomes += "\n\n2. Financial Compensation";
        outcomes += "\n   • Recovery of financial costs associated with the delay if it is a compensable event under your contract.";
        outcomes += "\n   • For your specific situation, this could include extended preliminaries and other time-related costs.";
      }
      
      if (issueKeywords.includes('liquidated') || issueKeywords.includes('damages')) {
        outcomes += "\n\n3. Liquidated Damages Assessment";
        outcomes += "\n   • If the delay is determined to be your responsibility, application of liquidated damages at the contractual rate.";
        outcomes += "\n   • For your specific situation, this would involve deduction of the pre-agreed sum for contractor-caused delay.";
      }
      
      outcomes += "\n\n4. Formal Dispute Resolution";
      outcomes += "\n   • If agreement cannot be reached, progression to adjudication or other formal dispute resolution.";
      outcomes += "\n   • For your specific situation, this would provide an independent determination of time entitlement.";
    } 
    // Variation issues outcomes - focused on the specific issue
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      outcomes += "\n\n1. Valuation Agreement";
      outcomes += "\n   • Agreement on the value of the variation and any associated time implications.";
      outcomes += "\n   • For your specific situation, this could involve acceptance of your valuation or a negotiated sum.";
      
      if (issueKeywords.includes('instruct') || issueKeywords.includes('authoriz') || issueKeywords.includes('authoris')) {
        outcomes += "\n\n2. Disputed Instruction Status";
        outcomes += "\n   • Resolution of whether a proper variation instruction was issued for the work in question.";
        outcomes += "\n   • For your specific situation, this could involve retrospective formalization or rejection of the claim.";
      }
      
      outcomes += "\n\n3. Formal Dispute Resolution";
      outcomes += "\n   • If agreement cannot be reached, progression to adjudication or other formal dispute resolution.";
      outcomes += "\n   • For your specific situation, this would provide an independent determination on both entitlement and valuation.";
    } 
    // Quality/defects issues outcomes - focused on the specific issue
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      outcomes += "\n\n1. Remedial Works Agreement";
      outcomes += "\n   • Agreement on the scope, method, and timing of remedial works to address the identified defects.";
      outcomes += "\n   • For your specific situation, this could involve a detailed remediation plan with agreed criteria for acceptance.";
      
      outcomes += "\n\n2. Financial Adjustment";
      outcomes += "\n   • Agreement on financial compensation instead of remedial works, particularly for minor defects.";
      outcomes += "\n   • For your specific situation, this could involve a reduction in contract sum proportionate to the defect impact.";
      
      outcomes += "\n\n3. Expert Determination";
      outcomes += "\n   • Appointment of independent expert to determine technical aspects of the defects dispute.";
      outcomes += "\n   • For your specific situation, this could resolve disagreements about whether works are defective or the required remediation.";
      
      outcomes += "\n\n4. Formal Dispute Resolution";
      outcomes += "\n   • If agreement cannot be reached, progression to adjudication or other formal dispute resolution.";
      outcomes += "\n   • For your specific situation, this would provide an independent determination on defect liability and remediation.";
    }
    // Design issues outcomes - focused on the specific issue
    else if (issueKeywords.includes('design')) {
      outcomes += "\n\n1. Design Responsibility Determination";
      outcomes += "\n   • Clarification of design responsibility allocation between parties for the specific elements in question.";
      outcomes += "\n   • For your specific situation, this could resolve whether responsibility lies with employer, contractor, or design consultant.";
      
      outcomes += "\n\n2. Design Solution Agreement";
      outcomes += "\n   • Agreement on required design changes or remediation to address the identified issues.";
      outcomes += "\n   • For your specific situation, this could involve revised designs with clear approval procedures.";
      
      outcomes += "\n\n3. Cost and Time Impact Resolution";
      outcomes += "\n   • Agreement on financial and programme implications of design changes or remediation.";
      outcomes += "\n   • For your specific situation, this could involve additional payment and/or extension of time if appropriate.";
      
      outcomes += "\n\n4. Formal Dispute Resolution";
      outcomes += "\n   • If agreement cannot be reached, progression to adjudication or other formal dispute resolution.";
      outcomes += "\n   • For your specific situation, this would provide an independent determination on design liability and remediation.";
    }
    // General contractual disputes outcomes - focused on the specific issue
    else {
      outcomes += "\n\n1. Contractual Resolution Through Existing Mechanisms";
      outcomes += "\n   • Application of specific contractual procedures designed to address your particular issue.";
      outcomes += "\n   • For your specific situation, this could involve determination by the contract administrator or project manager.";
      
      outcomes += "\n\n2. Negotiated Commercial Settlement";
      outcomes += "\n   • A commercial compromise specifically addressing your issue that balances the interests of both parties.";
      outcomes += "\n   • For your specific situation, this could involve concessions on both sides to reach an acceptable resolution.";
      
      outcomes += "\n\n3. Mediation";
      outcomes += "\n   • Engagement of neutral mediator to facilitate negotiated resolution of your specific issue.";
      outcomes += "\n   • For your specific situation, this could help preserve commercial relationships while resolving the dispute.";
      
      outcomes += "\n\n4. Adjudication";
      outcomes += "\n   • Statutory 28-day dispute resolution process delivering a temporarily binding decision on your specific issue.";
      outcomes += "\n   • For your specific situation, this would provide a quick resolution while preserving rights to final determination.";
      
      outcomes += "\n\n5. Arbitration or Litigation";
      outcomes += "\n   • Final binding determination of your specific issue through arbitration or court proceedings.";
      outcomes += "\n   • For your specific situation, this would provide comprehensive legal assessment of all aspects of your dispute.";
    }
    
    return outcomes;
  }
  
  function generateTimelineSuggestions(issueDescription) {
    const issueKeywords = issueDescription.toLowerCase();
    let timeline = "Recommended timeline for addressing your specific issue:";
    
    // Payment issues timeline - focused on the specific issue
    if (issueKeywords.includes('payment')) {
      timeline += "\n\nImmediate Actions (1-3 days)";
      timeline += "\n• Review your contract payment terms and notice requirements that specifically apply to your situation.";
      timeline += "\n• Verify status of all payment applications, notices, and certificates relevant to your specific issue.";
      timeline += "\n• Compile all documentation relevant to your payment issue (applications, notices, certificates).";
      timeline += "\n• Quantify the exact amount claimed in your specific situation with supporting calculations.";
      
      timeline += "\n\nShort-Term Actions (3-7 days)";
      timeline += "\n• Issue formal correspondence clearly stating your position with reference to contract clauses.";
      timeline += "\n• Request a meeting with relevant decision-makers to discuss resolution of your specific payment issue.";
      timeline += "\n• Prepare detailed payment reconciliation showing amounts applied for, certified, paid, and outstanding.";
      
      timeline += "\n\nMedium-Term Actions (7-14 days)";
      timeline += "\n• If payment remains unresolved, consider whether to issue notice of intention to suspend performance.";
      timeline += "\n• Consider whether to claim interest under contractual provisions or the Late Payment legislation.";
      timeline += "\n• Engage senior management from both organizations in resolution discussions.";
      
      timeline += "\n\nLonger-Term Actions (14-28 days)";
      timeline += "\n• If your specific payment issue remains unresolved, consider formal dispute resolution options.";
      timeline += "\n• Prepare necessary documentation for adjudication if required for your situation.";
    } 
    // Delay issues timeline - focused on the specific issue
    else if (issueKeywords.includes('delay')) {
      timeline += "\n\nImmediate Actions (1-3 days)";
      timeline += "\n• Document the specific cause and extent of delay with supporting evidence.";
      timeline += "\n• Review your contract provisions regarding extension of time that apply to your situation.";
      timeline += "\n• Check programme impact using appropriate scheduling method for your specific delay.";
      timeline += "\n• Verify compliance with contractual time limits for notifications relevant to your situation.";
      
      timeline += "\n\nShort-Term Actions (3-7 days)";
      timeline += "\n• Issue formal delay notification in accordance with your contractual requirements.";
      timeline += "\n• Implement mitigation measures to minimize the impact of your specific delay.";
      timeline += "\n• Hold a delay impact assessment meeting with relevant project team members.";
      timeline += "\n• Begin tracking costs associated with your specific delay for potential loss and expense claim.";
      
      timeline += "\n\nMedium-Term Actions (7-21 days)";
      timeline += "\n• Submit detailed extension of time application with supporting documentation for your specific delay.";
      timeline += "\n• Request extension of time assessment meeting with contract administrator/project manager.";
      timeline += "\n• Continue documenting progress and impact of your specific delay event.";
      
      timeline += "\n\nLonger-Term Actions (21-42 days)";
      timeline += "\n• Follow up on extension of time application if no response received within contractual timeframe.";
      timeline += "\n• Submit loss and expense claim if your specific delay is compensable under the contract.";
      timeline += "\n• Consider whether acceleration measures might be appropriate for your situation.";
    } 
    // Variation issues timeline - focused on the specific issue
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      timeline += "\n\nImmediate Actions (1-3 days)";
      timeline += "\n• Clarify whether your specific variation has been properly instructed in accordance with your contract.";
      timeline += "\n• Review your contract provisions regarding variation instructions, valuation, and notification.";
      timeline += "\n• Document the current status of works affected by your specific variation.";
      timeline += "\n• Assess initial scope and potential impact of your variation on programme and cost.";
      
      timeline += "\n\nShort-Term Actions (3-7 days)";
      timeline += "\n• If variation instruction was not properly issued, seek formal confirmation or regularization.";
      timeline += "\n• Submit initial notification of time and cost implications for your specific variation.";
      timeline += "\n• Prepare method statement and resource plan for executing your varied work.";
      
      timeline += "\n\nMedium-Term Actions (7-14 days)";
      timeline += "\n• Submit detailed variation quotation for your specific change, including direct costs, preliminaries impact, and programme implications.";
      timeline += "\n• Seek formal acceptance of quotation if your contract mechanism allows.";
      timeline += "\n• Begin implementing your variation while maintaining detailed records.";
      
      timeline += "\n\nDuring Execution (Ongoing)";
      timeline += "\n• Maintain detailed records specific to your variation, including labor, plant, and materials.";
      timeline += "\n• Document any changes to your variation scope during execution.";
      timeline += "\n• Provide regular updates on your variation progress and cost.";
    }
    // Quality/defects issues timeline - focused on the specific issue
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      timeline += "\n\nImmediate Actions (1-3 days)";
      timeline += "\n• Document the specific defects thoroughly with photographs and measurements.";
      timeline += "\n• Review your contract provisions regarding quality standards and defects rectification.";
      timeline += "\n• Identify potential causes of your specific defects and responsibility allocation.";
      
      timeline += "\n\nShort-Term Actions (3-7 days)";
      timeline += "\n• Issue formal defect notification in accordance with your contractual procedures.";
      timeline += "\n• Arrange inspection of the specific defects with relevant parties.";
      timeline += "\n• Prepare initial remediation proposal or response to defect notification for your situation.";
      
      timeline += "\n\nMedium-Term Actions (7-21 days)";
      timeline += "\n• Agree on scope, method, and timing of remedial works for your specific defects.";
      timeline += "\n• Address any disagreements about responsibility or required remediation for your situation.";
      timeline += "\n• Implement agreed remedial works or alternative resolution for your specific defects.";
      
      timeline += "\n\nLonger-Term Actions (21+ days)";
      timeline += "\n• Conduct inspection of completed remedial works for your specific defects.";
      timeline += "\n• Obtain formal acceptance of remedial works or further instruction if required.";
      timeline += "\n• Document lessons learned to prevent similar defects in future work.";
    }
    // General contractual issues timeline - focused on the specific issue
    else {
      timeline += "\n\nImmediate Actions (1-5 days)";
      timeline += "\n• Review the specific contract clauses relevant to your issue.";
      timeline += "\n• Gather all documentation related to your specific contractual issue.";
      timeline += "\n• Assess the factual circumstances and contractual position for your specific situation.";
      timeline += "\n• Compile chronology of events relevant to your specific issue with supporting documentation.";
      
      timeline += "\n\nShort-Term Actions (5-10 days)";
      timeline += "\n• Prepare a clear written statement of your position regarding your specific issue.";
      timeline += "\n• Document the commercial and practical impact of the issue on your operations.";
      timeline += "\n• Identify potential solutions that would be acceptable for your specific situation.";
      timeline += "\n• Issue formal correspondence setting out your position and proposed resolution.";
      
      timeline += "\n\nMedium-Term Actions (10-20 days)";
      timeline += "\n• Engage in direct discussion with the other party to explore resolution of your specific issue.";
      timeline += "\n• Consider whether any contractual determination mechanisms apply to your specific issue.";
      timeline += "\n• If initial discussions are unsuccessful, escalate to senior management level.";
      
      timeline += "\n\nLonger-Term Actions (20-40 days)";
      timeline += "\n• If direct negotiation is unsuccessful, consider alternative dispute resolution options for your specific issue.";
      timeline += "\n• Prepare detailed submission for chosen dispute resolution method addressing your specific issue.";
      timeline += "\n• Continue to explore settlement possibilities in parallel with formal processes.";
    }
    
    return timeline;
  }
  
  function generateRiskAssessment(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let assessment = "RISK ASSESSMENT SPECIFIC TO YOUR ISSUE:";
    
    // Probability assessment section - focused on the specific issue
    assessment += "\n\nProbability Analysis for Your Specific Situation:";
    
    if (issueKeywords.includes('payment') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\nBased on your specific payment issue, the probability of a favorable resolution depends on these key factors specific to your situation:";
      assessment += "\n• Whether your payment applications were properly submitted in accordance with your contract";
      assessment += "\n• Whether valid Payment Notices or Pay Less Notices were issued within statutory timeframes";
      assessment += "\n• Whether the work claimed has been substantively performed";
      assessment += "\n• Whether you have contemporaneous records supporting your valuation";
      
      assessment += "\n\nFor your specific payment issue, success probability decreases if:";
      assessment += "\n• Your applications did not comply with contractual requirements";
      assessment += "\n• There are genuine quality issues with the work claimed";
      assessment += "\n• Your claim includes loss and expense elements without detailed substantiation";
    } 
    else if (issueKeywords.includes('payment') && (role.includes('Client') || role.includes('Employer'))) {
      assessment += "\n\nBased on your specific payment issue, your position strength depends primarily on procedural compliance with payment mechanisms. For your particular situation, your probability of successfully defending payment claims increases if:";
      assessment += "\n• Valid Payment Notices and/or Pay Less Notices were issued within required timeframes";
      assessment += "\n• Notices contained the required information (amount proposed, basis of calculation)";
      assessment += "\n• There are genuine, documented defects or non-compliant work";
      
      assessment += "\n\nFor your specific payment issue, your position is significantly weakened if:";
      assessment += "\n• Notices were not issued, were late, or were inadequately detailed";
      assessment += "\n• You failed to operate the contractual payment mechanism consistently";
    }
    else if (issueKeywords.includes('delay') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\nBased on your specific delay issue, your probability of success depends on these key factors:";
      assessment += "\n• Whether the delay event is a relevant event/compensation event under your contract";
      assessment += "\n• Whether proper notice was given in accordance with your contract";
      assessment += "\n• Whether you have evidence demonstrating both cause and effect of the delay";
      assessment += "\n• Whether you took reasonable steps to mitigate the delay";
      
      assessment += "\n\nFor your specific delay issue, success probability for financial recovery depends on:";
      assessment += "\n• Whether your contract identifies this specific event as compensable";
      assessment += "\n• Whether you have detailed records of specific additional costs caused";
    }
    else if (issueKeywords.includes('variation') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\nBased on your specific variation issue, your probability of success depends on these key factors:";
      assessment += "\n• Whether the variation was properly instructed in accordance with your contract";
      assessment += "\n• Whether the instruction was given by someone with appropriate authority";
      assessment += "\n• Whether your valuation follows the methodology prescribed in your contract";
      assessment += "\n• Whether you have contemporaneous records supporting your valuation";
      
      assessment += "\n\nFor your specific variation issue, success probability decreases if:";
      assessment += "\n• The work could be interpreted as correction of defects or contractor-risk items";
      assessment += "\n• The person giving the instruction lacked authority to instruct variations";
    }
    else {
      assessment += "\n\nBased on your specific contractual issue, the probability of successful resolution depends on:";
      assessment += "\n• The clarity of relevant contractual provisions that apply to your situation";
      assessment += "\n• Quality and completeness of contemporaneous records relevant to your issue";
      assessment += "\n• Compliance with contractual procedures and notification requirements";
      assessment += "\n• The commercial reasonableness of your position in this specific situation";
    }
    
    // Cost-benefit analysis - focused on the specific issue
    assessment += "\n\nCost-Benefit Analysis for Your Specific Issue:";
    assessment += "\n\nDirect Resolution Costs:";
    assessment += "\n• Management time: Time required for document review, correspondence, and meetings";
    assessment += "\n• Professional fees: Potential costs for specialist advice relevant to your specific issue";
    assessment += "\n• Dispute resolution costs: If formal processes are required for your specific issue";
    
    assessment += "\n\nQuantifiable Benefits:";
    if (issueKeywords.includes('payment')) {
      assessment += "\n• Direct recovery: The disputed payment amount in your specific situation";
      assessment += "\n• Interest: Statutory or contractual interest that applies to your situation";
    } else if (issueKeywords.includes('delay')) {
      assessment += "\n• Time relief: Avoidance of delay damages through extension of time for your specific delay";
      if (issueKeywords.includes('loss') || issueKeywords.includes('expense') || issueKeywords.includes('compensation')) {
        assessment += "\n• Cost recovery: Potential recovery of prolongation costs for your specific delay";
      }
    } else if (issueKeywords.includes('variation')) {
      assessment += "\n• Direct payment: Recovery of costs for additional work, materials, and associated overheads";
      if (issueKeywords.includes('time') || issueKeywords.includes('extension') || issueKeywords.includes('eot')) {
        assessment += "\n• Time relief: Potential extension of time associated with your specific variation";
      }
    } else {
      assessment += "\n• Direct resolution: The quantifiable value of resolving your specific contractual issue";
      assessment += "\n• Risk mitigation: Avoided costs if your specific issue is successfully resolved";
    }
    
    assessment += "\n\nIntangible Factors:";
    assessment += "\n• Relationship impact: Effect on commercial relationships if pursuing your specific issue";
    assessment += "\n• Precedent effect: How resolution might affect other similar issues on this project";
    assessment += "\n• Team morale: Impact on project team effectiveness related to your specific issue";
    
    // Recommended approach - focused on the specific issue
    assessment += "\n\nRecommended Approach for Your Specific Issue:";
    
    if (issueKeywords.includes('payment') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\nBased on risk-benefit analysis of your specific payment issue, a graduated approach is recommended:";
      assessment += "\n1. Initial robust correspondence citing specific statutory and contractual rights applicable to your situation";
      assessment += "\n2. Senior-level negotiation with clear commercial settlement parameters";
      assessment += "\n3. If unresolved within 14 days, consider adjudication while keeping settlement channels open";
    } 
    else if (issueKeywords.includes('delay')) {
      assessment += "\n\nBased on risk-benefit analysis of your specific delay issue, a measured approach is recommended:";
      assessment += "\n1. Submit detailed extension of time application with comprehensive impact analysis";
      assessment += "\n2. Focus primary efforts on securing time relief for your specific delay";
      assessment += "\n3. Consider separate loss and expense claim if your delay is compensable";
      assessment += "\n4. Reserve formal dispute rights while pursuing negotiated resolution";
    }
    else if (issueKeywords.includes('variation')) {
      assessment += "\n\nBased on risk-benefit analysis of your specific variation issue, a pragmatic approach is recommended:";
      assessment += "\n1. Compile all evidence supporting the instruction and valuation of your specific variation";
      assessment += "\n2. Seek agreement on the principle of the variation before detailed valuation discussions";
      assessment += "\n3. Prepare detailed valuation following the methodology in your contract";
      assessment += "\n4. Consider whether staged resolution might be appropriate for your situation";
    }
    else {
      assessment += "\n\nBased on risk-benefit analysis of your specific issue, a balanced approach is recommended:";
      assessment += "\n1. Detailed analysis of contractual provisions directly relevant to your issue";
      assessment += "\n2. Clear written position statement with specific settlement proposal";
      assessment += "\n3. Structured negotiation with defined escalation timeline";
      assessment += "\n4. Consider mediation if direct negotiation stalls";
      assessment += "\n5. Prepare for formal dispute resolution as contingency while pursuing settlement";
    }
    
    return assessment;
  }
  
  // Helper functions for report generation
  function generateRelevantClauses(contractType, issueDescription) {
    // This would be a sophisticated function in a real application
    // Simplified for demonstration
    const issueKeywords = issueDescription.toLowerCase();
    
    if (contractType.includes('JCT')) {
      if (issueKeywords.includes('payment')) return ['Clause 4.8', 'Clause 4.9', 'Clause 4.10', 'Clause 4.11', 'Clause 4.12', 'Clause 4.13'];
      if (issueKeywords.includes('delay')) return ['Clause 2.26', 'Clause 2.27', 'Clause 2.28', 'Clause 2.29', 'Clause 2.25'];
      if (issueKeywords.includes('variation')) return ['Clause 3.14', 'Clause 3.15', 'Clause 3.16', 'Clause 5.6', 'Clause 5.7'];
      if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) return ['Clause 2.38', 'Clause 2.39', 'Clause 2.40', 'Clause 3.18'];
      if (issueKeywords.includes('design')) return ['Clause 2.1', 'Clause 2.2', 'Clause 2.17', 'Clause 3.21'];
      return ['Clause 1.7', 'Clause 2.1', 'Clause 8.4', 'Clause 8.9'];
    }
    
    if (contractType.includes('NEC')) {
      if (issueKeywords.includes('payment')) return ['Clause 50.1', 'Clause 50.2', 'Clause 50.3', 'Clause 51.1', 'Clause 51.2'];
      if (issueKeywords.includes('delay')) return ['Clause 60.1', 'Clause 61.3', 'Clause 62.2', 'Clause 63.3', 'Clause 63.5'];
      if (issueKeywords.includes('variation')) return ['Clause 60.1(1)', 'Clause 60.1(4)', 'Clause 61.2', 'Clause 63.1', 'Clause 63.7'];
      if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) return ['Clause 40.1', 'Clause 42.1', 'Clause 43.1', 'Clause 44.1', 'Clause 45.1'];
      if (issueKeywords.includes('design')) return ['Clause 21.1', 'Clause 21.2', 'Clause 27.1', 'Option X15 (if applicable)'];
      return ['Clause 10.1', 'Clause 15.1', 'Clause 91.1', 'Clause 93.1'];
    }
    
    if (contractType.includes('FIDIC')) {
      if (issueKeywords.includes('payment')) return ['Clause 14.3', 'Clause 14.6', 'Clause 14.7', 'Clause 14.8', 'Clause 14.9'];
      if (issueKeywords.includes('delay')) return ['Clause 8.4', 'Clause 8.5', 'Clause 20.1', 'Clause 3.5', 'Clause 4.24'];
      if (issueKeywords.includes('variation')) return ['Clause 13.1', 'Clause 13.2', 'Clause 13.3', 'Clause 12.3', 'Clause 12.4'];
      if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) return ['Clause 7.5', 'Clause 7.6', 'Clause 9.1', 'Clause 11.1', 'Clause 11.2'];
      if (issueKeywords.includes('design')) return ['Clause 4.1', 'Clause 5.1', 'Clause 5.2', 'Clause 5.8', 'Clause 4.11'];
      return ['Clause 1.9', 'Clause 3.5', 'Clause 4.1', 'Clause 20.1'];
    }
    
    return ['General Contract Provisions', 'Specific Terms of Agreement', 'Implied Terms', 'Variation and Change Provisions', 'Payment Terms'];
  }
  
  function generateRecommendations(contractType, role, issueDescription) {
    // Create recommendations focused on the specific issue
    const recommendations = [];
    const issueKeywords = issueDescription.toLowerCase();
    
    // Payment-related recommendations - focused on the specific issue
    if (issueKeywords.includes('payment')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('For your specific payment issue, submit a formal payment notice in accordance with your contract terms, ensuring compliance with all requirements.');
        recommendations.push('Compile comprehensive payment documentation specific to your disputed amount, including detailed measurements, valuations, and records.');
        recommendations.push('Request a formal meeting with the contract administrator/quantity surveyor to discuss your specific payment discrepancy with supporting documentation.');
        if (issueKeywords.includes('late') || issueKeywords.includes('overdue')) {
          recommendations.push('For your specific late payment issue, consider issuing a formal notice of intention to suspend performance if payment remains outstanding, following the specific requirements in your contract.');
          recommendations.push('Calculate and claim interest on your specific late payment under the contract terms or the Late Payment of Commercial Debts (Interest) Act 1998.');
        }
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('For your specific payment issue, review the application and certification procedures to ensure strict compliance with contractual and statutory requirements.');
        recommendations.push('Ensure Payment Notices and Pay Less Notices relevant to your disputed payment are issued within the required timeframes and contain the specified information.');
        recommendations.push('Maintain detailed records of any defects or non-compliant work that form the basis of your payment withholding in this specific case.');
        if (issueKeywords.includes('dispute') || issueKeywords.includes('disagree')) {
          recommendations.push('For your specific payment dispute, document any set-off or abatement claims with precise calculations and supporting evidence.');
        }
      } else {
        recommendations.push('For your specific payment issue, ensure all processes and certifications comply with both contractual and statutory requirements.');
        recommendations.push('Maintain detailed records of all payment-related communications, notices, and certifications relevant to this specific issue.');
        recommendations.push('Advise relevant parties of their specific rights and obligations under the contract and Construction Act that apply to this payment issue.');
      }
    }
    
    // Delay-related recommendations - focused on the specific issue
    else if (issueKeywords.includes('delay')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('For your specific delay issue, document all causes with contemporaneous records, including site diaries, progress reports, photographs, and correspondence.');
        recommendations.push('Submit extension of time notification for your specific delay strictly in accordance with your contractual timeframes and requirements.');
        recommendations.push('Prepare a detailed delay analysis for your specific situation using an appropriate methodology with supporting critical path network diagrams.');
        recommendations.push('Implement and document specific mitigation measures for your delay where reasonably practicable.');
        if (issueKeywords.includes('loss') || issueKeywords.includes('expense') || issueKeywords.includes('cost')) {
          recommendations.push('For your specific compensable delay, prepare separate loss and expense submission with detailed quantum evidence specific to your situation.');
        }
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('For your specific delay issue, review the extension of time provisions in your contract to confirm entitlement criteria and assessment methodology.');
        recommendations.push('Assess extension of time claims related to your specific delay objectively and within contractual timeframes.');
        recommendations.push('Maintain contemporaneous records of project progress, contractor performance, and any employer-caused delays relevant to this specific issue.');
        if (issueKeywords.includes('liquidated') || issueKeywords.includes('damages')) {
          recommendations.push('For your specific delay issue, ensure liquidated damages provisions have been properly operated, including any required notices or certificates.');
        }
      } else if (role.includes('Contract Administrator') || role.includes('Engineer')) {
        recommendations.push('For your specific delay issue, assess extension of time claims impartially in accordance with your contract, applying the specified methodology.');
        recommendations.push('Issue determinations for your specific delay issue within contractual timeframes, providing clear reasons for your decision.');
        recommendations.push('Maintain detailed records of your assessment process for this specific delay issue, including programmes reviewed and evidence considered.');
      } else {
        recommendations.push('For your specific delay issue, document all relevant events with specific dates, duration, and impact on planned activities.');
        recommendations.push('Submit detailed extension of time requests for your specific delay with supporting evidence and critical path analysis.');
        recommendations.push('Implement and document specific mitigation measures to minimize the impact of your delay.');
      }
    }
    
    // Variation-related recommendations - focused on the specific issue
    else if (issueKeywords.includes('variation')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        if (issueKeywords.includes('instruct') || issueKeywords.includes('authoriz') || issueKeywords.includes('authoris')) {
          recommendations.push('For your specific variation issue, ensure it is properly instructed in writing by an authorized person before proceeding with the varied work.');
        }
        recommendations.push('Submit detailed variation quotation for your specific change, including direct costs, time implications, and any impact on existing works.');
        recommendations.push('Maintain specific records for your variation separate from general project records, including labor allocation, material usage, and photographs.');
        if (issueKeywords.includes('delay') || issueKeywords.includes('extension') || issueKeywords.includes('time')) {
          recommendations.push('Notify promptly if your specific variation is likely to cause delay to completion or impact critical path activities.');
        }
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('For your specific variation issue, ensure instructions are issued only by authorized persons following contractual procedures.');
        recommendations.push('Request detailed quotation for your proposed variation before instruction where time permits, establishing cost and time implications upfront.');
        recommendations.push('Maintain comprehensive documentation of your specific variation, including scope, authorization, agreed value, and time impact.');
      } else if (role.includes('Contract Administrator') || role.includes('Engineer')) {
        recommendations.push('For your specific variation issue, issue instructions clearly in writing, specifying exactly what is being changed.');
        recommendations.push('Ensure your specific variation is properly valued according to the contractual hierarchy of valuation methods.');
        recommendations.push('Assess time implications of your specific variation objectively, particularly if it affects critical path activities.');
        recommendations.push('Maintain detailed records of your specific variation, including the instruction process, agreed scope, and valuation.');
      } else {
        recommendations.push('For your specific variation issue, verify that it is properly documented and authorized according to contract requirements.');
        recommendations.push('Establish a robust tracking system for your variation to monitor status, valuation, and impact.');
        recommendations.push('Ensure variation instructions provide clear scope definition and necessary technical details specific to your change.');
      }
    }
    
    // Quality/defects-related recommendations - focused on the specific issue
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('For your specific quality/defect issue, implement appropriate quality control procedures specific to the area of concern.');
        recommendations.push('Document any instructions or specifications that may have contributed to your specific alleged defect.');
        recommendations.push('Respond promptly to notifications regarding your specific defect, investigating thoroughly and proposing appropriate remedial methodology.');
        if (issueKeywords.includes('rectif') || issueKeywords.includes('remed') || issueKeywords.includes('repair')) {
          recommendations.push('For your specific defect, provide a detailed method statement and programme for remedial works, minimizing disruption.');
        }
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('Document your specific defect thoroughly with photographs, measurements, and specific reference to contract requirements.');
        recommendations.push('Issue formal defect notification for your specific issue in accordance with contractual procedures.');
        recommendations.push('Allow reasonable access for inspection and remediation of your specific defect, cooperating with contractor\'s proposed methodology where appropriate.');
      } else {
        recommendations.push('For your specific quality/defect issue, inspect work against specification requirements and industry standards, documenting any non-compliance.');
        recommendations.push('Issue clear instructions regarding your specific defective work, specifying the nature of the defect and required remediation.');
        recommendations.push('Maintain detailed records of all quality-related communications, inspections, and identified defects specific to your issue.');
      }
    }
    
    // Design-related recommendations - focused on the specific issue
    else if (issueKeywords.includes('design')) {
      if (role.includes('Contractor') && (contractType.includes('Design and Build') || issueKeywords.includes('contractor design'))) {
        recommendations.push('For your specific design issue, review the specific design obligations in your contract, particularly the standard of care required.');
        recommendations.push('Document any design approvals or acceptances by the employer that are relevant to your specific design issue.');
        recommendations.push('Ensure professional indemnity insurance adequately covers your specific design liability and notify insurers if appropriate.');
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('For your specific design issue, review the design responsibility allocation in your contract documents.');
        recommendations.push('Document your specific design deficiencies with reference to employer\'s requirements, performance specifications, or objective industry standards.');
        if (issueKeywords.includes('approval') || issueKeywords.includes('review')) {
          recommendations.push('Consider whether any design approval process operated under your contract affects design liability allocation for this specific issue.');
        }
      } else if (role.includes('Architect') || role.includes('Engineer')) {
        recommendations.push('For your specific design issue, review your appointment terms regarding design liability, particularly the standard of care.');
        recommendations.push('Maintain comprehensive records of design development, decisions, and calculations relevant to your specific design issue.');
        if (issueKeywords.includes('coordination')) {
          recommendations.push('For your specific design coordination issue, ensure proper coordination between different design disciplines, documenting the process.');
        }
      } else {
        recommendations.push('For your specific design issue, clarify design responsibility allocation between all relevant parties.');
        recommendations.push('Document design development process and key decisions relevant to your specific issue with supporting rationale.');
        recommendations.push('Implement structured design review and approval procedures with clear records for your specific design elements.');
      }
    }
    
    // General recommendations for specific contractual issues
    else {
      recommendations.push('For your specific contractual issue, review all relevant contract documents thoroughly to identify provisions directly applicable to your situation.');
      recommendations.push('Compile a comprehensive chronology of events related to your specific issue with supporting documentation.');
      recommendations.push('Document your interpretation of the relevant contract clauses that apply specifically to your situation.');
      recommendations.push('Seek early resolution of your specific issue through direct commercial discussion, considering the relationship value.');
      recommendations.push('Consider whether independent expert opinion on technical aspects of your specific issue might facilitate resolution.');
    }
    
    return recommendations;
  }
  
  function getDraftRecipient(role) {
    // Determine appropriate recipient based on role
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
  
  // Provide context value
  const value = {
    hasConsented,
    giveConsent,
    revokeConsent,
    projectDetails,
    updateProjectDetails,
    addIssue,
    updateIssue,
    removeIssue,
    report,
    generateReport,
    draftCommunication,
    generateDraftCommunication,
    savedReports,
    saveCurrentReport,
    deleteSavedReport,
    shouldGenerateLetter,
    setShouldGenerateLetter
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}