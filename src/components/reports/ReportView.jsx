import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import { FaFilePdf, FaFileCsv, FaPrint, FaCopy, FaFile, FaSave, FaList } from 'react-icons/fa';
import DraftCommunication from './DraftCommunication';
import SavedReportsList from './SavedReportsList';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';

export default function ReportView() {
  const { 
    report, 
    draftCommunication, 
    savedReports,
    saveCurrentReport,
    deleteSavedReport,
    projectDetails,
    generateReport
  } = useAppContext();
  
  const navigate = useNavigate();
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDraft, setShowDraft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refs for printing
  const reportRef = useRef();
  const draftRef = useRef();
  
  // Determine which report to display
  const displayReport = selectedReport || report;
  
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
      content += `#### Relevant Contract Clauses:\n`;
      analysis.relevantClauses.forEach(clause => {
        content += `* ${clause}\n`;
      });
      content += `\n#### Recommendations:\n`;
      analysis.recommendations.forEach(rec => {
        content += `* ${rec}\n`;
      });
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
      content += `Relevant Contract Clauses:\n`;
      analysis.relevantClauses.forEach(clause => {
        content += `- ${clause}\n`;
      });
      content += `\nRecommendations:\n`;
      analysis.recommendations.forEach(rec => {
        content += `- ${rec}\n`;
      });
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
    } catch (error) {
      console.error('Error regenerating report:', error);
      alert('An error occurred while regenerating the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
              className="bg-green-600 hover:bg-green-700"
              icon={<FaSave />}
            >
              Save Report
            </Button>
          )}
          
          <Button
            onClick={() => setShowSavedReports(true)}
            className="bg-purple-600 hover:bg-purple-700"
            icon={<FaList />}
          >
            Saved Reports
          </Button>
          
          {!showDraft && selectedReport && (
            <Button
              onClick={() => setSelectedReport(null)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Show Current Report
            </Button>
          )}
          
          {!showDraft && (
            <Button
              onClick={() => setShowDraft(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
              icon={<FaFile />}
            >
              Show Draft Communication
            </Button>
          )}
          
          {showDraft && (
            <Button
              onClick={() => setShowDraft(false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Show Report
            </Button>
          )}
        </div>
      </div>
      
      {!showDraft ? (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              onClick={handlePrintReport}
              className="bg-gray-600 hover:bg-gray-700"
              icon={<FaPrint />}
            >
              Print
            </Button>
            
            <Button
              onClick={handleExportReportToPDF}
              className="bg-red-600 hover:bg-red-700"
              icon={<FaFilePdf />}
            >
              Export PDF
            </Button>
            
            <Button
              onClick={handleExportReportToWord}
              className="bg-blue-600 hover:bg-blue-700"
              icon={<FaFile />}
            >
              Export Word
            </Button>
            
            <Button
              onClick={handleCopyReportToClipboard}
              className="bg-yellow-600 hover:bg-yellow-700"
              icon={<FaCopy />}
            >
              Copy to Clipboard
            </Button>
            
            {selectedReport && (
              <Button
                onClick={handleRegenerateReport}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 ml-auto"
              >
                {isGenerating ? 'Generating...' : 'Generate New Report'}
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
                  
                  <div className="mb-4">
                    <h5 className="text-md font-medium text-gray-700 mb-2">Relevant Contract Clauses:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.relevantClauses.map((clause, i) => (
                        <li key={i} className="text-gray-800">{clause}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-md font-medium text-gray-700 mb-2">Recommendations:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.recommendations.map((recommendation, i) => (
                        <li key={i} className="text-gray-800">{recommendation}</li>
                      ))}
                    </ul>
                  </div>
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
              className="bg-gray-600 hover:bg-gray-700"
              icon={<FaPrint />}
            >
              Print
            </Button>
            
            <Button
              onClick={handleExportDraftToPDF}
              className="bg-red-600 hover:bg-red-700"
              icon={<FaFilePdf />}
            >
              Export PDF
            </Button>
            
            <Button
              onClick={handleExportDraftToWord}
              className="bg-blue-600 hover:bg-blue-700"
              icon={<FaFile />}
            >
              Export Word
            </Button>
            
            <Button
              onClick={handleCopyDraftToClipboard}
              className="bg-yellow-600 hover:bg-yellow-700"
              icon={<FaCopy />}
            >
              Copy to Clipboard
            </Button>
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
          className="bg-gray-600 hover:bg-gray-700"
        >
          Back to Project Details
        </Button>
      </div>
    </div>
  );
}