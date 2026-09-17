import {
  store,
  loginSuccess,
  logout,
  increment,
  decrement,
  reset,
  incrementByAmount,
  selectAuth,
  selectCounter,
  PERSIST_BLACKLIST,
  rootPersistConfig,
} from '../App/store';

describe('Redux Store Architecture & Slices', () => {
  it('should have counter slice configured in PERSIST_BLACKLIST', () => {
    expect(PERSIST_BLACKLIST).toContain('counter');
    expect(rootPersistConfig.blacklist).toContain('counter');
    expect(rootPersistConfig.blacklist).not.toContain('auth');
  });

  it('should handle authSlice actions and selectors properly', () => {
    expect(selectAuth(store.getState()).isAuthenticated).toBe(false);

    store.dispatch(
      loginSuccess({
        user: {
          id: 'user_1',
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
        token: 'mock_token_123',
      })
    );

    const authState = selectAuth(store.getState());
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.name).toBe('Jane Doe');
    expect(authState.token).toBe('mock_token_123');

    store.dispatch(logout());
    const loggedOutState = selectAuth(store.getState());
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(loggedOutState.user).toBeNull();
  });

  it('should handle counterSlice actions and selectors properly', () => {
    const initialCounter = selectCounter(store.getState()).value;

    store.dispatch(increment());
    expect(selectCounter(store.getState()).value).toBe(initialCounter + 1);

    store.dispatch(decrement());
    expect(selectCounter(store.getState()).value).toBe(initialCounter);

    store.dispatch(incrementByAmount(10));
    expect(selectCounter(store.getState()).value).toBe(initialCounter + 10);

    store.dispatch(reset());
    expect(selectCounter(store.getState()).value).toBe(0);
  });
});
