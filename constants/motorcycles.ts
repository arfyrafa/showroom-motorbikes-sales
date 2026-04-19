export type MotorcycleListingStatus = 'available' | 'sold_out';

export interface Motorcycle {
  motorcycle_id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  rating?: number;
  year: number;
  engineCapacity: string;
  mileage: string;
  description?: string;
  /** Ketersediaan di showroom; dari API selalu terisi; snapshot booking lokal bisa tidak ada. */
  listingStatus?: MotorcycleListingStatus;
}