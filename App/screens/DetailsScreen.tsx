import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { RootStackScreenProps } from '../navigation/types';

export const DetailsScreen: React.FC<RootStackScreenProps<'Details'>> = ({
  navigation,
  route,
}) => {
  const { id, title } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Details Screen</Text>
        <Text style={styles.subtitle}>
          Received typed route parameters:
        </Text>

        <View style={styles.paramBox}>
          <Text style={styles.paramLabel}>ID:</Text>
          <Text style={styles.paramValue}>{id}</Text>
        </View>

        <View style={styles.paramBox}>
          <Text style={styles.paramLabel}>Title:</Text>
          <Text style={styles.paramValue}>{title}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    marginBottom: 20,
  },
  paramBox: {
    backgroundColor: '#334155',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  paramLabel: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  paramValue: {
    fontSize: 16,
    color: '#38bdf8',
    fontWeight: '600',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#475569',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
