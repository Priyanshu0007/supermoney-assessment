import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface BottomSheetProps {
  /**
   * Controls whether the bottom sheet modal is open.
   */
  visible: boolean;

  /**
   * Callback fired when the bottom sheet has finished closing.
   */
  onClose: () => void;

  /**
   * Title displayed in the sheet header.
   */
  title?: string;

  /**
   * Subtitle displayed below the title in the sheet header.
   */
  subtitle?: string;

  /**
   * Whether to show the default close ('✕') button in the header.
   * Defaults to `true`.
   */
  showCloseButton?: boolean;

  /**
   * Whether tapping the backdrop overlay closes the sheet.
   * If a keyboard is open, the first tap dismisses the keyboard.
   * Defaults to `true`.
   */
  closeOnBackdropPress?: boolean;

  /**
   * Whether dragging down on the handle or header dismisses the sheet.
   * Defaults to `true`.
   */
  enablePanDownToClose?: boolean;

  /**
   * Target opacity for the dark backdrop overlay (between 0 and 1).
   * Defaults to `0.65`.
   */
  backdropOpacity?: number;

  /**
   * Maximum height of the sheet container (e.g. '85%', '90%', or a number in pixels).
   * Defaults to `'85%'`.
   */
  maxHeight?: number | `${number}%`;

  /**
   * Fixed height for the sheet container. If not provided, height is dynamically determined by content.
   */
  height?: number | `${number}%`;

  /**
   * Whether the content area should be wrapped in a ScrollView.
   * Defaults to `true`. Set to `false` if you provide your own FlatList / ScrollView.
   */
  scrollable?: boolean;

  /**
   * Optional custom header component replacing the default header.
   */
  headerComponent?: ReactNode;

  /**
   * Optional sticky footer component placed above the bottom safe area.
   */
  footerComponent?: ReactNode;

  /**
   * Custom style for the sheet's outer animated card container.
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom style for the scrollable/inner content wrapper.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom style for the header container.
   */
  headerStyle?: StyleProp<ViewStyle>;

  /**
   * Custom style for the backdrop overlay.
   */
  backdropStyle?: StyleProp<ViewStyle>;

  /**
   * Content to render inside the bottom sheet.
   */
  children?: ReactNode;
}
