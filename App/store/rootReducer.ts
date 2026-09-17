import { combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, type PersistConfig } from 'redux-persist';
import authReducer from './slices/auth/authSlice';
import counterReducer from './slices/counter/counterSlice';

/**
 * Root reducer combining all slice reducers in the application.
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  counter: counterReducer,
});

export type RootReducerState = ReturnType<typeof rootReducer>;

/**
 * Persist Configuration
 *
 * BLACKLIST OPTION:
 * Slices added to `blacklist` are NOT saved to persistent AsyncStorage.
 * In this setup, 'counter' is blacklisted, so its state resets when the app restarts,
 * while 'auth' persists across app launches.
 *
 * Fully type-safe: items in this array must be keys of RootReducerState.
 */
export const PERSIST_BLACKLIST: (keyof RootReducerState)[] = ['counter'];

/**
 * Optional WHITELIST OPTION:
 * If you prefer whitelisting over blacklisting, you can define slice keys here.
 */
export const PERSIST_WHITELIST: (keyof RootReducerState)[] | undefined = undefined;

export const rootPersistConfig: PersistConfig<RootReducerState> = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  blacklist: PERSIST_BLACKLIST,
  ...(PERSIST_WHITELIST ? { whitelist: PERSIST_WHITELIST } : {}),
};

export const persistedRootReducer = persistReducer(rootPersistConfig, rootReducer);
