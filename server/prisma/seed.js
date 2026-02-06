const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@finsense.com' },
    update: {},
    create: {
      email: 'demo@finsense.com',
      passwordHash: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample transactions
  const categories = {
    income: ['Salary', 'Freelance', 'Investments', 'Other Income'],
    expense: ['Food', 'Rent', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education'],
  };

  const now = new Date();
  const transactions = [];

  // Generate transactions for last 3 months
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    
    // Add income
    transactions.push({
      userId: user.id,
      amount: 3500 + Math.random() * 500,
      type: 'INCOME',
      category: 'Salary',
      date: new Date(month.getFullYear(), month.getMonth(), 1),
      notes: 'Monthly salary',
    });

    // Add random expenses
    const expenseCount = 10 + Math.floor(Math.random() * 10);
    for (let i = 0; i < expenseCount; i++) {
      const category = categories.expense[Math.floor(Math.random() * categories.expense.length)];
      const day = Math.floor(Math.random() * 28) + 1;
      
      transactions.push({
        userId: user.id,
        amount: 10 + Math.random() * 200,
        type: 'EXPENSE',
        category,
        date: new Date(month.getFullYear(), month.getMonth(), day),
        notes: `${category} expense`,
      });
    }
  }

  await prisma.transaction.createMany({
    data: transactions,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${transactions.length} sample transactions`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
