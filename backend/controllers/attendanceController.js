const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.checkIn = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findByEmployeeAndDate(user.employee_id, today);

    if (existing && existing.check_in) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const attendance = await Attendance.checkIn(user.employee_id, today);

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const user = req.user;
    const today = new Date().toISOString().split('T')[0];

    const existing = await Attendance.findByEmployeeAndDate(user.employee_id, today);

    if (!existing || !existing.check_in) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first'
      });
    }

    if (existing.check_out) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    const attendance = await Attendance.checkOut(user.employee_id, today);

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const user = req.user;

    const attendance = await Attendance.findByEmployee(
      user.employee_id,
      month ? parseInt(month) : null,
      year ? parseInt(year) : null
    );

    // Calculate stats
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const leaveDays = attendance.filter(a => a.status === 'On Leave').length;
    const absentDays = attendance.filter(a => a.status === 'Absent').length;

    res.json({
      success: true,
      data: {
        records: attendance,
        stats: {
          totalDays,
          presentDays,
          leaveDays,
          absentDays,
          workingDays: month ? new Date(year, month, 0).getDate() : null
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const { date, employee } = req.query;

    let targetDate = date || new Date().toISOString().split('T')[0];

    let attendance;
    if (employee) {
      attendance = await Attendance.findByEmployee(employee);
    } else {
      attendance = await Attendance.findByDate(targetDate);
    }

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const targetDate = req.params.date;
    const attendance = await Attendance.findByDate(targetDate);

    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByEmployeeAndDate(
      req.body.employeeId,
      req.body.date
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    const updated = await Attendance.update(attendance.id, req.body);

    if (updated.check_in && updated.check_out) {
      await Attendance.calculateWorkHours(updated.id);
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
