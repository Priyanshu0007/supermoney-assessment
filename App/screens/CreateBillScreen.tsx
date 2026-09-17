import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';
import { KeyboardAvoidingScrollView, ScreenContainer } from '../Components';
import {
  useAppDispatch,
  useAppSelector,
  addBill,
  updateBill,
  selectBillById,
  CURRENT_USER,
  Participant,
  SplitItem,
  SplitType,
} from '../store';

interface FormItem {
  id: string;
  name: string;
  price: string;
  paidBy: string;
  splitType: SplitType;
  customShares: Record<string, string>;
}

export const CreateBillScreen: React.FC<RootStackScreenProps<'CreateBill'>> = ({
  navigation,
  route,
}) => {
  const dispatch = useAppDispatch();
  const editingBillId = route.params?.billId;
  const existingBill = useAppSelector(
    editingBillId ? selectBillById(editingBillId) : () => undefined
  );

  const [billName, setBillName] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([CURRENT_USER]);
  const [newPersonName, setNewPersonName] = useState('');
  const [isAddingPerson, setIsAddingPerson] = useState(false);

  const [items, setItems] = useState<FormItem[]>([
    {
      id: `item_${Date.now()}_1`,
      name: '',
      price: '',
      paidBy: CURRENT_USER.id,
      splitType: 'equal',
      customShares: {},
    },
  ]);

  // Load existing bill for editing if provided
  useEffect(() => {
    if (existingBill) {
      setBillName(existingBill.title);
      const people = existingBill.people?.length
        ? existingBill.people
        : existingBill.pepole || [CURRENT_USER];
      setParticipants(people);

      if (existingBill.items?.length) {
        setItems(
          existingBill.items.map((it) => ({
            id: it.id,
            name: it.itemName,
            price: it.itemPrice.toString(),
            paidBy: it.paidBy,
            splitType: it.splitType,
            customShares: it.customShares
              ? Object.fromEntries(
                  Object.entries(it.customShares).map(([k, v]) => [k, v.toString()])
                )
              : {},
          }))
        );
      }
    }
  }, [existingBill]);

  // Add a participant
  const handleAddParticipant = () => {
    const trimmed = newPersonName.trim();
    if (!trimmed) return;

    if (
      participants.some(
        (p) => p.displayName.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      Alert.alert('Duplicate', 'This participant is already in the list.');
      return;
    }

    const newParticipant: Participant = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userName: trimmed.toLowerCase().replace(/\s+/g, '_'),
      displayName: trimmed,
    };

    setParticipants((prev) => [...prev, newParticipant]);
    setNewPersonName('');
    setIsAddingPerson(false);
  };

  // Remove a participant (cannot remove CURRENT_USER)
  const handleRemoveParticipant = (id: string) => {
    if (id === CURRENT_USER.id) {
      Alert.alert('Cannot Remove', 'You cannot remove yourself from the bill.');
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));

    // Also update any item paidBy or customShares
    setItems((prev) =>
      prev.map((item) => {
        const nextCustomShares = { ...item.customShares };
        delete nextCustomShares[id];
        return {
          ...item,
          paidBy: item.paidBy === id ? CURRENT_USER.id : item.paidBy,
          customShares: nextCustomShares,
        };
      })
    );
  };

  // Add a new line item
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: '',
        price: '',
        paidBy: CURRENT_USER.id,
        splitType: 'equal',
        customShares: {},
      },
    ]);
  };

  // Remove a line item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      Alert.alert('Notice', 'A bill must have at least one item.');
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Update an item property
  const handleUpdateItem = <K extends keyof FormItem>(
    id: string,
    key: K,
    val: FormItem[K]
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: val } : item))
    );
  };

  // Update custom share for an item
  const handleUpdateShare = (
    itemId: string,
    participantId: string,
    shareAmount: string
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            customShares: {
              ...item.customShares,
              [participantId]: shareAmount,
            },
          };
        }
        return item;
      })
    );
  };

  // Save bill and calculate split
  const handleCalculateSplit = () => {
    const trimmedTitle = billName.trim();
    if (!trimmedTitle) {
      Alert.alert('Required', 'Please enter a Bill Name.');
      return;
    }

    if (participants.length < 1) {
      Alert.alert('Required', 'Please add at least one participant.');
      return;
    }

    // Validate all items
    const validatedItems: SplitItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const itemName = it.name.trim() || `Item ${i + 1}`;
      const price = parseFloat(it.price);

      if (isNaN(price) || price <= 0) {
        Alert.alert(
          'Invalid Price',
          `Please provide a valid price for "${itemName}".`
        );
        return;
      }

      const numericCustomShares: Record<string, number> = {};
      if (it.splitType === 'custom') {
        let sharesSum = 0;
        participants.forEach((p) => {
          const amt = parseFloat(it.customShares[p.id] || '0') || 0;
          numericCustomShares[p.id] = amt;
          sharesSum += amt;
        });

        if (Math.abs(sharesSum - price) > 0.01) {
          Alert.alert(
            'Share Mismatch',
            `For "${itemName}", shares must total Rs.${price}. (Current total: Rs.${sharesSum})`
          );
          return;
        }
      }

      validatedItems.push({
        id: it.id,
        itemName,
        itemPrice: price,
        paidBy: it.paidBy,
        splitType: it.splitType,
        customShares: it.splitType === 'custom' ? numericCustomShares : undefined,
      });
    }

    const totalAmount = validatedItems.reduce(
      (sum, item) => sum + item.itemPrice,
      0
    );

    const billId = editingBillId || `bill_${Date.now()}`;

    if (editingBillId && existingBill) {
      dispatch(
        updateBill({
          ...existingBill,
          title: trimmedTitle,
          people: participants,
          pepole: participants,
          totalPeople: participants.length,
          totalAmount,
          items: validatedItems,
        })
      );
    } else {
      dispatch(
        addBill({
          id: billId,
          title: trimmedTitle,
          people: participants,
          pepole: participants,
          totalPeople: participants.length,
          totalAmount,
          items: validatedItems,
          isSettled: false,
        })
      );
    }

    navigation.replace('SplitResult', { billId });
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header matching wireframe: <- New Bill */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editingBillId ? 'Edit Bill' : 'New Bill'}
            </Text>
          </View>

          {/* Section: Bill Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Bill Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Goa Trip"
                placeholderTextColor="#64748b"
                value={billName}
                onChangeText={setBillName}
              />
            </View>
          </View>

          {/* Section: Participants */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Participants</Text>
              <TouchableOpacity
                style={styles.inlineActionBtn}
                activeOpacity={0.7}
                onPress={() => setIsAddingPerson(true)}
              >
                <Text style={styles.inlineActionText}>+ Add Person</Text>
              </TouchableOpacity>
            </View>

            {/* Inline Add Person Input */}
            {isAddingPerson && (
              <View style={styles.addPersonInputRow}>
                <TextInput
                  style={styles.addPersonInput}
                  placeholder="Enter name (e.g. Sneha)"
                  placeholderTextColor="#64748b"
                  value={newPersonName}
                  onChangeText={setNewPersonName}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.addPersonConfirmBtn}
                  onPress={handleAddParticipant}
                >
                  <Text style={styles.addPersonConfirmText}>Add</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addPersonCancelBtn}
                  onPress={() => {
                    setIsAddingPerson(false);
                    setNewPersonName('');
                  }}
                >
                  <Text style={styles.addPersonCancelText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Participants tags */}
            <View style={styles.participantsWrap}>
              {participants.map((person) => {
                const isYou = person.id === CURRENT_USER.id;
                return (
                  <View
                    key={person.id}
                    style={[
                      styles.participantChip,
                      isYou && styles.participantChipYou,
                    ]}
                  >
                    <Text style={styles.participantChipText}>
                      {person.displayName}
                    </Text>
                    {isYou ? (
                      <Text style={styles.cannotRemoveText}>
                        {' '}(cannot remove)
                      </Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.removeChipBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => handleRemoveParticipant(person.id)}
                      >
                        <Text style={styles.removeChipText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Section: Items */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Items</Text>
              <TouchableOpacity
                style={styles.inlineActionBtn}
                activeOpacity={0.7}
                onPress={handleAddItem}
              >
                <Text style={styles.inlineActionText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {items.map((item, idx) => {
              const priceNum = parseFloat(item.price) || 0;
              let sharesSum = 0;
              if (item.splitType === 'custom') {
                participants.forEach((p) => {
                  sharesSum += parseFloat(item.customShares[p.id] || '0') || 0;
                });
              }
              const hasMismatch =
                item.splitType === 'custom' &&
                priceNum > 0 &&
                Math.abs(sharesSum - priceNum) > 0.01;

              return (
                <View key={item.id} style={styles.itemCard}>
                  {/* Item title and price input */}
                  <View style={styles.itemTopRow}>
                    <TextInput
                      style={styles.itemNameInput}
                      placeholder={`e.g. Pizza / Item ${idx + 1}`}
                      placeholderTextColor="#64748b"
                      value={item.name}
                      onChangeText={(txt) =>
                        handleUpdateItem(item.id, 'name', txt)
                      }
                    />

                    <View style={styles.priceContainer}>
                      <Text style={styles.rsPrefix}>Rs.</Text>
                      <TextInput
                        style={styles.itemPriceInput}
                        placeholder="0"
                        placeholderTextColor="#64748b"
                        keyboardType="numeric"
                        value={item.price}
                        onChangeText={(txt) =>
                          handleUpdateItem(item.id, 'price', txt)
                        }
                      />
                    </View>

                    {items.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeItemBtn}
                        onPress={() => handleRemoveItem(item.id)}
                      >
                        <Text style={styles.removeItemText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Paid By Selector */}
                  <View style={styles.selectorRow}>
                    <Text style={styles.selectorLabel}>Paid by:</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.pillsScroll}
                    >
                      {participants.map((p) => {
                        const isSelected = item.paidBy === p.id;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            style={[
                              styles.pill,
                              isSelected && styles.pillSelected,
                            ]}
                            onPress={() =>
                              handleUpdateItem(item.id, 'paidBy', p.id)
                            }
                          >
                            <Text
                              style={[
                                styles.pillText,
                                isSelected && styles.pillTextSelected,
                              ]}
                            >
                              {p.displayName} {isSelected ? '✓' : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Split Selector: Equally vs Custom */}
                  <View style={styles.selectorRow}>
                    <Text style={styles.selectorLabel}>Split:</Text>
                    <View style={styles.splitToggleRow}>
                      <TouchableOpacity
                        style={[
                          styles.splitTypeBtn,
                          item.splitType === 'equal' &&
                            styles.splitTypeBtnSelected,
                        ]}
                        onPress={() =>
                          handleUpdateItem(item.id, 'splitType', 'equal')
                        }
                      >
                        <Text
                          style={[
                            styles.splitTypeText,
                            item.splitType === 'equal' &&
                              styles.splitTypeTextSelected,
                          ]}
                        >
                          Equally
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.splitTypeBtn,
                          item.splitType === 'custom' &&
                            styles.splitTypeBtnSelected,
                        ]}
                        onPress={() =>
                          handleUpdateItem(item.id, 'splitType', 'custom')
                        }
                      >
                        <Text
                          style={[
                            styles.splitTypeText,
                            item.splitType === 'custom' &&
                              styles.splitTypeTextSelected,
                          ]}
                        >
                          Custom
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* If Custom Split: Show share inputs for each person */}
                  {item.splitType === 'custom' && (
                    <View style={styles.customSharesContainer}>
                      <Text style={styles.customSharePrompt}>
                        Enter custom share for each person:
                      </Text>
                      <View style={styles.customSharesGrid}>
                        {participants.map((p) => (
                          <View key={p.id} style={styles.customShareItem}>
                            <Text style={styles.customSharePersonName}>
                              {p.displayName}:
                            </Text>
                            <View style={styles.customShareInputBox}>
                              <TextInput
                                style={styles.customShareInput}
                                placeholder="0"
                                placeholderTextColor="#64748b"
                                keyboardType="numeric"
                                value={item.customShares[p.id] || ''}
                                onChangeText={(val) =>
                                  handleUpdateShare(item.id, p.id, val)
                                }
                              />
                            </View>
                          </View>
                        ))}
                      </View>

                      {hasMismatch && (
                        <Text style={styles.warningText}>
                          ! Shares must total Rs.{priceNum} (Current: Rs.
                          {sharesSum})
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Bottom Action: Calculate Split */}
          <View style={styles.calculateBtnContainer}>
            <TouchableOpacity
              style={styles.calculateBtn}
              activeOpacity={0.8}
              onPress={handleCalculateSplit}
            >
              <Text style={styles.calculateBtnText}>Calculate Split</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 20,
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
  },
  section: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  inlineActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inlineActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  inputContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#f8fafc',
    padding: 0,
  },
  addPersonInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  addPersonInput: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#38bdf8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 14,
  },
  addPersonConfirmBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addPersonConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  addPersonCancelBtn: {
    backgroundColor: '#334155',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addPersonCancelText: {
    color: '#94a3b8',
    fontWeight: '700',
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
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  participantChipYou: {
    borderColor: '#0284c7',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  participantChipText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  cannotRemoveText: {
    color: '#64748b',
    fontSize: 12,
    fontStyle: 'italic',
  },
  removeChipBtn: {
    marginLeft: 8,
    padding: 2,
  },
  removeChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    marginBottom: 14,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  itemNameInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8fafc',
    fontSize: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: 110,
  },
  rsPrefix: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  itemPriceInput: {
    flex: 1,
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 6,
  },
  removeItemBtn: {
    padding: 6,
  },
  removeItemText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectorLabel: {
    width: 68,
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  pill: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 6,
  },
  pillSelected: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  pillText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  pillTextSelected: {
    color: '#10b981',
  },
  splitToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  splitTypeBtn: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  splitTypeBtnSelected: {
    borderColor: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  splitTypeText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  splitTypeTextSelected: {
    color: '#38bdf8',
  },
  customSharesContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  customSharePrompt: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  customSharesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  customShareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customSharePersonName: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
  },
  customShareInputBox: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  customShareInput: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
  },
  warningText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  calculateBtnContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  calculateBtn: {
    backgroundColor: '#059669',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
