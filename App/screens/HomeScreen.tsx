import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import { BottomSheet } from '../Components/BottomSheet';
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

  // BottomSheet showcase state
  const [isFormSheetVisible, setIsFormSheetVisible] = useState(false);
  const [isInfoSheetVisible, setIsInfoSheetVisible] = useState(false);

  // Form sheet state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'Feedback' | 'Bug' | 'Feature'>('Feedback');
  const [formNotes, setFormNotes] = useState('');

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

      {/* Bottom Sheet Component Showcase Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Custom Bottom Sheet</Text>
          <View style={[styles.badge, styles.badgeBottomSheet]}>
            <Text style={styles.badgeText}>ANIMATED MODAL</Text>
          </View>
        </View>

        <Text style={styles.description}>
          Built with React Native Modal, PanResponder drag-to-dismiss, spring animations, and robust keyboard avoidance.
        </Text>

        <View style={styles.sheetButtonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buttonPurple]}
            activeOpacity={0.8}
            onPress={() => setIsFormSheetVisible(true)}
          >
            <Text style={styles.actionButtonText}>📝 Test Keyboard Form Sheet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.buttonTeal]}
            activeOpacity={0.8}
            onPress={() => setIsInfoSheetVisible(true)}
          >
            <Text style={styles.actionButtonText}>✨ View Features & Details</Text>
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

      {/* 1. Form Bottom Sheet with Keyboard Handling */}
      <BottomSheet
        visible={isFormSheetVisible}
        onClose={() => setIsFormSheetVisible(false)}
        title="Submit Feedback"
        subtitle="Test fluid keyboard avoiding & gesture dismiss"
        footerComponent={
          <View style={styles.sheetFooterRow}>
            <TouchableOpacity
              style={[styles.footerButton, styles.buttonSecondary]}
              activeOpacity={0.8}
              onPress={() => setIsFormSheetVisible(false)}
            >
              <Text style={styles.footerButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerButton, styles.buttonPrimary]}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  'Submitted Successfully',
                  `Subject: ${formTitle || 'N/A'}\nCategory: ${formCategory}\nNotes: ${formNotes || 'N/A'}`
                );
                setIsFormSheetVisible(false);
              }}
            >
              <Text style={styles.footerButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={styles.formContainer}>
          <Text style={styles.formLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {(['Feedback', 'Bug', 'Feature'] as const).map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  formCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setFormCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Title / Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Smooth sheet animation feedback"
            placeholderTextColor="#64748b"
            value={formTitle}
            onChangeText={setFormTitle}
            returnKeyType="next"
          />

          <Text style={styles.formLabel}>Details / Message</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Type your feedback here. Focus this field to see the sheet lift seamlessly above the software keyboard..."
            placeholderTextColor="#64748b"
            value={formNotes}
            onChangeText={setFormNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              💡 Tip: Notice how the sheet elevates smoothly without obscuring inputs. Drag down on the top bar or tap outside to dismiss.
            </Text>
          </View>
        </View>
      </BottomSheet>

      {/* 2. Info / Details Bottom Sheet */}
      <BottomSheet
        visible={isInfoSheetVisible}
        onClose={() => setIsInfoSheetVisible(false)}
        title="Bottom Sheet Architecture"
        subtitle="Built with pure React Native primitives"
        footerComponent={
          <TouchableOpacity
            style={[styles.navButton, styles.fullWidthButton]}
            activeOpacity={0.8}
            onPress={() => setIsInfoSheetVisible(false)}
          >
            <Text style={styles.navButtonText}>Got it!</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Pure React Native Modal</Text>
              <Text style={styles.featureDesc}>
                Zero external dependencies. Works cross-platform with full status bar translucency and Android hardware back button support.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⌨️</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Smart Keyboard Handling</Text>
              <Text style={styles.featureDesc}>
                Listens to native keyboard show/hide events to dynamically adjust padding and safe area insets without leaving an awkward gap.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🖐️</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>PanResponder Drag Gesture</Text>
              <Text style={styles.featureDesc}>
                1:1 real-time finger tracking on downward drags with velocity-aware dismiss and elastic rubber-band resistance when pulling upward.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎨</Text>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Spring Physics & Dim Backdrop</Text>
              <Text style={styles.featureDesc}>
                Natural bounciness on entry and smooth cubic deceleration on dismiss with animated backdrop fade.
              </Text>
            </View>
          </View>
        </View>
      </BottomSheet>
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
  badgeBottomSheet: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  sheetButtonRow: {
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPurple: {
    backgroundColor: '#8b5cf6',
  },
  buttonTeal: {
    backgroundColor: '#0d9488',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetFooterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  formContainer: {
    paddingBottom: 8,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderColor: '#3b82f6',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f8fafc',
    marginBottom: 16,
  },
  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },
  hintBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 4,
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
  featureList: {
    gap: 16,
    paddingBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  featureIcon: {
    fontSize: 22,
    marginTop: 1,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  fullWidthButton: {
    width: '100%',
  },
});

