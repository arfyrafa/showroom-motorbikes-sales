import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useMotorcycles } from '@/hooks/use-motorcycles';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Motorcycle, MotorcycleListingStatus } from '@/constants/motorcycles';
import { useBanners } from '@/hooks/use-banners';

// Types for Leads
type LeadRecord = {
  booking_id: string;
  interaction_type: string;
  created_at: string;
  visit_date: string | null;
  motorcycles: {
    name: string;
    price: number;
  };
  profiles: {
    name: string;
    email: string;
    mobile: string;
  } | null;
};

type ActiveTab = 'overview' | 'manage' | 'input' | 'leads' | 'banners';

export function WebAdminDashboard() {
  const {
    motorcycles,
    isLoading: isCatalogLoading,
    createMotorcycleByAdmin,
    updateMotorcycleByAdmin,
    deleteMotorcycleByAdmin,
  } = useMotorcycles();
  
  const {
    banners,
    isLoading: isBannersLoading,
    createBanner,
    toggleBannerStatus,
    deleteBanner,
  } = useBanners(false);
  
  const { user, logout } = useAuth();
  
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  // Leads state
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLeadsLoading, setIsLeadsLoading] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  // Manage Motorcycles filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'available' | 'sold_out'>('All');
  
  // Edit Motorcycle form modal state
  const [editingMotorcycle, setEditingMotorcycle] = useState<Motorcycle | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<MotorcycleListingStatus>('available');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Input Motorcycle form state
  const [inputTitle, setInputTitle] = useState('');
  const [inputPrice, setInputPrice] = useState('');
  const [inputBrand, setInputBrand] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [inputImageUri, setInputImageUri] = useState('');
  const [inputImageType, setInputImageType] = useState<string | undefined>(undefined);
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);

  // Input Banner form state
  const [inputBannerTitle, setInputBannerTitle] = useState('');
  const [inputBannerSubtitle, setInputBannerSubtitle] = useState('');
  const [inputBannerImageUri, setInputBannerImageUri] = useState('');
  const [inputBannerImageType, setInputBannerImageType] = useState<string | undefined>(undefined);
  const [isSubmittingBanner, setIsSubmittingBanner] = useState(false);

  // Fetch leads on mount / when activeTab changes to leads
  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads();
    }
  }, [activeTab]);

  const fetchLeads = async () => {
    setIsLeadsLoading(true);
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('motorcycle_bookings')
        .select(`
          booking_id,
          interaction_type,
          created_at,
          visit_date,
          user_id,
          motorcycles ( name, price )
        `)
        .eq('interaction_type', 'interested')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const userIds = [...new Set((bookingsData || []).map((b: any) => b.user_id).filter(Boolean))];
      
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, email, mobile')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p;
          });
        }
      }

      const mappedLeads: LeadRecord[] = (bookingsData || []).map((b: any) => ({
        booking_id: b.booking_id,
        interaction_type: b.interaction_type,
        created_at: b.created_at,
        visit_date: b.visit_date,
        motorcycles: b.motorcycles,
        profiles: profilesMap[b.user_id] 
          ? { 
              name: profilesMap[b.user_id].first_name || 'No Name', 
              email: profilesMap[b.user_id].email || '-',
              mobile: profilesMap[b.user_id].mobile || '-' 
            } 
          : { name: 'Unknown', email: '-', mobile: '-' }
      }));

      setLeads(mappedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat memuat daftar leads.');
    } finally {
      setIsLeadsLoading(false);
    }
  };

  // Filtered motorcycles for Manage tab
  const filteredBikes = useMemo(() => {
    return motorcycles.filter((bike) => {
      const matchesSearch = 
        bike.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bike.description && bike.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand = 
        selectedBrand === 'All' || 
        (bike.engineCapacity && bike.engineCapacity.toLowerCase().includes(selectedBrand.toLowerCase()));

      const matchesStatus = 
        selectedStatus === 'All' || 
        bike.listingStatus === selectedStatus;

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [motorcycles, searchQuery, selectedBrand, selectedStatus]);

  // Brand list for filters
  const brandsList = useMemo(() => {
    const brands = new Set<string>();
    motorcycles.forEach(bike => {
      if (bike.engineCapacity && bike.engineCapacity !== '-') {
        // Strip capacity details to get brand name (e.g. "Yamaha NMAX" -> "Yamaha")
        const brand = bike.engineCapacity.split(' ')[0];
        if (brand) brands.add(brand);
      }
    });
    return ['All', ...Array.from(brands)];
  }, [motorcycles]);

  // Handle Edit click
  const openEditModal = (bike: Motorcycle) => {
    setEditingMotorcycle(bike);
    setEditTitle(bike.title);
    setEditPrice(bike.price.toString());
    setEditBrand(bike.engineCapacity === '-' ? '' : bike.engineCapacity);
    setEditDescription(bike.description || '');
    setEditStatus(bike.listingStatus || 'available');
  };

  const handleSaveEdit = async () => {
    if (!editingMotorcycle) return;
    if (!editTitle || !editPrice) {
      Alert.alert('Gagal', 'Judul dan harga harus diisi.');
      return;
    }

    const priceNum = Number(editPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Gagal', 'Harga tidak valid.');
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateMotorcycleByAdmin(editingMotorcycle.motorcycle_id, {
        name: editTitle,
        price: priceNum,
        brand: editBrand || undefined,
        description: editDescription || undefined,
        listing_status: editStatus,
      });
      setEditingMotorcycle(null);
      Alert.alert('Berhasil', 'Motor berhasil diperbarui.');
    } catch (err: any) {
      Alert.alert('Gagal Menyimpan', err.message || 'Gagal menyimpan perubahan.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete click
  const confirmDeleteBike = (bikeId: string, title: string) => {
    const performDelete = async () => {
      try {
        await deleteMotorcycleByAdmin(bikeId);
        if (editingMotorcycle?.motorcycle_id === bikeId) {
          setEditingMotorcycle(null);
        }
        Alert.alert('Berhasil', 'Motor berhasil dihapus.');
      } catch (err: any) {
        Alert.alert('Gagal Hapus', err.message || 'Gagal menghapus motor.');
      }
    };

    if (Platform.OS === 'web') {
      const ok = window.confirm(`Apakah Anda yakin ingin menghapus motor "${title}" dari katalog secara permanen?`);
      if (ok) performDelete();
    } else {
      Alert.alert(
        'Hapus Motor',
        `Apakah Anda yakin ingin menghapus motor "${title}" secara permanen?`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Hapus', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // Handle Image Pick for Input Form
  const handlePickInputImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Galeri Diperlukan', 'Izinkan aplikasi untuk mengakses galeri.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setInputImageUri(result.assets[0].uri);
      setInputImageType(result.assets[0].mimeType);
    }
  };

  // Handle Submit new motorbike
  const handleSubmitInput = async () => {
    if (!inputTitle || !inputPrice || !inputImageUri) {
      Alert.alert('Data belum lengkap', 'Judul, harga, dan gambar motor wajib diisi.');
      return;
    }

    const parsedPrice = Number(inputPrice.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Gagal', 'Harga tidak valid.');
      return;
    }

    setIsSubmittingInput(true);
    try {
      await createMotorcycleByAdmin({
        title: inputTitle,
        price: parsedPrice,
        brand: inputBrand || undefined,
        description: inputDescription || undefined,
        imageUri: inputImageUri,
        mimeType: inputImageType,
      });

      Alert.alert('Berhasil', 'Motor berhasil ditambahkan.');
      // Reset form
      setInputTitle('');
      setInputPrice('');
      setInputBrand('');
      setInputDescription('');
      setInputImageUri('');
      setInputImageType(undefined);
      // Switch tab to Manage
      setActiveTab('manage');
    } catch (error: any) {
      Alert.alert('Gagal Simpan', error?.message || 'Terjadi kesalahan saat meng-upload motor.');
    } finally {
      setIsSubmittingInput(false);
    }
  };

  // Handle Banner Actions
  const handlePickBannerImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Galeri Diperlukan', 'Izinkan aplikasi untuk mengakses galeri.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setInputBannerImageUri(result.assets[0].uri);
      setInputBannerImageType(result.assets[0].mimeType);
    }
  };

  const handleSubmitBanner = async () => {
    if (!inputBannerTitle || !inputBannerImageUri) {
      Alert.alert('Data belum lengkap', 'Judul dan gambar banner wajib diisi.');
      return;
    }
    setIsSubmittingBanner(true);
    try {
      await createBanner({
        title: inputBannerTitle,
        subtitle: inputBannerSubtitle || undefined,
        imageUri: inputBannerImageUri,
        mimeType: inputBannerImageType,
      });
      Alert.alert('Berhasil', 'Banner berhasil ditambahkan.');
      setInputBannerTitle('');
      setInputBannerSubtitle('');
      setInputBannerImageUri('');
      setInputBannerImageType(undefined);
    } catch (err: any) {
      Alert.alert('Gagal Simpan', err.message || 'Terjadi kesalahan saat menyimpan banner.');
    } finally {
      setIsSubmittingBanner(false);
    }
  };

  const confirmDeleteBanner = (bannerId: string, title: string) => {
    const performDelete = async () => {
      try {
        await deleteBanner(bannerId);
        Alert.alert('Berhasil', 'Banner berhasil dihapus.');
      } catch (err: any) {
        Alert.alert('Gagal', err.message || 'Gagal menghapus banner.');
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Hapus banner "${title}"?`)) performDelete();
    } else {
      Alert.alert('Hapus Banner', `Hapus banner "${title}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: performDelete },
      ]);
    }
  };

  // Dashboard Stats calculation
  const totalBikes = motorcycles.length;
  const soldOutBikes = motorcycles.filter(b => b.listingStatus === 'sold_out').length;
  const availableBikes = totalBikes - soldOutBikes;
  const totalLeads = leads.length;

  return (
    <View style={styles.webContainer}>
      {/* 1. SIDEBAR */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
          <FontAwesome6 name="motorcycle" size={24} color="#ff6f10" />
          <Text style={styles.sidebarTitle}>MotoMarket Admin</Text>
        </View>

        <View style={styles.sidebarMenu}>
          <Pressable
            onPress={() => setActiveTab('overview')}
            style={[styles.menuItem, activeTab === 'overview' && styles.menuItemActive]}
          >
            <FontAwesome6 name="chart-pie" size={16} color={activeTab === 'overview' ? '#ff6f10' : '#888'} />
            <Text style={[styles.menuItemText, activeTab === 'overview' && styles.menuItemTextActive]}>
              Overview
            </Text>
          </Pressable>

          {/* Sub menu: Katalog Motor */}
          <View style={styles.menuGroup}>
            <Text style={styles.groupLabel}>Katalog Motor</Text>
            
            <Pressable
              onPress={() => setActiveTab('manage')}
              style={[styles.subMenuItem, activeTab === 'manage' && styles.subMenuItemActive]}
            >
              <FontAwesome6 name="list-check" size={13} color={activeTab === 'manage' ? '#ff6f10' : '#888'} />
              <Text style={[styles.subMenuItemText, activeTab === 'manage' && styles.subMenuItemTextActive]}>
                Kelola Motor
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('input')}
              style={[styles.subMenuItem, activeTab === 'input' && styles.subMenuItemActive]}
            >
              <FontAwesome6 name="plus" size={13} color={activeTab === 'input' ? '#ff6f10' : '#888'} />
              <Text style={[styles.subMenuItemText, activeTab === 'input' && styles.subMenuItemTextActive]}>
                Input Motor
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setActiveTab('leads')}
            style={[styles.menuItem, activeTab === 'leads' && styles.menuItemActive]}
          >
            <FontAwesome6 name="users" size={16} color={activeTab === 'leads' ? '#ff6f10' : '#888'} />
            <Text style={[styles.menuItemText, activeTab === 'leads' && styles.menuItemTextActive]}>
              Daftar Leads
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('banners')}
            style={[styles.menuItem, activeTab === 'banners' && styles.menuItemActive, { marginTop: 10 }]}
          >
            <FontAwesome6 name="images" size={16} color={activeTab === 'banners' ? '#ff6f10' : '#888'} />
            <Text style={[styles.menuItemText, activeTab === 'banners' && styles.menuItemTextActive]}>
              Kelola Banner
            </Text>
          </Pressable>
        </View>

        <View style={styles.sidebarFooter}>
          <View style={styles.profileBox}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'A'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{user?.name || 'Administrator'}</Text>
              <Text style={styles.profileRole}>Super Admin</Text>
            </View>
          </View>
          <Pressable onPress={logout} style={styles.logoutButton}>
            <FontAwesome6 name="right-from-bracket" size={14} color="#e53e3e" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

      {/* 2. MAIN CONTENT AREA */}
      <View style={styles.mainContent}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Dashboard Overview</Text>
              <Text style={styles.pageSubtitle}>Pantau kinerja showroom motor Anda</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#e6f4ea' }]}>
                  <FontAwesome6 name="motorcycle" size={20} color="#137333" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{totalBikes}</Text>
                  <Text style={styles.statLabel}>Total Unit Motor</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#e8f0fe' }]}>
                  <FontAwesome6 name="circle-check" size={20} color="#1a73e8" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{availableBikes}</Text>
                  <Text style={styles.statLabel}>Unit Tersedia (Available)</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#fce8e6' }]}>
                  <FontAwesome6 name="ban" size={20} color="#c5221f" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{soldOutBikes}</Text>
                  <Text style={styles.statLabel}>Unit Terjual (Sold Out)</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconWrapper, { backgroundColor: '#fef7e0' }]}>
                  <FontAwesome6 name="users" size={20} color="#b06000" />
                </View>
                <View>
                  <Text style={styles.statNumber}>{totalLeads}</Text>
                  <Text style={styles.statLabel}>Total Peminat (Leads)</Text>
                </View>
              </View>
            </View>

            {/* Sales Chart Mockup & Overview info */}
            <View style={styles.chartSection}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Aktivitas Penjualan & Minat (Minggu Ini)</Text>
                
                <View style={styles.barChartContainer}>
                  {[
                    { day: 'Mon', value: 4 },
                    { day: 'Tue', value: 3 },
                    { day: 'Wed', value: 7 },
                    { day: 'Thu', value: 5 },
                    { day: 'Fri', value: 8 },
                    { day: 'Sat', value: 10 },
                    { day: 'Sun', value: 6 },
                  ].map((bar, i) => (
                    <View key={i} style={styles.barColumn}>
                      <View style={styles.barBackground}>
                        <View style={[styles.barFill, { height: `${(bar.value / 10) * 100}%` }]} />
                      </View>
                      <Text style={styles.barLabel}>{bar.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* KELOLA MOTOR TAB */}
        {activeTab === 'manage' && (
          <View style={styles.panelContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Kelola Katalog Motor</Text>
              <Text style={styles.pageSubtitle}>Cari, filter, edit status, atau hapus motor dari database</Text>
            </View>

            {/* Filters bar */}
            <View style={styles.filterBar}>
              <View style={styles.searchBox}>
                <FontAwesome6 name="magnifying-glass" size={14} color="#888" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.filterSearchInput}
                  placeholder="Cari nama motor atau deskripsi..."
                  placeholderTextColor="#bbb"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Brand Selector Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.filterLabel}>Brand:</Text>
                <View style={styles.selectWrapper}>
                  <TextInput
                    style={styles.mockSelect}
                    value={selectedBrand}
                    editable={false}
                  />
                  <ScrollView style={styles.brandDropdownOptions} horizontal showsHorizontalScrollIndicator={false}>
                    {brandsList.map(brand => (
                      <Pressable
                        key={brand}
                        onPress={() => setSelectedBrand(brand)}
                        style={[styles.brandOptionChip, selectedBrand === brand && styles.brandOptionChipActive]}
                      >
                        <Text style={[styles.brandOptionText, selectedBrand === brand && styles.brandOptionTextActive]}>
                          {brand}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Status Selector */}
              <View style={styles.statusFilters}>
                <Pressable
                  onPress={() => setSelectedStatus('All')}
                  style={[styles.statusFilterChip, selectedStatus === 'All' && styles.statusFilterChipActive]}
                >
                  <Text style={[styles.statusFilterText, selectedStatus === 'All' && styles.statusFilterTextActive]}>
                    Semua ({totalBikes})
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedStatus('available')}
                  style={[styles.statusFilterChip, selectedStatus === 'available' && styles.statusFilterChipActive]}
                >
                  <Text style={[styles.statusFilterText, selectedStatus === 'available' && styles.statusFilterTextActive]}>
                    Tersedia ({availableBikes})
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setSelectedStatus('sold_out')}
                  style={[styles.statusFilterChip, selectedStatus === 'sold_out' && styles.statusFilterChipActive]}
                >
                  <Text style={[styles.statusFilterText, selectedStatus === 'sold_out' && styles.statusFilterTextActive]}>
                    Sold Out ({soldOutBikes})
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Catalog Grid / List */}
            {isCatalogLoading ? (
              <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#ff6f10" />
            ) : filteredBikes.length === 0 ? (
              <View style={styles.emptyPanel}>
                <FontAwesome6 name="circle-question" size={48} color="#ccc" />
                <Text style={styles.emptyPanelText}>Tidak ada motor yang cocok dengan filter pencarian.</Text>
              </View>
            ) : (
              <ScrollView style={styles.tableScroll}>
                <View style={styles.webTable}>
                  {/* Table Header */}
                  <View style={styles.webTableHeader}>
                    <Text style={[styles.thCell, { flex: 2 }]}>Detail Motor</Text>
                    <Text style={[styles.thCell, { flex: 1 }]}>Brand / Brand Name</Text>
                    <Text style={[styles.thCell, { flex: 1.2 }]}>Harga</Text>
                    <Text style={[styles.thCell, { flex: 1 }]}>Status</Text>
                    <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Aksi</Text>
                  </View>

                  {/* Table Body */}
                  {filteredBikes.map((bike) => {
                    const isSold = bike.listingStatus === 'sold_out';
                    const formattedPrice = bike.price.toLocaleString('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      maximumFractionDigits: 0,
                    });

                    return (
                      <View key={bike.motorcycle_id} style={styles.webTableRow}>
                        {/* Title and Image info */}
                        <View style={[styles.tbCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                          <Image
                            source={{ uri: bike.image }}
                            style={styles.tableRowImg}
                            contentFit="cover"
                          />
                          <View style={{ marginLeft: 12, flex: 1 }}>
                            <Text style={styles.tableRowTitle} numberOfLines={1}>{bike.title}</Text>
                            <Text style={styles.tableRowDesc} numberOfLines={1}>
                              {bike.description || 'Tidak ada deskripsi'}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.tbCell, { flex: 1 }]}>{bike.engineCapacity}</Text>
                        <Text style={[styles.tbCell, { flex: 1.2, color: '#ff6f10', fontWeight: '700' }]}>
                          {formattedPrice}
                        </Text>
                        
                        {/* Status badge */}
                        <View style={[styles.tbCell, { flex: 1 }]}>
                          <View style={[styles.tableStatusBadge, isSold ? styles.statusBadgeSold : styles.statusBadgeAvail]}>
                            <Text style={[styles.tableStatusText, isSold ? styles.statusTextSold : styles.statusTextAvail]}>
                              {isSold ? 'Sold Out' : 'Available'}
                            </Text>
                          </View>
                        </View>

                        {/* Actions */}
                        <View style={[styles.tbCell, { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 10 }]}>
                          <Pressable onPress={() => openEditModal(bike)} style={styles.btnEdit}>
                            <FontAwesome6 name="pen" size={12} color="#1a73e8" />
                          </Pressable>
                          <Pressable onPress={() => confirmDeleteBike(bike.motorcycle_id, bike.title)} style={styles.btnDelete}>
                            <FontAwesome6 name="trash" size={12} color="#d93025" />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* EDIT MOTOR MODAL OVERLAY */}
            {editingMotorcycle && (
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Detail Motor</Text>
                    <Pressable onPress={() => setEditingMotorcycle(null)} style={styles.closeBtn}>
                      <FontAwesome6 name="xmark" size={16} color="#333" />
                    </Pressable>
                  </View>

                  <ScrollView style={styles.modalForm}>
                    <Text style={styles.formLabel}>Judul Motor</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholder="Masukkan nama/judul motor"
                    />

                    <Text style={styles.formLabel}>Harga (IDR)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      keyboardType="numeric"
                      placeholder="Contoh: 25000000"
                    />

                    <Text style={styles.formLabel}>Brand (Brand Name)</Text>
                    <TextInput
                      style={styles.formInput}
                      value={editBrand}
                      onChangeText={setEditBrand}
                      placeholder="Contoh: Honda Vario 150"
                    />

                    <Text style={styles.formLabel}>Deskripsi</Text>
                    <TextInput
                      style={[styles.formInput, styles.multilineInput]}
                      value={editDescription}
                      onChangeText={setEditDescription}
                      multiline
                      numberOfLines={4}
                      placeholder="Masukkan deskripsi unit motor"
                    />

                    <Text style={styles.formLabel}>Ketersediaan / Listing Status</Text>
                    <View style={styles.statusRadioGroup}>
                      <Pressable
                        onPress={() => setEditStatus('available')}
                        style={[styles.radioItem, editStatus === 'available' && styles.radioItemActive]}
                      >
                        <FontAwesome6
                          name={editStatus === 'available' ? 'circle-dot' : 'circle'}
                          size={14}
                          color={editStatus === 'available' ? '#ff6f10' : '#888'}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.radioText, editStatus === 'available' && styles.radioTextActive]}>
                          Available (Tersedia)
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setEditStatus('sold_out')}
                        style={[styles.radioItem, editStatus === 'sold_out' && styles.radioItemActive]}
                      >
                        <FontAwesome6
                          name={editStatus === 'sold_out' ? 'circle-dot' : 'circle'}
                          size={14}
                          color={editStatus === 'sold_out' ? '#ff6f10' : '#888'}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.radioText, editStatus === 'sold_out' && styles.radioTextActive]}>
                          Not Available (Sold Out)
                        </Text>
                      </Pressable>
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <Pressable
                      onPress={() => confirmDeleteBike(editingMotorcycle.motorcycle_id, editingMotorcycle.title)}
                      style={styles.btnModalDelete}
                    >
                      <FontAwesome6 name="trash-can" size={14} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.btnModalDeleteText}>Hapus Unit</Text>
                    </Pressable>
                    
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable onPress={() => setEditingMotorcycle(null)} style={styles.btnCancel}>
                        <Text style={styles.btnCancelText}>Batal</Text>
                      </Pressable>
                      <Pressable onPress={handleSaveEdit} disabled={isSavingEdit} style={styles.btnSave}>
                        {isSavingEdit ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.btnSaveText}>Simpan Perubahan</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* INPUT MOTOR TAB */}
        {activeTab === 'input' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Input Motor Baru</Text>
              <Text style={styles.pageSubtitle}>Tambahkan unit motor baru ke showroom</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formColLeft}>
                <Text style={styles.formLabel}>Judul / Nama Motor</Text>
                <TextInput
                  style={styles.formInput}
                  value={inputTitle}
                  onChangeText={setInputTitle}
                  placeholder="Contoh: Yamaha NMAX 155cc 2024"
                />

                <Text style={styles.formLabel}>Harga Jual (IDR)</Text>
                <TextInput
                  style={styles.formInput}
                  value={inputPrice}
                  onChangeText={setInputPrice}
                  keyboardType="numeric"
                  placeholder="Contoh: 33500000"
                />

                <Text style={styles.formLabel}>Brand (Brand Name)</Text>
                <TextInput
                  style={styles.formInput}
                  value={inputBrand}
                  onChangeText={setInputBrand}
                  placeholder="Contoh: Yamaha"
                />

                <Text style={styles.formLabel}>Deskripsi Lengkap</Text>
                <TextInput
                  style={[styles.formInput, styles.multilineInput, { height: 120 }]}
                  value={inputDescription}
                  onChangeText={inputDescription => setInputDescription(inputDescription)}
                  multiline
                  numberOfLines={6}
                  placeholder="Masukkan detail spesifikasi motor, kondisi body, mesin, dokumen, plat, dll"
                />
              </View>

              <View style={styles.formColRight}>
                <Text style={styles.formLabel}>Foto Motor</Text>
                
                {inputImageUri ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: inputImageUri }} style={styles.inputImagePreview} contentFit="cover" />
                    <Pressable onPress={() => setInputImageUri('')} style={styles.removeImageBtn}>
                      <FontAwesome6 name="trash" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={handlePickInputImage} style={styles.imagePlaceholderBtn}>
                    <FontAwesome6 name="cloud-arrow-up" size={32} color="#ccc" style={{ marginBottom: 12 }} />
                    <Text style={styles.placeholderBtnText}>Pilih Foto dari Komputer</Text>
                    <Text style={styles.placeholderBtnSubtext}>Format: JPEG, PNG, WEBP (maks. 2MB)</Text>
                  </Pressable>
                )}

                <Pressable
                  onPress={handleSubmitInput}
                  disabled={isSubmittingInput}
                  style={[styles.btnSubmitForm, isSubmittingInput && styles.btnSubmitFormDisabled]}
                >
                  {isSubmittingInput ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontAwesome6 name="floppy-disk" size={16} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.btnSubmitText}>Simpan Motor Baru</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </ScrollView>
        )}

        {/* DAFTAR LEADS TAB */}
        {activeTab === 'leads' && (
          <View style={styles.panelContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Daftar Leads / Peminat Motor</Text>
              <Text style={styles.pageSubtitle}>Daftar calon pembeli yang menyatakan minat terhadap unit motor</Text>
            </View>

            {isLeadsLoading ? (
              <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#ff6f10" />
            ) : leads.length === 0 ? (
              <View style={styles.emptyPanel}>
                <FontAwesome6 name="inbox" size={48} color="#ccc" />
                <Text style={styles.emptyPanelText}>Belum ada calon pembeli (leads) yang terdaftar.</Text>
              </View>
            ) : (
              <ScrollView style={styles.tableScroll}>
                <View style={styles.leadsList}>
                  {leads.map((lead) => {
                    const isExpanded = expandedLeadId === lead.booking_id;
                    const dateStr = new Date(lead.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    
                    const handleWhatsApp = () => {
                      if (!lead.profiles?.mobile || lead.profiles.mobile === '-') {
                        Alert.alert('Gagal', 'Nomor HP calon pembeli tidak tersedia.');
                        return;
                      }
                      
                      // Normalize mobile number
                      let phone = lead.profiles.mobile.replace(/[^0-9]/g, '');
                      if (phone.startsWith('0')) {
                        phone = '62' + phone.slice(1);
                      }
                      const message = `Halo Kak ${lead.profiles.name}, kami dari Admin MotoMarket ingin menindaklanjuti ketertarikan Anda pada unit *${lead.motorcycles?.name}*. Apakah ada yang bisa kami bantu?`;
                      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                      
                      if (Platform.OS === 'web') {
                        window.open(waUrl, '_blank');
                      } else {
                        Alert.alert('Buka WhatsApp', 'Ingin menghubungi pembeli di WhatsApp?', [
                          { text: 'Batal', style: 'cancel' },
                          { text: 'Hubungi', onPress: () => Alert.alert('WhatsApp Link', waUrl) }
                        ]);
                      }
                    };

                    return (
                      <View key={lead.booking_id} style={[styles.leadAccordionCard, isExpanded && styles.leadAccordionCardActive]}>
                        {/* Header (Motorcycle Title and Type) */}
                        <Pressable
                          onPress={() => setExpandedLeadId(isExpanded ? null : lead.booking_id)}
                          style={styles.leadHeaderPressable}
                        >
                          <View style={styles.leadHeaderInfo}>
                            <View style={styles.leadMotorBadge}>
                              <FontAwesome6 name="motorcycle" size={14} color="#ff6f10" />
                            </View>
                            <View>
                              <Text style={styles.leadMotorName}>{lead.motorcycles?.name || 'Motor Tidak Dikenal'}</Text>
                              <Text style={styles.leadDateSub}>Minat masuk pada: {dateStr}</Text>
                            </View>
                          </View>
                          
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <View style={styles.badgeInterested}>
                              <Text style={styles.badgeInterestedText}>Sangat Tertarik</Text>
                            </View>
                            <FontAwesome6 name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#666" />
                          </View>
                        </Pressable>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <View style={styles.leadCollapsibleContent}>
                            <View style={styles.leadDivider} />
                            
                            <View style={styles.leadDetailGrid}>
                              <View style={styles.leadDetailCol}>
                                <Text style={styles.leadDetailLabel}>Nama Calon Pembeli</Text>
                                <Text style={styles.leadDetailValue}>{lead.profiles?.name || 'Anonymous'}</Text>

                                <Text style={[styles.leadDetailLabel, { marginTop: 12 }]}>Alamat Email</Text>
                                <Text style={styles.leadDetailValue}>{lead.profiles?.email || '-'}</Text>
                              </View>

                              <View style={styles.leadDetailCol}>
                                <Text style={styles.leadDetailLabel}>Nomor WhatsApp / HP</Text>
                                <Text style={styles.leadDetailValue}>{lead.profiles?.mobile || '-'}</Text>

                                {lead.visit_date && (
                                  <>
                                    <Text style={[styles.leadDetailLabel, { marginTop: 12 }]}>Rencana Kunjungan Showroom</Text>
                                    <View style={styles.visitBadgeContainer}>
                                      <FontAwesome6 name="calendar-days" size={12} color="#137333" style={{ marginRight: 6 }} />
                                      <Text style={styles.visitBadgeText}>{lead.visit_date}</Text>
                                    </View>
                                  </>
                                )}
                              </View>
                            </View>

                            <View style={styles.leadActionRow}>
                              <Pressable onPress={handleWhatsApp} style={styles.btnContactWa}>
                                <FontAwesome6 name="whatsapp" size={14} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.btnContactWaText}>Hubungi via WhatsApp</Text>
                              </Pressable>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* BANNERS TAB */}
        {activeTab === 'banners' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Kelola Banner / Slider Promo</Text>
              <Text style={styles.pageSubtitle}>Tambahkan dan atur banner promosi untuk halaman utama aplikasi</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formColLeft}>
                <Text style={styles.formLabel}>Judul Banner</Text>
                <TextInput
                  style={styles.formInput}
                  value={inputBannerTitle}
                  onChangeText={setInputBannerTitle}
                  placeholder="Contoh: Promo Ramadhan"
                />

                <Text style={styles.formLabel}>Sub Judul (Opsional)</Text>
                <TextInput
                  style={styles.formInput}
                  value={inputBannerSubtitle}
                  onChangeText={setInputBannerSubtitle}
                  placeholder="Contoh: Diskon DP hingga 50%"
                />

                <Pressable
                  onPress={handleSubmitBanner}
                  disabled={isSubmittingBanner}
                  style={[styles.btnSubmitForm, { marginTop: 20 }, isSubmittingBanner && styles.btnSubmitFormDisabled]}
                >
                  {isSubmittingBanner ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FontAwesome6 name="plus" size={16} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.btnSubmitText}>Tambah Banner</Text>
                    </>
                  )}
                </Pressable>
              </View>

              <View style={styles.formColRight}>
                <Text style={styles.formLabel}>Gambar Banner</Text>
                {inputBannerImageUri ? (
                  <View style={styles.imagePreviewWrapper}>
                    <Image source={{ uri: inputBannerImageUri }} style={[styles.inputImagePreview, { aspectRatio: 16/9, height: undefined, width: '100%' }]} contentFit="cover" />
                    <Pressable onPress={() => setInputBannerImageUri('')} style={styles.removeImageBtn}>
                      <FontAwesome6 name="trash" size={14} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable onPress={handlePickBannerImage} style={styles.imagePlaceholderBtn}>
                    <FontAwesome6 name="cloud-arrow-up" size={32} color="#ccc" style={{ marginBottom: 12 }} />
                    <Text style={styles.placeholderBtnText}>Pilih Foto dari Komputer</Text>
                    <Text style={styles.placeholderBtnSubtext}>Rekomendasi rasio 16:9 (Landscape)</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* List Banners */}
            <View style={{ marginTop: 40 }}>
              <Text style={[styles.pageTitle, { fontSize: 20, marginBottom: 15 }]}>Daftar Banner Aktif & Nonaktif</Text>
              
              {isBannersLoading ? (
                <ActivityIndicator size="large" color="#ff6f10" />
              ) : banners.length === 0 ? (
                <View style={styles.emptyPanel}>
                  <Text style={styles.emptyPanelText}>Belum ada banner yang ditambahkan.</Text>
                </View>
              ) : (
                <View style={styles.bannersGrid}>
                  {banners.map((banner) => (
                    <View key={banner.id} style={styles.bannerCard}>
                      <Image source={{ uri: banner.image_url }} style={styles.bannerCardImage} contentFit="cover" />
                      <View style={styles.bannerCardContent}>
                        <Text style={styles.bannerCardTitle}>{banner.title}</Text>
                        {banner.subtitle && <Text style={styles.bannerCardSubtitle}>{banner.subtitle}</Text>}
                        
                        <View style={styles.bannerCardActions}>
                          <Pressable 
                            onPress={() => toggleBannerStatus(banner.id, banner.is_active)}
                            style={[styles.bannerToggleBtn, banner.is_active ? styles.bannerToggleActive : styles.bannerToggleInactive]}
                          >
                            <Text style={[styles.bannerToggleText, banner.is_active && {color: '#fff'}]}>{banner.is_active ? 'Aktif' : 'Nonaktif'}</Text>
                          </Pressable>
                          
                          <Pressable onPress={() => confirmDeleteBanner(banner.id, banner.title)} style={styles.btnDelete}>
                            <FontAwesome6 name="trash" size={12} color="#d93025" />
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles: any = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#f8f9fa',
  },
  
  // 1. Sidebar Styles
  sidebar: {
    width: 260,
    backgroundColor: '#1e293b',
    borderRightWidth: 1,
    borderRightColor: '#334155',
    padding: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sidebarMenu: {
    flex: 1,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#334155',
  },
  menuItemText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  menuItemTextActive: {
    color: '#ff6f10',
  },
  menuGroup: {
    marginTop: 15,
    marginBottom: 10,
    gap: 4,
  },
  groupLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingLeft: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 24,
    borderRadius: 8,
    gap: 10,
  },
  subMenuItemActive: {
    backgroundColor: '#334155',
  },
  subMenuItemText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  subMenuItemTextActive: {
    color: '#ff6f10',
    fontWeight: '600',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 15,
    gap: 15,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ff6f10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  profileRole: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
    backgroundColor: 'rgba(229, 62, 62, 0.08)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },

  // 2. Main Content Area Styles
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 30,
  },
  panelContent: {
    flex: 1,
    padding: 30,
  },
  pageHeader: {
    marginBottom: 25,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  statIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  // Chart section
  chartSection: {
    marginBottom: 30,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barBackground: {
    width: 14,
    height: 130,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#ff6f10',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 10,
    fontWeight: '600',
  },

  // Filter Bar Styles
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBox: {
    flex: 2,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  filterSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 3,
    minWidth: 320,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  selectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  mockSelect: {
    display: 'none', // just to type check state
  },
  brandDropdownOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  brandOptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  brandOptionChipActive: {
    backgroundColor: '#ff6f10',
  },
  brandOptionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  brandOptionTextActive: {
    color: '#fff',
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  statusFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  statusFilterChipActive: {
    backgroundColor: '#0f172a',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  statusFilterTextActive: {
    color: '#fff',
  },

  // Table Scroll
  tableScroll: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  webTable: {
    width: '100%',
    minWidth: 800,
  },
  webTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  thCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  webTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tbCell: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  tableRowImg: {
    width: 50,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
  },
  tableRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  tableRowDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  tableStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeAvail: {
    backgroundColor: '#e6f4ea',
  },
  statusBadgeSold: {
    backgroundColor: '#fce8e6',
  },
  tableStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextAvail: {
    color: '#137333',
  },
  statusTextSold: {
    color: '#c5221f',
  },
  btnEdit: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDelete: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fce8e6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Edit Modal Dialog Overlays
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 550,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  modalForm: {
    padding: 20,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    fontSize: 14,
    color: '#334155',
    backgroundColor: '#fff',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 8,
  },
  statusRadioGroup: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 8,
    marginBottom: 15,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  radioItemActive: {
    borderColor: '#ff6f10',
    backgroundColor: '#fff5ed',
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  radioTextActive: {
    color: '#ff6f10',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  btnModalDelete: {
    backgroundColor: '#d93025',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnModalDeleteText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnCancel: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#fff',
  },
  btnCancelText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  btnSave: {
    borderRadius: 8,
    backgroundColor: '#ff6f10',
    paddingHorizontal: 16,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  btnSaveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },

  // Input Form Container
  formContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 30,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 30,
  },
  formColLeft: {
    flex: 3,
    minWidth: 320,
    gap: 4,
  },
  formColRight: {
    flex: 2,
    minWidth: 260,
    gap: 4,
  },
  imagePlaceholderBtn: {
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  placeholderBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  placeholderBtnSubtext: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4,
  },
  imagePreviewWrapper: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputImagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSubmitForm: {
    backgroundColor: '#ff6f10',
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
  },
  btnSubmitFormDisabled: {
    backgroundColor: '#ffaa66',
  },
  btnSubmitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  // Leads tab styles
  leadsList: {
    padding: 16,
    gap: 12,
  },
  leadAccordionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  leadAccordionCardActive: {
    borderColor: '#ff6f10',
  },
  leadHeaderPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leadHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leadMotorBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff5ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadMotorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  leadDateSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  badgeInterested: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeInterestedText: {
    fontSize: 11,
    color: '#1a73e8',
    fontWeight: '700',
  },
  leadCollapsibleContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  leadDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 14,
  },
  leadDetailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 16,
  },
  leadDetailCol: {
    flex: 1,
    minWidth: 200,
  },
  leadDetailLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  leadDetailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
    marginTop: 4,
  },
  visitBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  visitBadgeText: {
    color: '#137333',
    fontWeight: '700',
    fontSize: 13,
  },
  leadActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  btnContactWa: {
    backgroundColor: '#1f7a4d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnContactWaText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyPanel: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyPanelText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  
  // 5. Banners Tab Styles
  bannersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  bannerCard: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  bannerCardImage: {
    width: '100%',
    aspectRatio: 16/9,
  },
  bannerCardContent: {
    padding: 16,
  },
  bannerCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  bannerCardSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  bannerCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  bannerToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  bannerToggleActive: {
    backgroundColor: '#10b981',
  },
  bannerToggleInactive: {
    backgroundColor: '#f1f5f9',
  },
  bannerToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
});
