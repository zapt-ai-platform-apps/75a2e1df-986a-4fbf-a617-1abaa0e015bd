import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import { FaFilePdf, FaFileCsv, FaPrint, FaCopy, FaFile, FaSave, FaList, FaPen, FaArrowLeft, FaEye, FaPaperPlane, FaRedo } from 'react-icons/fa';
import DraftCommunication from './DraftCommunication';
import SavedReportsList from './SavedReportsList';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';
import DraftLetterPrompt from './DraftLetterPrompt';

export default function ReportView() {
  const { 
    report, 
    draftCommunication, 
    savedReports,
    saveCurrentReport,
    deleteSavedReport,
    projectDetails,
    generateReport,
    generateDraftCommunication,
    shouldGenerateLetter,
    setShouldGenerateLetter
  } = useAppContext();
  
  const navigate = useNavigate();
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDraft, setShowDraft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLetterPrompt, setShowLetterPrompt] = useState(false);
  
  // Refs for printing
  const reportRef = useRef();
  const draftRef = useRef();
  
  // Determine which report to display
  const displayReport = selectedReport || report;

  // Check if we should show the letter prompt
  useEffect(() => {
    if (report && shouldGenerateLetter === null) {
      setShowLetterPrompt(true);
    }
  }, [report, shouldGenerateLetter]);

  // Handle letter prompt response
  const handleLetterPromptResponse = (wantsDraft) => {
    setShouldGenerateLetter(wantsDraft);
    setShowLetterPrompt(false);
    
    if (wantsDraft) {
      generateDraftCommunication(report);
      setShowDraft(true);
    }
  };
  
  // If no reports and no selected report, redirect to project details
  if (!displayReport && !showSavedReports) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Report</h2>
        <p className="text-gray-600 mb-6">No report has been generated yet.</p>
        <Button 
          onClick={() => navigate('/project')}
          className="mx-auto"
        >
          Go to Project Details
        </Button>
      </div>
    );
  }
  
  // Handle print report
  const handlePrintReport = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Contract_Report_${displayReport?.projectDetails.projectName.replace(/\s+/g, '_')}`
  });
  
  // Handle print draft
  const handlePrintDraft = useReactToPrint({
    content: () => draftRef.current,
    documentTitle: `Draft_Communication_${displayReport?.projectDetails.projectName.replace(/\s+/g, '_')}`
  });
  
  // Handle export report to PDF
  const handleExportReportToPDF = () => {
    if (!reportRef.current) return;
    exportToPDF(
      reportRef.current, 
      `Contract_Report_${displayReport?.projectDetails.projectName.replace(/\s+/g, '_')}.pdf`
    );
  };
  
  // Handle export draft to PDF
  const handleExportDraftToPDF = () => {
    if (!draftRef.current) return;
    exportToPDF(
      draftRef.current, 
      `Draft_Communication_${displayReport?.projectDetails.projectName.replace(/\s+/g, '_')}.pdf`
    );
  };
  
  // Handle export report to Word
  const handleExportReportToWord = () => {
    if (!displayReport) return;
    
    // Format the report content
    let content = `# Contract Report: ${displayReport.projectDetails.projectName}\n\n`;
    content += `Date: ${new Date(displayReport.date).toLocaleDateString()}\n\n`;
    content += `## Project Details\n\n`;
    content += `Project: ${displayReport.projectDetails.projectName}\n`;
    content += `Description: ${displayReport.projectDetails.projectDescription}\n`;
    content += `Contract Type: ${displayReport.projectDetails.contractType}\n`;
    content += `Organization Role: ${displayReport.projectDetails.organizationRole}\n\n`;
    
    content += `## Issues Analysis\n\n`;
    
    displayReport.analysis.forEach((analysis, index) => {
      content += `### Issue ${index + 1}: ${analysis.issue}\n\n`;
      content += `Actions Taken: ${analysis.actionsTaken || 'None'}\n\n`;
      
      if (analysis.detailedAnalysis) {
        content += `#### Analysis:\n${analysis.detailedAnalysis}\n\n`;
      }
      
      if (analysis.legalContext) {
        content += `#### Legal Context:\n${analysis.legalContext}\n\n`;
      }
      
      content += `#### Relevant Contract Clauses:\n`;
      analysis.relevantClauses.forEach(clause => {
        content += `* ${clause}\n`;
      });
      
      if (analysis.clauseExplanations) {
        content += `\n#### Clause Explanations:\n`;
        analysis.clauseExplanations.forEach(explanation => {
          content += `* ${explanation}\n`;
        });
      }
      
      content += `\n#### Recommendations:\n`;
      analysis.recommendations.forEach(rec => {
        content += `* ${rec}\n`;
      });
      
      if (analysis.potentialOutcomes) {
        content += `\n#### Potential Outcomes:\n${analysis.potentialOutcomes}\n\n`;
      }
      
      if (analysis.timelineSuggestions) {
        content += `\n#### Timeline Suggestions:\n${analysis.timelineSuggestions}\n\n`;
      }
      
      if (analysis.riskAssessment) {
        content += `\n#### Risk Assessment:\n${analysis.riskAssessment}\n\n`;
      }
      
      content += `\n`;
    });
    
    exportToWord(content, `Contract_Report_${displayReport.projectDetails.projectName.replace(/\s+/g, '_')}.docx`);
  };
  
  // Handle export draft to Word
  const handleExportDraftToWord = () => {
    if (!draftCommunication) return;
    
    // Format the draft content
    let content = `${draftCommunication.greeting}\n\n`;
    content += `${draftCommunication.body}\n\n`;
    content += `${draftCommunication.closing}\n\n`;
    content += `${draftCommunication.sender}`;
    
    exportToWord(content, `Draft_Communication_${displayReport.projectDetails.projectName.replace(/\s+/g, '_')}.docx`);
  };
  
  // Handle copy report to clipboard
  const handleCopyReportToClipboard = () => {
    if (!displayReport) return;
    
    // Format the report content
    let content = `Contract Report: ${displayReport.projectDetails.projectName}\n\n`;
    content += `Date: ${new Date(displayReport.date).toLocaleDateString()}\n\n`;
    content += `Project Details:\n`;
    content += `Project: ${displayReport.projectDetails.projectName}\n`;
    content += `Description: ${displayReport.projectDetails.projectDescription}\n`;
    content += `Contract Type: ${displayReport.projectDetails.contractType}\n`;
    content += `Organization Role: ${displayReport.projectDetails.organizationRole}\n\n`;
    
    content += `Issues Analysis:\n\n`;
    
    displayReport.analysis.forEach((analysis, index) => {
      content += `Issue ${index + 1}: ${analysis.issue}\n`;
      content += `Actions Taken: ${analysis.actionsTaken || 'None'}\n\n`;
      
      if (analysis.detailedAnalysis) {
        content += `Analysis: ${analysis.detailedAnalysis}\n\n`;
      }
      
      content += `Relevant Contract Clauses:\n`;
      analysis.relevantClauses.forEach(clause => {
        content += `- ${clause}\n`;
      });
      
      content += `\nRecommendations:\n`;
      analysis.recommendations.forEach(rec => {
        content += `- ${rec}\n`;
      });
      
      if (analysis.potentialOutcomes) {
        content += `\nPotential Outcomes: ${analysis.potentialOutcomes}\n\n`;
      }
      
      content += `\n`;
    });
    
    navigator.clipboard.writeText(content)
      .then(() => {
        alert('Report copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Handle copy draft to clipboard
  const handleCopyDraftToClipboard = () => {
    if (!draftCommunication) return;
    
    // Format the draft content
    let content = `${draftCommunication.greeting}\n\n`;
    content += `${draftCommunication.body}\n\n`;
    content += `${draftCommunication.closing}\n\n`;
    content += `${draftCommunication.sender}`;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        alert('Draft communication copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  // Handle save current report
  const handleSaveReport = () => {
    saveCurrentReport();
    alert('Report saved successfully');
  };
  
  // Handle load saved report
  const handleLoadReport = (savedReport) => {
    setSelectedReport(savedReport);
    setShowSavedReports(false);
  };
  
  // Handle delete saved report
  const handleDeleteReport = (reportId) => {
    if (confirm('Are you sure you want to delete this saved report?')) {
      deleteSavedReport(reportId);
      
      // If currently viewing the deleted report, switch to the current report
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(null);
      }
    }
  };
  
  // Generate a new report using the current project details
  const handleRegenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateReport();
      setSelectedReport(null); // Switch back to the current report
      setShowDraft(false);
      setShouldGenerateLetter(null); // Reset to trigger prompt again
    } catch (error) {
      console.error('Error regenerating report:', error);
      alert('An error occurred while regenerating the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle creating a draft letter when it wasn't initially created
  const handleCreateDraftLetter = () => {
    if (!draftCommunication && displayReport) {
      generateDraftCommunication(displayReport);
    }
    setShowDraft(true);
  };
  
  if (showSavedReports) {
    return (
      <SavedReportsList 
        savedReports={savedReports}
        onClose={() => setShowSavedReports(false)}
        onLoad={handleLoadReport}
        onDelete={handleDeleteReport}
      />
    );
  }

  if (showLetterPrompt) {
    return (
      <DraftLetterPrompt
        onResponse={handleLetterPromptResponse}
      />
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {selectedReport ? 'Saved Report' : 'Contract Analysis Report'}
        </h2>
        
        <div className="flex gap-2">
          {displayReport === report && (
            <Button
              onClick={handleSaveReport}
              size="sm"
              variant="success"
              icon={<FaSave />}
              title="Save Report"
            >
              Save
            </Button>
          )}
          
          <Button
            onClick={() => setShowSavedReports(true)}
            size="sm"
            variant="secondary"
            icon={<FaList />}
            title="View Saved Reports"
          >
            Saved
          </Button>
          
          {!showDraft && selectedReport && (
            <Button
              onClick={() => setSelectedReport(null)}
              size="sm"
              variant="info"
              icon={<FaEye />}
              title="Show Current Report"
            >
              Current
            </Button>
          )}
          
          {!showDraft && (
            <Button
              onClick={handleCreateDraftLetter}
              size="sm"
              variant="info"
              icon={<FaPen />}
              title="Create or View Draft Letter"
            >
              Letter
            </Button>
          )}
          
          {showDraft && (
            <Button
              onClick={() => setShowDraft(false)}
              size="sm"
              variant="info"
              icon={<FaEye />}
              title="Show Report"
            >
              Report
            </Button>
          )}
        </div>
      </div>
      
      {!showDraft ? (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              onClick={handlePrintReport}
              size="sm"
              variant="secondary"
              icon={<FaPrint />}
              title="Print Report"
            />
            
            <Button
              onClick={handleExportReportToPDF}
              size="sm"
              variant="danger"
              icon={<FaFilePdf />}
              title="Export to PDF"
            />
            
            <Button
              onClick={handleExportReportToWord}
              size="sm"
              variant="primary"
              icon={<FaFile />}
              title="Export to Word"
            />
            
            <Button
              onClick={handleCopyReportToClipboard}
              size="sm"
              variant="warning"
              icon={<FaCopy />}
              title="Copy to Clipboard"
            />
            
            {selectedReport && (
              <Button
                onClick={handleRegenerateReport}
                disabled={isGenerating}
                size="sm"
                variant="success"
                icon={<FaRedo />}
                title="Generate New Report"
                className="ml-auto"
              >
                {isGenerating ? 'Generating...' : 'New Report'}
              </Button>
            )}
          </div>
          
          <div 
            ref={reportRef} 
            className="p-6 border border-gray-200 rounded-lg bg-white mb-6"
          >
            <div className="mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Project Name:</p>
                  <p className="text-gray-800">{displayReport.projectDetails.projectName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Contract Type:</p>
                  <p className="text-gray-800">{displayReport.projectDetails.contractType}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Role:</p>
                  <p className="text-gray-800">{displayReport.projectDetails.organizationRole}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Report Date:</p>
                  <p className="text-gray-800">{new Date(displayReport.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">Project Description:</p>
                <p className="text-gray-800">{displayReport.projectDetails.projectDescription}</p>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-4">Issues Analysis</h3>
            
            <div className="space-y-6">
              {displayReport.analysis.map((analysis, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Issue #{index + 1}: {analysis.issue}
                  </h4>
                  
                  {analysis.actionsTaken && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600">Actions Taken:</p>
                      <p className="text-gray-800">{analysis.actionsTaken}</p>
                    </div>
                  )}

                  {analysis.detailedAnalysis && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium text-gray-700 mb-2">Detailed Analysis:</h5>
                      <p className="text-gray-800">{analysis.detailedAnalysis}</p>
                    </div>
                  )}

                  {analysis.legalContext && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium text-gray-700 mb-2">Legal Context:</h5>
                      <p className="text-gray-800 whitespace-pre-line">{analysis.legalContext}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h5 className="text-md font-medium text-gray-700 mb-2">Relevant Contract Clauses:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.relevantClauses.map((clause, i) => (
                        <li key={i} className="text-gray-800">{clause}</li>
                      ))}
                    </ul>
                  </div>

                  {analysis.clauseExplanations && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium text-gray-700 mb-2">Clause Explanations:</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {analysis.clauseExplanations.map((explanation, i) => (
                          <li key={i} className="text-gray-800">{explanation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <h5 className="text-md font-medium text-gray-700 mb-2">Recommendations:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.recommendations.map((recommendation, i) => (
                        <li key={i} className="text-gray-800">{recommendation}</li>
                      ))}
                    </ul>
                  </div>

                  {analysis.potentialOutcomes && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium text-gray-700 mb-2">Potential Outcomes:</h5>
                      <p className="text-gray-800 whitespace-pre-line">{analysis.potentialOutcomes}</p>
                    </div>
                  )}

                  {analysis.timelineSuggestions && (
                    <div className="mb-4">
                      <h5 className="text-md font-medium text-gray-700 mb-2">Timeline Suggestions:</h5>
                      <p className="text-gray-800 whitespace-pre-line">{analysis.timelineSuggestions}</p>
                    </div>
                  )}

                  {analysis.riskAssessment && (
                    <div>
                      <h5 className="text-md font-medium text-gray-700 mb-2">Risk Assessment:</h5>
                      <p className="text-gray-800 whitespace-pre-line">{analysis.riskAssessment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Note: This analysis is based on the information provided and is for informational purposes only. 
                It is not legal advice. Please consult with a qualified legal professional before taking any action.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              onClick={handlePrintDraft}
              size="sm"
              variant="secondary"
              icon={<FaPrint />}
              title="Print Letter"
            />
            
            <Button
              onClick={handleExportDraftToPDF}
              size="sm"
              variant="danger"
              icon={<FaFilePdf />}
              title="Export to PDF"
            />
            
            <Button
              onClick={handleExportDraftToWord}
              size="sm"
              variant="primary"
              icon={<FaFile />}
              title="Export to Word"
            />
            
            <Button
              onClick={handleCopyDraftToClipboard}
              size="sm"
              variant="warning"
              icon={<FaCopy />}
              title="Copy to Clipboard"
            />
          </div>
          
          <DraftCommunication 
            draftCommunication={draftCommunication} 
            ref={draftRef} 
          />
        </>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button
          onClick={() => navigate('/project')}
          size="sm"
          variant="secondary"
          icon={<FaArrowLeft />}
        >
          Back to Project Details
        </Button>

        {!showDraft ? (
          <Button
            onClick={handleCreateDraftLetter}
            size="sm"
            variant="primary"
            icon={<FaPen />}
          >
            Create Draft Letter
          </Button>
        ) : (
          <Button
            onClick={handleCreateDraftLetter}
            size="sm"
            variant="primary"
            icon={<FaRedo />}
          >
            Refresh Draft Letter
          </Button>
        )}
      </div>
    </div>
  );
}