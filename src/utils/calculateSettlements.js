function calculateSettlements(members, balances) {
  // balances: { userId: number }

  // Build arrays of creditors and debtors
  const creditors = [];
  const debtors = [];

  members.forEach((m) => {
    const bal = balances[m.id];

    if (bal > 0.001) {
      creditors.push({ userId: m.id, amount: bal });
    } else if (bal < -0.001) {
      debtors.push({ userId: m.id, amount: -bal }); // store positive "owes" amount
    }
  });

  const settlements = [];

  let i = 0; // creditor index
  let j = 0; // debtor index

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];

    const payAmount = Math.min(creditor.amount, debtor.amount);

    if (payAmount > 0.001) {
      settlements.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: payAmount,
      });

      creditor.amount -= payAmount;
      debtor.amount -= payAmount;
    }

    if (creditor.amount <= 0.001) i++;
    if (debtor.amount <= 0.001) j++;
  }

  return settlements;
}

module.exports = { calculateSettlements };
