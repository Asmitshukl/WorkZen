const transporter = require('../config/email');

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME || 'HR System'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Failed to send email');
  }
}

async function sendWelcomeEmail(email, name, loginId, password) {
  const companyName = process.env.COMPANY_NAME || 'HR System';
  const subject = `Welcome to ${companyName} - Your Account Details`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to ${companyName}!</h2>
      <p>Dear ${name},</p>
      <p>Your employee account has been created successfully. Here are your login credentials:</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Login ID:</strong> ${loginId}</p>
        <p style="margin: 10px 0;"><strong>Temporary Password:</strong> ${password}</p>
      </div>
      
      <p><strong>Important Steps:</strong></p>
      <ol>
        <li>Login using your credentials</li>
        <li>You will receive an OTP on your email</li>
        <li>Enter the OTP to complete login</li>
        <li>Change your password upon first login for security</li>
      </ol>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">Please keep these credentials secure and do not share them with anyone.</p>
      
      <p>Best regards,<br/>HR Team</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
}

async function sendTimeOffApprovalEmail(email, name, status, startDate, endDate, reason) {
  const subject = `Time Off Request ${status}`;
  const statusColor = status === 'Approved' ? '#4CAF50' : '#F44336';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: ${statusColor};">Time Off Request ${status}</h2>
      <p>Dear ${name},</p>
      <p>Your time off request has been <strong style="color: ${statusColor};">${status.toLowerCase()}</strong>.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 10px 0;"><strong>Period:</strong> ${startDate} to ${endDate}</p>
        ${reason ? `<p style="margin: 10px 0;"><strong>${status === 'Rejected' ? 'Rejection Reason' : 'Your Reason'}:</strong> ${reason}</p>` : ''}
      </div>
      
      <p>Best regards,<br/>HR Team</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
}

async function sendPayslipEmail(email, name, month, year, netSalary) {
  const subject = `Payslip for ${getMonthName(month)} ${year}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4CAF50;">Salary Credited</h2>
      <p>Dear ${name},</p>
      <p>Your salary for <strong>${getMonthName(month)} ${year}</strong> has been processed.</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <p style="font-size: 14px; color: #666; margin: 0;">Net Salary</p>
        <p style="font-size: 32px; color: #4CAF50; font-weight: bold; margin: 10px 0;">₹${netSalary.toFixed(2)}</p>
      </div>
      
      <p>You can view and download your detailed payslip from the Payroll section in your account.</p>
      
      <p>Best regards,<br/>Payroll Team</p>
    </div>
  `;
  
  return await sendEmail(email, subject, html);
}

function getMonthName(month) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month - 1];
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTimeOffApprovalEmail,
  sendPayslipEmail
};