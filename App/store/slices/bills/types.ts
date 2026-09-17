export interface Participant {
  id: string;
  userName: string;
  displayName: string;
}

export type SplitType = 'equal' | 'custom';

export interface SplitItem {
  id: string;
  itemName: string;
  itemPrice: number;
  paidBy: string; // participant id
  splitType: SplitType;
  /**
   * For custom splits: map of participantId -> amount allocated to this person
   */
  customShares?: Record<string, number>;
  /**
   * Optional percentage breakdown: map of participantId -> percentage (0 - 100)
   */
  splitPercentage?: Record<string, number>;
}

export interface Bill {
  id: string;
  title: string;
  totalPeople: number;
  totalAmount: number;
  people: Participant[];
  /** Alias supporting the exact 'pepole' key from prompt schema */
  pepole?: Participant[];
  items: SplitItem[];
  isSettled: boolean;
  createdAt: string;
}

export interface DebtTransaction {
  id: string;
  fromParticipantId: string;
  fromName: string;
  toParticipantId: string;
  toName: string;
  amount: number;
}

export interface PersonBreakdown {
  participantId: string;
  displayName: string;
  isCurrentUser: boolean;
  paid: number;
  share: number;
  net: number; // positive = owed money, negative = owes money, 0 = even
}

export interface BillCalculationResult {
  totalAmount: number;
  breakdowns: PersonBreakdown[];
  transactions: DebtTransaction[];
  currentUserNet: number;
  statusText: string; // 'You owe Rs.X' | 'You are owed Rs.X' | 'Settled' | 'Even'
  currentUserOwes: boolean;
  currentUserIsOwed: boolean;
}

export interface BillsState {
  bills: Bill[];
  currentUserId: string;
}
