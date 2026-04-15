export interface Motorcycle {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  rating?: number;
  year: number;
  engineCapacity: string;
  mileage: string;
  description?: string;
}

export const MOTORCYCLES: Motorcycle[] = [
  {
    id: '1',
    title: 'Harley-Davidson Street 750',
    price: 12500,
    location: 'Los Angeles, CA',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.8,
    year: 2023,
    engineCapacity: '750cc',
    mileage: '2,500 miles',
    description: 'Pristine condition Harley-Davidson Street 750 with custom exhaust and recent service.',
  },
  {
    id: '2',
    title: 'Yamaha YZF-R6',
    price: 8500,
    location: 'San Francisco, CA',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.9,
    year: 2022,
    engineCapacity: '599cc',
    mileage: '5,200 miles',
    description: 'High-performance sport bike in excellent condition.',
  },
  {
    id: '3',
    title: 'Honda CB500F',
    price: 7200,
    location: 'New York, NY',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.7,
    year: 2021,
    engineCapacity: '471cc',
    mileage: '8,100 miles',
    description: 'Reliable middleweight with great fuel economy.',
  },
  {
    id: '4',
    title: 'Kawasaki Ninja 400',
    price: 5800,
    location: 'Las Vegas, NV',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.6,
    year: 2023,
    engineCapacity: '399cc',
    mileage: '1,200 miles',
    description: 'Perfect beginner-friendly sport bike.',
  },
  {
    id: '5',
    title: 'Ducati Monster 937',
    price: 11200,
    location: 'Miami, FL',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.8,
    year: 2023,
    engineCapacity: '937cc',
    mileage: '3,400 miles',
    description: 'Stylish naked bike with modern features.',
  },
  {
    id: '6',
    title: 'BMW S1000RR',
    price: 18500,
    location: 'Chicago, IL',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.9,
    year: 2022,
    engineCapacity: '999cc',
    mileage: '4,100 miles',
    description: 'Superbike with cutting-edge technology.',
  },
  {
    id: '7',
    title: 'Triumph Street Twin',
    price: 9800,
    location: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.7,
    year: 2023,
    engineCapacity: '900cc',
    mileage: '2,000 miles',
    description: 'Classic British motorcycle with modern reliability.',
  },
  {
    id: '8',
    title: 'KTM Duke 390',
    price: 4500,
    location: 'Denver, CO',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
    rating: 4.5,
    year: 2023,
    engineCapacity: '373cc',
    mileage: '1,800 miles',
    description: 'Lightweight and agile street bike.',
  },
];
