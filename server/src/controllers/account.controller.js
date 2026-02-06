const prisma = require('../config/database');
const { accountSchema, accountUpdateSchema } = require('../validators/account.validator');

// Create a new account
const createAccount = async (req, res, next) => {
  try {
    const validatedData = accountSchema.parse(req.body);

    const account = await prisma.account.create({
      data: {
        userId: req.user.id,
        name: validatedData.name,
        type: validatedData.type,
        openingBalance: validatedData.openingBalance,
        currentBalance: validatedData.openingBalance,
        currency: validatedData.currency,
        color: validatedData.color || '#8b5cf6',
      },
    });

    res.status(201).json({ account });
  } catch (error) {
    next(error);
  }
};

// Get all accounts for user
const getAccounts = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = { userId: req.user.id };
    if (status === 'ACTIVE') where.status = 'ACTIVE';
    if (status === 'ARCHIVED') where.status = 'ARCHIVED';

    const accounts = await prisma.account.findMany({
      where,
      orderBy: [
        { status: 'asc' }, // Active first
        { updatedAt: 'desc' },
      ],
    });

    // Get counts for totals
    const allAccounts = await prisma.account.findMany({
      where: { userId: req.user.id },
    });
    
    const activeAccounts = allAccounts.filter(a => a.status === 'ACTIVE');
    const archivedAccounts = allAccounts.filter(a => a.status === 'ARCHIVED');
    const totalBalance = activeAccounts.reduce(
      (sum, acc) => sum + parseFloat(acc.currentBalance),
      0
    );

    res.json({
      accounts,
      totals: {
        totalBalance,
        activeCount: activeAccounts.length,
        archivedCount: archivedAccounts.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single account
const getAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ account });
  } catch (error) {
    next(error);
  }
};

// Update account
const updateAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = accountUpdateSchema.parse(req.body);

    // Check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // If opening balance is updated, adjust current balance
    let updateData = { ...validatedData };
    if (validatedData.openingBalance !== undefined) {
      const balanceDiff = validatedData.openingBalance - parseFloat(existingAccount.openingBalance);
      updateData.currentBalance = parseFloat(existingAccount.currentBalance) + balanceDiff;
    }

    const account = await prisma.account.update({
      where: { id },
      data: updateData,
    });

    res.json({ account });
  } catch (error) {
    next(error);
  }
};

// Archive/Unarchive account
const toggleArchiveAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const newStatus = existingAccount.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';

    const account = await prisma.account.update({
      where: { id },
      data: { status: newStatus },
    });

    res.json({ account, message: `Account ${newStatus.toLowerCase()}` });
  } catch (error) {
    next(error);
  }
};

// Delete account permanently
const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await prisma.account.delete({
      where: { id },
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  toggleArchiveAccount,
  deleteAccount,
};
