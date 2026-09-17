import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Parameter list for the root stack navigator.
 * Define all screen names along with the types of their route params here.
 */
export type RootStackParamList = {
  BillList: undefined;
  CreateBill: { billId?: string } | undefined;
  SplitResult: { billId: string };
  BillDetail: { billId: string };
};

/**
 * Helper type for screen component props with full type safety for `navigation` and `route`.
 *
 * Usage example:
 * ```tsx
 * const HomeScreen = ({ navigation, route }: RootStackScreenProps<'Home'>) => { ... };
 * ```
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Augment the global ReactNavigation namespace so hooks like `useNavigation()`
 * automatically infer `RootStackParamList` without needing to pass type generics.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
