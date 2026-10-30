/**
 * MeeSeva DQMS Master Catalog
 * Full catalog of 33 Telangana Districts, 5 Master Departments,
 * Sub-Services, Prefixes, Counters, and District Office Locations.
 * Directly derived and expanded from docs/prototype/meeseva-prototype.html
 */

export const TELANGANA_DISTRICTS = [
  { id: "ADB", name: "Adilabad", region: "Northern Telangana", headquarters: "Adilabad" },
  { id: "BDK", name: "Bhadradri Kothagudem", region: "Eastern Telangana", headquarters: "Kothagudem" },
  { id: "HNK", name: "Hanamkonda", region: "Warangal Urban", headquarters: "Hanamkonda" },
  { id: "HYD", name: "Hyderabad", region: "Capital Region", headquarters: "Hyderabad" },
  { id: "JGT", name: "Jagtial", region: "Northern Telangana", headquarters: "Jagtial" },
  { id: "JNG", name: "Jangaon", region: "Central Telangana", headquarters: "Jangaon" },
  { id: "JBP", name: "Jayashankar Bhupalpally", region: "Eastern Telangana", headquarters: "Bhupalpally" },
  { id: "JGD", name: "Jogulamba Gadwal", region: "Southern Telangana", headquarters: "Gadwal" },
  { id: "KMR", name: "Kamareddy", region: "Northern Telangana", headquarters: "Kamareddy" },
  { id: "KRN", name: "Karimnagar", region: "Northern Telangana", headquarters: "Karimnagar" },
  { id: "KHM", name: "Khammam", region: "Eastern Telangana", headquarters: "Khammam" },
  { id: "KBA", name: "Kumuram Bheem Asifabad", region: "Northern Telangana", headquarters: "Asifabad" },
  { id: "MBD", name: "Mahabubabad", region: "Eastern Telangana", headquarters: "Mahabubabad" },
  { id: "MBN", name: "Mahabubnagar", region: "Southern Telangana", headquarters: "Mahabubnagar" },
  { id: "MNC", name: "Mancherial", region: "Northern Telangana", headquarters: "Mancherial" },
  { id: "MDK", name: "Medak", region: "Central Telangana", headquarters: "Medak" },
  { id: "MCM", name: "Medchal-Malkajgiri", region: "Hyderabad Periphery", headquarters: "Shamirpet" },
  { id: "MLG", name: "Mulugu", region: "Eastern Telangana", headquarters: "Mulugu" },
  { id: "NGK", name: "Nagarkurnool", region: "Southern Telangana", headquarters: "Nagarkurnool" },
  { id: "NLG", name: "Nalgonda", region: "Southern Telangana", headquarters: "Nalgonda" },
  { id: "NRP", name: "Narayanpet", region: "Southern Telangana", headquarters: "Narayanpet" },
  { id: "NRM", name: "Nirmal", region: "Northern Telangana", headquarters: "Nirmal" },
  { id: "NZB", name: "Nizamabad", region: "Northern Telangana", headquarters: "Nizamabad" },
  { id: "PED", name: "Peddapalli", region: "Northern Telangana", headquarters: "Peddapalli" },
  { id: "RJS", name: "Rajanna Sircilla", region: "Northern Telangana", headquarters: "Sircilla" },
  { id: "RNG", name: "Ranga Reddy", region: "Capital Surroundings", headquarters: "Shamshabad" },
  { id: "SNG", name: "Sangareddy", region: "Western Telangana", headquarters: "Sangareddy" },
  { id: "SDP", name: "Siddipet", region: "Central Telangana", headquarters: "Siddipet" },
  { id: "SRP", name: "Suryapet", region: "Southern Telangana", headquarters: "Suryapet" },
  { id: "VKR", name: "Vikarabad", region: "Western Telangana", headquarters: "Vikarabad" },
  { id: "WNP", name: "Wanaparthy", region: "Southern Telangana", headquarters: "Wanaparthy" },
  { id: "WGL", name: "Warangal", region: "Warangal Rural", headquarters: "Warangal" },
  { id: "YDB", name: "Yadadri Bhuvanagiri", region: "Eastern Capital Buffer", headquarters: "Bhuvanagiri" }
];

export const MASTER_DEPARTMENTS = {
  REV: {
    id: "REV",
    name: "Revenue Department Services",
    teluguName: "రెవెన్యూ శాఖ సేవలు",
    prefix: "REV-",
    counterName: "Counter 01 & 02",
    defaultCounters: ["Counter 01", "Counter 02"],
    avgServiceMinutes: 4,
    icon: "Landmark",
    subServices: [
      "Income Certificate",
      "Caste / Community Certificate",
      "Residence / Nativity Certificate",
      "Legal Heir Certificate",
      "Encumbrance Certificate (EC)",
      "Adangal / Pahani Copies",
      "OBCC Certificate"
    ],
    generateLocations: (distName) => [
      { name: `MeeSeva Center - Main Rd, ${distName}`, addr: `Main Road, Near Collectorate Circle, ${distName}` },
      { name: `Tahsildar / MRO Office - ${distName} Urban`, addr: `Revenue Divisional Office Complex, ${distName}` },
      { name: `MeeSeva Center - Market Yard, ${distName}`, addr: `Opposite Rythu Bazar, Station Road, ${distName}` }
    ]
  },
  REG: {
    id: "REG",
    name: "Civil Registration & Municipal Services",
    teluguName: "పౌర నమోదు & మునిసిపల్ సేవలు",
    prefix: "CR-",
    counterName: "Counter 03",
    defaultCounters: ["Counter 03"],
    avgServiceMinutes: 3,
    icon: "Building2",
    subServices: [
      "Birth Certificate Issue / Correction",
      "Death Certificate Issue",
      "Child Name Inclusion",
      "Property Tax Payment",
      "Trade License Renewal",
      "Water Connection Approval"
    ],
    generateLocations: (distName) => [
      { name: `MeeSeva Center - Municipal Complex, ${distName}`, addr: `Municipal Corporation Office Premises, ${distName}` },
      { name: `MeeSeva Center - Bus Stand Colony, ${distName}`, addr: `Near RTC Bus Stand Main Entrance, ${distName}` }
    ]
  },
  RTA: {
    id: "RTA",
    name: "Transport Department (RTA Services)",
    teluguName: "రవాణా శాఖ సేవలు",
    prefix: "RTA-",
    counterName: "Counter 04 & 05",
    defaultCounters: ["Counter 04", "Counter 05"],
    avgServiceMinutes: 6,
    icon: "Car",
    subServices: [
      "LLR Slot Booking",
      "Driving License Renewal",
      "Vehicle Ownership Transfer (Duplicate RC)",
      "Fitness Certificate Request",
      "Address Change in DL/RC"
    ],
    generateLocations: (distName) => [
      { name: `District RTO Office - ${distName}`, addr: `RTO Testing Track Complex, NH Highway Side, ${distName}` },
      { name: `MeeSeva Center - RTO Junction, ${distName}`, addr: `Shop 4, Opp RTO Main Office Gate, ${distName}` }
    ]
  },
  CIVIL: {
    id: "CIVIL",
    name: "Civil Supplies & Ration Services",
    teluguName: "పౌర సరఫరాలు & రేషన్ సేవలు",
    prefix: "CS-",
    counterName: "Counter 06",
    defaultCounters: ["Counter 06"],
    avgServiceMinutes: 5,
    icon: "ShoppingBag",
    subServices: [
      "New Food Security Card (Ration Card)",
      "Member Addition / Deletion in Ration Card",
      "Address Modification in Ration Card"
    ],
    generateLocations: (distName) => [
      { name: `MeeSeva Center - Civil Supplies Hub, ${distName}`, addr: `Civil Supplies Bhavan, Old Collectorate Rd, ${distName}` },
      { name: `MeeSeva Center - Civil Line, ${distName}`, addr: `Near District Supply Office, ${distName}` }
    ]
  },
  ELEC: {
    id: "ELEC",
    name: "Electricity & Utility Services (TSPDCL/TSNPDCL)",
    teluguName: "విద్యుత్ & యుటిలిటీ సేవలు",
    prefix: "ELE-",
    counterName: "Counter 07",
    defaultCounters: ["Counter 07"],
    avgServiceMinutes: 2,
    icon: "Zap",
    subServices: [
      "Electricity Bill Payment",
      "New Service Connection Registration",
      "Category Transfer / Name Change"
    ],
    generateLocations: (distName) => [
      { name: `MeeSeva Center - Electricity Substation Rd, ${distName}`, addr: `Opposite DISCOM Circle Office, ${distName}` }
    ]
  }
};

export const URBAN_MAP_OVERRIDES = {
  HYD: {
    REV: [
      { name: "MeeSeva Center - Sanath Nagar", addr: "H No 7-1-304/2/A/1, Subhash Nagar, Sanath Nagar, Hyderabad - 500018" },
      { name: "MeeSeva Center - SR Nagar", addr: "Beside HMWS & SB, Prakash Nagar, Sanjeeva Reddy Nagar, Hyderabad - 500038" },
      { name: "MeeSeva Center - Yousufguda", addr: "Shop No. 1, Near Hanuman Temple, Jawahar Nagar, Yousufguda, Hyderabad - 500045" },
      { name: "MRO / Tahsildar Office - Khairatabad", addr: "Opp. Eenadu Office, Somajiguda, Khairatabad, Hyderabad - 500082" }
    ],
    REG: [
      { name: "MeeSeva Center - Borabanda", addr: "MCH Community Hall Complex, Moti Nagar Main Rd, Borabanda, Hyderabad - 500018" },
      { name: "GHMC Head Office - Tank Bund", addr: "CC Complex, Tank Bund Road, Lower Tank Bund, Hyderabad - 500063" }
    ]
  },
  HNK: {
    REV: [
      { name: "MeeSeva Center - Main Road Hanamkonda", addr: "Main Road, Near Canara Bank, Hanamkonda - 506001" },
      { name: "MeeSeva Center - Kazipet", addr: "Near Railway Gate, Fathima Nagar, Kazipet - 506004" }
    ]
  },
  NZB: {
    REV: [
      { name: "MeeSeva Center - Pragathi Nagar", addr: "Shop No 1, Opp. Prashanthi Homes, Srinagar Colony, Nizamabad - 503001" },
      { name: "MeeSeva Center - Kanteshwar", addr: "Shop No 3, Opp. Gouda Sangam, Armoor Road, Kanteshwar, Nizamabad - 503002" }
    ]
  }
};

/**
 * Helper to resolve office locations for a district and department.
 */
export const getOfficesForDistrict = (districtId, departmentId) => {
  const district = TELANGANA_DISTRICTS.find((d) => d.id === districtId);
  const dept = MASTER_DEPARTMENTS[departmentId];
  if (!district || !dept) return [];

  if (URBAN_MAP_OVERRIDES[districtId]?.[departmentId]) {
    return URBAN_MAP_OVERRIDES[districtId][departmentId];
  }

  return dept.generateLocations(district.name);
};
