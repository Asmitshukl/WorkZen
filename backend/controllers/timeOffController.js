const TimeOff = require('../models/TimeOff');
const { sendTimeOffApprovalEmail } = require('../utils/emailService');

exports.requestTimeOff = async (req, res) => {
  try {
    const { timeOffType, startDate, endDate, reason, attachment } = req.body;
    const user = req.user;

    const employee = await Employee.findById(user.employee_id);

    
    const { eachDayOfInterval, isWeekend } = require('date-fns');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const allDays = eachDayOfInterval({ start, end });
    const workingDays = allDays.filter(day => !isWeekend(day)).length;

    // Check available balance
    const balanceCheck = await TimeOff.checkAvailableBalance(
      user.employee_id,
      timeOffType,
      workingDays
    );

    if (!balanceCheck.available) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ${balanceCheck.balance} days, Requested: ${workingDays} days`
      });
    }

    const timeOff = await TimeOff.create({
      employeeId: user.employee_id,
      timeOffType,
      startDate,
      endDate,
      reason,
      attachment
    });

    res.status(201).json({
      success: true,
      message: 'Time off request submitted successfully',
      data: timeOff
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyTimeOffRequests = async (req, res) => {
  try {
    const user = req.user;
    const timeOffs = await TimeOff.findByEmployee(user.employee_id);

    res.json({
      success: true,
      data: timeOffs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllTimeOffRequests = async (req, res) => {
  try {
    const { status, employeeId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (employeeId) filters.employeeId = employeeId;

    const timeOffs = await TimeOff.findAll(filters);

    res.json({
      success: true,
      count: timeOffs.length,
      data: timeOffs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.approveTimeOff = async (req, res) => {
  try {
    const timeOff = await TimeOff.findById(req.params.id);

    if (!timeOff) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found'
      });
    }

    if (timeOff.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Time off request already processed'
      });
    }

    const approved = await TimeOff.approve(req.params.id, req.user.id);

    // Deduct from allocation
    await TimeOff.deductFromAllocation(
      timeOff.employee_id,
      timeOff.time_off_type,
      timeOff.days
    );

    // Mark attendance as on leave for these dates
    const { eachDayOfInterval, isWeekend } = require('date-fns');
    const start = new Date(timeOff.start_date);
    const end = new Date(timeOff.end_date);
    const allDays = eachDayOfInterval({ start, end });
    
    for (const day of allDays) {
      if (!isWeekend(day)) {
        const dateStr = day.toISOString().split('T')[0];
        await Attendance.markLeave(timeOff.employee_id, dateStr);
      }
    }

    // Send email
    const employee = timeOff.employee;
    await sendTimeOffApprovalEmail(
      employee.email,
      employee.first_name,
      'Approved',
      timeOff.start_date,
      timeOff.end_date,
      timeOff.reason
    );

    res.json({
      success: true,
      message: 'Time off approved successfully',
      data: approved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.rejectTimeOff = async (req, res) => {
  try {
    const { reason } = req.body;
    const timeOff = await TimeOff.findById(req.params.id);

    if (!timeOff) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found'
      });
    }

    if (timeOff.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Time off request already processed'
      });
    }

    const rejected = await TimeOff.reject(req.params.id, req.user.id, reason);

    // Send email
    const employee = timeOff.employee;
    await sendTimeOffApprovalEmail(
      employee.email,
      employee.first_name,
      'Rejected',
      timeOff.start_date,
      timeOff.end_date,
      reason
    );

    res.json({
      success: true,
      message: 'Time off rejected',
      data: rejected
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteTimeOffRequest = async (req, res) => {
  try {
    const timeOff = await TimeOff.delete(req.params.id);

    if (!timeOff) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found or cannot be deleted'
      });
    }

    res.json({
      success: true,
      message: 'Time off request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
