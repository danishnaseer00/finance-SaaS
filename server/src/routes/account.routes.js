const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  toggleArchiveAccount,
  deleteAccount,
} = require('../controllers/account.controller');

// All routes require authentication
router.use(authenticate);

// CRUD routes
router.post('/', createAccount);
router.get('/', getAccounts);
router.get('/:id', getAccount);
router.put('/:id', updateAccount);
router.patch('/:id/toggle-archive', toggleArchiveAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
