import type { Action, ThunkAction } from '@reduxjs/toolkit';
import type { store } from './store';
import type { RootReducerState } from './rootReducer';

/**
 * RootState derived from the store's full state (includes redux-persist `_persist` state)
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch for dispatching standard actions as well as thunks
 */
export type AppDispatch = typeof store.dispatch;

/**
 * AppThunk type for asynchronous actions/thunks
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

/**
 * Type-safe slice keys helper for blacklist/whitelist configurations
 */
export type PersistSliceKey = keyof RootReducerState;
