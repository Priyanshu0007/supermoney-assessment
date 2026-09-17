import React, { forwardRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { KeyboardAvoidingScrollViewProps } from './types';

export const KeyboardAvoidingScrollView = forwardRef<
  any,
  KeyboardAvoidingScrollViewProps
>(
  (
    {
      children,
      containerStyle,
      style,
      contentContainerStyle,
      behavior = Platform.OS === 'ios' ? 'padding' : undefined,
      keyboardVerticalOffset = 0,
      keyboardAvoidingViewProps,
      keyboardDismissMode = 'on-drag',
      keyboardShouldPersistTaps = 'handled',
      automaticallyAdjustKeyboardInsets = Platform.OS === 'ios',
      showsVerticalScrollIndicator = false,
      bounces = true,
      ...restScrollViewProps
    },
    ref
  ) => {
    return (
      <KeyboardAvoidingView
        style={[styles.keyboardAvoidingView, containerStyle]}
        behavior={behavior}
        keyboardVerticalOffset={keyboardVerticalOffset}
        {...keyboardAvoidingViewProps}
      >
        <ScrollView
          ref={ref}
          style={[styles.scrollView, style]}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          keyboardDismissMode={keyboardDismissMode}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          automaticallyAdjustKeyboardInsets={automaticallyAdjustKeyboardInsets}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          bounces={bounces}
          {...restScrollViewProps}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);

KeyboardAvoidingScrollView.displayName = 'KeyboardAvoidingScrollView';

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});
