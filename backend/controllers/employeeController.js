const Employee = require('../models/Employee');
const User = require('../models/User');
const { generateLoginId } = require('../utils/loginIdGenerator');
const { generatePassword } = require('../utils/PasswordGenerator');
const { createAndSendOTP } = require('../utils/otpService');
const { sendWelcomeEmail } = require('../utils/emailService');

exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, status } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (department) filters.department = department;
    if (status) filters.isActive = status === 'active';

    const employees = await Employee.findAll(filters);
    
    // Get status for each employee
    const employeesWithStatus = await Promise.all(
      employees.map(async (emp) => {
        const status = await Employee.getStatus(emp.id);
        return { ...emp, status };
      })
    );

    res.json({
      success: true,
      count: employeesWithStatus.length,
      data: employeesWithStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const status = await Employee.getStatus(employee.id);
    employee.status = status;

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// backend/controllers/employeeController.js (Update createEmployee)
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, department, designation,
      manager, location, joiningDate, wage, role, dateOfBirth,
      gender, maritalStatus, residingAddress, nationality
    } = req.body;

    // Validate role
    const validRoles = ['HR Officer', 'Payroll Officer', 'Manager', 'Employee'];
    const employeeRole = role || 'Employee';
    
    if (!validRoles.includes(employeeRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`
      });
    }

    // Only Admin can create HR Officer, Payroll Officer, and Manager roles
    if (['HR Officer', 'Payroll Officer', 'Manager'].includes(employeeRole)) {
      if (req.user.role !== 'Admin') {
        return res.status(403).json({
          success: false,
          message: 'Only Admin can create HR Officer, Payroll Officer, or Manager roles'
        });
      }
    }

    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      managerId: manager,
      location,
      joiningDate: joiningDate || new Date(),
      dateOfBirth,
      gender,
      maritalStatus,
      residingAddress,
      nationality,
      wage: wage || 30000
    });
    
    await Employee.calculateSalaryComponents(employee.id, wage || 30000);

    const loginId = await generateLoginId(firstName, lastName, employee.joining_date);
    const tempPassword = generatePassword();

    const user = await User.create({
      loginId,
      email,
      password: tempPassword,
      role: employeeRole,
      employeeId: employee.id
    });
    
    await Employee.update(employee.id, { userId: user.id });

    await createAndSendOTP(email, 'signup');
    await sendWelcomeEmail(email, `${firstName} ${lastName}`, loginId, tempPassword);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully. Credentials sent to email.',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const updatedEmployee = await Employee.update(req.params.id, req.body);

    
    if (req.body.wage) {
      await Employee.calculateSalaryComponents(req.params.id, req.body.wage);
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await Employee.update(req.params.id, { isActive: false });
    await User.update(employee.user_id, { isActive: false });

    res.json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.employee_id) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const employee = await Employee.findById(user.employee_id);

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.employee_id) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const allowedFields = [
      'phone', 'residingAddress', 'personalEmail', 'profilePicture',
      'about', 'jobLove', 'interests', 'skills'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const employee = await Employee.update(user.employee_id, updates);

    
    if (req.body.bankDetails) {
      await Employee.updateBankDetails(user.employee_id, req.body.bankDetails);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
