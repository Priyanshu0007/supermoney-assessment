import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { ScreenContainer } from '../App/Components/ScreenContainer';

describe('ScreenContainer Component', () => {
  it('renders children correctly with default props', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ScreenContainer>
          <Text testID="child-text">Hello Screen</Text>
        </ScreenContainer>
      );
    });

    expect(tree.root.findByProps({ testID: 'child-text' })).toBeDefined();
    expect(tree.root.findByProps({ testID: 'child-text' }).props.children).toBe('Hello Screen');
  });

  it('renders with withScrollView enabled', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ScreenContainer withScrollView>
          <Text testID="scroll-child">Scrollable Content</Text>
        </ScreenContainer>
      );
    });

    expect(tree.root.findByProps({ testID: 'scroll-child' })).toBeDefined();
  });

  it('renders with enableSafeArea set to false', () => {
    let tree: any;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ScreenContainer enableSafeArea={false}>
          <Text testID="no-safe-area-child">No Safe Area</Text>
        </ScreenContainer>
      );
    });

    expect(tree.root.findByProps({ testID: 'no-safe-area-child' })).toBeDefined();
  });
});
