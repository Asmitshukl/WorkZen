const Payroll = require('../models/Payroll');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const SalaryCalculator = require('../utils/salaryCalculator');
const { sendPayslipEmail } = require('../utils/emailService');
const PDFGenerator = require('../utils/pdfGenerator');

exports.generatePayrun = async (req, res) => {
  try {
    const { month, year } = req.body;

    const existing = await Payroll.findByMonthYear(month, year);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Payrun already exists for this period'
      });
    }

    const payrun = await Payroll.create(month, year, req.user.id);

    const employees = await Employee.findAll({ isActive: true });

    let totalEmployerCost = 0;
    let totalGross = 0;
    let totalNet = 0;

    for (const employee of employees) {
      const workedDays = await SalaryCalculator.calculateWorkedDays(employee.id, month, year);
      
      const fullSalary = parseFloat(employee.salary_info?.wage || 30000);
      const proRataSalary = SalaryCalculator.calculateProRataSalary(
        fullSalary,
        workedDays.totalDays,
        22
      );

      const earnings = await SalaryCalculator.calculateSalaryComponents(
        employee.id,
        proRataSalary,
        fullSalary
      );
      
      const deductions = await SalaryCalculator.calculateDeductions(
        employee.id,
        proRataSalary,
        fullSalary
      );

      const grossWage = earnings.reduce((sum, e) => sum + e.amount, 0);
      const totalDeductionsAmount = deductions.reduce((sum, d) => sum + d.amount, 0);
      const netWage = grossWage - totalDeductionsAmount;

      const payslip = await Payslip.create({
        payrollId: payrun.id,
        employeeId: employee.id,
        payPeriodStart: new Date(year, month - 1, 1),
        payPeriodEnd: new Date(year, month, 0),
        salaryStructure: 'Regular Pay',
        attendanceDays: workedDays.attendance,
        paidTimeOffDays: workedDays.paidTimeOff,
        unpaidLeaveDays: workedDays.unpaidLeave,
        totalPayableDays: workedDays.totalDays,
        basicWage: proRataSalary * 0.50,
        grossWage,
        totalDeductions: totalDeductionsAmount,
        netWage,
        employerCost: grossWage,
        earnings,
        deductions,
        generatedBy: req.user.id
      });

      totalEmployerCost += grossWage;
      totalGross += grossWage;
      totalNet += netWage;
    }

    await Payroll.update(payrun.id, {
      employerCost: totalEmployerCost,
      gross: totalGross,
      net: totalNet,
      status: 'Computed'
    });

    res.status(201).json({
      success: true,
      message: 'Payrun generated successfully',
      data: payrun
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllPayruns = async (req, res) => {
  try {
    const payruns = await Payroll.findAll();

    res.json({
      success: true,
      data: payruns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPayrunById = async (req, res) => {
  try {
    const payrun = await Payroll.findById(req.params.id);

    if (!payrun) {
      return res.status(404).json({
        success: false,
        message: 'Payrun not found'
      });
    }

    const payslips = await Payslip.findByPayroll(req.params.id);
    payrun.payslips = payslips;

    res.json({
      success: true,
      data: payrun
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.validatePayrun = async (req, res) => {
  try {
    const payrun = await Payroll.findById(req.params.id);

    if (!payrun) {
      return res.status(404).json({
        success: false,
        message: 'Payrun not found'
      });
    }

    if (payrun.status === 'Done' || payrun.status === 'Validated') {
      return res.status(400).json({
        success: false,
        message: 'Payrun already validated'
      });
    }

    const payslips = await Payslip.findByPayroll(req.params.id);

    for (const payslip of payslips) {
      const fullPayslip = await Payslip.findById(payslip.id);
      
      await Payslip.update(fullPayslip.id, { status: 'Validated' });

      // Send payslip email to employee
      const employee = fullPayslip.employee;
      await sendPayslipEmail(
        employee.email,
        employee.first_name,
        payrun.month,
        payrun.year,
        fullPayslip.net_wage
      );
    }

    await Payroll.validate(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Payrun validated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    res.json({
      success: true,
      data: payslip
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyPayslips = async (req, res) => {
  try {
    const user = req.user;
    const payslips = await Payslip.findByEmployee(user.employee_id);

    res.json({
      success: true,
      data: payslips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.downloadPayslipPDF = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        message: 'Payslip not found'
      });
    }

    const employee = payslip.employee;
    const filename = `payslip_${employee.first_name}_${employee.last_name}_${payslip.payroll.month}_${payslip.payroll.year}.pdf`;

    const pdfPath = await PDFGenerator.generatePayslip(
      {
        ...payslip,
        month: payslip.payroll.month,
        year: payslip.payroll.year,
        pay_period_start: new Date(payslip.pay_period_start).toLocaleDateString(),
        pay_period_end: new Date(payslip.pay_period_end).toLocaleDateString()
      },
      employee,
      filename
    );

    res.download(pdfPath, filename, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Clean up temp file
      const fs = require('fs');
      try {
        fs.unlinkSync(pdfPath);
      } catch (error) {
        console.error('Error deleting temp file:', error);
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const employeesWithoutBank = await Employee.countWithoutBank();
    const employeesWithoutManager = await Employee.countWithoutManager();
    const recentPayruns = await Payroll.findAll(5);

    res.json({
      success: true,
      data: {
        warnings: {
          employeesWithoutBank,
          employeesWithoutManager
        },
        recentPayruns
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};