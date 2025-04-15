import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

/**
 * Export HTML element content to PDF
 * @param {HTMLElement} element - The element to export
 * @param {string} filename - The filename for the PDF
 */
export const exportToPDF = async (element, filename) => {
  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentPage = 0;
    
    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL('image/png'), 
      'PNG', 
      0, 
      currentPage === 0 ? 0 : -position, 
      imgWidth, 
      imgHeight
    );
    heightLeft -= pageHeight;
    
    // Add more pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      currentPage++;
      pdf.addImage(
        canvas.toDataURL('image/png'), 
        'PNG', 
        0, 
        position, 
        imgWidth, 
        imgHeight
      );
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('An error occurred while exporting to PDF. Please try again.');
  }
};

/**
 * Export content to Word document format
 * @param {string} content - The text content to export
 * @param {string} filename - The filename for the Word document
 */
export const exportToWord = (content, filename) => {
  try {
    // Convert basic markdown to HTML
    const htmlContent = convertMarkdownToHtml(content);
    
    // Create HTML document with Word-compatible styling
    const htmlDoc = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:w="urn:schemas-microsoft-com:office:word" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Calibri, Arial, sans-serif; }
          h1 { font-size: 16pt; color: #2F5496; }
          h2 { font-size: 14pt; color: #2F5496; }
          h3 { font-size: 12pt; color: #1F3864; }
          p { font-size: 11pt; }
          ul { margin-left: 20px; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    // Create Blob and save
    const blob = new Blob(['\ufeff', htmlDoc], {
      type: 'application/msword'
    });
    
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    alert('An error occurred while exporting to Word. Please try again.');
  }
};

/**
 * Converts simple markdown to HTML
 * @param {string} markdown - The markdown content
 * @returns {string} - HTML content
 */
function convertMarkdownToHtml(markdown) {
  let html = markdown;
  
  // Headers
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
  
  // Lists
  html = html.replace(/^\* (.*$)/gm, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
  
  // Wrap lists in ul tags
  let inList = false;
  const lines = html.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('<li>') && !inList) {
      lines[i] = '<ul>' + lines[i];
      inList = true;
    } else if (!lines[i].startsWith('<li>') && inList) {
      lines[i - 1] = lines[i - 1] + '</ul>';
      inList = false;
    }
  }
  
  if (inList) {
    lines.push('</ul>');
  }
  
  // Convert newlines to paragraphs
  html = lines.join('\n');
  
  // Paragraphs
  html = html.replace(/^(?!<[hl\d]|<li|<ul|<\/ul)(.+)$/gm, '<p>$1</p>');
  
  // Handle empty lines
  html = html.replace(/\n\n+/g, '<br><br>');
  
  return html;
}