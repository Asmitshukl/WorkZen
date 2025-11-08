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
const { authorize } = require('../middleware/roleCheck');
const { timeOffValidation, validate } = require('../middleware/validation');
const { ROLES } = require('../config/constants');

router.use(protect);

router.post('/', timeOffValidation, validate, requestTimeOff);
router.get('/my-requests', getMyTimeOffRequests);
router.delete('/:id', deleteTimeOffRequest);

router.get('/all', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), getAllTimeOffRequests);
router.put('/:id/approve', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), approveTimeOff);
router.put('/:id/reject', authorize(ROLES.ADMIN, ROLES.HR_OFFICER), rejectTimeOff);

module.exports = router;