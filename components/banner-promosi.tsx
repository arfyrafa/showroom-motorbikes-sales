import { Image, StyleSheet, Text, View } from 'react-native';

export default function BannerPromosi() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&q=80' }}
        style={styles.banner}
        resizeMode="cover"
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Promo April! Diskon hingga 2 Juta 🚀</Text>
        <Text style={styles.subtitle}>Booking motor sekarang, dapatkan cashback & hadiah menarik!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  banner: {
    width: '100%',
    height: 140,
  },
  textContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#e67e22',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
});
