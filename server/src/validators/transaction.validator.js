const { z } = require('zod');

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    errorMap: () => ({ message: 'Type must be INCOME or EXPENSE' }),
  }),
  category: z.string().min(1, 'Category is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  notes: z.string().optional(),
  accountId: z.string().uuid().optional().nullable(),
});

const transactionUpdateSchema = transactionSchema.partial();

// Helper to transform empty strings to undefined
const emptyToUndefined = z.literal('').transform(() => undefined);

const transactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional().or(emptyToUndefined),
  category: z.string().optional().or(emptyToUndefined).transform(val => val === '' ? undefined : val),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

module.exports = { transactionSchema, transactionUpdateSchema, transactionFilterSchema };
