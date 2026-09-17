import type React from 'react';
import type {
  KeyboardAvoidingViewProps,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface KeyboardAvoidingScrollViewProps extends ScrollViewProps {
  children?: React.ReactNode;
  /**
   * Additional style applied to the outer KeyboardAvoidingView.
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Style applied to the inner ScrollView.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style applied to the scrollable content inside ScrollView.
   * `flexGrow: 1` is applied by default to ensure scrollability when keyboard expands.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Behavior for KeyboardAvoidingView.
   * Defaults to 'padding' on iOS and undefined on Android.
   */
  behavior?: 'padding' | 'height' | 'position';
  /**
   * Distance between the top of the user screen and the React Native view.
   * Defaults to 0.
   */
  keyboardVerticalOffset?: number;
  /**
   * Extra props forwarded directly to the wrapping KeyboardAvoidingView.
   */
  keyboardAvoidingViewProps?: Partial<KeyboardAvoidingViewProps>;
  /**
   * Determines when the keyboard should be dismissed in response to a drag.
   * Defaults to 'on-drag'.
   */
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  /**
   * Determines when the keyboard should stay visible when tapping outside.
   * Defaults to 'handled'.
   */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  /**
   * Controls whether iOS automatically adjusts the scroll view content insets
   * when the software keyboard opens and closes.
   * Defaults to true on iOS.
   */
  automaticallyAdjustKeyboardInsets?: boolean;
}
