import type { RootState } from '../../types';

export const selectCounter = (state: RootState) => state.counter;
export const selectCounterValue = (state: RootState) => state.counter.value;
export const selectCounterLastAction = (state: RootState) => state.counter.lastAction;
export const selectCounterUpdatedAt = (state: RootState) => state.counter.updatedAt;
