const { z } = require('zod');

const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
});

module.exports = { chatMessageSchema };
