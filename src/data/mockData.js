export const initialTrucks = [
  {
    id: 'truck-a',
    name: 'Truck A (26ft Box Truck)',
    status: 'Busy',
    driverName: 'Marcus Vance',
    licensePlate: 'TX-72A-980'
  },
  {
    id: 'truck-b',
    name: 'Truck B (26ft Box Truck)',
    status: 'Busy',
    driverName: 'Carlos Santini',
    licensePlate: 'TX-88B-112'
  },
  {
    id: 'truck-c',
    name: 'Truck C (20ft Box Truck)',
    status: 'Available',
    driverName: 'Daveed Miller',
    licensePlate: 'TX-15C-409'
  },
  {
    id: 'truck-d',
    name: 'Truck D (16ft Sprinter)',
    status: 'Available',
    driverName: 'Leo Kowalski',
    licensePlate: 'TX-90D-552'
  },
  {
    id: 'truck-e',
    name: 'Truck E (26ft Box Truck)',
    status: 'Busy',
    driverName: 'Tyrone Jackson',
    licensePlate: 'TX-33E-667'
  }
];

export const initialJobs = [
  {
    id: 'job-1',
    clientName: 'Sarah Jenkins',
    status: 'Scheduled',
    origin: '782 Oak Ave, Austin, TX',
    destination: '1405 Cypress Ln, Austin, TX',
    estimateAmount: 1450,
    revenue: 1450,
    truckId: 'truck-a',
    date: '2026-07-07', // Today (assuming current date is 2026-07-07 as per metadata)
    items: '3 Bedroom House, Upright Piano, 30 Boxes',
    phone: '(512) 555-0143',
    email: 'sjenkins@gmail.com',
    notes: 'Fragile: Grandfather clock in dining room. Wrap piano with triple blankets.'
  },
  {
    id: 'job-2',
    clientName: 'Robert Dow',
    status: 'Completed',
    origin: '204 Whispering Pines, West Lake, TX',
    destination: '9910 Hillside Dr, West Lake, TX',
    estimateAmount: 3200,
    revenue: 3450, // Extra hourly charges
    truckId: 'truck-b',
    date: '2026-07-06', // Yesterday
    items: '5 Bedroom Estate, Heavy safe, Antique mirrors',
    phone: '(512) 555-0199',
    email: 'robbie.d@outlook.com',
    notes: 'Completed successfully. Client gave $250 tip to the crew.'
  },
  {
    id: 'job-3',
    clientName: 'Emily Rodriguez',
    status: 'Estimate Sent',
    origin: '3104 South Congress #412, Austin, TX',
    destination: '809 Brodie Ln, Sunset Valley, TX',
    estimateAmount: 950,
    revenue: 950,
    truckId: null,
    date: '2026-07-09',
    items: '1 Bedroom Apt, L-Sectional sofa, TV console',
    phone: '(512) 555-0211',
    email: 'emily.rod@gmail.com',
    notes: 'Waiting for client approval on travel fee. Elevator booking confirmed for 9 AM.'
  },
  {
    id: 'job-4',
    clientName: 'James Chen',
    status: 'New Inquiry',
    origin: '1202 Rio Grande St, Austin, TX',
    destination: '4409 Spicewood Springs, Austin, TX',
    estimateAmount: 1800,
    revenue: 1800,
    truckId: null,
    date: '2026-07-10',
    items: '2 Bedroom Condo, Office desk, Peloton bike',
    phone: '(512) 555-0302',
    email: 'jchen_design@yahoo.com',
    notes: 'Self-packing boxes. Need full loading and assembly service.'
  },
  {
    id: 'job-5',
    clientName: 'Amanda Brooks',
    status: 'Scheduled',
    origin: '505 W 15th St, Austin, TX',
    destination: '1200 San Jacinto Blvd, Austin, TX',
    estimateAmount: 2100,
    revenue: 2100,
    truckId: 'truck-e',
    date: '2026-07-08', // Tomorrow
    items: '3 Bedroom Townhouse, Double-door fridge, Treadmill',
    phone: '(512) 555-0187',
    email: 'abrooks@realestate.com',
    notes: 'Tight staircase at destination. Remove doors of fridge prior to carrying.'
  },
  {
    id: 'job-6',
    clientName: 'David Kim',
    status: 'Completed',
    origin: '1004 Red River St, Austin, TX',
    destination: '702 East Cesar Chavez, Austin, TX',
    estimateAmount: 1100,
    revenue: 1100,
    truckId: 'truck-a',
    date: '2026-07-05',
    items: '2 Bedroom Apt, Dining table + 6 chairs, 20 boxes',
    phone: '(512) 555-0771',
    email: 'dkim.tech@gmail.com',
    notes: 'All items delivered in good condition. Handled by Marcus and helper.'
  },
  {
    id: 'job-7',
    clientName: 'Sophia Loren',
    status: 'Scheduled',
    origin: '8912 Balcones Drive, Austin, TX',
    destination: '1103 West Avenue, Austin, TX',
    estimateAmount: 2850,
    revenue: 2850,
    truckId: 'truck-b',
    date: '2026-07-08', // Tomorrow
    items: '4 Bedroom House, Marble dining table, Outdoor grill',
    phone: '(512) 555-0902',
    email: 'sloren@gmail.com',
    notes: 'High value items. Custom crating required for marble dining tabletop.'
  },
  {
    id: 'job-8',
    clientName: 'Marcus Aurelius Logistics',
    status: 'Completed',
    origin: '1900 Wells Branch Pkwy, Austin, TX',
    destination: '3020 Industrial Terr, Austin, TX',
    estimateAmount: 8500,
    revenue: 9200, // Commercial job, extra boxes and shrinkwrap
    truckId: 'truck-e',
    date: '2026-07-03',
    items: 'Office Move: 15 desks, 15 file cabinets, server rack, 80 crates',
    phone: '(512) 555-0010',
    email: 'dispatch@aureliuslogistics.com',
    notes: 'Certificate of Insurance (COI) required by building managers at both sites.'
  },
  {
    id: 'job-9',
    clientName: 'Dr. Elizabeth Blackwell',
    status: 'Estimate Sent',
    origin: '1601 Trinity St (Dell Med), Austin, TX',
    destination: '9204 Medical Parkway, Austin, TX',
    estimateAmount: 2400,
    revenue: 2400,
    truckId: null,
    date: '2026-07-11',
    items: 'Medical office furniture, examination table, 40 archive boxes',
    phone: '(512) 555-0812',
    email: 'eblackwell@medclinic.org',
    notes: 'Delicate equipment. Needs special care with air-ride suspension if possible.'
  },
  {
    id: 'job-10',
    clientName: 'Thomas Jefferson High School',
    status: 'New Inquiry',
    origin: '3801 Shoal Creek Blvd, Austin, TX',
    destination: '1212 Rio Grande St, Austin, TX',
    estimateAmount: 4500,
    revenue: 4500,
    truckId: null,
    date: '2026-07-13',
    items: 'Gym Equipment: 10 spin bikes, 5 treadmills, weights rack, mats',
    phone: '(512) 555-0992',
    email: 'admin@tjhs.edu',
    notes: 'Requires liftgate truck. School loading dock access active from 8 AM to 2 PM.'
  },
  {
    id: 'job-11',
    clientName: 'The Miller Family',
    status: 'Scheduled',
    origin: '12900 Parmer Lane, Austin, TX',
    destination: '1504 Circle Drive, Round Rock, TX',
    estimateAmount: 1650,
    revenue: 1650,
    truckId: 'truck-a',
    date: '2026-07-09',
    items: '3 Bedroom House, Trampoline, Swing set (disassembled)',
    phone: '(512) 555-0105',
    email: 'miller.crew@gmail.com',
    notes: 'Load swing set and trampoline first. Assist with basic disassembly.'
  },
  {
    id: 'job-12',
    clientName: 'Oliver Twist Bookstore',
    status: 'Completed',
    origin: '601 Congress Ave, Austin, TX',
    destination: '2400 Guadalupe St, Austin, TX',
    estimateAmount: 3800,
    revenue: 3800,
    truckId: 'truck-b',
    date: '2026-07-02',
    items: 'Bookstore Relocation: 120 heavy book boxes, 10 shelving units',
    phone: '(512) 555-0321',
    email: 'books@olivertwist.com',
    notes: 'Completed. Bookstore staff pre-packed the boxes. Shelves dismantled.'
  }
];

export const weeklyRevenueData = [
  { name: 'Week 1', revenue: 12400 },
  { name: 'Week 2', revenue: 15800 },
  { name: 'Week 3', revenue: 18200 },
  { name: 'Week 4', revenue: 22600 }
];

export const activityLogs = [
  { id: 1, time: '10 mins ago', type: 'dispatch', message: 'Truck A dispatched to Sarah Jenkins (Oak Ave)' },
  { id: 2, time: '45 mins ago', type: 'status', message: 'Job Emily Rodriguez promoted to "Estimate Sent"' },
  { id: 3, time: '2 hours ago', type: 'system', message: 'Weekly schedule backup generated successfully' },
  { id: 4, time: '4 hours ago', type: 'billing', message: 'Payment of $3,450 received from Robert Dow' },
  { id: 5, time: '1 day ago', type: 'dispatch', message: 'Truck B completed job for Oliver Twist Bookstore' }
];
