const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { chatMessageSchema } = require('../validators/ai.validator');

// All routes require authentication
router.use(authenticate);

router.post('/chat', validate(chatMessageSchema), aiController.chat);
router.get('/insights', aiController.getInsights);
router.get('/budget-plan', aiController.getBudgetPlan);
router.get('/chat-history', aiController.getChatHistory);

module.exports = router;
