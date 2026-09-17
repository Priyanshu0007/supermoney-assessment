import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import {
  useAppDispatch,
  useAppSelector,
  selectBillById,
  selectBillCalculation,
  toggleBillSettled,
} from '../store';

export const SplitResultScreen: React.FC<RootStackScreenProps<'SplitResult'>> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const { billId } = route.params;

  const bill = useAppSelector(selectBillById(billId));
  const calculation = useAppSelector(selectBillCalculation(billId));

  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);

  if (!bill || !calculation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Bill Not Found</Text>
          <TouchableOpacity
            style={styles.backButtonSimple}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonSimpleText}>← Back to Bills</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleSettled = () => {
    dispatch(toggleBillSettled({ billId: bill.id }));
  };

  const handleShareSummary = async () => {
    try {
      const transactionsText = calculation.transactions.length
        ? calculation.transactions
            .map((t) => `• ${t.fromName} owes ${t.toName}: Rs.${t.amount}`)
            .join('\n')
        : 'All balances settled!';

      const breakdownsText = calculation.breakdowns
        .map(
          (b) =>
            `• ${b.displayName}: Paid Rs.${b.paid}, Share Rs.${b.share}, Net: ${
              b.net > 0 ? `+Rs.${b.net}` : b.net < 0 ? `-Rs.${Math.abs(b.net)}` : 'Rs.0'
            }`
        )
        .join('\n');

      const message = `🧾 ${bill.title} — Split Summary\nTotal: Rs.${bill.totalAmount.toLocaleString(
        'en-IN'
      )}\nStatus: ${bill.isSettled ? 'SETTLED' : 'ACTIVE'}\n\n💸 Transactions to Settle:\n${transactionsText}\n\n📊 Per Person Breakdown:\n${breakdownsText}\n\nGenerated via Supermoney Split Bills`;

      await Share.share({
        message,
        title: `${bill.title} Results`,
      });
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Could not share summary.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header matching wireframe: <- Goa Trip Results */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('BillList')}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {bill.title} Results
          </Text>
        </View>

        {/* Total Display matching wireframe: Total: Rs.3,200 */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Total:{' '}
            <Text style={styles.totalValue}>
              Rs.{bill.totalAmount.toLocaleString('en-IN')}
            </Text>
          </Text>

          {bill.isSettled && (
            <View style={styles.settledBadge}>
              <Text style={styles.settledBadgeText}>✓ SETTLED</Text>
            </View>
          )}
        </View>

        {/* Section: Transactions to Settle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions to Settle</Text>
          <View style={styles.transactionsBox}>
            {bill.isSettled ? (
              <View style={styles.allSettledBox}>
                <Text style={styles.allSettledText}>
                  🎉 All debts for this bill have been marked as settled!
                </Text>
              </View>
            ) : calculation.transactions.length === 0 ? (
              <View style={styles.allSettledBox}>
                <Text style={styles.allSettledText}>
                  ✨ All balances are equal. No pending settlements!
                </Text>
              </View>
            ) : (
              calculation.transactions.map((tx, idx) => (
                <View
                  key={tx.id}
                  style={[
                    styles.transactionItem,
                    idx < calculation.transactions.length - 1 &&
                      styles.transactionItemBorder,
                  ]}
                >
                  <View style={styles.transactionNamesCol}>
                    <Text style={styles.fromName}>{tx.fromName}</Text>
                    <Text style={styles.arrowText}>{'-->'}</Text>
                    <Text style={styles.toName}>{tx.toName}</Text>
                  </View>
                  <Text style={styles.transactionAmount}>
                    Rs.{tx.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Section: Per Person Breakdown with [v] toggle */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.breakdownHeaderRow}
            activeOpacity={0.7}
            onPress={() => setIsBreakdownExpanded((prev) => !prev)}
          >
            <Text style={styles.sectionTitle}>Per Person Breakdown</Text>
            <Text style={styles.expandToggleText}>
              {isBreakdownExpanded ? '[ ^ ]' : '[ v ]'}
            </Text>
          </TouchableOpacity>

          {isBreakdownExpanded && (
            <View style={styles.breakdownList}>
              {calculation.breakdowns.map((person) => {
                const isOwed = person.net > 0;
                const owes = person.net < 0;
                const isEven = person.net === 0;

                return (
                  <View key={person.participantId} style={styles.personCard}>
                    <View style={styles.personHeaderRow}>
                      <Text style={styles.personName}>
                        {person.displayName}
                        {person.isCurrentUser ? ' (You)' : ''}
                      </Text>
                    </View>

                    <View style={styles.personDetailsCol}>
                      <View style={styles.statLine}>
                        <Text style={styles.statLabel}>Paid:</Text>
                        <Text style={styles.statValue}>
                          Rs.{person.paid.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <View style={styles.statLine}>
                        <Text style={styles.statLabel}>Share:</Text>
                        <Text style={styles.statValue}>
                          Rs.{person.share.toLocaleString('en-IN')}
                        </Text>
                      </View>

                      <View style={styles.statLine}>
                        <Text style={styles.statLabel}>Net:</Text>
                        <Text
                          style={[
                            styles.statValue,
                            isOwed && styles.netOwed,
                            owes && styles.netOwes,
                            isEven && styles.netEven,
                          ]}
                        >
                          {isOwed
                            ? `+Rs.${person.net.toLocaleString('en-IN')}  (owed to you)`
                            : owes
                            ? `-Rs.${Math.abs(person.net).toLocaleString('en-IN')}  (owes)`
                            : `Rs.0  (settled)`}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Action Buttons matching wireframe: [ Mark All Settled ]   [ Share ] */}
        <View style={styles.buttonActionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              bill.isSettled ? styles.settleBtnActive : styles.settleBtn,
            ]}
            activeOpacity={0.8}
            onPress={handleToggleSettled}
          >
            <Text style={styles.actionBtnText}>
              {bill.isSettled ? '[ Mark As Unsettled ]' : '[ Mark All Settled ]'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.shareBtn]}
            activeOpacity={0.8}
            onPress={handleShareSummary}
          >
            <Text style={styles.actionBtnText}>[ Share ]</Text>
          </TouchableOpacity>
        </View>

        {/* Link to view detailed itemized breakdown */}
        <TouchableOpacity
          style={styles.viewItemsLink}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
        >
          <Text style={styles.viewItemsLinkText}>
            📋 View Itemized Breakdown & Expenses →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    fontSize: 20,
    color: '#f8fafc',
    fontWeight: '700',
    marginBottom: 16,
  },
  backButtonSimple: {
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
  },
  backButtonSimpleText: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 16,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: '#38bdf8',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.3,
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 18,
    color: '#94a3b8',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  totalValue: {
    fontSize: 22,
    color: '#f8fafc',
    fontWeight: '800',
  },
  settledBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  settledBadgeText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandToggleText: {
    fontSize: 14,
    color: '#38bdf8',
    fontWeight: '700',
  },
  transactionsBox: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  allSettledBox: {
    padding: 16,
    alignItems: 'center',
  },
  allSettledText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  transactionNamesCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fromName: {
    fontSize: 15,
    color: '#f87171',
    fontWeight: '700',
  },
  arrowText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  toName: {
    fontSize: 15,
    color: '#34d399',
    fontWeight: '700',
  },
  transactionAmount: {
    fontSize: 16,
    color: '#f8fafc',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  breakdownList: {
    gap: 12,
  },
  personCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  personHeaderRow: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 6,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  personDetailsCol: {
    gap: 4,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    width: 60,
    fontSize: 13,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statValue: {
    fontSize: 14,
    color: '#cbd5e1',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  netOwed: {
    color: '#34d399',
    fontWeight: '700',
  },
  netOwes: {
    color: '#f87171',
    fontWeight: '700',
  },
  netEven: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  buttonActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  settleBtn: {
    backgroundColor: '#059669',
    borderColor: '#10b981',
  },
  settleBtnActive: {
    backgroundColor: '#334155',
    borderColor: '#64748b',
  },
  shareBtn: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  viewItemsLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewItemsLinkText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
});
