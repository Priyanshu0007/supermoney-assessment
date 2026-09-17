import React, { useMemo } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import {
  useAppSelector,
  useAppDispatch,
  selectAllBills,
  selectCurrentUserId,
  calculateBillSettlement,
  resetBills,
  Bill,
} from '../store';

export const BillListScreen: React.FC<RootStackScreenProps<'BillList'>> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const bills = useAppSelector(selectAllBills);
  const currentUserId = useAppSelector(selectCurrentUserId);

  // Compute calculated metrics for each bill
  const billsWithMetrics = useMemo(() => {
    return bills.map((bill) => {
      const calculation = calculateBillSettlement(bill, currentUserId);
      return {
        bill,
        calculation,
      };
    });
  }, [bills, currentUserId]);

  const handleCreateNewBill = () => {
    navigation.navigate('CreateBill');
  };

  const handleViewBill = (billId: string) => {
    navigation.navigate('SplitResult', { billId });
  };

  const handleViewDetails = (billId: string) => {
    navigation.navigate('BillDetail', { billId });
  };

  const renderBillCard = ({
    item,
  }: {
    item: { bill: Bill; calculation: ReturnType<typeof calculateBillSettlement> };
  }) => {
    const { bill, calculation } = item;
    const peopleCount = bill.people?.length || bill.pepole?.length || bill.totalPeople || 0;
    const formattedTotal = bill.totalAmount.toLocaleString('en-IN');

    return (
      <View style={styles.billCard}>
        {/* Card Header: Title & Detail info icon */}
        <View style={styles.cardHeaderRow}>
          <TouchableOpacity
            style={styles.cardTitleContainer}
            activeOpacity={0.7}
            onPress={() => handleViewDetails(bill.id)}
          >
            <Text style={styles.billTitle}>{bill.title}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailLink}
            activeOpacity={0.6}
            onPress={() => handleViewDetails(bill.id)}
          >
            <Text style={styles.detailLinkText}>Details ℹ️</Text>
          </TouchableOpacity>
        </View>

        {/* Subtitle: X people   Rs.Y total */}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            <Text style={styles.metaHighlight}>{peopleCount} people</Text>
            {'   '}
            <Text style={styles.metaHighlight}>Rs.{formattedTotal} total</Text>
          </Text>
        </View>

        {/* Status Row: Status Tag + [View] Button */}
        <View style={styles.actionRow}>
          <View
            style={[
              styles.statusBadge,
              bill.isSettled
                ? styles.statusSettled
                : calculation.currentUserOwes
                ? styles.statusOwes
                : calculation.currentUserIsOwed
                ? styles.statusOwed
                : styles.statusEven,
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                bill.isSettled
                  ? styles.statusSettledText
                  : calculation.currentUserOwes
                  ? styles.statusOwesText
                  : calculation.currentUserIsOwed
                  ? styles.statusOwedText
                  : styles.statusEvenText,
              ]}
            >
              {calculation.statusText}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            activeOpacity={0.8}
            onPress={() => handleViewBill(bill.id)}
          >
            <Text style={styles.viewButtonText}>[View]</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.noMoreBillsText}>No more bills</Text>
      <TouchableOpacity
        style={styles.resetButton}
        activeOpacity={0.7}
        onPress={() => dispatch(resetBills())}
      >
        <Text style={styles.resetButtonText}>↻ Reset Demo Data</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.container}>
        {/* Top Header matching wireframe: Split Bills        [+ New] */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Split Bills</Text>
            <Text style={styles.headerSubtitle}>Supermoney Expense Ledger</Text>
          </View>

          <TouchableOpacity
            style={styles.newButton}
            activeOpacity={0.8}
            onPress={handleCreateNewBill}
          >
            <Text style={styles.newButtonText}>[+ New]</Text>
          </TouchableOpacity>
        </View>

        {/* List of bills */}
        <FlatList
          data={billsWithMetrics}
          keyExtractor={(item) => item.bill.id}
          renderItem={renderBillCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No bills recorded yet</Text>
              <Text style={styles.emptySubtitle}>
                Tap [+ New] to create your first split bill!
              </Text>
            </View>
          }
        />
      </View>
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  newButton: {
    backgroundColor: '#059669',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listContent: {
    paddingBottom: 32,
  },
  billCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitleContainer: {
    flex: 1,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  detailLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  detailLinkText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  metaRow: {
    marginBottom: 14,
  },
  metaText: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaHighlight: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusSettled: {
    backgroundColor: 'rgba(71, 85, 105, 0.4)',
    borderColor: '#64748b',
  },
  statusSettledText: {
    color: '#94a3b8',
  },
  statusOwes: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#f87171',
  },
  statusOwesText: {
    color: '#f87171',
  },
  statusOwed: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#34d399',
  },
  statusOwedText: {
    color: '#34d399',
  },
  statusEven: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
  },
  statusEvenText: {
    color: '#38bdf8',
  },
  viewButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  viewButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footerContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noMoreBillsText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  resetButtonText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
