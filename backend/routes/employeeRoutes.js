// backend/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
  updateMyProfile
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { authorize, isHROrAdmin, isAdmin, checkPermission } = require('../middleware/roleCheck');
const { employeeValidation, validate } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/me/profile', getMyProfile);
router.put('/me/profile', updateMyProfile);

// Employee management routes - Admin & HR Officer only
router.get('/', isHROrAdmin, getAllEmployees);
router.post('/', isHROrAdmin, employeeValidation, validate, createEmployee);

// View employee details - Admin, HR Officer, and the employee themselves
router.get('/:id', getEmployeeById);

// Update/Delete - Admin & HR Officer only
router.put('/:id', isHROrAdmin, updateEmployee);
router.delete('/:id', isAdmin, deleteEmployee);

module.exports = router;