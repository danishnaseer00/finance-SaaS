const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { transactionSchema } = require('../validators/transaction.validator');

// All routes require authentication
router.use(authenticate);

router.post('/', validate(transactionSchema), transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/categories', transactionController.getCategories);
router.get('/:id', transactionController.getTransaction);
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
