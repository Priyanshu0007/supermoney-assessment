import React from 'react';
import { Text, View } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { BottomSheet } from '../App/Components/BottomSheet';

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

describe('BottomSheet Component', () => {
  it('does not render when visible is false', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <BottomSheet visible={false} onClose={jest.fn()}>
          <Text>Hidden Content</Text>
        </BottomSheet>
      );
    });

    expect(tree?.toJSON()).toBeNull();
  });

  it('renders content and header elements when visible is true', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <BottomSheet
          visible={true}
          onClose={jest.fn()}
          title="Test Title"
          subtitle="Test Subtitle"
          showCloseButton={true}
        >
          <Text>Visible Sheet Content</Text>
        </BottomSheet>
      );
    });

    const instance = tree?.root;
    expect(instance?.findByProps({ children: 'Test Title' })).toBeTruthy();
    expect(instance?.findByProps({ children: 'Test Subtitle' })).toBeTruthy();
    expect(instance?.findByProps({ children: 'Visible Sheet Content' })).toBeTruthy();
  });

  it('renders custom footer component when provided', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <BottomSheet
          visible={true}
          onClose={jest.fn()}
          footerComponent={
            <View>
              <Text>Custom Footer Button</Text>
            </View>
          }
        >
          <Text>Body</Text>
        </BottomSheet>
      );
    });

    const instance = tree?.root;
    expect(instance?.findByProps({ children: 'Custom Footer Button' })).toBeTruthy();
  });
});
