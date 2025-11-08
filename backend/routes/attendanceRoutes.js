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
const { authorize } = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-attendance', getMyAttendance);

router.get('/all', authorize(ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER), getAllAttendance);
router.get('/:date', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), getAttendanceByDate);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), updateAttendance);

module.exports = router;
