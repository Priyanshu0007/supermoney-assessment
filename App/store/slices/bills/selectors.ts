import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../types';
import type { Bill, BillCalculationResult, DebtTransaction, PersonBreakdown } from './types';

/**
 * Pure calculation helper to compute settlement breakdown and simplified debt transactions.
 */
export function calculateBillSettlement(
  bill: Bill,
  currentUserId = 'user_you'
): BillCalculationResult {
  const people = bill.people?.length ? bill.people : bill.pepole || [];

  // Track paid and share for each person
  const paidMap: Record<string, number> = {};
  const shareMap: Record<string, number> = {};

  people.forEach((p) => {
    paidMap[p.id] = 0;
    shareMap[p.id] = 0;
  });

  // Calculate totals from items
  (bill.items || []).forEach((item) => {
    const price = Number(item.itemPrice) || 0;
    if (paidMap[item.paidBy] !== undefined) {
      paidMap[item.paidBy] += price;
    } else {
      paidMap[item.paidBy] = price;
    }

    if (item.splitType === 'custom' && item.customShares) {
      Object.entries(item.customShares).forEach(([participantId, amount]) => {
        const amt = Number(amount) || 0;
        shareMap[participantId] = (shareMap[participantId] || 0) + amt;
      });
    } else {
      // Default: Equal split among all participants
      const count = people.length || 1;
      const equalShare = price / count;
      people.forEach((p) => {
        shareMap[p.id] = (shareMap[p.id] || 0) + equalShare;
      });
    }
  });

  // Compute breakdowns
  const breakdowns: PersonBreakdown[] = people.map((p) => {
    const paid = Math.round((paidMap[p.id] || 0) * 100) / 100;
    const share = Math.round((shareMap[p.id] || 0) * 100) / 100;
    const net = Math.round((paid - share) * 100) / 100;
    return {
      participantId: p.id,
      displayName: p.displayName || p.userName || 'Person',
      isCurrentUser: p.id === currentUserId,
      paid,
      share,
      net,
    };
  });

  // Debt simplification: Greedy Min-Cash-Flow
  type Balance = { id: string; name: string; amount: number };
  const debtors: Balance[] = [];
  const creditors: Balance[] = [];

  breakdowns.forEach((b) => {
    if (b.net < -0.01) {
      debtors.push({ id: b.participantId, name: b.displayName, amount: Math.abs(b.net) });
    } else if (b.net > 0.01) {
      creditors.push({ id: b.participantId, name: b.displayName, amount: b.net });
    }
  });

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: DebtTransaction[] = [];
  let dIdx = 0;
  let cIdx = 0;
  let txCounter = 1;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledAmt = Math.min(debtor.amount, creditor.amount);
    const roundedAmt = Math.round(settledAmt * 100) / 100;

    if (roundedAmt > 0) {
      transactions.push({
        id: `tx_${bill.id}_${txCounter++}`,
        fromParticipantId: debtor.id,
        fromName: debtor.name,
        toParticipantId: creditor.id,
        toName: creditor.name,
        amount: roundedAmt,
      });
    }

    debtor.amount -= settledAmt;
    creditor.amount -= settledAmt;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  const currentUserBreakdown = breakdowns.find((b) => b.isCurrentUser);
  const currentUserNet = currentUserBreakdown ? currentUserBreakdown.net : 0;

  let statusText = 'Settled';
  if (bill.isSettled) {
    statusText = 'Settled';
  } else if (currentUserNet < -0.01) {
    statusText = `You owe Rs.${Math.round(Math.abs(currentUserNet)).toLocaleString('en-IN')}`;
  } else if (currentUserNet > 0.01) {
    statusText = `You are owed Rs.${Math.round(currentUserNet).toLocaleString('en-IN')}`;
  } else {
    statusText = 'Settled';
  }

  return {
    totalAmount: bill.totalAmount,
    breakdowns,
    transactions,
    currentUserNet,
    statusText,
    currentUserOwes: !bill.isSettled && currentUserNet < -0.01,
    currentUserIsOwed: !bill.isSettled && currentUserNet > 0.01,
  };
}

export const selectBillsState = (state: RootState) => state.bills;

export const selectAllBills = createSelector(
  selectBillsState,
  (billsState) => billsState.bills
);

export const selectCurrentUserId = createSelector(
  selectBillsState,
  (billsState) => billsState.currentUserId
);

export const selectBillById = (billId: string) =>
  createSelector(selectAllBills, (bills) => bills.find((b) => b.id === billId));

export const selectBillCalculation = (billId: string) =>
  createSelector(
    [selectAllBills, selectCurrentUserId],
    (bills, currentUserId): BillCalculationResult | null => {
      const bill = bills.find((b) => b.id === billId);
      if (!bill) return null;
      return calculateBillSettlement(bill, currentUserId);
    }
  );
