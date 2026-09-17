import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import {
  useAppDispatch,
  useAppSelector,
  loginSuccess,
  logout,
  increment,
  decrement,
  incrementByAmount,
  reset,
  selectAuth,
  selectCounter,
} from '../store';

export const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(selectAuth);
  const counter = useAppSelector(selectCounter);

  const handleToggleAuth = () => {
    if (auth.isAuthenticated) {
      dispatch(logout());
    } else {
      dispatch(
        loginSuccess({
          user: {
            id: 'user_42',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
          },
          token: 'jwt_mock_token_abc123',
        })
      );
    }
  };

  const handleNavigateToDetails = () => {
    navigation.navigate('Details', {
      id: 'item-101',
      title: 'React Navigation Deep Dive',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Redux State Hub</Text>
        <Text style={styles.headerSubtitle}>
          RTK + Redux Persist with Slice Blacklisting
        </Text>
      </View>

      {/* Persisted Slice Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Auth Slice</Text>
          <View style={[styles.badge, styles.badgePersisted]}>
            <Text style={styles.badgeText}>PERSISTED</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Stored in AsyncStorage. Survives app reload and device restart.
        </Text>

        <View style={styles.stateBox}>
          <View style={styles.row}>
            <Text style={styles.stateLabel}>Status:</Text>
            <Text
              style={[
                styles.stateValue,
                auth.isAuthenticated
                  ? styles.statusLoggedIn
                  : styles.statusGuest,
              ]}
            >
              {auth.isAuthenticated ? 'Logged In' : 'Guest'}
            </Text>
          </View>

          {auth.isAuthenticated && auth.user && (
            <>
              <View style={styles.row}>
                <Text style={styles.stateLabel}>User:</Text>
                <Text style={styles.stateValue}>{auth.user.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.stateLabel}>Email:</Text>
                <Text style={styles.stateValue}>{auth.user.email}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.stateLabel}>Token:</Text>
                <Text style={styles.stateValueSnippet}>{auth.token}</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            auth.isAuthenticated ? styles.buttonDanger : styles.buttonPrimary,
          ]}
          activeOpacity={0.8}
          onPress={handleToggleAuth}
        >
          <Text style={styles.buttonText}>
            {auth.isAuthenticated ? 'Log Out' : 'Log In as Jane Doe'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Blacklisted Slice Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Counter Slice</Text>
          <View style={[styles.badge, styles.badgeBlacklisted]}>
            <Text style={styles.badgeText}>BLACKLISTED</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Excluded via PERSIST_BLACKLIST in rootReducer. Resets to 0 upon app restart.
        </Text>

        <View style={styles.counterDisplay}>
          <Text style={styles.counterValue}>{counter.value}</Text>
          <Text style={styles.counterMeta}>
            Last action: {counter.lastAction ?? 'none'}
            {counter.updatedAt ? ` (${counter.updatedAt})` : ''}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.smallButton, styles.buttonSecondary]}
            activeOpacity={0.8}
            onPress={() => dispatch(decrement())}
          >
            <Text style={styles.smallButtonText}>- 1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, styles.buttonSecondary]}
            activeOpacity={0.8}
            onPress={() => dispatch(increment())}
          >
            <Text style={styles.smallButtonText}>+ 1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, styles.buttonSecondary]}
            activeOpacity={0.8}
            onPress={() => dispatch(incrementByAmount(5))}
          >
            <Text style={styles.smallButtonText}>+ 5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallButton, styles.buttonDanger]}
            activeOpacity={0.8}
            onPress={() => dispatch(reset())}
          >
            <Text style={styles.smallButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Card */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.navButton}
          activeOpacity={0.8}
          onPress={handleNavigateToDetails}
        >
          <Text style={styles.navButtonText}>Go to Details Screen →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgePersisted: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgeBlacklisted: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  stateBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  stateLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  stateValue: {
    fontSize: 13,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  statusLoggedIn: {
    color: '#10b981',
  },
  statusGuest: {
    color: '#f59e0b',
  },
  stateValueSnippet: {
    fontSize: 12,
    color: '#38bdf8',
    fontFamily: 'monospace',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
  },
  buttonSecondary: {
    backgroundColor: '#334155',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  counterDisplay: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  counterValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#38bdf8',
  },
  counterMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  navButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
