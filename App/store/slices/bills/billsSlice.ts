import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Bill, BillsState, Participant } from './types';

export const CURRENT_USER: Participant = {
  id: 'user_you',
  userName: 'you',
  displayName: 'You',
};

const initialMockBills: Bill[] = [
  {
    id: 'bill_goa_trip',
    title: 'Goa Trip',
    totalPeople: 4,
    totalAmount: 3200,
    people: [
      CURRENT_USER,
      { id: 'user_rahul', userName: 'rahul', displayName: 'Rahul' },
      { id: 'user_sneha', userName: 'sneha', displayName: 'Sneha' },
      { id: 'user_amit', userName: 'amit', displayName: 'Amit' },
    ],
    items: [
      {
        id: 'item_pizza',
        itemName: 'Pizza',
        itemPrice: 800,
        paidBy: 'user_rahul',
        splitType: 'equal',
      },
      {
        id: 'item_cab',
        itemName: 'Cab',
        itemPrice: 400,
        paidBy: 'user_you',
        splitType: 'custom',
        customShares: {
          user_rahul: 150,
          user_sneha: 0,
          user_you: 100,
          user_amit: 150,
        },
      },
      {
        id: 'item_villa',
        itemName: 'Villa & Stay',
        itemPrice: 800,
        paidBy: 'user_you',
        splitType: 'custom',
        customShares: {
          user_rahul: 700,
          user_sneha: 0,
          user_you: 50,
          user_amit: 50,
        },
      },
      {
        id: 'item_activities',
        itemName: 'Water Sports & Beach',
        itemPrice: 1200,
        paidBy: 'user_amit',
        splitType: 'custom',
        customShares: {
          user_rahul: 0,
          user_sneha: 0,
          user_you: 400,
          user_amit: 800,
        },
      },
    ],
    isSettled: false,
    createdAt: '2026-09-10T14:30:00.000Z',
  },
  {
    id: 'bill_movie_night',
    title: 'Movie Night',
    totalPeople: 3,
    totalAmount: 900,
    people: [
      CURRENT_USER,
      { id: 'user_rahul', userName: 'rahul', displayName: 'Rahul' },
      { id: 'user_sneha', userName: 'sneha', displayName: 'Sneha' },
    ],
    items: [
      {
        id: 'item_tickets',
        itemName: 'IMAX Tickets',
        itemPrice: 600,
        paidBy: 'user_you',
        splitType: 'equal',
      },
      {
        id: 'item_popcorn',
        itemName: 'Popcorn & Drinks',
        itemPrice: 300,
        paidBy: 'user_rahul',
        splitType: 'equal',
      },
    ],
    isSettled: false,
    createdAt: '2026-09-14T19:00:00.000Z',
  },
  {
    id: 'bill_flat_rent',
    title: 'Flat Rent - Aug',
    totalPeople: 2,
    totalAmount: 18000,
    people: [
      CURRENT_USER,
      { id: 'user_rohit', userName: 'rohit', displayName: 'Rohit' },
    ],
    items: [
      {
        id: 'item_rent',
        itemName: 'August Monthly Rent',
        itemPrice: 18000,
        paidBy: 'user_you',
        splitType: 'equal',
      },
    ],
    isSettled: true,
    createdAt: '2026-08-31T10:00:00.000Z',
  },
];

const initialState: BillsState = {
  bills: initialMockBills,
  currentUserId: CURRENT_USER.id,
};

export const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    addBill: (
      state,
      action: PayloadAction<Omit<Bill, 'id' | 'createdAt'> & { id?: string }>
    ) => {
      const id = action.payload.id || `bill_${Date.now()}`;
      const totalAmount = action.payload.items.reduce(
        (sum, item) => sum + (Number(item.itemPrice) || 0),
        0
      );
      const people = action.payload.people || action.payload.pepole || [CURRENT_USER];
      const newBill: Bill = {
        ...action.payload,
        id,
        people,
        pepole: people,
        totalPeople: people.length,
        totalAmount,
        isSettled: action.payload.isSettled ?? false,
        createdAt: new Date().toISOString(),
      };
      state.bills.unshift(newBill);
    },
    updateBill: (state, action: PayloadAction<Bill>) => {
      const index = state.bills.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        const totalAmount = action.payload.items.reduce(
          (sum, item) => sum + (Number(item.itemPrice) || 0),
          0
        );
        const people = action.payload.people || action.payload.pepole || [];
        state.bills[index] = {
          ...action.payload,
          people,
          pepole: people,
          totalPeople: people.length,
          totalAmount,
        };
      }
    },
    toggleBillSettled: (state, action: PayloadAction<{ billId: string; isSettled?: boolean }>) => {
      const bill = state.bills.find((b) => b.id === action.payload.billId);
      if (bill) {
        bill.isSettled =
          action.payload.isSettled !== undefined
            ? action.payload.isSettled
            : !bill.isSettled;
      }
    },
    deleteBill: (state, action: PayloadAction<string>) => {
      state.bills = state.bills.filter((b) => b.id !== action.payload);
    },
    resetBills: (state) => {
      state.bills = initialMockBills;
    },
  },
});

export const {
  addBill,
  updateBill,
  toggleBillSettled,
  deleteBill,
  resetBills,
} = billsSlice.actions;

export default billsSlice.reducer;
