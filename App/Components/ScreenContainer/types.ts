import type React from 'react';
import type { StyleProp, ViewStyle, StatusBarStyle } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

export interface ScreenContainerProps {
  children: React.ReactNode;
  /**
   * Additional style applied to the outermost container / SafeAreaView.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * Style applied to the content wrapper or scroll content if withScrollView is true.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Background color for the screen container and default status bar background.
   * Defaults to '#0f172a' (app dark theme).
   */
  backgroundColor?: string;
  /**
   * Specific edges to apply safe area insets to (e.g. ['top', 'bottom'] or ['top']).
   * Defaults to ['top', 'right', 'bottom', 'left'].
   */
  edges?: readonly Edge[];
  /**
   * Whether to wrap the screen in react-native-safe-area-context SafeAreaView.
   * Defaults to true. If false, renders a standard View.
   */
  enableSafeArea?: boolean;
  /**
   * Status bar style: 'light-content' | 'dark-content' | 'default'.
   * Defaults to 'light-content'.
   */
  statusBarStyle?: StatusBarStyle;
  /**
   * Status bar background color for Android.
   * Defaults to backgroundColor or '#0f172a'.
   */
  statusBarColor?: string;
  /**
   * Whether to hide the status bar.
   */
  statusBarHidden?: boolean;
  /**
   * When true, wraps children in a ScrollView.
   * Defaults to false.
   */
  withScrollView?: boolean;
  /**
   * When withScrollView is true, controls scroll bouncing on iOS.
   */
  bounces?: boolean;
  /**
   * Behavior for keyboard dismissal on scroll tap.
   */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}
