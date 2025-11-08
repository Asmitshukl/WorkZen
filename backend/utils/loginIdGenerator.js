const User = require('../models/User');

async function generateLoginId(firstName, lastName, joiningDate) {
  const companyCode = process.env.COMPANY_CODE || 'OI';
  
  const firstNameCode = firstName.substring(0, 2).toUpperCase();
  const lastNameCode = lastName.substring(0, 2).toUpperCase();
  
  const year = new Date(joiningDate).getFullYear();
  
  const lastUser = await User.findOne({
    loginId: `${companyCode}${firstNameCode}${lastNameCode}${year}%`
  });
  
  let serialNumber = 1;
  if (lastUser && lastUser.login_id) {
    const lastSerial = parseInt(lastUser.login_id.slice(-4));
    if (!isNaN(lastSerial)) {
      serialNumber = lastSerial + 1;
    }
  }
  
  const serialStr = serialNumber.toString().padStart(4, '0');
  const loginId = `${companyCode}${firstNameCode}${lastNameCode}${year}${serialStr}`;
  
  return loginId;
}

module.exports = { generateLoginId };