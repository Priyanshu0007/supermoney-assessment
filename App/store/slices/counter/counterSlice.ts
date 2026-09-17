import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CounterState } from './types';

const initialState: CounterState = {
  value: 0,
  lastAction: null,
  updatedAt: null,
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
      state.lastAction = 'increment';
      state.updatedAt = new Date().toLocaleTimeString();
    },
    decrement: (state) => {
      state.value -= 1;
      state.lastAction = 'decrement';
      state.updatedAt = new Date().toLocaleTimeString();
    },
    reset: (state) => {
      state.value = 0;
      state.lastAction = 'reset';
      state.updatedAt = new Date().toLocaleTimeString();
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
      state.lastAction = 'amount';
      state.updatedAt = new Date().toLocaleTimeString();
    },
  },
});

export const { increment, decrement, reset, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
