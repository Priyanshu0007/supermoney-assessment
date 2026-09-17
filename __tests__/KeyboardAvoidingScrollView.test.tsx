import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KeyboardAvoidingScrollView,
  KeyboardAvoidScrollView,
} from '../App/Components/KeyboardAvoidingScrollView';

describe('KeyboardAvoidingScrollView Component', () => {
  it('renders children correctly', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <KeyboardAvoidingScrollView>
          <Text testID="child-text">Form Input Child</Text>
        </KeyboardAvoidingScrollView>
      );
    });

    expect(tree.root.findByProps({ testID: 'child-text' })).toBeDefined();
    expect(tree.root.findByProps({ testID: 'child-text' }).props.children).toBe(
      'Form Input Child'
    );
  });

  it('renders correctly using the KeyboardAvoidScrollView alias', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <KeyboardAvoidScrollView>
          <Text testID="alias-child">Alias Works</Text>
        </KeyboardAvoidScrollView>
      );
    });

    expect(tree.root.findByProps({ testID: 'alias-child' })).toBeDefined();
  });

  it('passes keyboard and scroll props to underlying views', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <KeyboardAvoidingScrollView
          keyboardVerticalOffset={25}
          behavior="padding"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <View testID="inner-view">
            <Text>Inner Content</Text>
          </View>
        </KeyboardAvoidingScrollView>
      );
    });

    const scrollView = tree.root.findByType(ScrollView);
    expect(scrollView.props.keyboardDismissMode).toBe('on-drag');
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scrollView.props.contentContainerStyle).toEqual(
      expect.arrayContaining([{ flexGrow: 1 }, { paddingBottom: 50 }])
    );
  });

  it('supports ref forwarding to inner ScrollView', () => {
    const ref = React.createRef<ScrollView>();
    ReactTestRenderer.act(() => {
      ReactTestRenderer.create(
        <KeyboardAvoidingScrollView ref={ref}>
          <Text>Ref test</Text>
        </KeyboardAvoidingScrollView>
      );
    });

    expect(ref.current).toBeDefined();
  });
});
