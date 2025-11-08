const express = require('express');
const router = express.Router();
const {
  getSalaryStatement,
  getAttendanceSummary,
  getEmployerCostReport,
  getEmployeeCountReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { ROLES } = require('../config/constants');

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.PAYROLL_OFFICER, ROLES.HR_OFFICER));

router.get('/salary-statement', getSalaryStatement);
router.get('/attendance-summary', getAttendanceSummary);
router.get('/employer-cost', getEmployerCostReport);
router.get('/employee-count', getEmployeeCountReport);

module.exports = router;