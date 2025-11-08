// backend/routes/timeOffRoutes.js
const express = require('express');
const router = express.Router();
const {
  requestTimeOff,
  getMyTimeOffRequests,
  getAllTimeOffRequests,
  approveTimeOff,
  rejectTimeOff,
  deleteTimeOffRequest
} = require('../controllers/timeOffController');
const { protect } = require('../middleware/auth');
const { canApproveTimeOff } = require('../middleware/roleCheck');
const { timeOffValidation, validate } = require('../middleware/validation');

router.use(protect);

// Employee time off requests
router.post('/', timeOffValidation, validate, requestTimeOff);
router.get('/my-requests', getMyTimeOffRequests);
router.delete('/:id', deleteTimeOffRequest);

// Approve/Reject - Admin, HR Officer, Payroll Officer, Manager
router.get('/all', canApproveTimeOff, getAllTimeOffRequests);
router.put('/:id/approve', canApproveTimeOff, approveTimeOff);
router.put('/:id/reject', canApproveTimeOff, rejectTimeOff);

module.exports = router;