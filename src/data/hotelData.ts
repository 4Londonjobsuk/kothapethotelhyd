import {
  SiteSettings,
  RoomItem,
  AmenityItem,
  AttractionItem,
  GalleryItem,
  TestimonialItem,
  GuestCommitmentItem,
  TransitItem,
  NearbyFoodItem,
} from '../types';

export const siteSettings: SiteSettings = {
  hotelName: 'Lotus Grand',
  tagline: 'Where Comfort Meets True Hospitality',
  subTagline: 'A Premium Stay in the Heart of Hyderabad',
  cityArea: 'Kothapet / Saroornagar',
  stateCountry: 'Hyderabad, Telangana, India',
  fullLocation: 'First floor, blue building, beside PVT Market Building, Saroornagar, HUDA Complex, Kothapet, Papadams, Hyderabad, Telangana 500035',
  postalAddress: 'First floor, blue building, beside PVT Market Building, Saroornagar, HUDA Complex, Kothapet, Papadams, Hyderabad, Telangana 500035',
  secondaryAddressNote: 'Plot No. 54, 55, 56, Kothapet Main Road, Saroornagar, Hyderabad 500035 (OTA Reference)',
  phone: '+919032666941',
  phoneDisplay: '090326 66941',
  email: 'info@lotusgrand.in',
  isEmailVerified: false,
  whatsAppNumber: '+919032666941',
  checkInTime: '12:00 PM',
  checkOutTime: '11:00 AM',
  totalRooms: 30,
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3808.0673305417937!2d78.5353909!3d17.3668947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb990046145aa7%3A0x2d79c796c4728ee1!2sLotus%20Grand!5e0!3m2!1sen!2sin!4v1709800000000',
  googleMapsDirectionsUrl: 'https://www.google.com/maps/dir//Lotus+Grand,+First+floor,+blue+building,+beside+PVT+Market+Building,+Saroornagar,+HUDA+Complex,+Kothapet,+Papadams,+Hyderabad,+Telangana+500035/@17.3023927,78.5291596,14z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x3bcb990046145aa7:0x2d79c796c4728ee1!2m2!1d78.5379658!2d17.3668947?hl=en-IN&entry=ttu',
  googleMapsPlaceUrl: 'https://www.google.com/maps/place/Lotus+Grand/@17.3668947,78.5379658,17z/data=!4m6!3m5!1s0x3bcb990046145aa7:0x2d79c796c4728ee1!8m2!3d17.3668947!4d78.5379658!16s%2Fg%2F11t7sn9s8n',
  googleHotelUrl: 'https://www.google.com/travel/hotels/entity/CgoI4Z3Ko-zy8bwtEAE/overview?q=lotus%20grand%20hotel%20kothapet',
  makeMyTripUrl: 'https://www.makemytrip.com/hotels/super_townhouse_lotus_grand-details-hyderabad.html',
  goibiboUrl: 'https://www.goibibo.com/hotels/super-townhouse-lotus-grand-hotel-in-hyderabad-7862876362352800532/',
  ixigoUrl: 'https://www.ixigo.com/hotels/super-townhouse-lotus-grand-in-hyderabad-1156398-d',
  oyoUrl: 'https://www.oyorooms.com/238170/',
  socialLinks: {},
};

// Verified Transit Hubs & Connectivity Distances (From Google Hotel & Booking.com)
export const verifiedTransitData: TransitItem[] = [
  {
    id: 't-metro-1',
    name: 'Chaitanyapuri Metro Station',
    distance: '550 meters',
    duration: '5 min walk',
    type: 'metro',
    description: 'Red Line Corridor connecting to MGBS, Ameerpet, Miyapur, and Secunderabad.',
  },
  {
    id: 't-bus-1',
    name: 'Fruit Market Bus Stop',
    distance: '250 meters',
    duration: '3 min walk',
    type: 'bus',
    description: 'Frequent TSRTC city buses across Hyderabad & Dilsukhnagar.',
  },
  {
    id: 't-metro-2',
    name: 'Victoria Memorial Metro',
    distance: '1.1 km',
    duration: '3 min drive',
    type: 'metro',
    description: 'Direct metro station on the Vijayawada highway stretch.',
  },
  {
    id: 't-lake-1',
    name: 'Saroornagar Lake',
    distance: '500 meters',
    duration: '5 min walk',
    type: 'lake',
    description: 'Scenic recreation lake promenade nearby.',
  },
  {
    id: 't-train-1',
    name: 'Malakpet Railway Station',
    distance: '5 km',
    duration: '12 min drive',
    type: 'train',
    description: 'MMTS suburban railway connection.',
  },
  {
    id: 't-train-2',
    name: 'Hyderabad Deccan (Nampally) Station',
    distance: '6 km',
    duration: '15 min drive',
    type: 'train',
    description: 'Major long-distance railway junction in Hyderabad.',
  },
  {
    id: 't-airport-1',
    name: 'Rajiv Gandhi International Airport (RGIA)',
    distance: '21 km',
    duration: '30-35 min drive',
    type: 'airport',
    description: 'Fast access via Outer Ring Road (ORR) and Srisailam Highway.',
  },
];

// Verified Nearby Restaurants & Cafes
export const verifiedNearbyRestaurants: NearbyFoodItem[] = [
  {
    name: 'Naveena Tiffins',
    distance: '100 m',
    type: 'South Indian Tiffins & Filter Coffee',
  },
  {
    name: 'Shri Balaji Tiffins',
    distance: '200 m',
    type: 'Pure Vegetarian Breakfast & Snacks',
  },
  {
    name: 'Moon Light Restaurant & Bar',
    distance: '250 m',
    type: 'Multi-Cuisine Casual Dining',
  },
  {
    name: 'Imperial Restaurant',
    distance: '7 min walk',
    type: 'Authentic Hyderabadi Biryani & North Indian',
  },
];

// Verified Hotel Policies & Guidelines
export const verifiedHotelPolicies = {
  checkIn: '12:00 PM',
  checkOut: '11:00 AM',
  totalRooms: '30 Well-Appointed Rooms',
  smokeFree: '100% Smoke-Free Property',
  pets: 'No Pets Allowed',
  languages: 'Telugu, Hindi, English',
  paymentModes: ['Google Pay / PhonePe (UPI)', 'Credit Cards', 'Debit Cards', 'NFC Mobile Payments', 'Cash'],
  safety: ['24/7 CCTV in Common Areas', 'Fire Extinguishers', 'First-Aid Kit On-Site', 'Round-the-clock Caretaker'],
};

// Rooms data: Configured with verified Classic room and editable mockup categories
export const roomsData: RoomItem[] = [
  {
    id: 'deluxe-room',
    name: 'Deluxe Room',
    subtitle: 'Stylish and comfortable, perfect for a relaxing stay.',
    description:
      'A tastefully appointed room featuring modern wooden furnishings, plush bedding, ambient lighting, dedicated workstation, and an en-suite bathroom with complimentary toiletries.',
    image:
      '/assets/hotel-assets/rooms/img_10_hyderabad-super-townhouse-lotus-grand-photo-10.jpg',
    rateLabel: 'Contact for Rates',
    specs: {
      bed: 'King / Queen Bed',
      wifi: 'High-Speed Wi-Fi',
      tv: 'LED Flat TV',
      ac: 'Climate Controlled AC',
      capacity: 'Up to 2-3 Guests',
      size: 'Spacious Layout',
    },
    amenities: [
      'Air Conditioning',
      'High-Speed Wi-Fi',
      'Flat-Screen TV',
      '24/7 Room Service',
      'Daily Housekeeping',
      'Complimentary Bottled Water',
      'Work Desk & Chair',
      'Private Shower & Toiletries',
    ],
    isVerifiedInventory: true,
  },
  {
    id: 'standard-room',
    name: 'Standard Classic Room',
    subtitle: 'A comfortable and elegant space, perfect for relaxing after a busy day.',
    description:
      'Our primary verified guest accommodation offering cozy queen bedding, quiet air conditioning, bedside power outlets, flat-screen television, and clean attached bathroom.',
    image:
      '/assets/hotel-assets/rooms/img_11_hyderabad-super-townhouse-lotus-grand-photo-11.jpg',
    rateLabel: 'Contact for Rates',
    specs: {
      bed: 'Comfortable Queen Bed',
      wifi: 'Free Wi-Fi',
      tv: 'LED TV',
      ac: 'Air Conditioning',
      capacity: 'Up to 3 Guests',
      size: 'Approx. 97 sq ft',
    },
    amenities: [
      'Air Conditioning',
      'Free Wi-Fi',
      'Flat-Screen TV',
      'Telephone',
      'Power Backup',
      'Wardrobe / Cupboard',
      'Daily Housekeeping',
      'Private Bathroom with Shower',
    ],
    isVerifiedInventory: true,
    statusNote: 'Verified OTA Base Category',
  },
  {
    id: 'family-room',
    name: 'Family Room',
    subtitle: 'Ideal for families, with extra space and thoughtful amenities.',
    description:
      'Spacious room layout designed with multiple beds or interconnected space to accommodate families comfortably with generous storage, sitting area, and full in-room amenities.',
    image:
      '/assets/hotel-assets/rooms/img_12_hyderabad-super-townhouse-lotus-grand-photo-12.jpg',
    rateLabel: 'Contact for Rates',
    specs: {
      bed: 'Double Bed + Twin Bed',
      wifi: 'Free Wi-Fi',
      tv: 'LED TV',
      ac: 'Air Conditioning',
      capacity: 'Family / 3-4 Guests',
      size: 'Expanded Living Area',
    },
    amenities: [
      'Air Conditioning',
      'Free High-Speed Wi-Fi',
      'LED Flat-Screen TV',
      'Spacious Sitting Area',
      '24/7 Room Service',
      'Wake-Up Call Service',
      'Luggage Storage Space',
      'Attached Bathroom with Hot Shower',
    ],
    isVerifiedInventory: false,
    statusNote: 'Editable CMS Category — Verify Inventory',
  },
  {
    id: 'executive-suite',
    name: 'Executive Room',
    subtitle: 'Enhanced comfort with extra space for corporate and business travelers.',
    description:
      'Tailored for business visitors seeking tranquility, extra seating, ergonomic workstation, high-speed connectivity, and rapid room service assistance.',
    image:
      '/assets/hotel-assets/rooms/img_13_hyderabad-super-townhouse-lotus-grand-photo-13.jpg',
    rateLabel: 'Contact for Rates',
    specs: {
      bed: 'Premium King Bed',
      wifi: 'High-Speed Wi-Fi',
      tv: 'Smart LED TV',
      ac: 'Air Conditioning',
      capacity: '2 Guests',
      size: 'Executive Layout',
    },
    amenities: [
      'Air Conditioning',
      'High-Speed Wi-Fi',
      'Executive Desk',
      'Flat-Screen TV',
      '24/7 Front Desk Assistance',
      'Power Backup',
      'Room Service',
      'Modern Bathroom Fittings',
    ],
    isVerifiedInventory: false,
    statusNote: 'Editable CMS Category — Verify Inventory',
  },
];

// Hotel Amenities categorized by official hospitality standards
export const amenitiesData: AmenityItem[] = [
  // 1. Basic Facilities
  {
    id: 'wifi',
    title: 'Wi-Fi',
    description:
      'Complimentary high-speed wireless internet access across all rooms and public hotel areas.',
    iconName: 'Wifi',
    category: 'basic',
    categoryLabel: 'Basic Facilities',
  },
  {
    id: 'room-service',
    title: 'Room Service',
    description:
      'Courteous in-room food, beverage, and hospitality service delivered promptly to your room door.',
    iconName: 'ConciergeBell',
    category: 'basic',
    categoryLabel: 'Basic Facilities',
  },
  {
    id: 'air-conditioning',
    title: 'Air Conditioning',
    description:
      'Individually climate-controlled air conditioning in every room ensuring a cool, pleasant atmosphere.',
    iconName: 'AirVent',
    category: 'basic',
    categoryLabel: 'Basic Facilities',
  },
  {
    id: 'power-backup',
    title: 'Power Backup',
    description:
      '24/7 dedicated generator power backup ensuring continuous lighting, ventilation, and device charging.',
    iconName: 'Zap',
    category: 'basic',
    categoryLabel: 'Basic Facilities',
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping',
    description:
      'Professional daily room cleaning, bed linen changes, sanitized bath upkeep, and trash removal.',
    iconName: 'Sparkles',
    category: 'basic',
    categoryLabel: 'Basic Facilities',
  },
  {
    id: 'guest-parking',
    title: 'Guest Parking',
    description:
      'Secure on-site vehicle parking facility providing convenient and safe parking for registered guests.',
    iconName: 'Car',
    category: 'basic',
    categoryLabel: 'Basic Facilities',
  },

  // 2. General Services
  {
    id: 'multilingual-staff',
    title: 'Multilingual Staff',
    description:
      'Courteous front-line team fluent in Telugu, Hindi, and English to assist all travelers smoothly.',
    iconName: 'Globe2',
    category: 'general',
    categoryLabel: 'General Services',
  },
  {
    id: 'luggage-assistance',
    title: 'Luggage Assistance',
    description:
      'Attentive luggage handling and secure storage support available during arrival and departure.',
    iconName: 'Luggage',
    category: 'general',
    categoryLabel: 'General Services',
  },
  {
    id: 'caretaker',
    title: 'Caretaker',
    description:
      'Dedicated on-site property caretaker available 24/7 for prompt assistance and facility coordination.',
    iconName: 'UserCheck',
    category: 'general',
    categoryLabel: 'General Services',
  },

  // 3. Health and Wellness
  {
    id: 'first-aid',
    title: 'First-aid Services',
    description:
      'Equipped medical first-aid kit on-site with rapid support and coordination for emergency medical care.',
    iconName: 'HeartPulse',
    category: 'health',
    categoryLabel: 'Health and Wellness',
  },

  // 4. Room Amenities
  {
    id: 'mineral-water',
    title: 'Mineral Water',
    description:
      'Complimentary packaged drinking mineral water bottles replenished daily in every guest room.',
    iconName: 'Droplets',
    category: 'room',
    categoryLabel: 'Room Amenities',
  },
  {
    id: 'toiletries',
    title: 'Toiletries',
    description:
      'Complimentary personal care bath kit with fresh soap, shampoo, and sanitized essentials.',
    iconName: 'Bath',
    category: 'room',
    categoryLabel: 'Room Amenities',
  },
  {
    id: 'work-desk',
    title: 'Work Desk',
    description:
      'Ergonomic work desk and chair setup with convenient charging outlets for corporate and remote work.',
    iconName: 'Laptop',
    category: 'room',
    categoryLabel: 'Room Amenities',
  },

  // 5. Safety and Security
  {
    id: 'cctv',
    title: 'CCTV Surveillance',
    description:
      'Continuous 24/7 closed-circuit camera monitoring across corridors, entrances, and common areas.',
    iconName: 'ShieldCheck',
    category: 'safety',
    categoryLabel: 'Safety and Security',
  },
  {
    id: 'fire-extinguishers',
    title: 'Fire Extinguishers',
    description:
      'Certified fire safety extinguishers strategically installed on every floor and common hallway.',
    iconName: 'Flame',
    category: 'safety',
    categoryLabel: 'Safety and Security',
  },

  // 6. Common Area
  {
    id: 'reception',
    title: '24/7 Reception',
    description:
      'Welcoming round-the-clock front desk providing quick check-in, express check-out, and city guidance.',
    iconName: 'Clock',
    category: 'common',
    categoryLabel: 'Common Area',
  },
];

// Approved Nearby Attractions (STRICTLY the 5 approved in document!)
export const referenceAttractionDistances: Record<string, string> = {
  'charminar': '6.8 km',
  'salar-jung': '6.2 km',
  'nehru-zoo': '3.5 km',
  'birla-mandir': '8.5 km',
  'buddha-statue': '8.6 km',
};

export const approvedAttractions: AttractionItem[] = [
  {
    id: 'charminar',
    name: 'Charminar',
    distanceKm: undefined,
    distanceDisplay: '',
    showDistance: false,
    tagline: 'An iconic symbol of Hyderabad’s rich history and vibrant bazaars.',
    description:
      'Built in 1591, this monumental four-minaret landmark stands in the heart of old Hyderabad, surrounded by the bustling Laad Bazaar famous for bangles and authentic pearl shops.',
    image:
      '/assets/hotel-assets/attractions/charminar.jpg',
    locationArea: 'Old City, Hyderabad',
    isApproved: true,
  },
  {
    id: 'salar-jung',
    name: 'Salar Jung Museum',
    distanceKm: undefined,
    distanceDisplay: '',
    showDistance: false,
    tagline: 'Home to one of the world’s largest one-man collections of art and antiques.',
    description:
      'Located on the southern bank of the Musi River, this prestigious national museum features rare jade carvings, European marble sculptures, Persian carpets, and the renowned Veiled Rebecca.',
    image:
      '/assets/hotel-assets/attractions/salar-jung-museum.jpg',
    locationArea: 'Darusshifa, Hyderabad',
    isApproved: true,
  },
  {
    id: 'nehru-zoo',
    name: 'Nehru Zoological Park',
    distanceKm: undefined,
    distanceDisplay: '',
    showDistance: false,
    tagline: 'One of India’s premier zoological reserves spanning over 380 acres.',
    description:
      'A verdant wildlife park featuring diverse wildlife, safari tours, nocturnal animal house, and a natural lake sanctuary. One of the closest major family attractions to Lotus Grand.',
    image:
      'https://kubyquytyviyigumtnbc.supabase.co/storage/v1/object/public/hotel-assets/rooms/chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png',
    locationArea: 'Bahadurpura, Hyderabad',
    isApproved: true,
  },
  {
    id: 'birla-mandir',
    name: 'Birla Mandir',
    distanceKm: undefined,
    distanceDisplay: '',
    showDistance: false,
    tagline: 'A majestic white marble temple overlooking the Hyderabad city skyline.',
    description:
      'Perched on the 280-foot high Naubat Pahad hill, this immaculate Rajasthani white marble temple offers serene spiritual ambiance and sweeping panoramic views across the city.',
    image:
      '/assets/hotel-assets/attractions/birla-mandir.jpg',
    locationArea: 'Naubat Pahad, Hyderabad',
    isApproved: true,
  },
  {
    id: 'buddha-statue',
    name: 'Buddha Statue, Hussain Sagar',
    distanceKm: undefined,
    distanceDisplay: '',
    showDistance: false,
    tagline: 'A scenic lake with the world’s tallest monolithic granite Buddha statue.',
    description:
      'Standing majestically on the Gibraltar Rock in the center of Hussain Sagar Lake, this 18-meter statue is accessible by peaceful motorboat rides from Lumbini Park.',
    image:
      '/assets/hotel-assets/attractions/buddha-statue-hussain-sagar.jpg',
    locationArea: 'Hussain Sagar, Hyderabad',
    isApproved: true,
  },
];

// Gallery items categorized strictly into Rooms, Property, Dining, and Hyderabad
export const galleryItems: GalleryItem[] = [
  // 1. Property
  {
    id: 'g-prop-1',
    title: 'Hotel Exterior & Main Facade at Dusk',
    category: 'Property',
    image:
      '/assets/hotel-assets/property/img_1_hyderabad-super-townhouse-lotus-grand-photo-1.jpg',
    alt: 'Lotus Grand Hotel exterior in Kothapet at dusk',
  },
  {
    id: 'g-prop-2',
    title: 'Warm Lobby & Guest Lounge',
    category: 'Property',
    image:
      '/assets/hotel-assets/property/img_5_hyderabad-super-townhouse-lotus-grand-photo-5.jpg',
    alt: 'Welcoming lobby lounge with comfortable guest seating',
  },
  {
    id: 'g-prop-3',
    title: '24/7 Front Desk & Reception Area',
    category: 'Property',
    image:
      '/assets/hotel-assets/property/img_4_hyderabad-super-townhouse-lotus-grand-photo-4.jpg',
    alt: 'Hotel front desk counter with hospitable 24/7 staff',
  },
  {
    id: 'g-prop-4',
    title: 'Well-Lit Guest Corridor & Access',
    category: 'Property',
    image:
      '/assets/hotel-assets/property/img_6_hyderabad-super-townhouse-lotus-grand-photo-6.jpg',
    alt: 'Secure carpeted hallway corridor with CCTV security monitoring',
  },
  {
    id: 'g-prop-5',
    title: 'Evening Property View',
    category: 'Property',
    image:
      '/assets/hotel-assets/property/img_2_hyderabad-super-townhouse-lotus-grand-photo-2.jpg',
    alt: 'Lotus Grand building architecture and entrance in Kothapet',
  },

  // 2. Rooms
  {
    id: 'g-room-1',
    title: 'Deluxe Queen Bed Room',
    category: 'Rooms',
    image:
      '/assets/hotel-assets/rooms/img_10_hyderabad-super-townhouse-lotus-grand-photo-10.jpg',
    alt: 'Deluxe comfortable hotel room with plush bedding and warm lighting',
  },
  {
    id: 'g-room-2',
    title: 'Twin Comfort Accommodation',
    category: 'Rooms',
    image:
      '/assets/hotel-assets/rooms/img_11_hyderabad-super-townhouse-lotus-grand-photo-11.jpg',
    alt: 'Twin bed room layout with clean linens and bedside lamps',
  },
  {
    id: 'g-room-3',
    title: 'Executive Workstation & Seating',
    category: 'Rooms',
    image:
      '/assets/hotel-assets/rooms/img_13_hyderabad-super-townhouse-lotus-grand-photo-13.jpg',
    alt: 'Executive room study desk and armchair for business travelers',
  },
  {
    id: 'g-room-4',
    title: 'Fresh Linens & Bathroom Amenities',
    category: 'Rooms',
    image:
      '/assets/hotel-assets/rooms/img_14_hyderabad-super-townhouse-lotus-grand-photo-14.jpg',
    alt: 'Complimentary bathroom toiletries, sanitized towels and amenities',
  },

  // 3. Dining
  {
    id: 'g-dine-1',
    title: 'In-House Dining Area',
    category: 'Dining',
    image:
      '/assets/hotel-assets/dining/img_20_hyderabad-super-townhouse-lotus-grand-photo-20.jpg',
    alt: 'Clean and pleasant dining room table arrangement',
  },
  {
    id: 'g-dine-2',
    title: 'Freshly Prepared Culinary Dishes',
    category: 'Dining',
    image:
      '/assets/hotel-assets/dining/img_21_hyderabad-super-townhouse-lotus-grand-photo-21.jpg',
    alt: 'Delicious local delicacies and refreshments served to hotel guests',
  },
  {
    id: 'g-dine-3',
    title: 'Table Service & Refreshments',
    category: 'Dining',
    image:
      '/assets/hotel-assets/dining/img_22_hyderabad-super-townhouse-lotus-grand-photo-22.jpg',
    alt: 'Evening dining setup for hotel dinner service',
  },

  // 4. Hyderabad (Iconic Hyderabad Attractions)
  {
    id: 'g-hyd-1',
    title: 'Historic Charminar',
    category: 'Hyderabad',
    image:
      '/assets/hotel-assets/attractions/charminar.jpg',
    alt: 'The iconic 16th-century Charminar monument in Old City Hyderabad',
  },
  {
    id: 'g-hyd-2',
    title: 'Salar Jung Museum Artifacts',
    category: 'Hyderabad',
    image:
      '/assets/hotel-assets/attractions/salar-jung-museum.jpg',
    alt: 'Salar Jung Museum classic art collection and historical exhibits',
  },
  {
    id: 'g-hyd-3',
    title: 'Nehru Zoological Park',
    category: 'Hyderabad',
    image:
      'https://kubyquytyviyigumtnbc.supabase.co/storage/v1/object/public/hotel-assets/rooms/chatgpt-image-sep-10--2026--12_44_40-am-1788981319343.png',
    alt: 'Nehru Zoological Park 380-acre wildlife sanctuary in Bahadurpura',
  },
  {
    id: 'g-hyd-4',
    title: 'Birla Mandir White Marble Temple',
    category: 'Hyderabad',
    image:
      '/assets/hotel-assets/attractions/birla-mandir.jpg',
    alt: 'Birla Mandir temple carved from pure Rajasthani white marble on Naubat Pahad',
  },
  {
    id: 'g-hyd-5',
    title: 'Buddha Statue at Hussain Sagar',
    category: 'Hyderabad',
    image:
      '/assets/hotel-assets/attractions/buddha-statue-hussain-sagar.jpg',
    alt: 'Monolithic granite Buddha statue standing in the center of Hussain Sagar Lake',
  },
];

// Guest Hospitality & Satisfaction Standards (No fictional reviews or fabricated names; strictly factual)
export const guestHospitalityCommitments: GuestCommitmentItem[] = [
  {
    id: 'ghc-1',
    title: 'Clean & Sanitized Accommodations',
    subtitle: 'Meticulous Daily Upkeep',
    description:
      'Every room is thoroughly prepared with sanitized linens, fresh towels, sanitized surfaces, and functional amenities before your arrival.',
    badge: 'Hygiene & Cleanliness',
  },
  {
    id: 'ghc-2',
    title: '24/7 Front Desk Hospitality',
    subtitle: 'Always Here to Help',
    description:
      'Our on-site reception team in Kothapet is staffed around the clock to ensure swift check-ins, direct enquiries, and attentive guest service.',
    badge: 'Round-the-Clock Care',
  },
  {
    id: 'ghc-3',
    title: 'Prime Hyderabad Connectivity',
    subtitle: 'Effortless City Access',
    description:
      'Ideally located in Kothapet / Saroornagar with seamless transit to metro stations, OMNI Hospitals, bustling markets, and historical landmarks.',
    badge: 'Central Location',
  },
];

// Authentic Verified Google Customer Reviews
export const testimonialsData: TestimonialItem[] = [
  {
    id: 'rev-1',
    guestName: 'Prakash Garg',
    timeAgo: 'a year ago',
    source: 'Google',
    rating: 5,
    travelerType: 'Business ❘ Solo',
    quote:
      'I booked this place at last minute when I didn’t find any other option nearby and it came out to be very comfortable stay. The staff is quite humble and helping. Rooms and washrooms are very much clean.',
    ratingsBreakdown: {
      rooms: 4.0,
      service: 5.0,
      location: 5.0,
    },
    highlights: 'Luxury · Quiet',
  },
  {
    id: 'rev-2',
    guestName: 'Sandeep Pollaswar',
    timeAgo: '7 months ago',
    source: 'Google',
    rating: 5,
    travelerType: 'Family Stay',
    quote:
      'I visited here the hotel was very clean and neat. I stayed here with my family for 4 days, I feel like my home stay. Staff also very kind and nice people.',
    highlights: 'Family Friendly · Clean & Neat',
  },
  {
    id: 'rev-3',
    guestName: 'Urmila .G',
    timeAgo: 'a year ago',
    source: 'Google',
    rating: 5,
    quote:
      'I recently stayed at this hotel, and it exceeded my expectations in every way! The moment I walked in, I was impressed by the cleanliness and welcoming ambiance. The check-in process was smooth, and the staff was courteous and attentive. The room was spacious, well-furnished, and had all the amenities I needed. The attention to detail was noticeable, from the fresh linens to the neatly arranged space. I especially appreciated how quiet and peaceful the environment was, allowing me to fully relax.',
    highlights: 'Quiet & Peaceful · Welcoming Ambiance',
  },
  {
    id: 'rev-4',
    guestName: 'Ayan Dey',
    timeAgo: '5 months ago',
    source: 'Google',
    rating: 4,
    travelerType: 'Holiday ❘ Couple',
    quote:
      'Stayed for 3 nights. In this locality I hardly think any other property will be good in this price range. The rooms are spacious and clean. The staff is friendly and helpful. Would visit again.',
    ratingsBreakdown: {
      rooms: 5.0,
      service: 4.0,
      location: 4.0,
    },
    highlights: 'Quiet · Great value',
  },
];

// Why choose us items for About page
export const whyChooseUsData = [
  {
    title: 'Warm Hospitality',
    description:
      'Experience genuine care and a friendly atmosphere, because your comfort and convenience mean everything to our dedicated team.',
    iconName: 'HeartHandshake',
  },
  {
    title: 'Prime Location',
    description:
      'Located in Kothapet / Saroornagar with easy access to metro stations, business hubs, OMNI Hospitals, shopping, and Hyderabad’s iconic landmarks.',
    iconName: 'MapPin',
  },
  {
    title: 'Personalized Service',
    description:
      'As a guest-focused hotel, we go the extra mile to understand your requirements and make your Hyderabad stay pleasant and hassle-free.',
    iconName: 'Users',
  },
];

// Highlights bar items on homepage
export const homeHighlights = [
  {
    title: 'Prime Location in Kothapet',
    subtitle: 'Near metro, hospitals & transit',
    iconName: 'MapPin',
  },
  {
    title: '24/7 Front Desk',
    subtitle: 'Round-the-clock check-in support',
    iconName: 'Clock',
  },
  {
    title: 'Guest-Focused Service',
    subtitle: 'Courteous staff & clean rooms',
    iconName: 'Users',
  },
  {
    title: 'Trusted by Travelers',
    subtitle: 'Safe, secure & peaceful stay',
    iconName: 'ShieldCheck',
  },
];
