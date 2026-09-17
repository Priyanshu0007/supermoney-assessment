import {
  store,
  selectAllBills,
  selectBillById,
  selectBillCalculation,
  addBill,
  updateBill,
  toggleBillSettled,
  deleteBill,
  resetBills,
  calculateBillSettlement,
  CURRENT_USER,
  Bill,
} from '../App/store';

describe('Bills Slice & Settlement Calculation Logic', () => {
  beforeEach(() => {
    store.dispatch(resetBills());
  });

  it('should initialize with mock bills matching the wireframes', () => {
    const bills = selectAllBills(store.getState());
    expect(bills.length).toBeGreaterThanOrEqual(3);

    const goaTrip = bills.find((b) => b.title === 'Goa Trip');
    expect(goaTrip).toBeDefined();
    expect(goaTrip?.totalPeople).toBe(4);
    expect(goaTrip?.totalAmount).toBe(3200);

    const movieNight = bills.find((b) => b.title === 'Movie Night');
    expect(movieNight).toBeDefined();
    expect(movieNight?.totalPeople).toBe(3);
    expect(movieNight?.totalAmount).toBe(900);

    const flatRent = bills.find((b) => b.title === 'Flat Rent - Aug');
    expect(flatRent).toBeDefined();
    expect(flatRent?.isSettled).toBe(true);
  });

  it('should calculate accurate settlement transactions and per-person breakdown for Goa Trip', () => {
    const calc = selectBillCalculation('bill_goa_trip')(store.getState());
    expect(calc).not.toBeNull();
    if (!calc) return;

    expect(calc.totalAmount).toBe(3200);

    // Verify per person breakdown for You (CURRENT_USER)
    const you = calc.breakdowns.find((b) => b.isCurrentUser);
    expect(you).toBeDefined();
    expect(you?.displayName).toBe('You');
    expect(you?.paid).toBe(1200);
    expect(you?.share).toBe(750);
    expect(you?.net).toBe(450);

    // Verify per person breakdown for Rahul
    const rahul = calc.breakdowns.find((b) => b.displayName === 'Rahul');
    expect(rahul).toBeDefined();
    expect(rahul?.paid).toBe(800);
    expect(rahul?.share).toBe(1050);
    expect(rahul?.net).toBe(-250);

    // Verify transactions to settle
    expect(calc.transactions.length).toBeGreaterThan(0);
    const rahulToYou = calc.transactions.find(
      (t) => t.fromName === 'Rahul' && t.toName === 'You'
    );
    expect(rahulToYou).toBeDefined();
    expect(rahulToYou?.amount).toBe(250);
  });

  it('should calculate accurate equal splits for a bill', () => {
    const mockBill: Bill = {
      id: 'test_equal_split',
      title: 'Dinner Party',
      totalPeople: 2,
      totalAmount: 1000,
      people: [
        CURRENT_USER,
        { id: 'user_friend', userName: 'friend', displayName: 'Friend' },
      ],
      items: [
        {
          id: 'item_dinner',
          itemName: 'Dinner',
          itemPrice: 1000,
          paidBy: 'user_you',
          splitType: 'equal',
        },
      ],
      isSettled: false,
      createdAt: new Date().toISOString(),
    };

    const calc = calculateBillSettlement(mockBill, CURRENT_USER.id);
    expect(calc.currentUserNet).toBe(500); // You paid 1000, your share is 500 => you are owed 500
    expect(calc.currentUserIsOwed).toBe(true);
    expect(calc.statusText).toBe('You are owed Rs.500');
    expect(calc.transactions.length).toBe(1);
    expect(calc.transactions[0].fromName).toBe('Friend');
    expect(calc.transactions[0].toName).toBe('You');
    expect(calc.transactions[0].amount).toBe(500);
  });

  it('should support addBill, updateBill, toggleBillSettled, and deleteBill actions', () => {
    const newBillId = 'custom_test_bill_999';

    // Add Bill
    store.dispatch(
      addBill({
        id: newBillId,
        title: 'Road Trip',
        totalPeople: 2,
        totalAmount: 1500,
        people: [
          CURRENT_USER,
          { id: 'user_alex', userName: 'alex', displayName: 'Alex' },
        ],
        items: [
          {
            id: 'item_fuel',
            itemName: 'Petrol',
            itemPrice: 1500,
            paidBy: 'user_alex',
            splitType: 'equal',
          },
        ],
        isSettled: false,
      })
    );

    let bill = selectBillById(newBillId)(store.getState());
    expect(bill).toBeDefined();
    expect(bill?.title).toBe('Road Trip');

    // Toggle Settled
    store.dispatch(toggleBillSettled({ billId: newBillId }));
    bill = selectBillById(newBillId)(store.getState());
    expect(bill?.isSettled).toBe(true);

    // Update Bill
    if (bill) {
      store.dispatch(
        updateBill({
          ...bill,
          title: 'Road Trip to Mountains',
        })
      );
    }
    bill = selectBillById(newBillId)(store.getState());
    expect(bill?.title).toBe('Road Trip to Mountains');

    // Delete Bill
    store.dispatch(deleteBill(newBillId));
    bill = selectBillById(newBillId)(store.getState());
    expect(bill).toBeUndefined();
  });

  it('should correctly format statusText when current user owes money', () => {
    const mockBill: Bill = {
      id: 'test_user_owes',
      title: 'Cab Ride',
      totalPeople: 2,
      totalAmount: 400,
      people: [
        CURRENT_USER,
        { id: 'user_friend', userName: 'friend', displayName: 'Friend' },
      ],
      items: [
        {
          id: 'item_cab',
          itemName: 'Cab',
          itemPrice: 400,
          paidBy: 'user_friend',
          splitType: 'equal',
        },
      ],
      isSettled: false,
      createdAt: new Date().toISOString(),
    };

    const calc = calculateBillSettlement(mockBill, CURRENT_USER.id);
    expect(calc.currentUserNet).toBe(-200);
    expect(calc.currentUserOwes).toBe(true);
    expect(calc.statusText).toBe('You owe Rs.200');
  });

  it('should support pepole field alias from prompt specification', () => {
    const mockBillWithPepole: Bill = {
      id: 'test_pepole_alias',
      title: 'Coffee Catchup',
      totalPeople: 2,
      totalAmount: 300,
      people: [],
      pepole: [
        CURRENT_USER,
        { id: 'user_sam', userName: 'sam', displayName: 'Sam' },
      ],
      items: [
        {
          id: 'item_coffee',
          itemName: 'Cold Brews',
          itemPrice: 300,
          paidBy: 'user_you',
          splitType: 'equal',
        },
      ],
      isSettled: false,
      createdAt: new Date().toISOString(),
    };

    const calc = calculateBillSettlement(mockBillWithPepole, CURRENT_USER.id);
    expect(calc.breakdowns.length).toBe(2);
    expect(calc.currentUserNet).toBe(150);
  });
});
