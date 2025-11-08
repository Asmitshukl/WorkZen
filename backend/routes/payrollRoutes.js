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
const { authorize } = require('../middleware/roleCheck');
const { payrunValidation, validate } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/my-payslips', getMyPayslips);
router.get('/payslip/:id/pdf', downloadPayslipPDF);

router.use(authorize(ROLES.ADMIN, ROLES.PAYROLL_OFFICER));
router.post('/generate-payrun', payrunValidation, validate, generatePayrun);
router.get('/payruns', getAllPayruns);
router.get('/payrun/:id', getPayrunById);
router.post('/validate-payrun/:id', validatePayrun);
router.get('/payslip/:id', getPayslipById);
router.get('/dashboard-stats', getDashboardStats);

module.exports = router;