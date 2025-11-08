const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  static async generatePayslip(payslipData, employee, outputPath) {
    return new Promise((resolve, reject) => {
      const tempDir = path.join(__dirname, '../../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const fullPath = path.join(tempDir, outputPath);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(fullPath);
      
      doc.pipe(stream);
      
      // Header
      doc.rect(0, 0, doc.page.width, 100).fill('#4472C4');
      
      doc.fillColor('white')
         .fontSize(24)
         .text('Salary Slip', 50, 30, { align: 'center' })
         .fontSize(12)
         .text(`For the month of ${getMonthName(payslipData.month)} ${payslipData.year}`, { align: 'center' });
      
      doc.fillColor('black');
      
      // Employee details
      doc.moveDown(3);
      doc.fontSize(10);
      
      const leftCol = 50;
      const rightCol = 350;
      let y = doc.y;
      
      doc.text(`Employee Name: ${employee.first_name} ${employee.last_name}`, leftCol, y);
      // Fixed: Added null check for emp_code
      const empCode = employee.emp_code || employee.id || 'N/A';
      doc.text(`Employee Code: ${empCode}`, rightCol, y);
      
      y += 20;
      doc.text(`Designation: ${employee.designation || 'N/A'}`, leftCol, y);
      doc.text(`Department: ${employee.department || 'N/A'}`, rightCol, y);
      
      y += 20;
      const joiningDate = employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A';
      doc.text(`Date of Joining: ${joiningDate}`, leftCol, y);
      doc.text(`Pay Date: ${new Date().toLocaleDateString()}`, rightCol, y);
      
      y += 20;
      doc.text(`Pay Period: ${payslipData.pay_period_start} to ${payslipData.pay_period_end}`, leftCol, y);
      
      // Worked days section
      y += 30;
      doc.fontSize(11).font('Helvetica-Bold').text('Worked Days:', leftCol, y);
      doc.font('Helvetica').fontSize(10);
      y += 20;
      doc.text(`Attendance: ${payslipData.attendance_days} days`, leftCol, y);
      y += 15;
      doc.text(`Paid Time Off: ${payslipData.paid_time_off_days} days`, leftCol, y);
      y += 15;
      doc.text(`Total Days: ${payslipData.total_payable_days} days`, leftCol, y);
      
      // Earnings and Deductions table
      y += 40;
      const tableTop = y;
      const col1X = 50;
      const col2X = 250;
      const col3X = 350;
      const col4X = 480;
      
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Earnings', col1X, tableTop);
      doc.text('Amount (₹)', col2X, tableTop);
      doc.text('Deductions', col3X, tableTop);
      doc.text('Amount (₹)', col4X, tableTop);
      
      doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      doc.font('Helvetica').fontSize(9);
      let currentY = tableTop + 20;
      
      // Fixed: Added null checks for earnings and deductions
      const earnings = payslipData.earnings || [];
      const deductions = payslipData.deductions || [];
      const maxRows = Math.max(earnings.length, deductions.length);
      
      for (let i = 0; i < maxRows; i++) {
        if (earnings[i]) {
          doc.text(earnings[i].component, col1X, currentY, { width: 180 });
          doc.text(parseFloat(earnings[i].amount).toFixed(2), col2X, currentY);
        }
        
        if (deductions[i]) {
          doc.text(deductions[i].component, col3X, currentY, { width: 100 });
          doc.text(parseFloat(deductions[i].amount).toFixed(2), col4X, currentY);
        }
        
        currentY += 15;
      }
      
      // Totals
      doc.moveTo(col1X, currentY).lineTo(550, currentY).stroke();
      currentY += 10;
      
      doc.font('Helvetica-Bold');
      doc.text('Gross Total', col1X, currentY);
      doc.text(parseFloat(payslipData.gross_wage).toFixed(2), col2X, currentY);
      doc.text('Total Deductions', col3X, currentY);
      doc.text(parseFloat(payslipData.total_deductions).toFixed(2), col4X, currentY);
      
      // Net payable
      currentY += 30;
      doc.fillColor('#4472C4').rect(col1X - 10, currentY - 5, 520, 35).fill();
      
      doc.fillColor('white').fontSize(12);
      doc.text('Total Net Payable', col1X, currentY + 5);
      doc.text(`₹ ${parseFloat(payslipData.net_wage).toFixed(2)}`, col2X, currentY + 5);
      
      // Amount in words
      currentY += 50;
      doc.fillColor('black').fontSize(10);
      doc.text(`Amount in Words: ${numberToWords(payslipData.net_wage)}`, col1X, currentY);
    
      // Footer
      doc.moveDown(3).fontSize(8).fillColor('#666');
      doc.text('This is a system-generated document and does not require a signature.', { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => resolve(fullPath));
      stream.on('error', reject);
    });
  }
}

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1] || 'Unknown';
}

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero Rupees Only';
  
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = num % 100;
  
  let words = '';
  
  if (crore > 0) words += convertToWords(crore) + ' Crore ';
  if (lakh > 0) words += convertToWords(lakh) + ' Lakh ';
  if (thousand > 0) words += convertToWords(thousand) + ' Thousand ';
  if (hundred > 0) words += ones[hundred] + ' Hundred ';
  if (remainder > 0) {
    if (remainder < 10) words += ones[remainder];
    else if (remainder < 20) words += teens[remainder - 10];
    else {
      words += tens[Math.floor(remainder / 10)] + ' ';
      if (remainder % 10 > 0) words += ones[remainder % 10];
    }
  }
  
  return 'Rupees ' + words.trim() + ' Only';
  
  function convertToWords(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '');
  }
}

module.exports = PDFGenerator;