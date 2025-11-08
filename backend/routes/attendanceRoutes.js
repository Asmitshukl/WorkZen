// backend/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByDate,
  updateAttendance
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize, isHROrAdmin } = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

router.use(protect);

// Personal attendance - all employees
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-attendance', getMyAttendance);

// Manage attendance - Admin & HR Officer only
router.get('/all', isHROrAdmin, getAllAttendance);
router.get('/:date', isHROrAdmin, getAttendanceByDate);
router.put('/:id', isHROrAdmin, updateAttendance);

module.exports = router;