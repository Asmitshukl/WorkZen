// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSalaryStatement,
  getAttendanceSummary,
  getEmployerCostReport,
  getEmployeeCountReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { canAccessReports } = require('../middleware/roleCheck');

router.use(protect);
router.use(canAccessReports);

router.get('/salary-statement', getSalaryStatement);
router.get('/attendance-summary', getAttendanceSummary);
router.get('/employer-cost', getEmployerCostReport);
router.get('/employee-count', getEmployeeCountReport);

module.exports = router;