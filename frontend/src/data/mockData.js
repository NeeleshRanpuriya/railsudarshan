export const STATIONS = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus (Mumbai)', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Junction (Kolkata)', city: 'Kolkata', state: 'West Bengal' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'PRYJ', name: 'Prayagraj Junction', city: 'Prayagraj', state: 'Uttar Pradesh' },
  { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', city: 'Mughalsarai', state: 'Uttar Pradesh' },
  { code: 'GAYA', name: 'Gaya Junction', city: 'Gaya', state: 'Bihar' },
  { code: 'ST', name: 'Surat', city: 'Surat', state: 'Gujarat' },
  { code: 'BRC', name: 'Vadodara Junction', city: 'Vadodara', state: 'Gujarat' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra' },
];

export const TRAINS = [
  {
    number: '12301',
    name: 'Howrah Rajdhani Express (via Gaya)',
    from: 'HWH',
    to: 'NDLS',
    departureTime: '16:50',
    arrivalTime: '10:05',
    duration: '17h 15m',
    classes: ['1A', '2A', '3A'],
    fares: { '1A': 4850, '2A': 3120, '3A': 2280 },
    availableSeats: { '1A': 12, '2A': 28, '3A': 64 },
    stops: [
      { code: 'HWH', name: 'Howrah Jn', arrival: 'Source', departure: '16:50', day: 1, dist: 0, status: 'passed' },
      { code: 'ASN', name: 'Asansol Jn', arrival: '18:57', departure: '19:00', day: 1, dist: 200, status: 'passed' },
      { code: 'DHN', name: 'Dhanbad Jn', arrival: '19:50', departure: '19:55', day: 1, dist: 259, status: 'current' },
      { code: 'GAYA', name: 'Gaya Jn', arrival: '22:19', departure: '22:22', day: 1, dist: 459, status: 'upcoming' },
      { code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', arrival: '00:45', departure: '00:55', day: 2, dist: 664, status: 'upcoming' },
      { code: 'PRYJ', name: 'Prayagraj Jn', arrival: '02:43', departure: '02:45', day: 2, dist: 816, status: 'upcoming' },
      { code: 'CNB', name: 'Kanpur Central', arrival: '04:50', departure: '04:55', day: 2, dist: 1011, status: 'upcoming' },
      { code: 'NDLS', name: 'New Delhi', arrival: '10:05', departure: 'Destination', day: 2, dist: 1451, status: 'upcoming' },
    ]
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani Express',
    from: 'MMCT',
    to: 'NDLS',
    departureTime: '17:00',
    arrivalTime: '08:32',
    duration: '15h 32m',
    classes: ['1A', '2A', '3A'],
    fares: { '1A': 4680, '2A': 3010, '3A': 2190 },
    availableSeats: { '1A': 8, '2A': 34, '3A': 82 },
    stops: [
      { code: 'MMCT', name: 'Mumbai Central', arrival: 'Source', departure: '17:00', day: 1, dist: 0, status: 'passed' },
      { code: 'ST', name: 'Surat', arrival: '19:32', departure: '19:37', day: 1, dist: 263, status: 'passed' },
      { code: 'BRC', name: 'Vadodara Jn', arrival: '21:06', departure: '21:16', day: 1, dist: 393, status: 'current' },
      { code: 'RTM', name: 'Ratlam Jn', arrival: '00:25', departure: '00:28', day: 2, dist: 654, status: 'upcoming' },
      { code: 'KOTA', name: 'Kota Jn', arrival: '03:15', departure: '03:20', day: 2, dist: 920, status: 'upcoming' },
      { code: 'NDLS', name: 'New Delhi', arrival: '08:32', departure: 'Destination', day: 2, dist: 1386, status: 'upcoming' },
    ]
  },
  {
    number: '22436',
    name: 'Vande Bharat Express',
    from: 'NDLS',
    to: 'BSB',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    classes: ['CC', 'EC'],
    fares: { 'CC': 1750, 'EC': 3300 },
    availableSeats: { 'CC': 42, 'EC': 16 },
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: 'Source', departure: '06:00', day: 1, dist: 0, status: 'passed' },
      { code: 'CNB', name: 'Kanpur Central', arrival: '10:08', departure: '10:10', day: 1, dist: 440, status: 'current' },
      { code: 'PRYJ', name: 'Prayagraj Jn', arrival: '12:08', departure: '12:10', day: 1, dist: 635, status: 'upcoming' },
      { code: 'BSB', name: 'Varanasi Jn', arrival: '14:00', departure: 'Destination', day: 1, dist: 759, status: 'upcoming' },
    ]
  },
  {
    number: '12621',
    name: 'Tamil Nadu Express',
    from: 'MAS',
    to: 'NDLS',
    departureTime: '22:00',
    arrivalTime: '06:30',
    duration: '32h 30m',
    classes: ['1A', '2A', '3A', 'SL'],
    fares: { '1A': 5200, '2A': 3280, '3A': 2340, 'SL': 840 },
    availableSeats: { '1A': 6, '2A': 22, '3A': 50, 'SL': 110 },
    stops: [
      { code: 'MAS', name: 'MGR Chennai Central', arrival: 'Source', departure: '22:00', day: 1, dist: 0, status: 'passed' },
      { code: 'BZA', name: 'Vijayawada Jn', arrival: '03:55', departure: '04:05', day: 2, dist: 431, status: 'passed' },
      { code: 'WL', name: 'Warangal', arrival: '06:50', departure: '06:52', day: 2, dist: 638, status: 'passed' },
      { code: 'BPQ', name: 'Balharshah', arrival: '10:50', departure: '10:55', day: 2, dist: 881, status: 'current' },
      { code: 'NGP', name: 'Nagpur Jn', arrival: '13:50', departure: '13:55', day: 2, dist: 1089, status: 'upcoming' },
      { code: 'BPL', name: 'Bhopal Jn', arrival: '20:10', departure: '20:20', day: 2, dist: 1479, status: 'upcoming' },
      { code: 'VGLJ', name: 'VGL Jhansi Jn', arrival: '00:26', departure: '00:31', day: 3, dist: 1771, status: 'upcoming' },
      { code: 'GWL', name: 'Gwalior Jn', arrival: '01:32', departure: '01:34', day: 3, dist: 1869, status: 'upcoming' },
      { code: 'AGC', name: 'Agra Cantt', arrival: '03:15', departure: '03:17', day: 3, dist: 1987, status: 'upcoming' },
      { code: 'NDLS', name: 'New Delhi', arrival: '06:30', departure: 'Destination', day: 3, dist: 2182, status: 'upcoming' },
    ]
  },
  {
    number: '12566',
    name: 'Bihar Sampark Kranti Express',
    from: 'NDLS',
    to: 'PNBE',
    departureTime: '13:00',
    arrivalTime: '05:20',
    duration: '16h 20m',
    classes: ['2A', '3A', 'SL'],
    fares: { '2A': 2250, '3A': 1580, 'SL': 590 },
    availableSeats: { '2A': 14, '3A': 48, 'SL': 95 },
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: 'Source', departure: '13:00', day: 1, dist: 0, status: 'passed' },
      { code: 'CNB', name: 'Kanpur Central', arrival: '18:10', departure: '18:15', day: 1, dist: 440, status: 'current' },
      { code: 'LKO', name: 'Lucknow Charbagh', arrival: '19:40', departure: '19:50', day: 1, dist: 512, status: 'upcoming' },
      { code: 'GKP', name: 'Gorakhpur Jn', arrival: '00:50', departure: '01:00', day: 2, dist: 782, status: 'upcoming' },
      { code: 'CPR', name: 'Chhapra Jn', arrival: '03:40', departure: '03:45', day: 2, dist: 962, status: 'upcoming' },
      { code: 'PNBE', name: 'Patna Jn', arrival: '05:20', departure: 'Destination', day: 2, dist: 1032, status: 'upcoming' },
    ]
  },
  {
    number: '12934',
    name: 'Karnavati Superfast Express',
    from: 'ADI',
    to: 'MMCT',
    departureTime: '05:00',
    arrivalTime: '12:35',
    duration: '7h 35m',
    classes: ['CC', '2S'],
    fares: { 'CC': 960, '2S': 240 },
    availableSeats: { 'CC': 62, '2S': 140 },
    stops: [
      { code: 'ADI', name: 'Ahmedabad Jn', arrival: 'Source', departure: '05:00', day: 1, dist: 0, status: 'passed' },
      { code: 'ND', name: 'Nadiad Jn', arrival: '05:40', departure: '05:42', day: 1, dist: 46, status: 'passed' },
      { code: 'ANND', name: 'Anand Jn', arrival: '05:58', departure: '06:00', day: 1, dist: 65, status: 'passed' },
      { code: 'BRC', name: 'Vadodara Jn', arrival: '06:33', departure: '06:38', day: 1, dist: 100, status: 'current' },
      { code: 'ST', name: 'Surat', arrival: '08:13', departure: '08:18', day: 1, dist: 230, status: 'upcoming' },
      { code: 'BVI', name: 'Borivali', arrival: '11:47', departure: '11:49', day: 1, dist: 463, status: 'upcoming' },
      { code: 'MMCT', name: 'Mumbai Central', arrival: '12:35', departure: 'Destination', day: 1, dist: 493, status: 'upcoming' },
    ]
  }
];

export const OCCUPATIONS = [
  'Doctor',
  'Police',
  'Student',
  'Nurse',
  'Engineer',
  'Teacher',
  'Homemaker',
  'Business',
  'Government Employee'
];

export const STATION_RESTAURANTS = {
  'NDLS': [
    {
      id: 'ndls_1',
      name: 'Comesum Rail Cafe',
      rating: 4.5,
      deliveryTime: '20-25 mins',
      cuisine: 'North Indian, Chinese & Combos',
      fssai: '10014011002341',
      menu: [
        { id: 'c1', name: 'Executive Veg Deluxe Thali (Paneer, Dal Makhani, 2 Parathas, Jeera Rice, Gulab Jamun)', price: 280, veg: true },
        { id: 'c2', name: 'Railway Dum Biryani with Raita & Salan', price: 260, veg: false },
        { id: 'c3', name: 'Amritsari Chole Kulche Combo (2 Kulche)', price: 180, veg: true },
        { id: 'c4', name: 'Masala Chai Flask (Serves 2) + 2 Samosas', price: 110, veg: true },
      ]
    },
    {
      id: 'ndls_2',
      name: 'Saravana Bhavan Express',
      rating: 4.7,
      deliveryTime: '15-20 mins',
      cuisine: 'Authentic South Indian Pure Veg',
      fssai: '10012011000984',
      menu: [
        { id: 's1', name: 'Special Mini Ghee Podi Idli (14 pcs) with 3 Chutneys & Sambar', price: 190, veg: true },
        { id: 's2', name: 'Masala Dosa with Filter Coffee Combo', price: 210, veg: true },
        { id: 's3', name: 'Curd Rice with South Indian Pickle & Fried Chillies', price: 140, veg: true },
      ]
    }
  ],
  'CNB': [
    {
      id: 'cnb_1',
      name: 'Kanpur Biryani Mahal & Awadhi Express',
      rating: 4.6,
      deliveryTime: '20 mins',
      cuisine: 'Awadhi, Mughlai & North Indian',
      fssai: '12718001000452',
      menu: [
        { id: 'kb1', name: 'Shahi Murgh Dum Biryani with Burani Raita', price: 290, veg: false },
        { id: 'kb2', name: 'Special Shahi Paneer Thali with 3 Tandoori Roti & Pulao', price: 240, veg: true },
        { id: 'kb3', name: 'Famous Thaggu Ke Laddu Box (4 Pcs)', price: 160, veg: true },
      ]
    }
  ],
  'PRYJ': [
    {
      id: 'pryj_1',
      name: 'Sangam Rasoi & Haldiram Snacks',
      rating: 4.4,
      deliveryTime: '15 mins',
      cuisine: 'Pure Veg North Indian & Sweets',
      fssai: '12719002000311',
      menu: [
        { id: 'pr1', name: 'Jain Special Thali (No Onion, No Garlic)', price: 250, veg: true },
        { id: 'pr2', name: 'Rajma Chawal Bowl with Boondi Raita', price: 170, veg: true },
        { id: 'pr3', name: 'Allahabadi Gujiya & Rasmalai Duo', price: 150, veg: true },
      ]
    }
  ],
  'BRC': [
    {
      id: 'brc_1',
      name: 'Jagdish Farsan & Gujarati Thali',
      rating: 4.8,
      deliveryTime: '15 mins',
      cuisine: 'Traditional Gujarati & Snacks',
      fssai: '10716003000889',
      menu: [
        { id: 'jf1', name: 'Royal Kathiyawadi Thali (Sev Tameta, Baingan Bharta, 3 Rotla, Khichdi & Buttermilk)', price: 290, veg: true },
        { id: 'jf2', name: 'Baroda Famous Nylon Khaman Dhokla (250g)', price: 120, veg: true },
        { id: 'jf3', name: 'Masala Chaas & Thepla Pack (4 Pcs)', price: 110, veg: true },
      ]
    }
  ],
  'BSB': [
    {
      id: 'bsb_1',
      name: 'Kashi Vishwanath Annapurna Rasoi',
      rating: 4.9,
      deliveryTime: '20 mins',
      cuisine: 'Satvik Pure Veg & Banarasi Delicacies',
      fssai: '12720005000781',
      menu: [
        { id: 'bs1', name: 'Banarasi Dum Aloo Puri Combo (4 Puris with Kheer)', price: 210, veg: true },
        { id: 'bs2', name: 'Satvik Mahathali with Malai Kofta & Kheer', price: 280, veg: true },
        { id: 'bs3', name: 'Banarasi Malai Lassi (Clay Matka 350ml)', price: 90, veg: true },
      ]
    }
  ]
};

export const ONBOARD_DOCTORS = [
  { id: 'doc_1', name: 'Dr. Priya Sharma (MD, Cardiology)', profession: 'Doctor', coach: 'B2', berth: 24, mobile: '+91 98112 45890', isVerified: true, trainNumber: '11058', travelDate: '2026-11-05', boardingStation: 'AGC', alightingStation: 'GWL' },
  { id: 'doc_2', name: 'Dr. Anand Verma (General Physician)', profession: 'Doctor', coach: 'A1', berth: 11, mobile: '+91 94331 87210', isVerified: true, trainNumber: '11057', travelDate: '2026-11-05', boardingStation: 'BPL', alightingStation: 'GWL' },
  { id: 'doc_3', name: 'Nurse Sunita K. (Emergency Trauma Certified)', profession: 'Nurse', coach: 'B4', berth: 42, mobile: '+91 88762 33419', isVerified: true, trainNumber: '11058', travelDate: '2026-11-05', boardingStation: 'GWL', alightingStation: 'NDLS' },
  { id: 'doc_4', name: 'Dr. Amit Sharma (Emergency Medicine)', profession: 'Doctor', coach: 'A2', berth: 18, mobile: '+91 90000 11223', isVerified: true, trainNumber: '11057', travelDate: '2026-11-05', boardingStation: 'NGP', alightingStation: 'NDLS' },
];

export const EMERGENCY_NUMBERS = [
  { name: 'All-India Railway Helpline (One-Stop)', number: '139', note: 'Medical, Security, Complaints, PNR enquiry' },
  { name: 'National Emergency SOS', number: '112', note: 'Police, Fire, Ambulance 24x7' },
  { name: 'Women Safety In Distress', number: '1091', note: 'Dedicated Women Helpline' },
  { name: 'National Commission for Women (NCW)', number: '7827170170', note: '24/7 Helpline for Women in distress' },
  { name: 'Railway Protection Force (RPF) Security', number: '182', note: 'Onboard security patrol' },
  { name: 'Government Railway Police (GRP)', number: '1512', note: 'Direct station police squad' },
];
