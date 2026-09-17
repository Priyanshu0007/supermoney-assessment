import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ScreenContainerProps } from './types';

const DEFAULT_EDGES = ['top', 'right', 'bottom', 'left'] as const;
const DEFAULT_BG = '#0f172a';

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  contentContainerStyle,
  backgroundColor = DEFAULT_BG,
  edges = DEFAULT_EDGES,
  enableSafeArea = true,
  statusBarStyle = 'light-content',
  statusBarColor,
  statusBarHidden = false,
  withScrollView = false,
  bounces = true,
  keyboardShouldPersistTaps = 'handled',
}) => {
  const containerBgStyle = { backgroundColor };

  const content = withScrollView ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      bounces={bounces}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.innerContent, contentContainerStyle]}>
      {children}
    </View>
  );

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor || backgroundColor}
        hidden={statusBarHidden}
        translucent={false}
      />
      {enableSafeArea ? (
        <SafeAreaView
          edges={edges}
          style={[styles.container, containerBgStyle, style]}
        >
          {content}
        </SafeAreaView>
      ) : (
        <View style={[styles.container, containerBgStyle, style]}>
          {content}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
