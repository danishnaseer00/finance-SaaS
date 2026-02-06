const prisma = require('../config/database');
const { transactionFilterSchema } = require('../validators/transaction.validator');

const createTransaction = async (req, res, next) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        amount,
        type,
        category,
        date: new Date(date),
        notes,
      },
    });

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
    const { amount, type, category, date, notes } = req.body;

    // Check ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
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
