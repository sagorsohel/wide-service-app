import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
  const services = [
    { id: '1', title: 'AC Repair', icon: '❄️', category: 'Appliances' },
    { id: '2', title: 'Plumbing', icon: '🔧', category: 'Home Care' },
    { id: '3', title: 'Electrical', icon: '⚡', category: 'Utility' },
    { id: '4', title: 'Cleaning', icon: '✨', category: 'Home Care' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandTitle}>Wide Service</Text>
          </View>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>WS</Text>
          </View>
        </View>

        {/* Hero Card */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerBadge}>Fast & Reliable</Text>
          <Text style={styles.bannerTitle}>Professional Services at Your Doorstep</Text>
          <Text style={styles.bannerSubtitle}>
            Connected with wide-service-admin & wide-service-web.
          </Text>
          <TouchableOpacity style={styles.bannerButton} activeOpacity={0.8}>
            <Text style={styles.bannerButtonText}>Book a Service</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <Text style={styles.seeAllText}>View All</Text>
        </View>

        <View style={styles.grid}>
          {services.map((service) => (
            <TouchableOpacity key={service.id} style={styles.card} activeOpacity={0.7}>
              <Text style={styles.cardIcon}>{service.icon}</Text>
              <Text style={styles.cardTitle}>{service.title}</Text>
              <Text style={styles.cardCategory}>{service.category}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ecosystem Info Box */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Wide Service Ecosystem</Text>
          <Text style={styles.infoText}>• wide-service-app (React Native Expo)</Text>
          <Text style={styles.infoText}>• wide-service-admin (React + React Router + shadcn)</Text>
          <Text style={styles.infoText}>• wide-service-web (Next.js + shadcn)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  bannerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 22,
    marginBottom: 28,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 99, 235, 0.3)',
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 18,
  },
  bannerButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 20,
  },
});
