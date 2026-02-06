const { z } = require('zod');

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'WALLET'], {
    errorMap: () => ({ message: 'Invalid account type' }),
  }),
  openingBalance: z.number().default(0),
  currency: z.string().min(1).max(10).default('USD'),
  color: z.string().optional(),
});

const accountUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'SAVINGS', 'WALLET']).optional(),
  openingBalance: z.number().optional(),
  currency: z.string().min(1).max(10).optional(),
  color: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).optional(),
});

module.exports = { accountSchema, accountUpdateSchema };
