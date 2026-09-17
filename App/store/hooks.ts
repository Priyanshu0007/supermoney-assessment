import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './types';

/**
 * Pre-typed dispatch hook that is aware of thunks and action types.
 * Use throughout the application instead of plain `useDispatch`.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed selector hook that is aware of RootState.
 * Use throughout the application instead of plain `useSelector`.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
