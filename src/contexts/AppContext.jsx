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
        body += `**Issue ${index + 1}: ${analysis.issue}**\n\n`;
        
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
        
        // Add specific recommendation from the analysis
        if (analysis.recommendations && analysis.recommendations.length > 0) {
          body += `\n\nOur position is that ${analysis.recommendations[0].toLowerCase()} `;
          
          if (analysis.recommendations.length > 1) {
            body += `Additionally, we propose that ${analysis.recommendations[1].toLowerCase()} `;
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
    
    // Payment issues analysis
    if (issueKeywords.includes('payment')) {
      analysis = "This issue pertains to payment obligations under the contract. Payment disputes represent approximately 30% of all construction contract disputes in the UK and require careful consideration of both the contractual and statutory frameworks that apply.\n\n";
      
      analysis += "Based on the information provided, this appears to involve ";
      
      if (issueKeywords.includes('late')) {
        analysis += "late payment contrary to the contractual payment terms. The Housing Grants, Construction and Regeneration Act 1996 (as amended) provides a statutory right to be paid in accordance with the contract or scheme provisions, with specific remedies for late or non-payment including the right to suspend performance and claim interest.";
      } 
      else if (issueKeywords.includes('certif')) {
        analysis += "challenges with the certification process for payment. The contract likely specifies the certification procedure, including what constitutes a valid application, who should issue certificates, timeframes for certification, and the consequences of failure to certify correctly.";
      }
      else if (issueKeywords.includes('retention')) {
        analysis += "issues with retention monies. Retention is a contractual mechanism whereby a percentage of payment is withheld to protect the employer against defects. The contract should specify the retention percentage, release triggers (typically practical completion and making good defects), and whether the retention is held in a separate trust account.";
      }
      else if (issueKeywords.includes('final account')) {
        analysis += "disputes concerning the final account settlement. Final accounts typically consolidate all financial adjustments made during the project including variations, extensions of time with associated costs, fluctuations, and other claims. The contract should specify the procedure and timeframe for submission and agreement of the final account.";
      }
      else {
        analysis += "a dispute regarding payment provisions. This could include disagreements over the valuation of work, timing of payments, conditions precedent to payment, or the consequences of non-payment.";
      }
      
      analysis += "\n\n";
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "As a " + role + ", your payment rights are governed by both the express terms of the contract and the implied terms from applicable legislation. The Housing Grants, Construction and Regeneration Act 1996 (as amended) provides statutory protection regarding payment terms, notice requirements, and the right to refer disputes to adjudication. These statutory provisions cannot be contracted out of and override any contractual terms that attempt to exclude them.";
        
        if (contractType.includes('JCT')) {
          analysis += " Under JCT contracts, payment provisions are typically found in clauses 4.8-4.13, which specify application procedures, certification timeframes, and the process for challenging valuations through appropriate notices.";
        } else if (contractType.includes('NEC')) {
          analysis += " In NEC contracts, payment provisions are primarily addressed in clause 50 (assessment) and clause 51 (payment), with clear procedures for assessment and certification, including mandatory timeframes for each step in the process.";
        }
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "As the " + role + ", your payment obligations are specifically defined within the contract terms. You typically have the responsibility to make payment within the contractually or statutorily defined period following either certification or a valid application (depending on contract provisions). Failure to comply with the payment provisions can lead to statutory interest charges, the contractor's right to suspend performance, and potential reputational damage.";
        
        if (contractType.includes('JCT')) {
          analysis += " In JCT contracts, your payment responsibilities include issuing Payment Notices and Pay Less Notices within statutory timeframes if you intend to pay less than the notified sum, with clear requirements for the content of such notices to be valid.";
        } else if (contractType.includes('NEC')) {
          analysis += " Under NEC contracts, you must ensure proper certification procedures are followed, with the Project Manager's assessments being made objectively and in accordance with the contract, as failure to do so could constitute a compensation event in itself.";
        }
      }
      else {
        analysis += "Your role as " + role + " requires a detailed understanding of the payment provisions within the contract. You should ensure that proper procedures are followed for applications, certifications, and payments to minimize the risk of disputes. Clear record-keeping and documentation of all payment-related communications is essential.";
      }
    } 
    // Delay issues analysis
    else if (issueKeywords.includes('delay')) {
      analysis = "This issue concerns delays to the project programme. Time-related disputes account for approximately 25% of construction contract disputes and can have significant financial implications for all parties involved.\n\n";
      
      analysis += "Based on the information provided, this appears to involve ";
      
      if (issueKeywords.includes('extension') || issueKeywords.includes('eot')) {
        analysis += "claims for extension of time under the contract. Extension of time provisions allocate the risk of delay between the parties and provide a mechanism for adjusting the contractual completion date when certain events occur.";
      }
      else if (issueKeywords.includes('liquidated') || issueKeywords.includes('lad') || issueKeywords.includes('damages')) {
        analysis += "issues regarding liquidated damages. Liquidated damages are a pre-agreed sum that the employer can deduct for late completion, representing a genuine pre-estimate of the employer's loss due to delayed completion.";
      }
      else if (issueKeywords.includes('concurrent')) {
        analysis += "concurrent delays, which occur when two or more delay events happen simultaneously, with at least one being the contractor's risk and one being the employer's risk. The treatment of concurrent delay varies between standard forms and is often addressed specifically in contract amendments.";
      }
      else if (issueKeywords.includes('acceleration')) {
        analysis += "acceleration measures to mitigate delays. Acceleration involves increasing resources or adjusting methods to complete works earlier than would otherwise be possible. It may be instructed formally or undertaken constructively in response to a failure to grant appropriate extensions of time.";
      }
      else {
        analysis += "delay-related matters affecting the project timeline. These may include the causes of delay, responsibility allocation, entitlement to additional time, and the potential financial implications of delayed completion.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        analysis += "Under JCT contracts, the extension of time mechanism operates through 'Relevant Events' (typically found in clauses 2.26-2.29), which define the circumstances in which the contractor may be entitled to additional time. Meanwhile, 'Relevant Matters' (typically in clauses 4.21-4.22) define circumstances where the contractor may additionally be entitled to loss and expense. It is important to note that not all Relevant Events are also Relevant Matters - for example, exceptionally adverse weather typically entitles the contractor to additional time but not additional money.";
        
        if (issueKeywords.includes('notice')) {
          analysis += " The JCT requires the contractor to give notice 'forthwith' when it becomes reasonably apparent that progress is being or is likely to be delayed, providing details of the cause and expected effects. Failure to provide timely notice may not invalidate an EOT claim entirely but could impact the assessment if it prejudices the employer's position.";
        }
      } 
      else if (contractType.includes('NEC')) {
        analysis += "In NEC contracts, delays are typically addressed through the Early Warning and Compensation Event mechanisms. Clause 61.3 requires the Contractor to notify a compensation event within 8 weeks of becoming aware of the event, with failure to do so potentially resulting in loss of entitlement if it prevents proper assessment. The assessment principles in clause 63 require a prospective analysis using the Accepted Programme, evaluating the impact on Planned Completion.";
        
        if (issueKeywords.includes('early warning')) {
          analysis += " The Early Warning procedure (clause 15) is particularly important in NEC contracts, as it encourages proactive identification and mitigation of potential issues before they impact the project. While failure to give an Early Warning does not preclude entitlement to a Compensation Event, it may reduce the amount due if early notification would have reduced the impact.";
        }
      }
      else {
        analysis += "The specific contract terms governing delay events, notification requirements, and extension of time entitlements should be carefully reviewed. Key considerations include: the contractual definition of the completion date; the specific events that entitle the contractor to extension of time; notification requirements and timeframes; the method of delay analysis prescribed by the contract; and any conditions precedent to entitlement.";
      }
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + ", your primary responsibilities include proper programming, timely notification of delay events, maintenance of contemporaneous records to evidence both cause and effect of delays, and submission of substantiated extension of time claims in accordance with contractual procedures. Failure to maintain adequate records or to follow contractual notification procedures could compromise your entitlement to extensions of time and associated financial recovery.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + ", you must ensure that extension of time claims are assessed fairly and in accordance with the contract. This includes reviewing submitted claims promptly, considering the evidence presented, and making determinations within the timeframes specified in the contract. Failure to properly administer extension of time claims could render liquidated damages unenforceable and potentially expose you to claims for time at large.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + ", you have a duty to administer the contract impartially when assessing delay claims. This involves objectively evaluating the evidence presented, considering the contractual entitlements, and making determinations in accordance with the contract. Your assessments must be reasonable and made within the timeframes specified in the contract to avoid breaching your obligations.";
      }
    } 
    // Variation issues analysis
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change') || issueKeywords.includes('extra work')) {
      analysis = "This issue relates to variations or changes to the originally agreed scope of work. Variation disputes represent approximately 20% of construction contract disputes and typically involve questions of whether an instruction constitutes a variation, the proper valuation of varied work, and the impact on the project timeline.\n\n";
      
      analysis += "Based on the information provided, this involves ";
      
      if (issueKeywords.includes('valuation')) {
        analysis += "disputes regarding the valuation of variations. Most contracts provide a hierarchy of methods for valuing variations, typically including: rates and prices in the contract where applicable; pro-rata adjustment of such rates where reasonable; fair market rates where no contract rates exist; or cost plus with a reasonable addition for overhead and profit.";
      }
      else if (issueKeywords.includes('instruct') || issueKeywords.includes('authoriz') || issueKeywords.includes('authoris')) {
        analysis += "issues concerning the proper instruction or authorization of variations. Most construction contracts specify who has authority to instruct variations and the required format of such instructions. Work undertaken without proper instruction may constitute 'voluntary variations' for which there may be limited or no entitlement to additional payment.";
      }
      else if (issueKeywords.includes('omission')) {
        analysis += "omissions from the original scope of work. While most contracts permit the employer to omit work, there may be restrictions if the work is omitted to be given to another contractor or if the omission substantially changes the nature of the contract. Additionally, the contractor may be entitled to loss of profit on omitted work in certain circumstances.";
      }
      else if (issueKeywords.includes('design') || issueKeywords.includes('specification')) {
        analysis += "design development or specification changes. It is important to distinguish between design development (which may fall within the contractor's original obligations, particularly in design and build contracts) and genuine variations that change the employer's requirements.";
      }
      else {
        analysis += "changes to the originally agreed scope of work. Variations may result from employer requests, design development, unforeseen conditions, statutory requirements, or other factors necessitating deviation from the original contract documents.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        analysis += "JCT contracts handle variations through the Architect's/Contract Administrator's Instructions mechanism. Typically found in section 3.14-3.17, these provisions define what constitutes a valid variation instruction, the contractor's right to reasonable objection (e.g., where the varied work would substantially change the nature of the contract), and the valuation rules applying to variations. The contractor generally has an obligation to comply with properly issued instructions, subject to their right of reasonable objection.";
        
        if (issueKeywords.includes('valuation')) {
          analysis += " The valuation rules in JCT contracts (typically clause 5.6-5.9) provide a clear hierarchy of methods for valuing variations, including: contract rates/prices where the work is of similar character and executed under similar conditions; fair adjustment of these rates where there is significant change in quantities or conditions; fair market rates where no contract rates are applicable; or daywork rates in limited circumstances.";
        }
      } 
      else if (contractType.includes('NEC')) {
        analysis += "NEC contracts manage variations through the Compensation Event mechanism. This provides a structured process for instructing changes (clause 60.1(1)) and evaluating their impact on both time and cost. The Project Manager is responsible for notifying compensation events they instruct, while the Contractor must notify events they identify within the 8-week timeframe specified in clause 61.3 to preserve entitlement.";
        
        if (issueKeywords.includes('quotation')) {
          analysis += " The quotation process for compensation events (clause 62) requires the Contractor to submit quotations showing the time and cost impact, with assessment based on the effect on Defined Cost plus Fee. A key principle of NEC contracts is that compensation events are assessed prospectively (based on forecast effects) rather than retrospectively (based on actual costs incurred).";
        }
      }
      else {
        analysis += "The specific variation provisions within your contract should be carefully reviewed. Key considerations include: who has authority to instruct variations; the required format of variation instructions; any limitations on the scope of permitted variations; notification and quotation requirements; valuation methodologies; and the impact on completion date.";
      }
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + ", you should ensure that you only proceed with varied work where there is proper instruction in accordance with the contract. Contemporaneous records of all variations are essential, including details of additional resources, time impact, and costs. Where the contract requires notification or quotation within specified timeframes, strict compliance is necessary to preserve entitlement.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + ", you should ensure that variations are properly instructed through authorized representatives and in accordance with contractual procedures. Clear scope definition and, where possible, agreement on cost and time implications before work proceeds can help minimize disputes. Be aware that significant or numerous variations may undermine the original contractual bargain and potentially constitute a 'cardinal change' giving rise to different entitlements.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + ", you have specific powers and duties regarding variations. These typically include the authority to issue variation instructions, obligation to value variations fairly in accordance with the contract, and responsibility to assess time implications. Proper record-keeping of all instructions issued and their rationale is essential for effective contract administration.";
      }
    } 
    // Design issues analysis
    else if (issueKeywords.includes('design') || issueKeywords.includes('specification') || issueKeywords.includes('drawing')) {
      analysis = "This issue concerns design responsibilities and/or adequacy of design information. Design-related disputes account for approximately 15% of construction contract disputes and typically involve questions of design responsibility, design development versus variation, and the standard of care applicable to design obligations.\n\n";
      
      analysis += "Based on the information provided, this involves ";
      
      if (issueKeywords.includes('error') || issueKeywords.includes('mistake') || issueKeywords.includes('incorrect')) {
        analysis += "errors or inadequacies in the design information. The contractual and legal consequences depend on design responsibility allocation and the standard of care applicable to design obligations. In traditional contracts, design errors in employer-provided information may entitle the contractor to additional time and cost.";
      }
      else if (issueKeywords.includes('coordination')) {
        analysis += "coordination issues between different design elements. Design coordination responsibilities should be clearly defined in the contract, particularly where design responsibility is shared between multiple parties. Coordination failures can lead to abortive work, delays, and additional costs.";
      }
      else if (issueKeywords.includes('information') || issueKeywords.includes('drawing') || issueKeywords.includes('detail')) {
        analysis += "issues with the provision or adequacy of design information. Most contracts specify timeframes for information release and procedures for requesting additional information. Late or inadequate information may entitle the contractor to extension of time and additional cost, subject to proper notification.";
      }
      else {
        analysis += "design-related matters affecting the project. The allocation of design responsibility is a fundamental aspect of construction contracts, with significant implications for risk allocation, standard of care, and liability for design inadequacies.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        if (contractType.includes('Design and Build')) {
          analysis += "Under the JCT Design and Build Contract, the Contractor assumes responsibility for completing the design (clause 2.1). The standard of care applicable to this design obligation is typically the reasonable skill and care of a competent designer, unless expressly amended to a fitness for purpose obligation. The Contractor's liability for design may be limited by any design submission procedure and employer's approval specified in the contract.";
        } else {
          analysis += "In traditional JCT contracts, design responsibility typically remains with the Employer and the design team, with the Contractor responsible only for building in accordance with the design information provided. The Information Release Schedule (where included) establishes the timetable for provision of information, and the Contractor may be entitled to extension of time and loss and expense if information is not provided within the relevant period.";
        }
      } 
      else if (contractType.includes('NEC')) {
        if (contractType.includes('Option X15')) {
          analysis += "When Option X15 (Design Limitation) is incorporated into NEC contracts, the Contractor's liability for design is limited to reasonable skill and care rather than the stricter 'fitness for purpose' obligation that might otherwise apply. The scope of the Contractor's design responsibilities should be clearly defined in the Works Information/Scope.";
        } else {
          analysis += "In NEC contracts, the allocation of design responsibility should be clearly defined in the Works Information/Scope. Where the Contractor has design responsibility, they typically warrant that the works will be fit for the purpose specified in the Works Information/Scope, unless this obligation is limited by incorporation of Option X15.";
        }
      }
      else {
        analysis += "The specific provisions governing design responsibility in your contract should be carefully reviewed. Key considerations include: the explicit allocation of design responsibility; the standard of care applicable to design obligations (reasonable skill and care versus fitness for purpose); any design submission and approval procedures; and the process for handling design changes.";
      }
      
      if (role.includes('Contractor') && (contractType.includes('Design and Build') || issueKeywords.includes('contractor design'))) {
        analysis += "\n\nAs a Contractor with design responsibilities, you should ensure that your design complies with the contractual requirements and applicable standard of care. Professional indemnity insurance is essential to cover design liability. Careful review of employer's requirements and site constraints before contract formation is crucial to identify potential design issues early.";
      } 
      else if (role.includes('Contractor') && !contractType.includes('Design and Build')) {
        analysis += "\n\nAs a Contractor in a traditional contract, you should promptly notify any discrepancies or inadequacies in the design information provided. Requests for information should be made in accordance with contractual procedures and timeframes. Detailed records should be maintained of any delays or disruption resulting from design issues.";
      }
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + ", your responsibilities regarding design information depend on the procurement route. In traditional contracts, you are responsible (through your design team) for providing adequate and timely design information. In design and build contracts, you must provide clear employer's requirements and ensure that any approval procedures are administered efficiently to avoid delaying the contractor.";
      }
      else if (role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + ", you have professional obligations regarding design adequacy and coordination. The standard of care applicable is typically to exercise reasonable skill and care expected of a competent member of your profession. Effective coordination between different design disciplines and clear communication of design information to the contractor are essential responsibilities.";
      }
    }
    // Quality/defects issues analysis
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality') || issueKeywords.includes('workmanship')) {
      analysis = "This issue relates to the quality of work and/or defects in the constructed works. Quality-related disputes account for approximately 15% of construction contract disputes and typically involve questions of compliance with specification, workmanship standards, and remedial obligations.\n\n";
      
      analysis += "Based on the information provided, this involves ";
      
      if (issueKeywords.includes('rectif') || issueKeywords.includes('repair') || issueKeywords.includes('remed')) {
        analysis += "the rectification of defects in the works. Most contracts contain provisions requiring the contractor to remedy defects identified during the works, at practical completion, or during a defects liability period. Disputes may arise regarding responsibility for defects, the appropriate remedial method, or the cost of rectification.";
      }
      else if (issueKeywords.includes('reject') || issueKeywords.includes('remov')) {
        analysis += "rejected work or materials that do not comply with contractual requirements. Construction contracts typically give the contract administrator power to reject non-compliant work and require its removal or replacement. The contractor generally bears the cost of such remedial work unless the rejection was unreasonable.";
      }
      else if (issueKeywords.includes('practical completion') || issueKeywords.includes('substantial completion')) {
        analysis += "issues affecting practical completion certification. The standard for practical completion typically requires completion of the works without defects, other than minor defects that do not prevent the works from being used for their intended purpose. Disputes may arise regarding whether this standard has been achieved.";
      }
      else {
        analysis += "quality-related matters affecting the project. Construction contracts typically require work to be completed in accordance with the specification, in a proper and workmanlike manner, using materials of the quality and standards described in the contract documents.";
      }
      
      analysis += "\n\n";
      
      if (contractType.includes('JCT')) {
        analysis += "JCT contracts contain specific provisions regarding quality and defects. Clause 2.1 typically requires the Contractor to carry out and complete the works in accordance with the Contract Documents, statutory requirements, and the instructions of the Architect/Contract Administrator. Clause 3.18 gives the Architect/Contract Administrator power to issue instructions requiring the removal of non-compliant work and materials. The defects liability provisions (typically clause 2.38-2.39) establish the procedure for identifying and rectifying defects after practical completion.";
        
        if (issueKeywords.includes('practical completion')) {
          analysis += " Practical completion under JCT contracts is not precisely defined but generally requires the works to be complete for all practical purposes, capable of being occupied and used for their intended purpose, with only minor items outstanding that can be completed without significant disruption. The certifier has discretion in determining whether practical completion has been achieved.";
        }
      } 
      else if (contractType.includes('NEC')) {
        analysis += "NEC contracts address quality through the concept of 'Defects'. A Defect is defined as part of the works not in accordance with the Works Information/Scope or applicable law. Clause 43 requires the Contractor and Project Manager to notify each other of Defects they find, with the Supervisor also empowered to identify Defects under clause 42. The Contractor must correct Defects within the defect correction period, and the Project Manager may instruct earlier correction if reasonable.";
        
        if (issueKeywords.includes('completion')) {
          analysis += " Completion under NEC contracts requires the Contractor to have done all the work that the Works Information/Scope states they are to do by the Completion Date and to have corrected notified Defects that would prevent the Employer from using the works. The Project Manager certifies Completion within one week of completion or of being requested to certify Completion by the Contractor.";
        }
      }
      else {
        analysis += "The specific provisions governing quality and defects in your contract should be carefully reviewed. Key considerations include: the defined quality standards and testing procedures; the process for identifying and notifying defects; the contractor's obligation to rectify defects and the timeframe for doing so; and any limitations on liability for defects (e.g., time limits for notification).";
      }
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + ", you have primary responsibility for ensuring that work complies with the contractual requirements and is free from defects. This includes implementing appropriate quality control procedures, ensuring proper supervision, and promptly addressing any defects identified. You should maintain records of any quality control measures implemented and any instructions received regarding quality issues.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + ", you are entitled to works that comply with the contractual requirements. Where defects are identified, you should ensure that they are properly notified in accordance with the contract and that any remedial works are adequately supervised. If the contractor fails to rectify defects, you may have the right to employ others to remedy the defects and recover the cost, subject to proper notification.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + ", you have specific responsibilities regarding quality control and defects management. These typically include inspecting the works, identifying defects, issuing instructions for remedial work, and determining whether practical completion has been achieved. Your decisions should be made impartially and in accordance with the contract, with proper records maintained of all inspections and instructions.";
      }
    }
    // General contract interpretation if no specific issue type identified
    else {
      analysis = "Based on the information provided, this issue involves matters of contract interpretation and implementation that require careful analysis of the specific terms and conditions in your agreement. Contract interpretation disputes are common in construction projects and typically arise from ambiguous drafting, differing interpretations of contractual provisions, or changes in circumstances not explicitly addressed in the contract.\n\n";
      
      analysis += "When interpreting construction contracts, courts and adjudicators typically apply established principles including:\n\n";
      analysis += "• The objective approach - focusing on what a reasonable person with all the background knowledge available to the parties would understand the contract to mean;\n";
      analysis += "• The whole agreement approach - reading the contract as a whole rather than focusing on isolated clauses;\n";
      analysis += "• The business efficacy principle - favoring interpretations that give commercial sense to the agreement;\n";
      analysis += "• The contra proferentem rule - interpreting ambiguities against the party who drafted the provision (though this is typically a last resort).\n\n";
      
      if (contractType.includes('JCT') || contractType.includes('NEC') || contractType.includes('FIDIC')) {
        analysis += `The ${contractType} is a standard form contract with established interpretations through case law and industry practice. When disputes arise regarding interpretation, courts and adjudicators often refer to industry guides, previous cases interpreting similar provisions, and the overall scheme of the standard form.`;
      } else {
        analysis += "Your bespoke contract should be interpreted according to its specific drafting and the circumstances of your project. Industry standard practices and common contractual interpretations may be relevant but will not override clear expressions of the parties' intentions in the contract documents.";
      }
      
      analysis += "\n\nKey areas to consider when addressing this type of contractual issue include:\n\n";
      analysis += "• The hierarchy of contract documents and how conflicts between different documents are resolved;\n";
      analysis += "• Any specifically negotiated amendments to standard terms and their impact on interpretation;\n";
      analysis += "• The objective of the relevant provisions and what they were intended to achieve;\n";
      analysis += "• The conduct of the parties to date and whether this establishes a pattern of interpretation;\n";
      analysis += "• Any relevant implied terms that may supplement the express terms of the contract.";
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "\n\nAs a " + role + ", you should review the specific contract provisions relevant to your issue, gather supporting documentation that evidences your interpretation, and present your position clearly with reference to the contract terms. Consider both the express contractual provisions and any implied terms that may be relevant to your situation.";
      } 
      else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "\n\nAs the " + role + ", you should ensure that your interpretation of the contract is consistent with both the specific wording and the overall scheme of the agreement. Contemporaneous records of discussions during contract formation may be relevant to establishing the intended meaning where provisions are ambiguous.";
      }
      else if (role.includes('Contract Administrator') || role.includes('Architect') || role.includes('Engineer')) {
        analysis += "\n\nIn your role as " + role + ", you may be required to make determinations that involve interpreting the contract. These determinations should be made impartially, based on a reasonable interpretation of the contract in its commercial context, and with proper reasons provided to the parties.";
      }
    }
    
    return analysis;
  }
  
  function generateLegalContext(contractType, issueDescription) {
    let context = "The legal framework for this issue comprises several layers of obligations and rights:";
    
    // Contractual framework
    if (contractType.includes('JCT') || contractType.includes('NEC') || contractType.includes('FIDIC')) {
      context += `\n\n• **The ${contractType} Contract**: This forms the primary legal basis for resolving the dispute. The specific clauses relevant to this issue (identified above) establish the parties' respective rights and obligations, the procedures for addressing the issue, and the remedies available.`;
    } else {
      context += "\n\n• **Your Specific Contract Agreement**: This forms the primary legal basis for resolving the dispute. The specific clauses relevant to this issue establish the parties' respective rights and obligations, the procedures for addressing the issue, and the remedies available.";
    }
    
    // Statutory framework
    context += "\n\n• **The Housing Grants, Construction and Regeneration Act 1996 (as amended)**: Often referred to as the 'Construction Act', this legislation provides statutory rights regarding payment, adjudication, and suspension that apply to construction contracts and override any non-compliant contractual provisions. Key features include:";
    context += "\n   - The right to refer disputes to adjudication at any time;";
    context += "\n   - Specific requirements for payment mechanisms and notice provisions;";
    context += "\n   - The right to suspend performance for non-payment following proper notice.";
    
    context += "\n\n• **The Scheme for Construction Contracts (England and Wales) Regulations 1998 (as amended)**: These regulations provide default provisions that apply where construction contracts do not comply with the requirements of the Construction Act. They cover procedures for adjudication and payment where contractual provisions are inadequate.";
    
    // Issue-specific legislation
    const issueKeywords = issueDescription.toLowerCase();
    
    if (issueKeywords.includes('payment')) {
      context += "\n\n• **The Late Payment of Commercial Debts (Interest) Act 1998**: This legislation provides a statutory entitlement to interest on late commercial payments, currently at 8% above the Bank of England base rate, plus potential recovery of costs associated with pursuing payment.";
      
      context += "\n\n• **Part II of the Construction Act (Sections 109-113)**: These sections specifically address payment provisions in construction contracts, including requirements for:";
      context += "\n   - An adequate mechanism for determining what payments become due and when;";
      context += "\n   - A final date for payment of any sum that becomes due;";
      context += "\n   - Provision for notices of intention to withhold payment ('Pay Less Notices');";
      context += "\n   - Prohibition of 'pay-when-paid' clauses (with limited exceptions for upstream insolvency).";
    }
    
    if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      context += "\n\n• **The Defective Premises Act 1972**: Section 1 imposes a duty on persons taking on work for the provision of a dwelling to ensure the work is done in a workmanlike or professional manner, with proper materials, and that the dwelling is fit for habitation when completed.";
      
      context += "\n\n• **The Building Act 1984 and Building Regulations**: These establish minimum technical standards for design and construction, with potential implications for what constitutes defective work. Non-compliance may result in enforcement action by local authorities.";
      
      context += "\n\n• **The Supply of Goods and Services Act 1982**: This implies terms that services will be carried out with reasonable care and skill, within a reasonable time, and for a reasonable charge, which may be relevant to quality standards where not explicitly defined in the contract.";
    }
    
    if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      context += "\n\n• **Common Law Principles Regarding Variations**: While no specific legislation governs variations, common law principles establish that:";
      context += "\n   - Variations must be instructed in accordance with the contract to be valid;";
      context += "\n   - The scope of permitted variations may be limited to changes of a similar nature and scale to the original works;";
      context += "\n   - Substantial variations may constitute a breach of contract or potentially form a separate contract.";
    }
    
    if (issueKeywords.includes('design')) {
      context += "\n\n• **Common Law Principles Regarding Design Responsibility**: The standard of care applicable to design obligations depends on the contractual terms and the nature of the obligation:";
      context += "\n   - A 'reasonable skill and care' obligation is measured against the standard of a reasonably competent member of the relevant profession;";
      context += "\n   - A 'fitness for purpose' obligation is stricter, requiring the design to be suitable for its intended purpose regardless of the level of skill applied;";
      context += "\n   - The precise standard applicable will depend on the contractual drafting and may be influenced by professional appointment terms, collateral warranties, and any limitations of liability.";
    }
    
    // Case law
    context += "\n\n• **Relevant Case Law**: The interpretation and application of both contractual and statutory provisions are informed by precedent from construction cases, including:";
    
    if (issueKeywords.includes('payment')) {
      context += "\n   - *S&T (UK) Ltd v Grove Developments Ltd* [2018] EWCA Civ 2448: Establishing the importance of valid payment and pay less notices;";
      context += "\n   - *ISG Construction Ltd v Seevic College* [2014] EWHC 4007 (TCC): Highlighting the consequences of failing to issue payment notices;";
      context += "\n   - *Henia Investments Inc v Beck Interiors Ltd* [2015] EWHC 2433 (TCC): Addressing the requirements for a valid payment application.";
    }
    
    if (issueKeywords.includes('delay') || issueKeywords.includes('extension')) {
      context += "\n   - *Walter Lilly & Co Ltd v Mackay* [2012] EWHC 1773 (TCC): Providing guidance on extension of time claims and concurrent delay;";
      context += "\n   - *North Midland Building Ltd v Cyden Homes Ltd* [2018] EWCA Civ 1744: Establishing that parties can allocate the risk of concurrent delay through express contractual provisions;";
      context += "\n   - *Multiplex Construction (UK) Ltd v Honeywell Control Systems Ltd* [2007] EWHC 447 (TCC): Addressing global claims and the burden of proof in delay claims.";
    }
    
    if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      context += "\n   - *Blue v Ashley* [2017] EWHC 1928 (Comm): Emphasizing the importance of following contractual variation procedures;";
      context += "\n   - *RTS Flexible Systems Ltd v Molkerei Alois Müller GmbH* [2010] UKSC 14: Addressing when work proceeds before formal contract execution;";
      context += "\n   - *Williams v Roffey Bros & Nicholls (Contractors) Ltd* [1989] EWCA Civ 5: Relevant to the consideration of agreements to pay additional sums for existing contractual obligations.";
    }
    
    if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      context += "\n   - *MT Højgaard A/S v E.ON Climate & Renewables UK Robin Rigg East Ltd* [2017] UKSC 59: Addressing fitness for purpose obligations in construction contracts;";
      context += "\n   - *McGlinn v Waltham Contractors Ltd* [2007] EWHC 149 (TCC): Providing guidance on the assessment of damages for defective work;";
      context += "\n   - *Trebor Bassett Holdings Ltd v ADT Fire & Security plc* [2012] EWCA Civ 1158: Addressing limitation of liability clauses in relation to defective work.";
    }
    
    // Alternative dispute resolution
    context += "\n\n• **Dispute Resolution Options**: In addition to contractual and statutory rights, parties have several dispute resolution options:";
    context += "\n   - **Adjudication**: A statutory right providing a 28-day procedure for interim binding decisions;";
    context += "\n   - **Mediation**: A non-binding facilitated negotiation process that may help preserve commercial relationships;";
    context += "\n   - **Arbitration**: A private, binding dispute resolution process governed by the Arbitration Act 1996 if provided for in the contract;";
    context += "\n   - **Litigation**: Court proceedings, typically in the Technology and Construction Court for significant construction disputes.";
    
    return context;
  }
  
  function generateClauseExplanations(relevantClauses, contractType) {
    // Generate explanations for each clause
    return relevantClauses.map(clause => {
      let explanation = "";
      
      if (contractType.includes('JCT')) {
        if (clause.includes('4.8') || clause.includes('4.9') || clause.includes('4.10') || clause.includes('4.11') || clause.includes('4.12') || clause.includes('4.13')) {
          explanation = `${clause}: This provision forms part of the interim payment mechanism under the JCT contract. It establishes the payment application, certification, and payment process, including timeframes for each step. These clauses must be read in conjunction with the Construction Act requirements regarding payment notices and pay less notices. Non-compliance with these provisions may result in the employer becoming liable to pay the notified sum (or application amount if no valid payment notice is issued) regardless of the actual value of the work.`;
        } 
        else if (clause.includes('2.26') || clause.includes('2.27') || clause.includes('2.28') || clause.includes('2.29')) {
          explanation = `${clause}: This clause forms part of the extension of time (EOT) mechanism, which allocates the risk of delay between the parties. It defines 'Relevant Events' that entitle the contractor to additional time, the notification requirements, and the procedure for assessment. Key aspects include: the contractor's obligation to notify delays 'forthwith'; the contract administrator's duty to make a 'fair and reasonable' assessment; and provisions for review of EOT determinations at practical completion. EOT entitlement preserves the contractor's right to claim loss and expense (if the delay event is also a Relevant Matter) and protects against liquidated damages for the period of excusable delay.`;
        } 
        else if (clause.includes('2.30') || clause.includes('2.31')) {
          explanation = `${clause}: This clause addresses acceleration of the works, which involves completing the project earlier than would otherwise be possible. Under the JCT, acceleration is typically achieved through agreement rather than instruction, with clause 2.30 providing for negotiations regarding a Confirmed Acceptance (a formal variation requiring the contractor to complete earlier than the current completion date). This is distinct from mitigation measures that the contractor is obliged to take to address its own delays.`;
        }
        else if (clause.includes('3.14') || clause.includes('3.15') || clause.includes('3.16')) {
          explanation = `${clause}: This provision governs variations (also called 'changes' or 'AI's - Architect's Instructions) to the works. It establishes the contract administrator's power to issue instructions changing the works, the contractor's duty to comply (subject to reasonable objection rights), and the basis for valuation. Variations must be properly instructed in writing according to these provisions to create an entitlement to additional payment. The valuation provisions in section 5 (e.g., clauses 5.6-5.9) provide the methodology for pricing variations, with a hierarchy from contract rates to fair valuation.`;
        } 
        else if (clause.includes('2.38') || clause.includes('2.39') || clause.includes('2.40')) {
          explanation = `${clause}: This clause addresses the defects liability period (or 'rectification period'), which runs from practical completion. During this period, the contract administrator may issue instructions requiring the contractor to remedy defects at no additional cost to the employer. The contractor has reasonable access rights to complete such remedial works. At the end of the period, the contract administrator issues a certificate of making good defects if satisfied that identified defects have been remedied.`;
        }
        else if (clause.includes('4.21') || clause.includes('4.22') || clause.includes('4.23')) {
          explanation = `${clause}: This provision governs loss and expense claims, which allow the contractor to recover additional costs caused by matters for which the employer is responsible (Relevant Matters). Unlike extension of time, which addresses delay only, loss and expense provisions address financial impact. To establish entitlement, the contractor must demonstrate that regular progress has been materially affected by a Relevant Matter and provide the information reasonably necessary for the contract administrator to ascertain the amount of loss and expense.`;
        }
        else if (clause.includes('6.4') || clause.includes('6.5')) {
          explanation = `${clause}: This provision addresses the contractor's right to suspend performance for non-payment, a right reinforced by the Construction Act. The contractor must first give notice of intention to suspend, specifying the ground(s) of suspension, and seven days must pass from the notice before suspension can begin. Proper exercise of suspension rights entitles the contractor to extension of time and loss and expense for the suspension period.`;
        }
        else if (clause.includes('8.9') || clause.includes('8.10') || clause.includes('8.11')) {
          explanation = `${clause}: This clause addresses termination rights, which allow a party to bring the contract to an end before completion in specified circumstances. The provisions set out the grounds for termination, the required notice procedure, and the financial consequences of termination. Termination is a last resort with significant consequences, and strict compliance with the procedural requirements is essential for valid termination.`;
        }
        else {
          explanation = `${clause}: This standard provision in JCT contracts should be interpreted contextually within the overall contractual framework. JCT contracts are interpreted considering their commercial purpose, with clauses read in the context of the contract as a whole. Established industry interpretations and relevant case law provide guidance on how such provisions are typically applied in practice.`;
        }
      } 
      else if (contractType.includes('NEC')) {
        if (clause.includes('10.1')) {
          explanation = `${clause}: This is a fundamental provision stating that the parties shall act in a 'spirit of mutual trust and co-operation.' This obligation is central to the NEC philosophy and has been interpreted by courts as creating enforceable obligations of good faith, requiring parties to act honestly, reasonably, and with integrity. It influences the interpretation of other contractual provisions and may prevent parties from taking unfair advantage of contractual mechanisms.`;
        }
        else if (clause.includes('50') || clause.includes('51')) {
          explanation = `${clause}: This provision governs payment assessment and certification. It establishes a regular assessment cycle (typically monthly), the items to be included in assessments (including completed work, changes in Defined Cost, and other contractual entitlements), and the timing for payment following assessment. Unlike some contracts, NEC does not rely on applications from the Contractor, instead requiring the Project Manager to make proactive assessments in accordance with the contract.`;
        } 
        else if (clause.includes('60') || clause.includes('61') || clause.includes('62')) {
          explanation = `${clause}: This clause defines Compensation Events, which are the NEC mechanism for addressing changes, delays, and other events that may entitle the Contractor to additional time and/or money. Clause 60 lists the events that qualify, clause 61 establishes notification requirements (including the important 8-week notification time limit), and clause 62 sets out the quotation procedure. Timely notification and preparation of quotations in accordance with these provisions is critical to preserving entitlement.`;
        } 
        else if (clause.includes('63')) {
          explanation = `${clause}: This clause establishes the principles for assessing Compensation Events, requiring forecasts of the effect on Defined Cost and any delay to the Completion Date or meeting a Key Date. This prospective approach to assessment is a distinctive feature of NEC contracts, focusing on the expected impact rather than actual costs incurred. The assessment must account for both direct physical effects and any time-related implications, applying the same level of detail and accuracy used in the contract documentation.`;
        } 
        else if (clause.includes('15')) {
          explanation = `${clause}: This provision establishes the Early Warning procedure, a proactive risk management mechanism requiring both parties to notify each other of matters that could increase costs, delay completion, or impair performance. Following notification, a risk reduction meeting should be held to discuss how to avoid or mitigate the impact. Failure to give an Early Warning does not prevent an event from being a Compensation Event but may reduce the compensation due if early notification would have reduced the impact.`;
        }
        else if (clause.includes('30') || clause.includes('31') || clause.includes('32')) {
          explanation = `${clause}: This clause addresses programming requirements, including the initial programme submission, content requirements, and updating procedures. The Accepted Programme is a central document in NEC contracts, forming the basis for assessing delays, evaluating Compensation Events, and monitoring progress. It must show planned completion, the order and timing of operations, float, time risk allowances, and other contractually required information.`;
        }
        else if (clause.includes('40') || clause.includes('41') || clause.includes('42') || clause.includes('43')) {
          explanation = `${clause}: This provision deals with quality management and defects. It establishes the quality standards required, testing procedures, the process for identifying and notifying Defects, and the Contractor's obligation to correct Defects within the defect correction period. A Defect is defined as part of the works not in accordance with the Scope, with both the Contractor and Project Manager having obligations to notify Defects they discover.`;
        }
        else if (clause.includes('91') || clause.includes('92') || clause.includes('93')) {
          explanation = `${clause}: This clause addresses termination provisions, specifying the grounds on which each party may terminate, the required notice procedure, and the financial consequences of termination. Grounds include substantial breach, insolvency, corruption, and prolonged suspension. Following termination, detailed provisions govern the accounting process and payment of the final amount due.`;
        }
        else {
          explanation = `${clause}: This provision should be interpreted in accordance with NEC contract principles, which emphasize clarity, proactive management, and mutual cooperation. The NEC uses relatively simple language without legal jargon, aiming for clarity and precision. Provisions should be interpreted purposively, considering the contract's objectives and the requirements for proactive administration that characterize the NEC approach.`;
        }
      } 
      else if (contractType.includes('FIDIC')) {
        if (clause.includes('2.5') || clause.includes('3.5') || clause.includes('20.1')) {
          explanation = `${clause}: This provision establishes notification and claims procedures that are fundamental to preserving entitlements under FIDIC contracts. FIDIC typically requires timely notice of claims (often within 28 days of becoming aware of the event), followed by detailed substantiation. These time limits may operate as conditions precedent, with failure to comply potentially resulting in loss of entitlement. Following a claim, the Engineer is typically required to make a fair determination in consultation with both parties.`;
        }
        else if (clause.includes('8.4') || clause.includes('8.5')) {
          explanation = `${clause}: This clause addresses extension of time entitlement, specifying the events that qualify for EOT and the notification and assessment procedures. To secure an extension, the Contractor must typically demonstrate that a qualifying event has caused or will cause delay to completion, provide timely notice, and submit particulars including an analysis of the delay impact. The Engineer must then make a fair determination of the extension due.`;
        }
        else if (clause.includes('13.1') || clause.includes('13.2') || clause.includes('13.3')) {
          explanation = `${clause}: This provision governs Variations (also called 'Variations' or 'Change Orders'), establishing the Engineer's right to initiate variations, the Contractor's obligation to execute them, and the valuation methodology. Variations may include changes to the Works, sequences, methods, or other requirements. The valuation typically follows a hierarchy from contract rates to cost-plus approaches depending on the nature of the change.`;
        }
        else if (clause.includes('14')) {
          explanation = `${clause}: This clause governs the Contract Price and payment procedures, including applications for payment, certification, timing of payments, and the consequences of late payment. FIDIC contracts typically establish a regular payment cycle, with detailed provisions for the content of payment certificates and the Contractor's right to financing charges for delayed payment.`;
        }
        else if (clause.includes('16') || clause.includes('19')) {
          explanation = `${clause}: This provision addresses suspension and termination rights, specifying the circumstances in which the Contractor may suspend work or either party may terminate the contract. Grounds typically include non-payment, extended suspension, force majeure, and substantial breach. Specific notice periods and procedural requirements must be followed for valid suspension or termination.`;
        }
        else if (clause.includes('4.1') || clause.includes('4.2')) {
          explanation = `${clause}: This clause establishes the Contractor's general obligations, including the duty to execute the Works in accordance with the Contract, provide specified guarantees, and comply with applicable laws. It may also address design responsibilities where the Contractor has a design role, specifying the standard of care required (typically 'fitness for purpose' unless expressly modified).`;
        }
        else if (clause.includes('7') || clause.includes('9')) {
          explanation = `${clause}: This provision deals with testing, completion, and defects liability, establishing procedures for tests on completion, the issuance of completion certificates, and the identification and rectification of defects during the defects notification period. It specifies the Contractor's obligation to search for and remedy defects, as well as the consequences of failure to rectify defects within the specified timeframe.`;
        }
        else {
          explanation = `${clause}: This standard FIDIC provision should be interpreted according to the contract's governing law and the general principles applicable to FIDIC contracts. FIDIC contracts are used internationally and are designed to allocate risks and responsibilities clearly between the parties. Interpretation should consider both the specific wording of the clause and its context within the overall contractual framework.`;
        }
      }
      else {
        explanation = `${clause}: This provision in your specific contract establishes important rights and obligations relevant to the current issue. To properly interpret and apply this clause, consider its precise wording in context, any definitions that may modify its ordinary meaning, its relationship to other contractual provisions, and the commercial purpose it is intended to serve. Where ambiguity exists, courts typically favor interpretations that give commercial efficacy to the contract and avoid absurd results.`;
      }
      
      return explanation;
    });
  }
  
  function generatePotentialOutcomes(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let outcomes = "Based on the information provided and analysis of the contractual framework, potential outcomes may include:";
    
    // Payment issues outcomes
    if (issueKeywords.includes('payment')) {
      outcomes += "\n\n**1. Negotiated Resolution (Most Common)**";
      outcomes += "\n   • Parties reach agreement on the disputed payment through commercial discussions.";
      outcomes += "\n   • This typically results in a compromise settlement, potentially documented through a settlement agreement.";
      outcomes += "\n   • Pros: Preserves commercial relationships, avoids costs of formal dispute resolution, provides certainty.";
      outcomes += "\n   • Cons: May require compromise on entitlements, can create precedent for future valuations.";
      
      outcomes += "\n\n**2. Application of Contractual Mechanisms**";
      outcomes += "\n   • Utilization of the payment notice procedures under the contract and Construction Act.";
      outcomes += "\n   • This may result in 'default payment' of the notified or applied sum if proper notices are not issued.";
      outcomes += "\n   • Pros: Can result in prompt payment, strong legal foundation if notices were not properly issued.";
      outcomes += "\n   • Cons: Strict compliance with notice requirements necessary, potentially adversarial approach.";
      
      outcomes += "\n\n**3. Suspension of Performance**";
      outcomes += "\n   • If payment is not made as required, proper notice of intention to suspend followed by actual suspension.";
      outcomes += "\n   • This is a statutory right under the Construction Act, providing entitlement to extension of time and costs.";
      outcomes += "\n   • Pros: Powerful leverage to secure payment, statutory protection for proper exercise.";
      outcomes += "\n   • Cons: Must be exercised precisely according to the Act, potential commercial damage, may escalate dispute.";
      
      outcomes += "\n\n**4. Formal Dispute Resolution**";
      outcomes += "\n   • If other approaches fail, progression to adjudication, the most common method for payment disputes.";
      outcomes += "\n   • Adjudication provides a 28-day procedure with a temporarily binding decision.";
      outcomes += "\n   • Pros: Relatively quick, less expensive than litigation/arbitration, high enforcement rate.";
      outcomes += "\n   • Cons: Limited time for complex issues, temporarily binding only, can damage relationships.";
      
      outcomes += "\n\n**5. Mediation as Alternative**";
      outcomes += "\n   • Appointment of a neutral mediator to facilitate negotiations between the parties.";
      outcomes += "\n   • This non-binding process aims to help parties find their own solution.";
      outcomes += "\n   • Pros: Preserves relationships, confidential, flexible, high success rate, can address wider issues.";
      outcomes += "\n   • Cons: Requires willing participation of both parties, no guaranteed outcome.";
      
      outcomes += "\n\n**6. Eventual Litigation/Arbitration**";
      outcomes += "\n   • If the dispute remains unresolved through other means, final determination through court or arbitration.";
      outcomes += "\n   • This provides a final and binding resolution based on full examination of the issues.";
      outcomes += "\n   • Pros: Definitive resolution, precise application of legal rights, precedent value.";
      outcomes += "\n   • Cons: Expensive, time-consuming, typically damages commercial relationships.";
    } 
    // Delay issues outcomes
    else if (issueKeywords.includes('delay')) {
      outcomes += "\n\n**1. Extension of Time Award**";
      outcomes += "\n   • Assessment and award of additional time to complete the works without liability for liquidated damages.";
      outcomes += "\n   • This may be granted in full or in part, depending on entitlement and substantiation.";
      outcomes += "\n   • Pros: Protects against liquidated damages, establishes new contractual completion date.";
      outcomes += "\n   • Cons: May not include compensation for prolongation costs if not a compensable delay.";
      
      outcomes += "\n\n**2. Financial Compensation (Loss and Expense/Compensation Event)**";
      outcomes += "\n   • Where delays are attributable to compensable events, financial recovery for prolongation costs.";
      outcomes += "\n   • This typically includes extended preliminaries, site overheads, and other time-related costs.";
      outcomes += "\n   • Pros: Financial recovery for delay impact, preserves project viability.";
      outcomes += "\n   • Cons: Requires detailed substantiation, may not cover full commercial impact, potentially complex calculation.";
      
      outcomes += "\n\n**3. Liquidated Damages Assessment**";
      outcomes += "\n   • If the delay is determined to be the contractor's responsibility, deduction of liquidated damages at the contractual rate.";
      outcomes += "\n   • This represents a pre-agreed sum for contractor-caused delay.";
      outcomes += "\n   • Pros: Simplifies quantification of employer's loss, provides certainty.";
      outcomes += "\n   • Cons: May be challenged as penalty, requires proper administration of extension of time provisions to be enforceable.";
      
      outcomes += "\n\n**4. Acceleration Measures**";
      outcomes += "\n   • Agreement to implement acceleration measures to recover lost time.";
      outcomes += "\n   • This may involve additional resources, changed methods, or extended working hours.";
      outcomes += "\n   • Pros: Maintains project completion targets, potentially mitigates wider commercial impact.";
      outcomes += "\n   • Cons: Typically requires additional payment, may affect quality if rushed, potential labor law implications.";
      
      outcomes += "\n\n**5. Programme Revision**";
      outcomes += "\n   • Formal revision of the project programme to reflect the impact of delays.";
      outcomes += "\n   • This establishes a new baseline for measuring progress and future delays.";
      outcomes += "\n   • Pros: Creates realistic expectations, provides clear basis for future extension claims.";
      outcomes += "\n   • Cons: May acknowledge substantial project overrun, potential commercial implications.";
      
      outcomes += "\n\n**6. Termination (Extreme Cases)**";
      outcomes += "\n   • In cases of prolonged or fundamental delays, potential termination of the contract.";
      outcomes += "\n   • This represents a last resort when delays render the project commercially unviable.";
      outcomes += "\n   • Pros: Limits ongoing losses, allows engagement of alternative resources to complete works.";
      outcomes += "\n   • Cons: Significant commercial and legal implications, likely to result in formal dispute proceedings.";
      
      outcomes += "\n\n**7. Formal Dispute Resolution**";
      outcomes += "\n   • If parties cannot agree on responsibility or entitlement, progression to adjudication, mediation, arbitration, or litigation.";
      outcomes += "\n   • This provides an independent determination of the issues.";
      outcomes += "\n   • Pros: Independent assessment, binding determination, potential for full review of evidence.";
      outcomes += "\n   • Cons: Cost, time, potential commercial damage, uncertain outcome.";
    } 
    // Variation issues outcomes
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      outcomes += "\n\n**1. Valuation Agreement**";
      outcomes += "\n   • Parties reach agreement on the value of the variation and any associated time implications.";
      outcomes += "\n   • This typically results in a formally recorded agreement through a variation order or confirmation.";
      outcomes += "\n   • Pros: Certainty, preservation of commercial relationships, simplified payment processing.";
      outcomes += "\n   • Cons: Potential for undervaluation if full impacts not considered, may create precedent for future variations.";
      
      outcomes += "\n\n**2. Partial Agreement / Reserved Rights**";
      outcomes += "\n   • Agreement on certain aspects (e.g., that a variation has occurred) while reserving position on others (e.g., full value).";
      outcomes += "\n   • This allows work to proceed while detailed assessment continues.";
      outcomes += "\n   • Pros: Avoids project delay, preserves rights, allows time for proper assessment.";
      outcomes += "\n   • Cons: Uncertainty, potential for subsequent dispute, administrative complexity.";
      
      outcomes += "\n\n**3. Disputed Instruction Status**";
      outcomes += "\n   • Disagreement about whether a proper variation instruction was issued or whether work constitutes a variation.";
      outcomes += "\n   • This focuses on the procedural compliance with the contract's variation mechanisms.";
      outcomes += "\n   • Pros: Maintains contractual integrity, enforces proper procedures.";
      outcomes += "\n   • Cons: Potential project delay, contractual/commercial tension, possible retrospective formalization required.";
      
      outcomes += "\n\n**4. Quantum Meruit Assessment**";
      outcomes += "\n   • Where work has been carried out without proper instruction but with employer knowledge, potential quantum meruit claim.";
      outcomes += "\n   • This represents a claim for reasonable value of work outside strict contractual mechanisms.";
      outcomes += "\n   • Pros: Potential recovery where contractual mechanisms not followed, prevents unjust enrichment.";
      outcomes += "\n   • Cons: Legally complex, less certain than contractual entitlements, higher evidential burden.";
      
      outcomes += "\n\n**5. Global Claims Approach**";
      outcomes += "\n   • Where numerous variations have cumulative impact beyond their individual effects, potential global claim.";
      outcomes += "\n   • This addresses the disruption and inefficiency caused by multiple changes.";
      outcomes += "\n   • Pros: Recognizes practical impact of multiple changes, addresses loss that's difficult to attribute to specific variations.";
      outcomes += "\n   • Cons: Legally challenging, high evidential burden, often skeptically received by tribunals.";
      
      outcomes += "\n\n**6. Formal Dispute Resolution**";
      outcomes += "\n   • If agreement cannot be reached, progression to adjudication, mediation, arbitration, or litigation.";
      outcomes += "\n   • This provides independent determination based on contractual entitlements and evidence.";
      outcomes += "\n   • Pros: Definitive resolution, application of contractual rights, precedent value.";
      outcomes += "\n   • Cons: Cost, time, potentially adversarial process, uncertain outcome.";
    } 
    // Quality/defects issues outcomes
    else if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      outcomes += "\n\n**1. Remedial Works by Original Contractor**";
      outcomes += "\n   • The contractor rectifies defective work at their own expense in accordance with contract requirements.";
      outcomes += "\n   • This represents the primary contractual remedy for defects.";
      outcomes += "\n   • Pros: Preserves contractual relationship, contractor familiarity with the works, clear contractual basis.";
      outcomes += "\n   • Cons: Potential disruption to occupants/operations, quality concerns if same contractor produced defective work.";
      
      outcomes += "\n\n**2. Financial Adjustment / Damages**";
      outcomes += "\n   • Agreement on financial compensation instead of remedial works, particularly for minor defects or where rectification would be disproportionately disruptive.";
      outcomes += "\n   • This typically involves a reduction in contract sum or damages payment.";
      outcomes += "\n   • Pros: Avoids disruption of remedial works, immediate resolution, employer can choose timing/contractor for repairs.";
      outcomes += "\n   • Cons: Requires agreement on financial value, may leave defects unremedied, potential for undervaluation of long-term impact.";
      
      outcomes += "\n\n**3. Replacement Contractor with Recovery of Costs**";
      outcomes += "\n   • Engagement of alternative contractor to remedy defects with recovery of costs from original contractor.";
      outcomes += "\n   • This typically follows failure of original contractor to rectify within reasonable time.";
      outcomes += "\n   • Pros: Ensures timely remediation, potential quality improvement, maintains project progress.";
      outcomes += "\n   • Cons: Contractual complexity, potential disputes over reasonable cost, warranty implications.";
      
      outcomes += "\n\n**4. Expert Determination on Technical Issues**";
      outcomes += "\n   • Appointment of independent expert to determine technical aspects of defects disputes.";
      outcomes += "\n   • This addresses situations where parties disagree on whether works are defective or required remediation method.";
      outcomes += "\n   • Pros: Technical expertise, relatively quick, less adversarial than formal dispute resolution.";
      outcomes += "\n   • Cons: Limited to technical rather than legal issues, may not be binding unless agreed, additional cost.";
      
      outcomes += "\n\n**5. Withholding of Payment / Retention**";
      outcomes += "\n   • Retention of appropriate sums to cover the cost of rectifying defects.";
      outcomes += "\n   • This provides security for the employer while defects issues are resolved.";
      outcomes += "\n   • Pros: Provides financial security, incentivizes contractor to remedy defects promptly.";
      outcomes += "\n   • Cons: Potential disputes over appropriate sum, must comply with contractual/statutory requirements for withholding.";
      
      outcomes += "\n\n**6. Professional Negligence Claim (Design Issues)**";
      outcomes += "\n   • Where defects result from design failure, potential professional negligence claim against design team.";
      outcomes += "\n   • This addresses design defects rather than workmanship issues.";
      outcomes += "\n   • Pros: Recovery where defects are design-related, potential coverage by professional indemnity insurance.";
      outcomes += "\n   • Cons: Legally complex, higher burden of proof, typically requires expert evidence, limitation periods apply.";
      
      outcomes += "\n\n**7. Formal Dispute Resolution**";
      outcomes += "\n   • If agreement cannot be reached on defects liability or remediation, progression to adjudication, mediation, arbitration, or litigation.";
      outcomes += "\n   • This provides independent determination of technical and legal issues.";
      outcomes += "\n   • Pros: Binding determination, expert tribunal (particularly in arbitration/TCC litigation), comprehensive assessment.";
      outcomes += "\n   • Cons: Cost, time, potentially adversarial process, execution risk remains after determination.";
    }
    // General contractual disputes outcomes
    else {
      outcomes += "\n\n**1. Contractual Resolution Through Existing Mechanisms**";
      outcomes += "\n   • Application of specific contractual procedures designed to address the issue in question.";
      outcomes += "\n   • This may involve determinations by the contract administrator, engineer, or project manager.";
      outcomes += "\n   • Pros: Follows agreed contractual framework, maintains contractual integrity, typically faster than formal disputes.";
      outcomes += "\n   • Cons: Potential concerns about impartiality of determining party, limited to contractual remedies.";
      
      outcomes += "\n\n**2. Negotiated Commercial Settlement**";
      outcomes += "\n   • Parties reach a commercial compromise that might not strictly align with contractual entitlements but is acceptable to both.";
      outcomes += "\n   • This often involves give-and-take on various issues to reach overall agreement.";
      outcomes += "\n   • Pros: Preserves commercial relationships, provides certainty, typically faster resolution, can address multiple issues.";
      outcomes += "\n   • Cons: May diverge from strict contractual entitlements, potential precedent concerns, requires mutual willingness.";
      
      outcomes += "\n\n**3. Contract Amendment or Variation**";
      outcomes += "\n   • Formal amendment to the contract to address the disputed issue or clarify ambiguous provisions.";
      outcomes += "\n   • This creates a revised contractual framework going forward.";
      outcomes += "\n   • Pros: Provides clarity for future operations, prevents recurrence of same dispute, can formalize practical arrangements.";
      outcomes += "\n   • Cons: Requires agreement of both parties, potential impact on other contract provisions, may require legal review.";
      
      outcomes += "\n\n**4. Mediation**";
      outcomes += "\n   • Engagement of neutral mediator to facilitate negotiated resolution.";
      outcomes += "\n   • This structured process helps parties find their own solution with expert assistance.";
      outcomes += "\n   • Pros: Preserves relationships, flexible, confidential, high success rate, can address commercial factors beyond strict legal rights.";
      outcomes += "\n   • Cons: Non-binding unless settlement reached, requires participation of both parties, additional cost.";
      
      outcomes += "\n\n**5. Early Neutral Evaluation**";
      outcomes += "\n   • Appointment of independent evaluator to provide non-binding assessment of the likely outcome if the dispute proceeded to formal resolution.";
      outcomes += "\n   • This provides a reality check for both parties.";
      outcomes += "\n   • Pros: Informs realistic settlement positions, less formal than adjudication, can narrow issues in dispute.";
      outcomes += "\n   • Cons: Additional cost, non-binding, requires agreement on evaluator and process.";
      
      outcomes += "\n\n**6. Adjudication**";
      outcomes += "\n   • Statutory 28-day dispute resolution process delivering temporarily binding decision.";
      outcomes += "\n   • This provides quick resolution while preserving right to final determination through litigation/arbitration.";
      outcomes += "\n   • Pros: Quick, relatively inexpensive, high compliance rate, preserves cash flow while dispute continues.";
      outcomes += "\n   • Cons: Limited time for complex issues, temporarily binding only, potential for 'rough justice', sequential adjudications on related issues.";
      
      outcomes += "\n\n**7. Arbitration or Litigation**";
      outcomes += "\n   • Final binding determination through arbitration (if contractually provided) or court proceedings.";
      outcomes += "\n   • This provides comprehensive legal assessment of all issues.";
      outcomes += "\n   • Pros: Final resolution, full consideration of issues, developed legal procedures, binding precedent (litigation).";
      outcomes += "\n   • Cons: Expensive, time-consuming, typically damages commercial relationships, uncertain outcome.";
    }
    
    return outcomes;
  }
  
  function generateTimelineSuggestions(issueDescription) {
    const issueKeywords = issueDescription.toLowerCase();
    let timeline = "Recommended timeline for addressing this issue:";
    
    // Payment issues timeline
    if (issueKeywords.includes('payment')) {
      timeline += "\n\n**Immediate Actions (1-3 days)**";
      timeline += "\n• Review contract payment terms and notice requirements in detail.";
      timeline += "\n• Verify status of all payment applications, notices, and certificates.";
      timeline += "\n• Check compliance with Construction Act payment provisions.";
      timeline += "\n• Compile all relevant documentation (applications, payment notices, pay less notices, previous certificates).";
      timeline += "\n• Quantify the exact amount claimed with supporting calculations.";
      
      timeline += "\n\n**Short-Term Actions (3-7 days)**";
      timeline += "\n• Issue formal correspondence clearly stating position with reference to contract clauses and statutory provisions.";
      timeline += "\n• Request face-to-face or virtual meeting with relevant decision-makers to discuss resolution.";
      timeline += "\n• Prepare detailed payment reconciliation showing amounts applied for, certified, paid, and outstanding.";
      timeline += "\n• Identify any procedural failures in the payment process that may create statutory payment obligations.";
      
      timeline += "\n\n**Medium-Term Actions (7-14 days)**";
      timeline += "\n• If payment remains unresolved, issue formal notice of intention to suspend performance (allowing the required notice period specified in the contract or the statutory minimum of 7 days).";
      timeline += "\n• Consider whether to claim interest under contractual provisions or the Late Payment of Commercial Debts (Interest) Act.";
      timeline += "\n• Engage senior management from both organizations in resolution discussions.";
      timeline += "\n• Begin preparations for potential adjudication including identification of suitable adjudicators.";
      
      timeline += "\n\n**Longer-Term Actions (14-28 days)**";
      timeline += "\n• If the issue remains unresolved, implement suspension of performance following proper notification.";
      timeline += "\n• Refer the dispute to adjudication with notice of adjudication and referral document.";
      timeline += "\n• Consider whether parallel mediation might facilitate resolution while adjudication proceeds.";
      timeline += "\n• Document all costs associated with suspension for potential loss and expense claim.";
      
      timeline += "\n\n**Follow-Up Actions (28+ days)**";
      timeline += "\n• Implement adjudicator's decision within required timeframe (usually immediately enforceable).";
      timeline += "\n• If decision is not complied with, consider enforcement through Technology and Construction Court (typically 7-14 days).";
      timeline += "\n• Review payment processes to prevent recurrence of similar issues.";
      timeline += "\n• Consider long-term commercial relationship implications and potential need for contract amendments.";
    } 
    // Delay issues timeline
    else if (issueKeywords.includes('delay')) {
      timeline += "\n\n**Immediate Actions (1-3 days)**";
      timeline += "\n• Document the cause and extent of delay with supporting evidence (photographs, site records, correspondence).";
      timeline += "\n• Review contract provisions regarding extension of time, including notice requirements and qualifying events.";
      timeline += "\n• Check programme impact using critical path analysis or other appropriate scheduling method.";
      timeline += "\n• Verify compliance with any contractual time limits for notifications.";
      timeline += "\n• Secure any physical evidence that may disappear or change with time.";
      
      timeline += "\n\n**Short-Term Actions (3-7 days)**";
      timeline += "\n• Issue formal delay notification in accordance with contractual requirements, ensuring compliance with any specified format or content.";
      timeline += "\n• Implement mitigation measures to minimize delay impact where reasonably possible.";
      timeline += "\n• Hold delay impact assessment meeting with relevant project team members.";
      timeline += "\n• Begin tracking costs associated with the delay for potential loss and expense/compensation event claim.";
      timeline += "\n• Initiate regular progress updates to document ongoing delay effects.";
      
      timeline += "\n\n**Medium-Term Actions (7-21 days)**";
      timeline += "\n• Submit detailed extension of time application with supporting documentation, including:";
      timeline += "\n  - Cause of delay and contractual basis for claim";
      timeline += "\n  - Critical path analysis showing impact on completion";
      timeline += "\n  - Programme showing pre-delay and post-delay positions";
      timeline += "\n  - Evidence linking cause to effect";
      timeline += "\n  - Proposed revised completion date";
      timeline += "\n• Request extension of time assessment meeting with contract administrator/project manager.";
      timeline += "\n• Continue documenting progress and impact of delay events.";
      
      timeline += "\n\n**Longer-Term Actions (21-42 days)**";
      timeline += "\n• Follow up on extension of time application if no response received within contractual timeframe.";
      timeline += "\n• Submit loss and expense/compensation event claim if delay is compensable under the contract.";
      timeline += "\n• Consider whether acceleration measures might be appropriate (with associated cost claim).";
      timeline += "\n• If extension of time is inadequately assessed, consider formal dispute resolution options.";
      
      timeline += "\n\n**Follow-Up Actions (42+ days)**";
      timeline += "\n• Update programmes and schedules to reflect any granted extensions.";
      timeline += "\n• Implement recovery measures if extension granted is less than delay impact.";
      timeline += "\n• Monitor ongoing delays and submit further notices/applications as necessary.";
      timeline += "\n• Review delay events to identify preventative measures for future projects.";
    } 
    // Variation issues timeline
    else if (issueKeywords.includes('variation') || issueKeywords.includes('change')) {
      timeline += "\n\n**Immediate Actions (1-3 days)**";
      timeline += "\n• Clarify whether the variation has been properly instructed in accordance with the contract.";
      timeline += "\n• Review contract provisions regarding variation instructions, valuation, and notification requirements.";
      timeline += "\n• Document the current status of any works affected by the variation (photographs, measurements, condition reports).";
      timeline += "\n• Assess initial scope and potential impact of the variation on programme and cost.";
      timeline += "\n• Verify authority of person issuing variation instruction if there is any doubt.";
      
      timeline += "\n\n**Short-Term Actions (3-7 days)**";
      timeline += "\n• If variation instruction was not properly issued but work is proceeding, seek formal confirmation or regularization.";
      timeline += "\n• Submit initial notification of time and cost implications in accordance with contract requirements.";
      timeline += "\n• Establish variation tracking system if multiple variations are anticipated.";
      timeline += "\n• Prepare method statement and resource plan for executing the varied work.";
      timeline += "\n• Consider whether variations affect any critical path activities.";
      
      timeline += "\n\n**Medium-Term Actions (7-14 days)**";
      timeline += "\n• If possible, agree valuation methodology and potential time impact before proceeding with significant varied work.";
      timeline += "\n• Submit detailed variation quotation including:";
      timeline += "\n  - Direct costs (labor, materials, plant)";
      timeline += "\n  - Preliminaries/overhead impact";
      timeline += "\n  - Program implications";
      timeline += "\n  - Design fees if applicable";
      timeline += "\n  - Risk allowances";
      timeline += "\n• Seek formal acceptance of quotation if contract mechanism allows.";
      timeline += "\n• Begin implementing variation while maintaining detailed records.";
      
      timeline += "\n\n**During Execution (Ongoing)**";
      timeline += "\n• Maintain detailed records specific to the variation, including:";
      timeline += "\n  - Labor allocation and hours";
      timeline += "\n  - Plant and equipment usage";
      timeline += "\n  - Materials quantities and costs";
      timeline += "\n  - Any disruption to planned sequence";
      timeline += "\n• Document any changes to the variation scope during execution.";
      timeline += "\n• Provide regular updates on variation progress and cost.";
      timeline += "\n• Notify promptly if circumstances change affecting time or cost.";
      
      timeline += "\n\n**Post-Completion Actions (14-28 days after completion of varied work)**";
      timeline += "\n• Submit final detailed valuation of the variation with supporting documentation.";
      timeline += "\n• Reconcile estimated costs against actual costs incurred.";
      timeline += "\n• Assess and document any wider impact on unchanged works (disruption, out-of-sequence working).";
      timeline += "\n• Update master programme to reflect completed variation works.";
      timeline += "\n• Ensure variation is properly incorporated into as-built documentation.";
    }
    // General contractual disputes timeline
    else {
      timeline += "\n\n**Immediate Actions (1-5 days)**";
      timeline += "\n• Review relevant contract clauses and gather all documentation related to the issue.";
      timeline += "\n• Assess factual circumstances and contractual position objectively.";
      timeline += "\n• Identify key contractual provisions, rights, and obligations applicable to the situation.";
      timeline += "\n• Compile chronology of relevant events with supporting documentation.";
      timeline += "\n• Consult internally with project team to gather all relevant information and perspectives.";
      
      timeline += "\n\n**Short-Term Actions (5-10 days)**";
      timeline += "\n• Prepare a clear written statement of your position, referencing specific contract clauses.";
      timeline += "\n• Document the commercial and practical impact of the issue on your operations.";
      timeline += "\n• Identify potential solutions that would be acceptable, creating a negotiation strategy.";
      timeline += "\n• Issue formal correspondence setting out your position and proposed resolution approach.";
      timeline += "\n• Request a meeting with the other party to discuss resolution within a specific timeframe.";
      
      timeline += "\n\n**Medium-Term Actions (10-20 days)**";
      timeline += "\n• Engage in direct discussion with the other party to explore potential resolution.";
      timeline += "\n• Consider whether any contractual determination mechanisms apply to the issue.";
      timeline += "\n• If initial discussions are unsuccessful, escalate to senior management level.";
      timeline += "\n• Assess whether external expertise would assist (e.g., technical expert, legal advisor).";
      timeline += "\n• Document all discussions and continue to maintain relevant records.";
      
      timeline += "\n\n**Longer-Term Actions (20-40 days)**";
      timeline += "\n• If direct negotiation is unsuccessful, consider alternative dispute resolution options:";
      timeline += "\n  - Mediation (typically arrangements can be made within 2-3 weeks)";
      timeline += "\n  - Early neutral evaluation (similar timeframe to mediation)";
      timeline += "\n  - Adjudication (28-day process from referral)";
      timeline += "\n• Prepare detailed submission for chosen dispute resolution method.";
      timeline += "\n• Continue to explore settlement possibilities in parallel with formal processes.";
      
      timeline += "\n\n**Follow-Up Actions (40+ days)**";
      timeline += "\n• Implement any resolution or decision reached through negotiation or formal processes.";
      timeline += "\n• Document lessons learned to prevent similar issues on future projects.";
      timeline += "\n• Consider whether contract amendments would help prevent recurrence.";
      timeline += "\n• Review whether any related issues need addressing following resolution of the primary dispute.";
      timeline += "\n• Assess impact on overall project and update programmes/forecasts accordingly.";
    }
    
    return timeline;
  }
  
  function generateRiskAssessment(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let assessment = "**RISK ASSESSMENT ANALYSIS**";
    
    // Probability assessment section with role-specific analysis
    assessment += "\n\n**Probability Analysis:**";
    
    if (issueKeywords.includes('payment') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\n**Medium to High Probability of Favorable Resolution**: Payment disputes typically have strong statutory protection for contractors, particularly where proper notice procedures have been followed. The Construction Act provides significant protection regarding payment mechanisms, and the courts have consistently upheld the importance of procedural compliance with payment notice requirements. Success probability increases significantly where:";
      assessment += "\n• Applications for payment were properly submitted in accordance with the contract";
      assessment += "\n• No valid Payment Notice or Pay Less Notice was issued within statutory timeframes";
      assessment += "\n• The work claimed has been substantively performed";
      assessment += "\n• You have contemporaneous records supporting the valuation claimed";
      
      assessment += "\n\nSuccess probability decreases where:";
      assessment += "\n• Applications did not comply with contractual requirements (timing, format, address)";
      assessment += "\n• There are genuine quality or defect issues with the work claimed";
      assessment += "\n• The claimed sum includes significant loss and expense elements without detailed substantiation";
      assessment += "\n• There have been procedural irregularities in previous payment cycles that established a pattern";
    } 
    else if (issueKeywords.includes('payment') && (role.includes('Client') || role.includes('Employer'))) {
      assessment += "\n\n**Variable Probability Based on Procedural Compliance**: As the paying party, your position strength depends primarily on procedural compliance with payment mechanisms. The Construction Act and case law strongly favor the payee where procedural requirements have not been met. Your probability of successfully defending payment claims increases where:";
      assessment += "\n• Valid Payment Notices and/or Pay Less Notices were issued within required timeframes";
      assessment += "\n• Notices contained the required information (amount proposed, basis of calculation)";
      assessment += "\n• There are genuine, documented defects or non-compliant work";
      assessment += "\n• You have contemporaneous records supporting your valuation";
      
      assessment += "\n\nYour position is significantly weakened where:";
      assessment += "\n• Notices were not issued, were late, or were inadequately detailed";
      assessment += "\n• You failed to operate the contractual payment mechanism consistently";
      assessment += "\n• You have made contra-charges without proper notification";
      assessment += "\n• There is evidence of 'smash and grab' motivation in withholding payment";
    }
    else if (issueKeywords.includes('delay') && issueKeywords.includes('weather') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\n**Medium Probability of Partial Success**: Weather-related delay claims typically present a mixed probability profile. Extension of time entitlement is generally stronger than financial recovery prospects. Success probability for extension of time increases where:";
      assessment += "\n• Weather conditions were demonstrably exceptional compared to 10-year averages for the location/season";
      assessment += "\n• Weather impact on critical activities is clearly documented with contemporaneous records";
      assessment += "\n• Proper notice was given in accordance with the contract";
      assessment += "\n• The contract specifically identifies exceptional weather as a relevant event";
      
      assessment += "\n\nSuccess probability for financial recovery is typically lower and depends on whether:";
      assessment += "\n• The contract specifically identifies weather as a compensable event (uncommon in standard forms)";
      assessment += "\n• You can demonstrate that the weather conditions were beyond what could reasonably have been foreseen";
      assessment += "\n• You took reasonable precautions against normal weather events";
      assessment += "\n• You have detailed records of specific additional costs caused by the weather";
    }
    else if (issueKeywords.includes('variation') && issueKeywords.includes('verbal') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\n**Low to Medium Probability of Full Recovery**: Verbal variation instructions present significant evidential challenges as most contracts require written instructions for variations. Success probability increases where:";
      assessment += "\n• There is contemporaneous documentation supporting the verbal instruction (e.g., meeting minutes, emails referencing the discussion)";
      assessment += "\n• The verbal instruction was given by someone with appropriate authority under the contract";
      assessment += "\n• You sought written confirmation promptly after the verbal instruction";
      assessment += "\n• The employer had knowledge of and acquiesced to the varied work proceeding";
      
      assessment += "\n\nSuccess probability decreases where:";
      assessment += "\n• The contract contains an 'entire agreement' clause or expressly requires written instructions";
      assessment += "\n• There is no supporting documentation of the verbal instruction";
      assessment += "\n• The work could be interpreted as correction of defects or contractor-risk items";
      assessment += "\n• The person giving the instruction lacked authority to instruct variations";
    }
    else if (issueKeywords.includes('design') && (contractType.includes('Design and Build') || issueKeywords.includes('contractor design'))) {
      assessment += "\n\n**Medium Probability with Significant Variables**: Design responsibility issues under design and build arrangements present complex risk profiles. The probability of successful resolution depends significantly on:";
      assessment += "\n• Whether the design obligation is 'reasonable skill and care' or 'fitness for purpose'";
      assessment += "\n• The extent and quality of employer's requirements provided";
      assessment += "\n• Whether a novated design team was involved and the terms of novation";
      assessment += "\n• The existence and operation of any design submission and approval procedure";
      
      assessment += "\n\nAdditional risk factors include:";
      assessment += "\n• The technical complexity of the design elements in question";
      assessment += "\n• Whether design development or genuine design changes are at issue";
      assessment += "\n• The clarity of responsibility allocation in the contract documents";
      assessment += "\n• The availability and quality of expert evidence supporting respective positions";
    }
    else {
      assessment += "\n\n**Medium Probability Based on Contractual Merits**: Based on general principles of construction law and typical contract interpretation, this issue presents a moderate probability of successful resolution. Success probability depends on:";
      assessment += "\n• The clarity of relevant contractual provisions";
      assessment += "\n• Quality and completeness of contemporaneous records";
      assessment += "\n• Compliance with contractual procedures and notification requirements";
      assessment += "\n• The commercial reasonableness of your position";
      assessment += "\n• The strength of factual and potentially expert evidence available";
      
      assessment += "\n\nThe specific circumstances of your situation may shift this probability higher or lower. A detailed review by a construction law specialist would provide more precise probability assessment based on the specific contractual provisions and facts.";
    }
    
    // Cost-benefit analysis section
    assessment += "\n\n**Cost-Benefit Analysis:**";
    assessment += "\n\n**Direct Resolution Costs:**";
    assessment += "\n• Internal management time: Significant time commitment for document review, correspondence, and meetings";
    assessment += "\n• Professional fees: Potential costs for specialist advice from quantity surveyors, delay analysts, or legal advisors";
    assessment += "\n• Dispute resolution costs: If formal processes are required, costs escalate substantially with adjudication (£5,000-£15,000+), mediation (£3,000-£8,000+), or litigation/arbitration (£25,000-£100,000+)";
    assessment += "\n• Opportunity cost: Management distraction from current projects and business development";
    
    assessment += "\n\n**Quantifiable Benefits:**";
    if (issueKeywords.includes('payment')) {
      assessment += "\n• Direct recovery: The disputed payment amount of [?]";
      assessment += "\n• Interest: Statutory or contractual interest on late payment (potentially 8% above base rate under Late Payment legislation)";
      assessment += "\n• Financing costs: Avoided costs of alternative financing if payment is secured";
    } else if (issueKeywords.includes('delay')) {
      assessment += "\n• Liquidated damages relief: Avoidance of delay damages at the contractual rate of [?] per day/week";
      assessment += "\n• Prolongation costs: Recovery of extended preliminaries and site overheads";
      assessment += "\n• Inflation costs: Protection against material and labor cost increases during extended period";
    } else if (issueKeywords.includes('variation')) {
      assessment += "\n• Direct costs: Recovery of costs for additional work, materials, and associated overheads";
      assessment += "\n• Programme relief: Extension of time associated with the variation impact";
      assessment += "\n• Disruption costs: Potential recovery for inefficiency caused by out-of-sequence working";
    } else {
      assessment += "\n• Direct financial impact: The quantifiable value of the contractual right or obligation in dispute";
      assessment += "\n• Risk mitigation: Avoided costs of adverse determination if issue is successfully resolved";
      assessment += "\n• Resource reallocation: Optimized resource utilization if contractual clarity is achieved";
    }
    
    assessment += "\n\n**Intangible Factors:**";
    assessment += "\n• Relationship impact: Consider the value of ongoing business relationships versus the value of the claim";
    assessment += "\n• Precedent effect: How resolution might affect other similar issues on this project or future projects";
    assessment += "\n• Reputation considerations: Industry perception and future tender opportunities";
    assessment += "\n• Team morale: Impact on project team effectiveness and commitment";
    
    // Alternative strategies risk comparison
    assessment += "\n\n**Alternative Strategy Risk Comparison:**";
    
    assessment += "\n\n**1. Negotiated Settlement:**";
    assessment += "\n• **Risk Level:** Low to Medium";
    assessment += "\n• **Cost Range:** Lower direct costs but potential compromise on entitlement";
    assessment += "\n• **Timeframe:** Typically 2-4 weeks";
    assessment += "\n• **Probability of Success:** 60-80% for achieving partial resolution";
    assessment += "\n• **Key Benefits:** Preserves relationships, quicker resolution, lower direct costs, certainty of outcome";
    assessment += "\n• **Key Risks:** Potential compromise below full entitlement, might establish unfavorable precedent";
    
    assessment += "\n\n**2. Formal Contractual Mechanisms:**";
    assessment += "\n• **Risk Level:** Medium";
    assessment += "\n• **Cost Range:** Moderate professional fees for detailed submissions";
    assessment += "\n• **Timeframe:** As defined in contract (typically 2-8 weeks)";
    assessment += "\n• **Probability of Success:** 50-70% dependent on contractual merits and evidence quality";
    assessment += "\n• **Key Benefits:** Follows agreed framework, potential for full entitlement, preserves formal dispute options";
    assessment += "\n• **Key Risks:** Decision-maker may not be truly independent, limited recourse if outcome unfavorable";
    
    assessment += "\n\n**3. Adjudication:**";
    assessment += "\n• **Risk Level:** Medium to High";
    assessment += "\n• **Cost Range:** £5,000-£15,000+ plus internal resource commitment";
    assessment += "\n• **Timeframe:** 28 days from referral (potentially extended)";
    assessment += "\n• **Probability of Success:** 40-60% dependent on merits, evidence quality, and adjudicator appointment";
    assessment += "\n• **Key Benefits:** Relatively quick, temporarily binding, enforceable decision, potentially recoverable costs";
    assessment += "\n• **Key Risks:** Limited time for complex issues, 'rough justice' risk, temporarily binding only, relationship damage";
    
    assessment += "\n\n**4. Mediation:**";
    assessment += "\n• **Risk Level:** Low to Medium";
    assessment += "\n• **Cost Range:** £3,000-£8,000+ for mediator and venue";
    assessment += "\n• **Timeframe:** Typically arranged within 2-3 weeks";
    assessment += "\n• **Probability of Success:** 70-80% for achieving some form of resolution";
    assessment += "\n• **Key Benefits:** Preserves relationships, confidential, flexible, high success rate, addresses commercial factors";
    assessment += "\n• **Key Risks:** No guaranteed outcome, requires willing participation, additional cost if unsuccessful";
    
    assessment += "\n\n**5. Litigation/Arbitration:**";
    assessment += "\n• **Risk Level:** High";
    assessment += "\n• **Cost Range:** £25,000-£100,000+ depending on complexity";
    assessment += "\n• **Timeframe:** 9-18 months to final hearing";
    assessment += "\n• **Probability of Success:** 30-70% highly dependent on specific merits and evidence";
    assessment += "\n• **Key Benefits:** Definitive resolution, precise application of legal rights, potential for costs recovery";
    assessment += "\n• **Key Risks:** High cost, significant time investment, uncertain outcome, substantial relationship damage";
    
    // Recommended approach
    assessment += "\n\n**Recommended Approach:**";
    
    if (issueKeywords.includes('payment') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n\nBased on risk-benefit analysis, a graduated approach is recommended:";
      assessment += "\n1. Initial robust correspondence citing specific statutory and contractual rights";
      assessment += "\n2. Senior-level negotiation with clear commercial settlement parameters";
      assessment += "\n3. If unresolved within 14 days, proceed to adjudication while keeping settlement channels open";
      assessment += "\n\nThis approach leverages the strong statutory position while balancing relationship and cost considerations.";
    } 
    else if (issueKeywords.includes('delay') && issueKeywords.includes('weather')) {
      assessment += "\n\nBased on risk-benefit analysis, a measured approach is recommended:";
      assessment += "\n1. Submit detailed extension of time application with comprehensive weather data and impact analysis";
      assessment += "\n2. Focus primary efforts on securing time relief rather than financial compensation";
      assessment += "\n3. Consider compromise position accepting partial EOT without financial recovery";
      assessment += "\n4. Reserve formal dispute rights while pursuing negotiated resolution";
      assessment += "\n\nThis approach recognizes the stronger position on time entitlement versus cost recovery for weather-related delays.";
    }
    else if (issueKeywords.includes('variation') && issueKeywords.includes('verbal')) {
      assessment += "\n\nBased on risk-benefit analysis, a pragmatic approach is recommended:";
      assessment += "\n1. Compile all circumstantial evidence supporting the verbal instruction";
      assessment += "\n2. Seek retrospective formalization of the instruction through agreement";
      assessment += "\n3. Propose a without-prejudice commercial settlement at a discount to full valuation";
      assessment += "\n4. If unsuccessful, consider whether value justifies adjudication risk";
      assessment += "\n\nThis approach acknowledges the evidential challenges while seeking practical resolution.";
    }
    else {
      assessment += "\n\nBased on risk-benefit analysis, a balanced approach is recommended:";
      assessment += "\n1. Detailed contractual analysis and evidence compilation";
      assessment += "\n2. Clear written position statement with settlement proposal";
      assessment += "\n3. Structured negotiation with defined escalation timeline";
      assessment += "\n4. Consider early neutral evaluation or mediation if direct negotiation stalls";
      assessment += "\n5. Prepare for adjudication as contingency while pursuing settlement";
      assessment += "\n\nThis approach balances cost-effective resolution with appropriate protection of contractual rights.";
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
    // Create a more comprehensive set of recommendations
    const recommendations = [];
    const issueKeywords = issueDescription.toLowerCase();
    
    // Payment-related recommendations
    if (issueKeywords.includes('payment')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('Submit a formal payment notice in accordance with contract terms, ensuring compliance with contractual requirements for format, content, and submission method.');
        recommendations.push('Compile comprehensive payment documentation including detailed measurements, valuations, daywork sheets, and records of materials on and off site.');
        recommendations.push('Request a formal meeting with the contract administrator/quantity surveyor to discuss payment discrepancies with supporting documentation.');
        recommendations.push('Issue a formal notice of intention to suspend performance if payment remains outstanding, following the specific procedural requirements in clause 4.14 (JCT) or 91.4 (NEC) and allowing the statutory notice period of 7 days.');
        recommendations.push('Calculate and claim interest on late payment under the contract terms or the Late Payment of Commercial Debts (Interest) Act 1998, which currently provides for 8% above Bank of England base rate.');
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('Review payment application and certification procedures to ensure strict compliance with contractual and statutory requirements.');
        recommendations.push('Ensure Payment Notices and Pay Less Notices are issued within the required timeframes and contain the specified information (amount proposed to be paid and basis of calculation).');
        recommendations.push('Maintain detailed records of defects or non-compliant work that form the basis of any payment withholding.');
        recommendations.push('Document any set-off or abatement claims with precise calculations and supporting evidence.');
        recommendations.push('Consider whether project cash flow issues might be better addressed through formal contract amendment rather than withholding payment improperly.');
      } else {
        recommendations.push('Ensure payment processes and certifications comply with both contractual and statutory requirements, particularly regarding timing and content of notices.');
        recommendations.push('Maintain detailed records of all payment-related communications, notices, and certifications.');
        recommendations.push('Advise relevant parties of their rights and obligations under the contract and Construction Act.');
        recommendations.push('Consider whether independent valuation of disputed items might facilitate resolution.');
        recommendations.push('Ensure appropriate delegation of authority for payment certification is clearly documented and understood.');
      }
    }
    
    // Delay-related recommendations
    if (issueKeywords.includes('delay')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('Document all causes of delay with contemporaneous records, including site diaries, progress reports, photographs, correspondence, and meeting minutes.');
        recommendations.push('Submit extension of time notification strictly in accordance with contractual timeframes and requirements, ensuring it identifies the cause, likely effect, and contractual basis of claim.');
        recommendations.push('Prepare a detailed delay analysis using an appropriate methodology (e.g., time impact analysis, as-planned vs. as-built, impacted as-planned) with supporting critical path network diagrams.');
        recommendations.push('Implement mitigation measures where reasonably practicable and maintain records of such efforts, as many contracts impose a duty to mitigate delays regardless of cause.');
        recommendations.push('For compensable delays, prepare separate loss and expense/compensation event submissions with detailed quantum evidence.');
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('Review extension of time provisions to confirm entitlement criteria, notice requirements, and assessment methodology specified in the contract.');
        recommendations.push('Assess extension of time claims objectively and within contractual timeframes, avoiding blanket rejections that might constitute a breach of contract.');
        recommendations.push('Maintain contemporaneous records of project progress, contractor performance, and any employer-caused delays.');
        recommendations.push('Consider independent programming expertise for complex delay scenarios, particularly where multiple causes of delay interact.');
        recommendations.push('Ensure liquidated damages provisions have been properly operated, including any required notices or certificates, before considering deduction.');
      } else if (role.includes('Contract Administrator') || role.includes('Engineer')) {
        recommendations.push('Assess extension of time claims impartially in accordance with the contract, applying the specified methodology and considering the evidence presented.');
        recommendations.push('Issue determinations within contractual timeframes, providing clear reasons for decisions, particularly where claims are rejected or only partially granted.');
        recommendations.push('Maintain detailed records of your assessment process, including programmes reviewed, methodology applied, and evidence considered.');
        recommendations.push('Consider whether recovery measures or acceleration might be appropriate, subject to appropriate instruction and compensation.');
        recommendations.push('Ensure proper administration of consequential contract mechanisms such as liquidated damages deduction or release of retention.');
      } else {
        recommendations.push('Document all delay events with specific dates, duration, and impact on planned activities.');
        recommendations.push('Submit detailed extension of time requests with supporting evidence and critical path analysis.');
        recommendations.push('Implement and document mitigation measures to minimize delay impacts.');
        recommendations.push('Maintain comprehensive records of all project activities, correspondence, and events affecting progress.');
        recommendations.push('Consider appropriate contractual and practical responses if extension of time is not granted as requested.');
      }
    }
    
    // Variation-related recommendations
    if (issueKeywords.includes('variation')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('Ensure all variations are properly instructed in writing by an authorized person before proceeding with varied work, except in emergency situations.');
        recommendations.push('Submit detailed variation quotations including direct costs, time implications, and any impact on existing works before commencing variation works where contract allows.');
        recommendations.push('Maintain specific variation records separate from general project records, including labor allocation, material usage, plant time, and specific photographs of varied work.');
        recommendations.push('Notify promptly if any variation is likely to cause delay to completion or impact critical path activities, following contractual notification requirements.');
        recommendations.push('Consider potential cumulative impact of multiple variations on unchanged work and maintain records to support any disruption or loss of productivity claims.');
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('Ensure variation instructions are issued only by authorized persons following contractual procedures, typically in writing.');
        recommendations.push('Request detailed quotations for proposed variations before instruction where time permits, establishing cost and time implications upfront.');
        recommendations.push('Maintain a comprehensive variation register documenting each variation, its scope, authorization, agreed value, and time impact.');
        recommendations.push('Consider the potential impact of proposed variations on the critical path and project completion before instruction.');
        recommendations.push('Be aware that significant scope changes might constitute a cardinal change beyond the contractual variation mechanism, potentially creating a separate agreement.');
      } else if (role.includes('Contract Administrator') || role.includes('Engineer')) {
        recommendations.push('Issue variation instructions clearly in writing, specifying exactly what is being changed and providing necessary details or revised drawings.');
        recommendations.push('Ensure variations are properly valued according to the contractual hierarchy (typically contract rates where applicable, pro-rata adjustment where reasonable, fair valuation where no applicable rates exist).');
        recommendations.push('Assess time implications of variations objectively, particularly where they affect critical path activities.');
        recommendations.push('Maintain detailed records of all variations, including the instruction process, agreed scope, valuation, and any disputed elements.');
        recommendations.push('Consider whether proposed variations might be better addressed through separate agreement rather than using the contractual variation mechanism, particularly for substantial changes.');
      } else {
        recommendations.push('Verify that all variations are properly documented and authorized according to contract requirements.');
        recommendations.push('Establish a robust variation management system to track status, valuation, and impact of all changes.');
        recommendations.push('Ensure variation instructions provide clear scope definition and necessary technical details.');
        recommendations.push('Validate that variation valuations follow the methodology prescribed in the contract.');
        recommendations.push('Assess cumulative impact of multiple variations on project timeline and cost.');
      }
    }
    
    // Quality/defects-related recommendations
    if (issueKeywords.includes('defect') || issueKeywords.includes('quality')) {
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        recommendations.push('Implement a comprehensive quality management system including inspection and test plans, material verification, and workmanship checks.');
        recommendations.push('Document any instructions or specifications that may have contributed to alleged defects, including any approvals given by the employer or design team.');
        recommendations.push('Respond promptly to any defect notifications, investigating thoroughly and proposing appropriate remedial methodology.');
        recommendations.push('Where defects are accepted, provide a detailed method statement and programme for remedial works, minimizing disruption to other activities or occupants.');
        recommendations.push('Where defects are disputed, obtain independent expert opinion on compliance with specification and industry standards before formalizing your position.');
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('Document defects thoroughly with photographs, measurements, and specific reference to contract requirements or applicable standards.');
        recommendations.push('Issue formal defect notifications in accordance with contractual procedures, specifying the nature and location of each defect clearly.');
        recommendations.push('Allow reasonable access for inspection and remediation of accepted defects, cooperating with contractor\'s proposed methodology where appropriate.');
        recommendations.push('Consider whether any alleged defects might result from design rather than workmanship issues, as this affects responsibility and remedial obligations.');
        recommendations.push('Ensure any decision to employ others to remedy defects follows contractual requirements for notification and reasonable opportunity to rectify.');
      } else {
        recommendations.push('Inspect work regularly against specification requirements and industry standards, documenting any non-compliance promptly.');
        recommendations.push('Issue clear instructions regarding any defective work, specifying the nature of the defect and required remediation.');
        recommendations.push('Maintain detailed records of all quality-related communications, inspections, and identified defects.');
        recommendations.push('Ensure testing and commissioning procedures are properly implemented and documented.');
        recommendations.push('Consider whether expert determination might assist in resolving technical disputes about alleged defects.');
      }
    }
    
    // Design-related recommendations
    if (issueKeywords.includes('design')) {
      if (role.includes('Contractor') && (contractType.includes('Design and Build') || issueKeywords.includes('contractor design'))) {
        recommendations.push('Review the specific design obligations in your contract, particularly whether the standard is "reasonable skill and care" or "fitness for purpose".');
        recommendations.push('Document any design approvals or acceptances by the employer or their representatives, as these may affect liability depending on contract wording.');
        recommendations.push('Ensure professional indemnity insurance adequately covers your design liability and notify insurers of any potential design issues.');
        recommendations.push('Maintain design development records showing how the design evolved from employer\'s requirements and the rationale for design decisions.');
        recommendations.push('Consider independent expert review of disputed design elements to verify compliance with contractual standards and industry norms.');
      } else if (role.includes('Client') || role.includes('Employer')) {
        recommendations.push('Review the design responsibility allocation in the contract documents, including any limitations or exclusions.');
        recommendations.push('Document any design deficiencies with reference to employer\'s requirements, performance specifications, or objective industry standards.');
        recommendations.push('Consider whether any design approval process operated under the contract affects design liability allocation.');
        recommendations.push('Verify professional indemnity insurance coverage for design liability, including adequacy of coverage limits.');
        recommendations.push('Obtain independent expert assessment of alleged design deficiencies before formalizing claims, particularly for complex technical issues.');
      } else if (role.includes('Architect') || role.includes('Engineer')) {
        recommendations.push('Review your appointment terms regarding design liability, particularly the standard of care and any limitations of liability.');
        recommendations.push('Maintain comprehensive records of design development, decisions, calculations, and any constraints that influenced the design.');
        recommendations.push('Ensure proper coordination between different design disciplines, documenting the coordination process.');
        recommendations.push('Verify that design output complies with all applicable regulations, standards, and contractual requirements.');
        recommendations.push('Notify professional indemnity insurers promptly of any potential design liability claims or circumstances that might give rise to claims.');
      } else {
        recommendations.push('Clarify design responsibility allocation between all parties involved in the project.');
        recommendations.push('Document design development process and key decisions with supporting rationale.');
        recommendations.push('Implement structured design review and approval procedures with clear records.');
        recommendations.push('Ensure design coordination across all disciplines and interfaces.');
        recommendations.push('Verify design compliance with contractual requirements and applicable regulations.');
      }
    }
    
    // General recommendations if specific issues not identified
    if (recommendations.length === 0) {
      recommendations.push('Review all contract documents thoroughly to identify relevant provisions applicable to this issue, including any amendments to standard forms.');
      recommendations.push('Compile a comprehensive chronology of events with supporting documentation to establish the factual background.');
      recommendations.push('Document your interpretation of the relevant contract clauses with reference to established legal principles and industry practice.');
      recommendations.push('Consider whether any pre-contract discussions or communications might be relevant to interpreting ambiguous provisions, subject to any entire agreement clauses.');
      recommendations.push('Seek early resolution through direct commercial discussion, considering the relationship value against the specific issue value.');
      recommendations.push('Consider whether independent expert opinion on technical matters might facilitate resolution of disputed factual issues.');
      recommendations.push('Review previous conduct under the contract to identify any established practices or potential estoppel arguments.');
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