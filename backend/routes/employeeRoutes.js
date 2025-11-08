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
const { authorize } = require('../middleware/roleCheck');
const { employeeValidation, validate } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

router.use(protect);

router.get('/me/profile', getMyProfile);
router.put('/me/profile', updateMyProfile);

router.get('/', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), getAllEmployees);
router.post('/', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), employeeValidation, validate, createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), updateEmployee);
router.delete('/:id', authorize(ROLES.ADMIN), deleteEmployee);

module.exports = router;
