import React from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
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
  deleteBill,
  toggleBillSettled,
} from '../store';

export const BillDetailScreen: React.FC<RootStackScreenProps<'BillDetail'>> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const { billId } = route.params;
  const bill = useAppSelector(selectBillById(billId));

  if (!bill) {
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

  const people = bill.people?.length ? bill.people : bill.pepole || [];
  const participantMap = new Map(people.map((p) => [p.id, p.displayName]));

  const handleDelete = () => {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${bill.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteBill(bill.id));
            navigation.navigate('BillList');
          },
        },
      ]
    );
  };

  const handleToggleSettled = () => {
    dispatch(toggleBillSettled({ billId: bill.id }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header: <- Bill Details */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {bill.title} Details
          </Text>
        </View>

        {/* Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewTopRow}>
            <View>
              <Text style={styles.overviewLabel}>Total Amount</Text>
              <Text style={styles.overviewAmount}>
                Rs.{bill.totalAmount.toLocaleString('en-IN')}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.statusBadge,
                bill.isSettled ? styles.statusSettled : styles.statusActive,
              ]}
              onPress={handleToggleSettled}
            >
              <Text
                style={[
                  styles.statusText,
                  bill.isSettled
                    ? styles.statusSettledText
                    : styles.statusActiveText,
                ]}
              >
                {bill.isSettled ? '✓ SETTLED' : '● ACTIVE'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.overviewMetaRow}>
            <Text style={styles.metaItem}>
              👥 {people.length} Participants
            </Text>
            <Text style={styles.metaItem}>
              🛒 {bill.items.length} Items
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[styles.quickBtn, styles.splitResultBtn]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('SplitResult', { billId: bill.id })
            }
          >
            <Text style={styles.quickBtnText}>⚖️ View Split Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickBtn, styles.editBtn]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('CreateBill', { billId: bill.id })
            }
          >
            <Text style={styles.quickBtnText}>✏️ Edit Bill</Text>
          </TouchableOpacity>
        </View>

        {/* Participants Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantsWrap}>
            {people.map((person) => (
              <View key={person.id} style={styles.participantChip}>
                <Text style={styles.participantName}>{person.displayName}</Text>
                {person.id === 'user_you' && (
                  <Text style={styles.youBadge}>(You)</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Itemized Expenses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itemized Expenses</Text>
          <View style={styles.itemsList}>
            {bill.items.map((item, index) => {
              const payerName =
                participantMap.get(item.paidBy) || item.paidBy || 'Unknown';

              return (
                <View key={item.id || index} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text style={styles.itemPrice}>
                      Rs.{item.itemPrice.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.itemSubRow}>
                    <Text style={styles.itemSubText}>
                      Paid by:{' '}
                      <Text style={styles.itemPayerHighlight}>{payerName}</Text>
                    </Text>
                    <Text style={styles.itemSubText}>
                      Split:{' '}
                      <Text style={styles.itemSplitHighlight}>
                        {item.splitType === 'equal' ? 'Equally' : 'Custom'}
                      </Text>
                    </Text>
                  </View>

                  {/* If custom split shares exist, render mini breakdown */}
                  {item.splitType === 'custom' && item.customShares && (
                    <View style={styles.customSharesBox}>
                      <Text style={styles.customSharesTitle}>
                        Custom Share Allocation:
                      </Text>
                      {Object.entries(item.customShares).map(
                        ([pId, amount]) => (
                          <View key={pId} style={styles.shareLine}>
                            <Text style={styles.shareLineName}>
                              {participantMap.get(pId) || pId}:
                            </Text>
                            <Text style={styles.shareLineAmt}>
                              Rs.{Number(amount).toLocaleString('en-IN')}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Delete Bill Option */}
        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.7}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete Bill</Text>
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
  overviewCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 18,
    marginBottom: 16,
  },
  overviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  overviewAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusSettled: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  statusActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38bdf8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusSettledText: {
    color: '#34d399',
  },
  statusActiveText: {
    color: '#38bdf8',
  },
  overviewMetaRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  metaItem: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  splitResultBtn: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  editBtn: {
    backgroundColor: '#334155',
    borderColor: '#64748b',
  },
  quickBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  participantsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  participantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  participantName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  youBadge: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38bdf8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  itemSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSubText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  itemPayerHighlight: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  itemSplitHighlight: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  customSharesBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  customSharesTitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 6,
  },
  shareLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  shareLineName: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  shareLineAmt: {
    fontSize: 12,
    color: '#38bdf8',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '700',
  },
});
