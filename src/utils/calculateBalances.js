function calculateBalances(members, expenses, splits) {
  // members: [{ id, username }]
  // expenses: [{ id, amount, paidBy }]
  // splits: [{ expenseId, userId, amount }]

  const balances = {};
  const paid = {};
  const owes = {};

  // Initialise all amounts to 0
  members.forEach((m) => {
    balances[m.id] = 0;
    paid[m.id] = 0;
    owes[m.id] = 0;
  });

  // 1. Total paid by each member
  expenses.forEach((e) => {
    paid[e.paidBy] += Number(e.amount);
  });

  // 2. Total owed by each member (from splits)
  splits.forEach((s) => {
    owes[s.userId] += Number(s.amount);
  });

  // 3. Final balance
  // balance = paid - owes
  members.forEach((m) => {
    balances[m.id] = paid[m.id] - owes[m.id];
  });

  return { balances, paid, owes };
}

module.exports = { calculateBalances };
