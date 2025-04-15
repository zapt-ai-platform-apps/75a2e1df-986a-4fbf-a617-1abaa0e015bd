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
      // This would typically be an API call or complex logic
      // Simulating draft generation
      const draft = {
        to: getDraftRecipient(projectDetails.organizationRole),
        subject: `Contract Issue: ${projectDetails.projectName}`,
        greeting: "Dear Sir/Madam,",
        body: `I am writing regarding ${projectDetails.projectName}.\n\n` +
              `As the ${projectDetails.organizationRole} under the ${projectDetails.contractType} contract, ` +
              `I wish to bring to your attention the following contract issue(s):\n\n` +
              reportData.analysis.map((analysis, index) => 
                `Issue ${index + 1}: ${analysis.issue}\n` +
                `Relevant Contract Clauses: ${analysis.relevantClauses.join(', ')}\n` +
                `Proposed Resolution: ${analysis.recommendations[0]}\n`
              ).join('\n\n') +
              `\nI look forward to resolving this matter in accordance with the contract terms.`,
        closing: "Yours faithfully,",
        sender: "[Your Name]\n[Your Position]\n[Your Company]"
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
    let analysis = "Based on your description, this issue involves ";
    
    if (issueKeywords.includes('payment')) {
      analysis += "disputes related to payment under the contract. Payment issues are among the most common disputes in construction contracts and typically revolve around the quantum, timing, or conditions for payment. ";
      
      if (role.includes('Contractor') || role.includes('Sub-contractor')) {
        analysis += "As a contractor, you have specific rights regarding payment, including entitlement to prompt payment and potentially the right to suspend work for non-payment, depending on the specific terms of your contract.";
      } else if (role.includes('Client') || role.includes('Employer')) {
        analysis += "As the client, your payment obligations are typically tied to specific milestones, certification of works, or agreed payment schedules. You generally have the right to withhold payment in certain circumstances, such as defective work or non-compliance with contract requirements.";
      }
    } 
    else if (issueKeywords.includes('delay')) {
      analysis += "delays to the project timeline. Delay issues typically involve questions of responsibility, extension of time entitlements, and potential financial implications such as liquidated damages or loss and expense claims. ";
      
      if (contractType.includes('JCT')) {
        analysis += "Under JCT contracts, extensions of time and loss and expense are typically handled through specific 'Relevant Events' and 'Relevant Matters' clauses that define circumstances where contractors may be entitled to additional time or compensation.";
      } else if (contractType.includes('NEC')) {
        analysis += "In NEC contracts, delays are typically addressed through the Early Warning and Compensation Event mechanisms, which encourage proactive management of issues that could affect time, cost, or quality.";
      }
    }
    else if (issueKeywords.includes('variation')) {
      analysis += "variations or changes to the originally agreed scope of work. Variation issues generally involve the process for instructing changes, valuation of additional or omitted work, and the impact on project timelines. ";
      
      if (contractType.includes('JCT')) {
        analysis += "JCT contracts typically handle variations through formal Architect's/Contract Administrator's Instructions and provide mechanisms for valuing changes.";
      } else if (contractType.includes('NEC')) {
        analysis += "NEC contracts manage variations through Compensation Events, which provide a structured process for both instructing and evaluating the impact of changes.";
      }
    } 
    else {
      analysis += "aspects of contract interpretation or implementation that require careful review of the specific terms and conditions in your agreement. Contract disputes often arise from differing interpretations of contractual provisions, unclear drafting, or changes in circumstances not explicitly addressed in the contract.";
    }
    
    return analysis;
  }
  
  function generateLegalContext(contractType, issueDescription) {
    let context = "The legal framework for this issue includes:";
    
    if (contractType.includes('JCT') || contractType.includes('NEC') || contractType.includes('FIDIC')) {
      context += `\n\n• The specific provisions of your ${contractType} contract, which forms the primary basis for resolving the dispute.`;
    } else {
      context += "\n\n• The specific provisions of your contract, which forms the primary basis for resolving the dispute.";
    }
    
    context += "\n\n• The Housing Grants, Construction and Regeneration Act 1996 (as amended), which provides statutory rights regarding payment and adjudication in construction contracts.";
    
    context += "\n\n• The Scheme for Construction Contracts, which may apply where contract provisions do not comply with the statutory requirements.";
    
    if (issueDescription.toLowerCase().includes('payment')) {
      context += "\n\n• The Late Payment of Commercial Debts (Interest) Act 1998, which may entitle the payee to interest on late payments.";
    }
    
    context += "\n\n• Common law principles of contract interpretation and precedent from relevant case law.";
    
    return context;
  }
  
  function generateClauseExplanations(relevantClauses, contractType) {
    // Generate explanations for each clause
    return relevantClauses.map(clause => {
      let explanation = "";
      
      if (contractType.includes('JCT')) {
        if (clause.includes('4.8') || clause.includes('4.9') || clause.includes('4.10')) {
          explanation = `${clause} addresses the payment provisions, including the process for interim payments, the timing of payment notices, and the consequences of late or non-payment.`;
        } else if (clause.includes('2.26') || clause.includes('2.27') || clause.includes('2.28') || clause.includes('2.29')) {
          explanation = `${clause} covers extension of time provisions, setting out the circumstances under which the contractor may be entitled to additional time and the procedures for claiming and assessing such extensions.`;
        } else if (clause.includes('3.14') || clause.includes('3.15') || clause.includes('3.16')) {
          explanation = `${clause} deals with variations to the works, including the process for instructing changes, the contractor's right to reasonable objection, and the valuation of variations.`;
        } else {
          explanation = `${clause} is a standard provision in JCT contracts that requires careful interpretation in the context of your specific issue.`;
        }
      } else if (contractType.includes('NEC')) {
        if (clause.includes('50') || clause.includes('51')) {
          explanation = `${clause} relates to payment assessment and timing, including the process for submitting and assessing applications for payment.`;
        } else if (clause.includes('60') || clause.includes('61') || clause.includes('62')) {
          explanation = `${clause} addresses compensation events, which are the NEC mechanism for dealing with changes, delays, and other events that may entitle the contractor to additional time or money.`;
        } else if (clause.includes('63')) {
          explanation = `${clause} sets out the procedures for assessing compensation events, including the principles for calculating the financial impact.`;
        } else {
          explanation = `${clause} is a standard NEC provision that should be carefully reviewed in the context of your specific circumstances.`;
        }
      } else {
        explanation = `${clause} is a key provision in your contract that appears relevant to the issue at hand. This clause should be carefully reviewed to understand your rights and obligations.`;
      }
      
      return explanation;
    });
  }
  
  function generatePotentialOutcomes(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let outcomes = "Based on the information provided, potential outcomes may include:";
    
    if (issueKeywords.includes('payment')) {
      outcomes += "\n\n• Resolution through negotiation: The parties may reach an agreement on the disputed payment through discussion and compromise.";
      outcomes += "\n\n• Formal notice procedure: Utilizing the contractual payment notice procedures to establish entitlement and enforce payment.";
      outcomes += "\n\n• Statutory right to suspend performance: If payment is not made as required, the unpaid party may have the right to suspend work under the Housing Grants, Construction and Regeneration Act.";
      outcomes += "\n\n• Adjudication: A rapid dispute resolution process specifically designed for construction disputes, typically resulting in a decision within 28 days.";
      outcomes += "\n\n• Mediation: A non-binding facilitated negotiation that may help the parties reach a mutually acceptable solution.";
      outcomes += "\n\n• Arbitration or litigation: More formal and final dispute resolution methods that may be necessary if other approaches fail.";
    } 
    else if (issueKeywords.includes('delay')) {
      outcomes += "\n\n• Extension of time: The contractor may be granted additional time to complete the works without liability for liquidated damages.";
      outcomes += "\n\n• Loss and expense/compensation: The contractor may be entitled to additional payment to cover costs associated with the delay, depending on the cause.";
      outcomes += "\n\n• Liquidated damages: If the delay is the contractor's responsibility, the employer may be entitled to deduct liquidated damages at the rate specified in the contract.";
      outcomes += "\n\n• Termination: In cases of prolonged or fundamental delays, either party may potentially have grounds for termination, depending on the specific circumstances and contract terms.";
      outcomes += "\n\n• Dispute resolution: If the parties cannot agree on responsibility or entitlement, the matter may proceed to adjudication, mediation, arbitration, or litigation.";
    } 
    else if (issueKeywords.includes('variation')) {
      outcomes += "\n\n• Valuation and agreement: The parties may agree on the value of the variation and any associated time implications.";
      outcomes += "\n\n• Partial agreement: The parties might agree on some aspects (e.g., that a variation has occurred) but disagree on others (e.g., valuation).";
      outcomes += "\n\n• Dispute on instruction: There may be disagreement about whether a proper instruction was issued or whether the work constitutes a variation at all.";
      outcomes += "\n\n• Impact assessment: The parties may need to assess not just the direct costs of the variation but also any impact on the wider works or project timeline.";
      outcomes += "\n\n• Formal dispute resolution: If agreement cannot be reached, the matter may proceed to adjudication, mediation, arbitration, or litigation.";
    } 
    else {
      outcomes += "\n\n• Contractual resolution: Applying the specific terms of the contract to determine the outcome.";
      outcomes += "\n\n• Negotiated settlement: The parties may reach a compromise solution that addresses their respective concerns.";
      outcomes += "\n\n• Formal dispute resolution: If direct negotiation fails, the parties may need to resort to adjudication, mediation, arbitration, or litigation.";
      outcomes += "\n\n• Contract interpretation: A third-party decision-maker may need to interpret ambiguous or disputed contract terms.";
      outcomes += "\n\n• Relationship management: The parties may prioritize preserving their business relationship by finding a mutually acceptable solution.";
    }
    
    return outcomes;
  }
  
  function generateTimelineSuggestions(issueDescription) {
    const issueKeywords = issueDescription.toLowerCase();
    let timeline = "Recommended timeline for addressing this issue:";
    
    if (issueKeywords.includes('payment')) {
      timeline += "\n\n• Immediate action: Verify payment terms and check that all payment notice requirements have been met.";
      timeline += "\n\n• Within 7 days: Issue formal written correspondence clearly stating your position and referencing relevant contract clauses.";
      timeline += "\n\n• Within 14 days: If payment remains unresolved, consider issuing a notice of intention to suspend performance (allowing the required notice period specified in your contract or the statutory minimum).";
      timeline += "\n\n• Within 21-28 days: If the issue remains unresolved, consider formal dispute resolution mechanisms such as adjudication.";
    } 
    else if (issueKeywords.includes('delay')) {
      timeline += "\n\n• Immediate action: Document the cause and extent of delay with supporting evidence.";
      timeline += "\n\n• Within 7 days: Issue notification of delay in accordance with contractual requirements (noting that many contracts have strict time limits for such notifications).";
      timeline += "\n\n• Within 14-28 days: Submit a detailed extension of time application with supporting documentation and analysis.";
      timeline += "\n\n• Ongoing: Maintain detailed records of progress, impediments, and any additional costs being incurred.";
      timeline += "\n\n• Within 14 days of resolution: Update programs and schedules to reflect any agreed extensions.";
    } 
    else if (issueKeywords.includes('variation')) {
      timeline += "\n\n• Immediate action: Clarify whether the variation has been properly instructed in accordance with the contract.";
      timeline += "\n\n• Before execution: If possible, agree on the valuation method and potential time impact before proceeding with the varied work.";
      timeline += "\n\n• Within 7-14 days of instruction: Submit initial assessment of cost and time implications (subject to contractual notification requirements).";
      timeline += "\n\n• Ongoing: Keep detailed records of resources, time, and costs specifically associated with the variation.";
      timeline += "\n\n• Within 14-28 days of completion: Submit final detailed valuation of the variation with supporting documentation.";
    } 
    else {
      timeline += "\n\n• Immediate action: Review relevant contract clauses and gather documentation related to the issue.";
      timeline += "\n\n• Within 7 days: Prepare a clear written statement of your position, referencing specific contract clauses.";
      timeline += "\n\n• Within 14 days: Engage in direct discussion with the other party to explore potential resolution.";
      timeline += "\n\n• Within 21-28 days: If direct discussion is unsuccessful, consider involving senior management or independent facilitation.";
      timeline += "\n\n• Within 28-42 days: If the issue remains unresolved, consider formal dispute resolution mechanisms as appropriate.";
    }
    
    return timeline;
  }
  
  function generateRiskAssessment(issueDescription, contractType, role) {
    const issueKeywords = issueDescription.toLowerCase();
    let assessment = "Risk assessment for this issue:";
    
    assessment += "\n\n**Probability of favorable resolution:**";
    
    if (issueKeywords.includes('payment') && (role.includes('Contractor') || role.includes('Sub-contractor'))) {
      assessment += "\n• Medium to High - Payment disputes typically have strong statutory protection for contractors, particularly where proper notice procedures have been followed.";
    } 
    else if (issueKeywords.includes('delay') && issueKeywords.includes('weather')) {
      assessment += "\n• Medium - Weather-related delays may entitle contractors to extension of time but often not to additional costs, depending on contract terms and the exceptional nature of the weather conditions.";
    } 
    else if (issueKeywords.includes('variation') && issueKeywords.includes('verbal')) {
      assessment += "\n• Low to Medium - Verbal instructions for variations are often problematic as most contracts require written instructions. Success may depend on other supporting evidence or subsequent confirmation.";
    } 
    else {
      assessment += "\n• Medium - Based on general principles of construction law and typical contract interpretation.";
    }
    
    assessment += "\n\n**Potential costs and benefits:**";
    assessment += "\n• Direct resolution costs: Professional fees for preparing documentation and potential representation.";
    assessment += "\n• Time commitment: Management time in preparing evidence and attending meetings or hearings.";
    assessment += "\n• Relationship impact: Consider the value of ongoing business relationships versus the value of the claim.";
    assessment += "\n• Precedent effect: Consider how the resolution of this issue might affect other similar issues on this project or future projects.";
    
    assessment += "\n\n**Alternative strategies risk comparison:**";
    assessment += "\n• Negotiation: Lower cost, faster, preserves relationships, but may result in compromise.";
    assessment += "\n• Adjudication: Faster than litigation, relatively lower cost, temporarily binding, but may strain relationships.";
    assessment += "\n• Mediation: Non-binding, relationship-preserving, but requires both parties' willingness to engage.";
    assessment += "\n• Arbitration/Litigation: Definitive resolution, potentially significant precedent value, but higher cost, longer timeframe, and may damage business relationships.";
    
    return assessment;
  }
  
  // Helper functions for report generation
  function generateRelevantClauses(contractType, issueDescription) {
    // This would be a sophisticated function in a real application
    // Simplified for demonstration
    const issueKeywords = issueDescription.toLowerCase();
    
    if (contractType.includes('JCT')) {
      if (issueKeywords.includes('payment')) return ['Clause 4.8', 'Clause 4.9', 'Clause 4.10'];
      if (issueKeywords.includes('delay')) return ['Clause 2.26', 'Clause 2.27', 'Clause 2.28', 'Clause 2.29'];
      if (issueKeywords.includes('variation')) return ['Clause 3.14', 'Clause 3.15', 'Clause 3.16'];
      return ['Clause 1.8', 'Clause 2.1'];
    }
    
    if (contractType.includes('NEC')) {
      if (issueKeywords.includes('payment')) return ['Clause 50', 'Clause 51'];
      if (issueKeywords.includes('delay')) return ['Clause 60', 'Clause 61', 'Clause 62'];
      if (issueKeywords.includes('variation')) return ['Clause 60.1(1)', 'Clause 63'];
      return ['Clause 10.1', 'Clause 91.1'];
    }
    
    return ['General Contract Provisions', 'Specific Terms of Agreement'];
  }
  
  function generateRecommendations(contractType, role, issueDescription) {
    // Simplified recommendation generator
    const recommendations = [];
    const issueKeywords = issueDescription.toLowerCase();
    
    if (issueKeywords.includes('payment')) {
      recommendations.push('Submit a formal payment notice in accordance with contract terms.');
      recommendations.push('Prepare detailed records of work completed and costs incurred.');
      if (role.includes('Contractor')) {
        recommendations.push('Consider suspension of work if payment is significantly overdue, following proper notification procedures.');
      }
    }
    
    if (issueKeywords.includes('delay')) {
      recommendations.push('Document all causes of delay with specific dates and impacts.');
      recommendations.push('Submit extension of time request with supporting evidence.');
      recommendations.push('Maintain detailed records of all project activities and correspondence.');
    }
    
    if (issueKeywords.includes('variation')) {
      recommendations.push('Submit variation order request with detailed cost and time implications.');
      recommendations.push('Ensure all changes are documented and approved before proceeding.');
      recommendations.push('Maintain a variation register with status updates.');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Review the specific contract clauses related to this issue.');
      recommendations.push('Document all relevant facts and communications.');
      recommendations.push('Seek early resolution through contractual mechanisms.');
      recommendations.push('Consider formal correspondence outlining your position.');
    }
    
    return recommendations;
  }
  
  function getDraftRecipient(role) {
    // Determine appropriate recipient based on role
    if (role.includes('Client') || role.includes('Employer')) {
      return 'Contractor';
    } else if (role.includes('Contractor')) {
      return 'Client/Employer';
    } else if (role.includes('Sub-contractor')) {
      return 'Main Contractor';
    }
    return 'Contract Administrator';
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