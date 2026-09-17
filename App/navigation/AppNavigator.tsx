import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { BillListScreen } from '../screens/BillListScreen';
import { CreateBillScreen } from '../screens/CreateBillScreen';
import { SplitResultScreen } from '../screens/SplitResultScreen';
import { BillDetailScreen } from '../screens/BillDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="BillList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1e293b',
          },
          headerTintColor: '#f8fafc',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'simple_push',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Overview' }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Item Details' }}
        />
        <Stack.Screen
          name="BillList"
          component={BillListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateBill"
          component={CreateBillScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SplitResult"
          component={SplitResultScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BillDetail"
          component={BillDetailScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
