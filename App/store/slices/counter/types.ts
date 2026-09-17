export interface CounterState {
  value: number;
  lastAction: 'increment' | 'decrement' | 'reset' | 'amount' | null;
  updatedAt: string | null;
}
