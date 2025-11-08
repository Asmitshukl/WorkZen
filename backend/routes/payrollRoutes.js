// backend/routes/payrollRoutes.js
const express = require('express');
const router = express.Router();
const {
  generatePayrun,
  getAllPayruns,
  getPayrunById,
  validatePayrun,
  getPayslipById,
  getMyPayslips,
  downloadPayslipPDF,
  getDashboardStats
} = require('../controllers/payrollController');
const { protect } = require('../middleware/auth');
const { isPayrollOrAdmin } = require('../middleware/roleCheck');
const { payrunValidation, validate } = require('../middleware/validation');

router.use(protect);

// Employee payslip access - all employees
router.get('/my-payslips', getMyPayslips);
router.get('/payslip/:id/pdf', downloadPayslipPDF);
router.get('/payslip/:id', getPayslipById);

// Payroll management - Admin & Payroll Officer only
router.post('/generate-payrun', isPayrollOrAdmin, payrunValidation, validate, generatePayrun);
router.get('/payruns', isPayrollOrAdmin, getAllPayruns);
router.get('/payrun/:id', isPayrollOrAdmin, getPayrunById);
router.post('/validate-payrun/:id', isPayrollOrAdmin, validatePayrun);
router.get('/dashboard-stats', isPayrollOrAdmin, getDashboardStats);

module.exports = router;