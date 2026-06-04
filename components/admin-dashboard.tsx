import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { useMotorcycles } from '@/hooks/use-motorcycles';

const { width } = Dimensions.get('window');

export function AdminDashboard() {
  const { motorcycles } = useMotorcycles();
  
  // Mock data for dashboard
  const stats = [
    { label: 'Total Units', value: motorcycles.length, icon: 'motorcycle', color: '#007AFF' },
    { label: 'Units Sold', value: '124', icon: 'cart-shopping', color: '#34C759' },
    { label: 'Revenue', value: 'Rp 2.4B', icon: 'money-bill-trend-up', color: '#5856D6' },
    { label: 'Pending', value: '12', icon: 'clock', color: '#FF9500' },
  ];

  const salesData = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 30 },
    { day: 'Wed', value: 65 },
    { day: 'Thu', value: 50 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 95 },
    { day: 'Sun', value: 70 },
  ];

  const maxSales = Math.max(...salesData.map(d => d.value));

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your showroom performance</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '15' }]}>
              <FontAwesome6 name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Sales Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sales Activity</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>This Week</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartBars}>
            {salesData.map((data, index) => (
              <View key={index} style={styles.barColumn}>
                <View style={styles.barBackground}>
                  <View 
                    style={[
                      styles.barFill, 
                      { height: `${(data.value / maxSales) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{data.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recent Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF3B30' }]}>
              <FontAwesome6 name="plus" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Add Bike</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#5856D6' }]}>
              <FontAwesome6 name="file-invoice" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Reports</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FF9500' }]}>
              <FontAwesome6 name="users" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Customers</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#34C759' }]}>
              <FontAwesome6 name="gear" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 50) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    width: 8,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#ff6f10',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 8,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: (width - 40) / 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
});
