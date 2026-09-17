import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomSheetProps } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  showCloseButton = true,
  closeOnBackdropPress = true,
  enablePanDownToClose = true,
  backdropOpacity = 0.65,
  maxHeight = '85%',
  height,
  scrollable = true,
  headerComponent,
  footerComponent,
  containerStyle,
  contentContainerStyle,
  headerStyle,
  backdropStyle,
  children,
}) => {
  const insets = useSafeAreaInsets();

  // Internal modal visibility to allow exit animation to finish before unmounting Modal
  const [isModalVisible, setIsModalVisible] = useState(visible);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [sheetHeight, setSheetHeight] = useState<number>(SCREEN_HEIGHT * 0.5);

  // Animated values
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Track if exit animation is in progress to prevent duplicate triggers
  const isClosingRef = useRef(false);

  // Keyboard listeners for dynamic avoiding and safe-area adjustments
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Dismiss animation
  const handleDismiss = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;

    Keyboard.dismiss();

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: sheetHeight || SCREEN_HEIGHT,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsModalVisible(false);
        isClosingRef.current = false;
        onClose();
      }
    });
  }, [backdropAnim, translateY, sheetHeight, onClose]);

  // Handle open / close transitions when visible prop changes
  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      setIsModalVisible(true);
      translateY.setValue(sheetHeight || SCREEN_HEIGHT);

      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          stiffness: 280,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isModalVisible && !isClosingRef.current) {
      handleDismiss();
    }
  }, [visible, sheetHeight, backdropAnim, translateY, isModalVisible, handleDismiss]);

  // PanResponder for drag-to-dismiss gesture on handle & header
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enablePanDownToClose,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enablePanDownToClose) return false;
        // Activate if dragged down by more than 4px and vertical motion dominates
        return (
          gestureState.dy > 4 ||
          (gestureState.dy < -2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx))
        );
      },
      onPanResponderGrant: () => {
        // Dismiss keyboard immediately when drag interaction begins
        Keyboard.dismiss();
      },
      onPanResponderMove: (_, gestureState) => {
        if (!enablePanDownToClose) return;
        if (gestureState.dy > 0) {
          // Normal 1:1 drag downwards
          translateY.setValue(gestureState.dy);
        } else {
          // Elastic rubber-band resistance when pulling upward
          translateY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!enablePanDownToClose) return;

        // Dismiss if dragged down past 110px or with strong downward flick
        const shouldDismiss =
          gestureState.dy > 110 || (gestureState.dy > 35 && gestureState.vy > 0.55);

        if (shouldDismiss) {
          handleDismiss();
        } else {
          // Fluid bounce back to original position
          Animated.spring(translateY, {
            toValue: 0,
            damping: 24,
            stiffness: 280,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Backdrop press: dismiss keyboard first if active, otherwise dismiss sheet
  const handleBackdropPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    if (closeOnBackdropPress) {
      handleDismiss();
    }
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    if (measuredHeight > 0 && Math.abs(measuredHeight - sheetHeight) > 10) {
      setSheetHeight(measuredHeight);
    }
  };

  if (!isModalVisible) {
    return null;
  }

  // Calculate bottom padding: collapse safe area inset when keyboard is open to avoid gap
  const bottomPadding = isKeyboardVisible ? 0 : Math.max(insets.bottom, 16);

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      {/* KeyboardAvoidingView ensures the bottom sheet smoothly moves up with keyboard on iOS */}
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Animated Dim Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            backdropStyle,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, backdropOpacity],
              }),
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={handleBackdropPress}
            accessibilityRole="button"
            accessibilityLabel="Close bottom sheet"
          />
        </Animated.View>

        {/* Animated Sheet Container */}
        <Animated.View
          onLayout={handleLayout}
          style={[
            styles.sheetContainer,
            { maxHeight },
            height ? { height } : null,
            containerStyle,
            {
              paddingBottom: bottomPadding,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Top Drag Handle & Gesture Area */}
          <View
            {...(enablePanDownToClose ? panResponder.panHandlers : {})}
            style={styles.gestureHeader}
          >
            <View style={styles.dragHandle} />

            {/* Custom Header Component OR Default Header */}
            {headerComponent !== undefined ? (
              headerComponent
            ) : title || subtitle || showCloseButton ? (
              <View style={[styles.defaultHeader, headerStyle]}>
                <View style={styles.titleContainer}>
                  {title ? <Text style={styles.titleText}>{title}</Text> : null}
                  {subtitle ? (
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                  ) : null}
                </View>

                {showCloseButton ? (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleDismiss}
                    activeOpacity={0.7}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>

          {/* Sheet Body Content */}
          {scrollable ? (
            <ScrollView
              style={styles.scrollBody}
              contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.staticBody, contentContainerStyle]}>
              {children}
            </View>
          )}

          {/* Optional Sticky Footer */}
          {footerComponent ? (
            <View style={styles.footerContainer}>{footerComponent}</View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
    overflow: 'hidden',
  },
  gestureHeader: {
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#1e293b',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#475569',
    alignSelf: 'center',
    marginBottom: 10,
  },
  defaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#334155',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '700',
    lineHeight: 16,
  },
  scrollBody: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  staticBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#334155',
    backgroundColor: '#1e293b',
  },
});
