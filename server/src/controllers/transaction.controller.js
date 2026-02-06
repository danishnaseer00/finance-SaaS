const prisma = require('../config/database');
const { transactionFilterSchema } = require('../validators/transaction.validator');

const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes, accountId } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount,
        type,
        category,
        date: new Date(date),
        notes,
        accountId: accountId || null,
      },
      include: {
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
      },
    });

    // Update account balance if account is linked
    if (accountId) {
      const balanceChange = type === 'INCOME' ? amount : -amount;
      await prisma.account.update({
        where: { id: accountId },
        data: {
          currentBalance: { increment: balanceChange },
        },
      });
    }

    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const filters = transactionFilterSchema.parse(req.query);
    const { startDate, endDate, type, category, page, limit } = filters;

    const where = { userId: req.user.id };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (type) where.type = type;
    if (category) where.category = category;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          account: {
            select: { id: true, name: true, type: true, color: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, type, category, date, notes, accountId } = req.body;

    // Check ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Handle account balance changes
    const oldAccountId = existing.accountId;
    const newAccountId = accountId !== undefined ? (accountId || null) : oldAccountId;
    const oldAmount = parseFloat(existing.amount);
    const newAmount = amount !== undefined ? amount : oldAmount;
    const oldType = existing.type;
    const newType = type !== undefined ? type : oldType;

    // Revert old account balance
    if (oldAccountId) {
      const oldBalanceChange = oldType === 'INCOME' ? -oldAmount : oldAmount;
      await prisma.account.update({
        where: { id: oldAccountId },
        data: { currentBalance: { increment: oldBalanceChange } },
      });
    }

    // Apply new account balance
    if (newAccountId) {
      const newBalanceChange = newType === 'INCOME' ? newAmount : -newAmount;
      await prisma.account.update({
        where: { id: newAccountId },
        data: { currentBalance: { increment: newBalanceChange } },
      });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(accountId !== undefined && { accountId: accountId || null }),
      },
      include: {
        account: {
          select: { id: true, name: true, type: true, color: true },
        },
      },
    });

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert account balance if linked
    if (existing.accountId) {
      const balanceChange = existing.type === 'INCOME' 
        ? -parseFloat(existing.amount) 
        : parseFloat(existing.amount);
      await prisma.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: balanceChange } },
      });
    }

    await prisma.transaction.delete({ where: { id } });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      select: { category: true },
      distinct: ['category'],
    });

    res.json({
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
