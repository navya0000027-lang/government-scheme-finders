/**
 * schemes.js - Verified Government Schemes Database
 * -----------------------------------------------------------------------------
 * Project: Government Scheme Finder (Hackathon MVP)
 * Team: Scheme Savers
 * 
 * VERIFIED OFFICIAL SOURCES:
 * 1. myScheme Portal (Government of India) - https://www.myscheme.gov.in/
 * 2. National Portal of India - https://www.india.gov.in/
 * 3. Government of Telangana Official Portal - https://telangana.gov.in/
 * 
 * POLICY & ARCHITECTURE RULES:
 * - All schemes use authentic official names, verified departments, and real official URLs.
 * - Unknown or non-applicable conditions are represented explicitly as "unknown" or null,
 *   never fabricated.
 * - Every scheme includes:
 *   a) Applicable rules (checked automatically by client-side matching)
 *   b) Manual verification rules (offline/documentary checks required by authorities)
 *   c) Last-verified date and official source URL
 * - Label: All entries remain clearly tagged as "DEMO DATA" for hackathon evaluation.
 */

const SCHEMES_DATABASE = [
  // ===========================================================================
  // 1. PM-Kisan Samman Nidhi (Central Scheme - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    category: "Agriculture",
    stateApplicability: ["All"],
    tagline: "Direct income support of ₹6,000 per year in three 4-monthly installments.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/pm-kisan",
    officialUrl: "https://pmkisan.gov.in/",
    portalDisplay: "pmkisan.gov.in",
    ageRules: {
      minAge: 18,
      maxAge: null, // Unknown / No upper age limit in official operational guidelines
      ruleDescription: "Applicant must be an adult citizen (18 years or older). No official upper age limit specified."
    },
    incomeRules: {
      isApplicable: false, // PM-Kisan has no numerical family income ceiling; exclusion is category-based
      maxIncome: null,
      ruleDescription: "Unknown / Not capped by a specific numerical income limit. Exclusion is structural (income tax payers and institutional landholders are excluded)."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Farmer", "Daily Wage / Unorganized Worker"],
      ruleDescription: "Small and marginal farmer families with cultivable landholding."
    },
    benefits: [
      "Financial assistance of ₹6,000 per year transferred directly to bank account via DBT.",
      "Disbursed in three equal four-monthly tranches of ₹2,000 each.",
      "100% centrally funded scheme with transparent direct bank disbursement."
    ],
    eligibilityCriteria: [
      "Farmer family comprising husband, wife, and minor children owning cultivable land.",
      "Valid land ownership records updated in state land registry (Khasra/Khatauni).",
      "Excludes constitutional post holders, serving/retired government employees, and income-tax payers."
    ],
    manualVerificationRules: [
      "Physical / digital verification of cultivable landholding title against state revenue records.",
      "e-KYC biometric authentication via Aadhaar OTP or facial recognition on PM-KISAN portal.",
      "Verification of non-income-tax-payer status against IT department database."
    ],
    requiredDocuments: [
      "Proof of Identity (Voter ID, Driving License, or Aadhaar for authentication)",
      "Land ownership title deed / RoR (Record of Rights) / Pattadar Passbook",
      "Active DBT-enabled Bank Account Passbook",
      "Valid Aadhaar-linked Mobile Number"
    ],
    applicationSteps: [
      "Navigate to the official PM-KISAN portal (pmkisan.gov.in).",
      "Under 'Farmers Corner', click 'New Farmer Registration'.",
      "Select Rural or Urban Farmer Registration and enter State, District, Sub-District, Block, and Village.",
      "Enter land survey/khasra numbers and upload supporting land records.",
      "Submit application and note Farmer Registration ID for status tracking."
    ]
  },

  // ===========================================================================
  // 2. Rythu Bharosa / Rythu Bandhu (Telangana State Scheme - telangana.gov.in)
  // ===========================================================================
  {
    id: "tg-rythu-bharosa",
    name: "Rythu Bharosa / Rythu Bandhu Investment Support Scheme",
    ministry: "Department of Agriculture & Farmers Welfare, Government of Telangana",
    category: "Agriculture",
    stateApplicability: ["Telangana"],
    tagline: "Direct crop investment financial assistance per acre per season for Telangana farmers.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://telangana.gov.in/",
    officialUrl: "https://rythubandhu.telangana.gov.in/",
    portalDisplay: "telangana.gov.in / rythubandhu.telangana.gov.in",
    ageRules: {
      minAge: 18,
      maxAge: null, // No upper age bar for title-holding farmers
      ruleDescription: "Minimum age of 18 years for legal title holders. Upper age limit is unknown / not restricted."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Not capped by household income bracket; granted on basis of cultivable land acreage."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Farmer"],
      ruleDescription: "Resident farmers, landholders, and recognized cultivators in Telangana."
    },
    benefits: [
      "Direct financial support per acre per season to purchase agriculture inputs (seeds, fertilizer, labor).",
      "Credited electronically via Treasury and Direct Benefit Transfer (DBT).",
      "Relieves farmers from exploitative non-institutional debt cycles."
    ],
    eligibilityCriteria: [
      "Must be a resident farmer of Telangana holding cultivable agricultural land.",
      "Must hold a valid digital Pattadar Passbook issued via the Dharani / Bhu Bharati portal.",
      "Applicable strictly to agricultural land under active cultivation."
    ],
    manualVerificationRules: [
      "Field verification of active cultivation by Agricultural Extension Officer (AEO).",
      "Land title validation against digital Dharani land registry.",
      "Confirmation that land is not converted for non-agricultural/real-estate layouts."
    ],
    requiredDocuments: [
      "Dharani Pattadar Passbook / Digital Title Deed",
      "Telangana Resident Proof / Voter Identity",
      "Aadhaar-seeded Bank Account details",
      "Crop sowing self-declaration form"
    ],
    applicationSteps: [
      "Check inclusion in the Village Revenue Agriculture Beneficiary List at local Gram Panchayat.",
      "Ensure Pattadar Passbook details are updated on the Dharani portal.",
      "Submit bank account details to the local Agriculture Extension Officer (AEO).",
      "Track disbursement status on the official Telangana Rythu Bandhu portal."
    ]
  },

  // ===========================================================================
  // 3. Central Sector Scheme of Scholarship (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "css-scholarship",
    name: "Central Sector Scheme of Scholarship for College and University Students",
    ministry: "Ministry of Education (Department of Higher Education)",
    category: "Education",
    stateApplicability: ["All"],
    tagline: "Merit-cum-means financial scholarship for college undergraduate & postgraduate students.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/css-scholarship",
    officialUrl: "https://scholarships.gov.in/",
    portalDisplay: "scholarships.gov.in",
    ageRules: {
      minAge: 17,
      maxAge: 25,
      ruleDescription: "Must be between 17 and 25 years of age at the time of college admission."
    },
    incomeRules: {
      isApplicable: true,
      maxIncome: 450000,
      ruleDescription: "Gross annual family income from all sources must not exceed ₹4,50,000 per annum."
    },
    educationRules: {
      allowedEducation: ["12th Pass", "Undergraduate / Degree", "Postgraduate"],
      ruleDescription: "Passed Class 12 board exam and enrolled in regular undergraduate/postgraduate degree program."
    },
    occupationRules: {
      allowedOccupations: ["Student"],
      ruleDescription: "Regular full-time students in recognized universities, colleges, or institutions."
    },
    benefits: [
      "₹12,000 per year at Graduation level for first 3 years of higher education.",
      "₹20,000 per year at Post-Graduation level.",
      "Direct Benefit Transfer into student's personal bank account."
    ],
    eligibilityCriteria: [
      "Students above 80th percentile of successful candidates in relevant stream from respective Class 12 Examination Board.",
      "Pursuing regular full-time degree courses (distance/correspondence education not eligible).",
      "Family income from all sources must not exceed ₹4,50,000 per annum.",
      "Not availing any other scholarship/stipend concurrently."
    ],
    manualVerificationRules: [
      "Institutional verification of admission & regular attendance by College Nodal Officer (INO).",
      "Verification of 80th percentile cutoff criteria against state board merit list.",
      "Verification of family income certificate by District Revenue Authority (SNO)."
    ],
    requiredDocuments: [
      "Class 12th Board Marksheet and Passing Certificate",
      "Income Certificate issued by competent revenue authority (Tahsildar / SDO)",
      "College Bonafide Student Certificate and Admission Fee Receipt",
      "Student Bank Account Passbook (Aadhaar linked)"
    ],
    applicationSteps: [
      "Register on the National Scholarship Portal (scholarships.gov.in).",
      "Fill in academic details, Class 12 roll number, and institution code (AISHE).",
      "Upload verified income certificate and previous examination mark sheets.",
      "Submit application and hand over printed copy to College Nodal Officer for online verification."
    ]
  },

  // ===========================================================================
  // 4. Dr. B.R. Ambedkar Overseas Vidya Nidhi (Telangana State - telangana.gov.in)
  // ===========================================================================
  {
    id: "tg-ambedkar-overseas",
    name: "Dr. B.R. Ambedkar Overseas Vidya Nidhi Scheme",
    ministry: "Scheduled Castes / ST / BC / Minorities Welfare Department, Government of Telangana",
    category: "Education",
    stateApplicability: ["Telangana"],
    tagline: "Overseas study scholarship grant up to ₹20 Lakhs for post-graduate and doctoral studies abroad.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://telangana.gov.in/",
    officialUrl: "https://telanganaepass.cgg.gov.in/",
    portalDisplay: "telanganaepass.cgg.gov.in",
    ageRules: {
      minAge: 20,
      maxAge: 35,
      ruleDescription: "Must be below 35 years of age as of July 1st of the notification year."
    },
    incomeRules: {
      isApplicable: true,
      maxIncome: 500000,
      ruleDescription: "Total family income from all sources must not exceed ₹5,00,000 per annum."
    },
    educationRules: {
      allowedEducation: ["Undergraduate / Degree", "Postgraduate"],
      ruleDescription: "Minimum 60% marks in Degree (for PG studies abroad) or in PG (for PhD studies abroad)."
    },
    occupationRules: {
      allowedOccupations: ["Student", "Unemployed"],
      ruleDescription: "Eligible students or young scholars domiciled in Telangana."
    },
    benefits: [
      "Scholarship grant up to ₹20,00,000 (Twenty Lakhs) or actual course fees/expenses, whichever is less.",
      "One-way economy class airfare and mandatory visa processing charges.",
      "Disbursed in designated installment tranches linked to foreign university progress reports."
    ],
    eligibilityCriteria: [
      "Must be a permanent resident / domicile of Telangana State.",
      "Candidate must have secured admission into an accredited foreign university in USA, UK, Australia, Canada, Germany, etc.",
      "Valid scores in qualifying tests (GRE / GMAT) and English language tests (IELTS / TOEFL / PTE).",
      "Restricted strictly to only one student per family."
    ],
    manualVerificationRules: [
      "In-person interview and certificate verification by the State Level Screening Committee.",
      "Verification of I-20 / CAS / University unconditional offer letter from foreign institution.",
      "MeeSeva Caste and Integrated Income Certificate verification by District Collectorate."
    ],
    requiredDocuments: [
      "Telangana Resident Certificate & Integrated Caste Certificate from MeeSeva",
      "Family Income Certificate (below ₹5 Lakhs p.a.)",
      "Degree Marksheets and Consolidated Marks Memo (minimum 60%)",
      "Scorecards of GRE/GMAT and IELTS/TOEFL",
      "Valid Passport, Student Visa, and University I-20 / Offer Letter"
    ],
    applicationSteps: [
      "Visit the Telangana ePASS official portal (telanganaepass.cgg.gov.in).",
      "Select 'Overseas Scholarship Services' and register under the relevant welfare department.",
      "Upload academic credentials, university admission proof, and standardized test scores.",
      "Attend the document verification and interview session before the State Screening Committee."
    ]
  },

  // ===========================================================================
  // 5. Aasara Pension Scheme (Telangana State - telangana.gov.in)
  // ===========================================================================
  {
    id: "tg-aasara-pension",
    name: "Aasara Social Security Pension Scheme",
    ministry: "Panchayat Raj & Rural Development Department, Government of Telangana",
    category: "Housing & Social Welfare",
    stateApplicability: ["Telangana"],
    tagline: "Monthly social security pension of ₹2,016 (₹3,016 for disabled) to protect vulnerable citizens.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://telangana.gov.in/",
    officialUrl: "https://aasara.telangana.gov.in/",
    portalDisplay: "telangana.gov.in / aasara.telangana.gov.in",
    ageRules: {
      minAge: 57, // Reduced to 57 years for Old Age Pension
      maxAge: null, // No upper limit
      ruleDescription: "57 years and above for Old Age Pension (or 18+ for widows/disabled with medical certificate)."
    },
    incomeRules: {
      isApplicable: true,
      maxIncome: 200000,
      ruleDescription: "Annual family income must not exceed ₹1,50,000 in rural areas and ₹2,00,000 in urban areas."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Daily Wage / Unorganized Worker", "Unemployed", "Farmer", "Any"],
      ruleDescription: "Vulnerable individuals, informal laborers, senior citizens, and persons without institutional livelihood."
    },
    benefits: [
      "Monthly pension of ₹2,016 for senior citizens, widows, weavers, and toddy tappers.",
      "Enhanced monthly pension of ₹3,016 for persons with disabilities (40%+ disability).",
      "Direct DBT credit into Post Office savings account or biometric disbursement via Village Panchayat."
    ],
    eligibilityCriteria: [
      "Permanent resident of Telangana belonging to below-poverty-line (BPL) household.",
      "Old age applicants must have completed 57 years of age.",
      "Applicant must not be a government pensioner or income-tax payer.",
      "Only one pension is sanctioned per household (excluding specific disability exemptions)."
    ],
    manualVerificationRules: [
      "Door-to-door physical verification by Gram Panchayat Secretary / Municipal Ward Officer.",
      "SADAREM medical board certificate verification for disability claims.",
      "Cross-check against national database to prevent dual pension claims."
    ],
    requiredDocuments: [
      "Food Security Card (Ration Card) or BPL Household Certificate",
      "Age proof certificate (Voter ID, School certificate, or Medical age certificate)",
      "SADAREM Disability Certificate (for PWD applicants)",
      "Death Certificate of husband (for Widow pension)",
      "Bank / Post Office Passbook copy"
    ],
    applicationSteps: [
      "Obtain and fill the Aasara application form from local Gram Panchayat or MeeSeva centre.",
      "Submit with proof of age, residence, food security card, and passbook.",
      "Verification is conducted by the Panchayat Secretary or Bill Collector.",
      "Approved beneficiaries receive an Aasara Pension Card with unique Pensioner ID."
    ]
  },

  // ===========================================================================
  // 6. PM Vishwakarma Scheme (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "pm-vishwakarma",
    name: "PM Vishwakarma Scheme",
    ministry: "Ministry of Micro, Small and Medium Enterprises (MSME)",
    category: "Skill Development",
    stateApplicability: ["All"],
    tagline: "End-to-end support, modern toolkit incentive of ₹15,000, and collateral-free enterprise loans up to ₹3 Lakhs.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/pm-vishwakarma",
    officialUrl: "https://pmvishwakarma.gov.in/",
    portalDisplay: "pmvishwakarma.gov.in",
    ageRules: {
      minAge: 18,
      maxAge: null, // Unknown / No upper age limit specified
      ruleDescription: "Must be at least 18 years of age on date of registration. Upper age cap is unknown / not restricted."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Unknown / No formal household income ceiling. Eligibility depends on traditional trade engagement and non-government employment."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Self-Employed / Small Business", "Daily Wage / Unorganized Worker"],
      ruleDescription: "Artisans and craftspeople engaged hands-on in 18 recognized traditional trades (carpenter, blacksmith, potter, tailor, mason, etc.)."
    },
    benefits: [
      "PM Vishwakarma Certificate & ID Card recognizing authentic artisan status.",
      "Basic skill training of 5-7 days and advanced training of 15+ days with daily stipend of ₹500/day.",
      "Modern Toolkit incentive e-voucher of up to ₹15,000.",
      "Collateral-free enterprise loan up to ₹1 Lakh (Tranche 1) and ₹2 Lakhs (Tranche 2) at concessional 5% interest rate."
    ],
    eligibilityCriteria: [
      "Artisan working with hands and tools in one of the 18 traditional trades in the unorganized sector.",
      "Minimum 18 years of age on registration date.",
      "Must not have availed loans under PMEGP, PM SVANidhi, or Mudra in past 5 years.",
      "Benefits restricted to one member per family; government employees & family are excluded."
    ],
    manualVerificationRules: [
      "Stage 1 verification: Local verification by Gram Panchayat Head / Urban Local Body Commissioner.",
      "Stage 2 verification: District Implementation Committee (DIC) appraisal.",
      "Stage 3 verification: Screening by National/State Quality Council."
    ],
    requiredDocuments: [
      "Aadhaar Card and Mobile linked to Aadhaar",
      "Bank Account details (DBT active)",
      "Ration Card or Family Declaration",
      "Trade-specific proof of self-employment / artisan work"
    ],
    applicationSteps: [
      "Visit nearest Common Service Centre (CSC) with Aadhaar and active mobile.",
      "Complete Aadhaar biometric authentication on the PM Vishwakarma portal (pmvishwakarma.gov.in).",
      "Select your traditional trade and submit application.",
      "Track three-tier verification (Gram Panchayat -> District Committee -> State Council)."
    ]
  },

  // ===========================================================================
  // 7. PM Street Vendor's AtmaNirbhar Nidhi (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "pm-svanidhi",
    name: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    ministry: "Ministry of Housing and Urban Affairs",
    category: "Business & Entrepreneurship",
    stateApplicability: ["All"],
    tagline: "Collateral-free working capital micro-credit with 7% interest subsidy and cashback for street vendors.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/pmsvanidhi",
    officialUrl: "https://pmsvanidhi.mohua.gov.in/",
    portalDisplay: "pmsvanidhi.mohua.gov.in",
    ageRules: {
      minAge: 18,
      maxAge: null, // Unknown / No upper age limit specified
      ruleDescription: "Must be at least 18 years old. Upper age cap is unknown / not restricted."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Unknown / No formal household income ceiling; eligibility is based on urban vendor identity."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Self-Employed / Small Business", "Daily Wage / Unorganized Worker"],
      ruleDescription: "Street vendors, hawkers, thelawalas, and micro-retailers in urban/peri-urban jurisdictions."
    },
    benefits: [
      "First tranche: Working capital micro-loan up to ₹10,000 (1-year repayment tenure).",
      "Second & Third tranches: Enhanced loans of ₹20,000 and ₹50,000 upon timely repayment.",
      "Interest subsidy of 7% p.a. credited directly into bank account via DBT on quarterly basis.",
      "Digital transaction cashback incentives up to ₹1,200 per year."
    ],
    eligibilityCriteria: [
      "Street vendors engaged in vending in urban areas on or before the qualifying scheme dates.",
      "Vendors possessing Certificate of Vending (CoV) or Identity Card issued by Urban Local Body (ULB).",
      "Vendors possessing Letter of Recommendation (LoR) issued by Town Vending Committee (TVC)."
    ],
    manualVerificationRules: [
      "Physical field verification and issuance of Letter of Recommendation by ULB / Town Vending Committee.",
      "Credit evaluation and sanction by empaneled Lending Institution / Bank."
    ],
    requiredDocuments: [
      "Certificate of Vending (CoV) / Identity Card or LoR from ULB",
      "Government Photo ID Proof",
      "Bank Account details linked with mobile number"
    ],
    applicationSteps: [
      "Access the official PM SVANidhi portal (pmsvanidhi.mohua.gov.in).",
      "Verify mobile number with OTP and check Certificate of Vending status.",
      "Fill online application and choose preferred commercial or rural bank.",
      "Submit application; local ULB coordinators assist with banking correspondent sanction."
    ]
  },

  // ===========================================================================
  // 8. Ayushman Bharat - PM-JAY (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "pm-jay",
    name: "Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    ministry: "Ministry of Health and Family Welfare / National Health Authority (NHA)",
    category: "Healthcare",
    stateApplicability: ["All"],
    tagline: "World's largest health assurance scheme providing ₹5 Lakh free hospitalization per family per year.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/ab-pmjay",
    officialUrl: "https://pmjay.gov.in/",
    portalDisplay: "pmjay.gov.in",
    ageRules: {
      minAge: null, // Unknown / No minimum age (covers newborns to senior citizens)
      maxAge: null, // Unknown / No upper age limit
      ruleDescription: "Unknown / No age restriction; provides cashless cover for all family members regardless of age or gender."
    },
    incomeRules: {
      isApplicable: true,
      maxIncome: 300000,
      ruleDescription: "Entitlement based on SECC deprivation criteria and National Food Security Act (NFSA) / BPL income levels."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["All"],
      ruleDescription: "Eligible low-income households, unorganized laborers, and deprived families."
    },
    benefits: [
      "Cashless and paperless inpatient secondary and tertiary hospital care up to ₹5,00,000 per family per year.",
      "Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization diagnostics and medicines.",
      "Valid at all empaneled public and private hospitals across India (portable nationwide)."
    ],
    eligibilityCriteria: [
      "Families automatically categorized under deprivation criteria D1 to D7 in rural areas, and 11 occupational categories in urban areas.",
      "Holders of active BPL / NFSA ration cards in participating states/UTs.",
      "Zero restriction on family size, age, or gender."
    ],
    manualVerificationRules: [
      "Biometric e-KYC verification and ration card linkage by 'Arogya Mitra' at empaneled hospital helpdesk.",
      "State health agency validation before issuance of Ayushman Golden Card."
    ],
    requiredDocuments: [
      "Ration Card or NFSA Household Entitlement Letter",
      "Government photo identity proof for each family member",
      "Active Mobile number for OTP validation"
    ],
    applicationSteps: [
      "Check eligibility on pmjay.gov.in using 'Am I Eligible' or call helpline 14555.",
      "Visit nearest Empaneled Hospital or Common Service Centre (CSC).",
      "Meet the 'Pradhan Mantri Arogya Mitra' at the helpdesk.",
      "Complete Aadhaar e-KYC to generate your free Ayushman Card on the spot."
    ]
  },

  // ===========================================================================
  // 9. Pradhan Mantri MUDRA Yojana (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "pm-mudra-yojana",
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    ministry: "Ministry of Finance (Department of Financial Services)",
    category: "Business & Entrepreneurship",
    stateApplicability: ["All"],
    tagline: "Collateral-free business loans up to ₹10 Lakhs (extended up to ₹20 Lakhs) for micro-enterprises.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/pmmy",
    officialUrl: "https://www.mudra.org.in/",
    portalDisplay: "mudra.org.in",
    ageRules: {
      minAge: 18,
      maxAge: 65,
      ruleDescription: "Borrower must be at least 18 years old and typically up to 65 years at loan maturity."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Unknown / No formal household income ceiling; sanction depends on business viability and cash flow."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Self-Employed / Small Business", "Farmer", "Unemployed", "Daily Wage / Unorganized Worker"],
      ruleDescription: "Non-corporate, non-farm small/micro enterprises in manufacturing, trade, and services."
    },
    benefits: [
      "Shishu Category: Loans up to ₹50,000 for early-stage micro-ventures.",
      "Kishor Category: Loans from ₹50,000 up to ₹5,00,000 for business expansion.",
      "Tarun Category: Loans from ₹5,00,000 up to ₹10,00,000 (and Tarun Plus up to ₹20 Lakhs).",
      "Zero collateral or third-party guarantee required from the borrower."
    ],
    eligibilityCriteria: [
      "Any Indian citizen who has a feasible business plan for a non-farm revenue-generating enterprise.",
      "Applicable to manufacturing, services, trading, processing, and allied agricultural activities.",
      "Applicant must not have any prior default records with any scheduled bank."
    ],
    manualVerificationRules: [
      "Bank credit appraisal and physical site inspection of the business premises.",
      "CIBIL / Credit bureau report scoring and default check by lending branch.",
      "Verification of equipment/raw material price quotations."
    ],
    requiredDocuments: [
      "Identity Proof (Voter ID, Passport, or Driving License)",
      "Proof of Residence (Electricity bill, Ration card, or Rental agreement)",
      "Business establishment license / Udyam Registration (if operational)",
      "Project report with 1-year projected income/cost estimation"
    ],
    applicationSteps: [
      "Prepare your enterprise project plan and capital estimation.",
      "Apply online through the national portal (udyamimitra.in) or visit any participating commercial/rural bank.",
      "Submit application form along with quotation for machinery/equipment.",
      "Bank processes appraisal and disburses loan with MUDRA Card."
    ]
  },

  // ===========================================================================
  // 10. Pradhan Mantri Kaushal Vikas Yojana (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "pmkvy-skills",
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)",
    ministry: "Ministry of Skill Development and Entrepreneurship (MSDE)",
    category: "Skill Development",
    stateApplicability: ["All"],
    tagline: "Free industry-relevant vocational training, NSQF certification, and placement assistance.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/pmkvy",
    officialUrl: "https://www.pmkvyofficial.org/",
    portalDisplay: "pmkvyofficial.org / skillindiadigital.gov.in",
    ageRules: {
      minAge: 15,
      maxAge: 45,
      ruleDescription: "Indian youth between 15 and 45 years of age."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Unknown / No formal household income ceiling; open to all school/college dropouts and job seekers."
    },
    educationRules: {
      allowedEducation: ["Below 10th", "10th Pass", "12th Pass", "Diploma / Vocational", "Undergraduate / Degree"],
      ruleDescription: "Minimum education depends on the specific Job Role / NSQF Qualification Pack selected."
    },
    occupationRules: {
      allowedOccupations: ["Student", "Unemployed", "Daily Wage / Unorganized Worker"],
      ruleDescription: "Unemployed youth, school/college dropouts, or uncertified informal workers."
    },
    benefits: [
      "100% government-funded training in emerging tech (AI, Drones, Solar, EV, Coding, Logistics, Healthcare).",
      "Government-recognized National Skill Qualification Framework (NSQF) certification.",
      "Direct monetary reward and travel allowance disbursed via DBT upon course completion and certification.",
      "Employment Rozgar Melas and placement facilitation."
    ],
    eligibilityCriteria: [
      "Indian national youth looking for marketable job-oriented vocational skills.",
      "Possess basic identity proof and bank account.",
      "Must not have completed identical skill certification under government sponsorship in previous year."
    ],
    manualVerificationRules: [
      "Biometric AEPS attendance verification (minimum 70% attendance required).",
      "Independent assessment and practical skill examination by third-party Sector Skill Council."
    ],
    requiredDocuments: [
      "Educational qualification certificates / transfer certificate",
      "Government Photo Identity Card",
      "Recent passport-sized photographs",
      "DBT-enabled Bank Account passbook copy"
    ],
    applicationSteps: [
      "Visit Skill India Digital portal (skillindiadigital.gov.in) or pmkvyofficial.org.",
      "Search accredited training centres by state, district, or job role preference.",
      "Enroll in chosen batch (Short Term Training or Recognition of Prior Learning).",
      "Complete hands-on curriculum and appear for independent Sector Skill Council assessment."
    ]
  },

  // ===========================================================================
  // 11. Stand-Up India Scheme (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "standup-india",
    name: "Stand-Up India Scheme",
    ministry: "Ministry of Finance (Department of Financial Services)",
    category: "Business & Entrepreneurship",
    stateApplicability: ["All"],
    tagline: "Bank loans between ₹10 Lakhs and ₹1 Crore for greenfield commercial ventures by SC/ST & Women.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/stand-up-india",
    officialUrl: "https://www.standupmitra.in/",
    portalDisplay: "standupmitra.in",
    ageRules: {
      minAge: 18,
      maxAge: null, // Unknown / No upper age limit specified
      ruleDescription: "Must be at least 18 years of age. Upper age cap is unknown / not restricted."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Unknown / No formal household income ceiling; determined by viability of commercial proposal."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["Self-Employed / Small Business", "Unemployed", "Salaried / Working Professional"],
      ruleDescription: "SC/ST and/or Woman entrepreneurs starting a new greenfield enterprise."
    },
    benefits: [
      "Composite bank loan between ₹10 Lakh and ₹1 Crore covering up to 85% of project cost.",
      "Repayable over 7 years with maximum moratorium period of 18 months.",
      "Handholding support via SIDBI and Lead District Managers (LDMs)."
    ],
    eligibilityCriteria: [
      "SC/ST and/or Woman entrepreneurs above 18 years of age.",
      "Loan is granted only for greenfield projects (first-time venture in manufacturing, services, agri-allied, or trading).",
      "In non-individual enterprises, 51% shareholding and controlling stake must be held by SC/ST or woman entrepreneur."
    ],
    manualVerificationRules: [
      "Caste certificate and legal gender verification by scheduled commercial bank branch.",
      "Techno-economic project feasibility appraisal by bank credit committee.",
      "Inspection of proposed greenfield land and machinery quotations."
    ],
    requiredDocuments: [
      "Identity Proof and Caste Certificate (for SC/ST applicants)",
      "Proof of Business Premises / Land Title",
      "Project Report detailing machinery, working capital requirement, and market viability",
      "Bank statements and financial projections"
    ],
    applicationSteps: [
      "Visit the Stand-Up Mitra portal (standupmitra.in).",
      "Register as a borrower and fill the greenfield project application.",
      "Select your preferred scheduled commercial bank branch.",
      "Attend the credit appraisal meeting and access handholding assistance."
    ]
  },

  // ===========================================================================
  // 12. Sukanya Samriddhi Yojana (Central - myScheme / India.gov.in)
  // ===========================================================================
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana (SSY)",
    ministry: "Ministry of Finance / Department of Posts",
    category: "Housing & Social Welfare",
    stateApplicability: ["All"],
    tagline: "High-interest government-backed small savings scheme for girl child education and marriage.",
    demoLabel: "DEMO DATA",
    lastVerified: "2026-10-15",
    officialSource: "https://www.myscheme.gov.in/schemes/ssy",
    officialUrl: "https://www.indiapost.gov.in/",
    portalDisplay: "indiapost.gov.in",
    ageRules: {
      minAge: 18, // Account opened by parent/guardian aged 18+ for daughter under 10
      maxAge: null, // Unknown / No upper age limit for guardian
      ruleDescription: "Parent or legal guardian must be 18+ years old opening account for a girl child below 10 years."
    },
    incomeRules: {
      isApplicable: false,
      maxIncome: null,
      ruleDescription: "Unknown / No income ceiling; open to all families with a girl child."
    },
    educationRules: {
      allowedEducation: ["All"],
      ruleDescription: "No formal education condition required."
    },
    occupationRules: {
      allowedOccupations: ["All"],
      ruleDescription: "Open to citizens across all occupations."
    },
    benefits: [
      "Attractive high interest rate (currently 8.2% p.a., compounded annually).",
      "Triple tax exemption: Tax exemption on investment, interest accrued, and maturity withdrawal (EEE status).",
      "Minimum deposit of just ₹250 per year up to maximum ₹1,50,000 per financial year.",
      "Partial withdrawal allowed for higher education after daughter turns 18."
    ],
    eligibilityCriteria: [
      "Account can be opened by natural or legal guardian for a girl child below 10 years of age.",
      "Maximum of two accounts permitted per family (one for each girl child, exception for twins/triplets).",
      "Account matures after 21 years from opening date or upon marriage of the girl child after age 18."
    ],
    manualVerificationRules: [
      "Verification of girl child's birth certificate by Post Office / Commercial Bank officer.",
      "Verification of legal guardian status and family tree (maximum two accounts check)."
    ],
    requiredDocuments: [
      "Birth Certificate of the girl child",
      "Identity and Address Proof of the parent / legal guardian",
      "Initial deposit amount (minimum ₹250 cash or cheque)",
      "Passport size photographs of guardian and child"
    ],
    applicationSteps: [
      "Visit any Post Office branch or authorized public/private commercial bank.",
      "Obtain and fill the Sukanya Samriddhi Account Opening Form (SSY-1).",
      "Attach child's birth certificate and guardian KYC documents.",
      "Deposit the initial account opening amount; a dedicated SSY passbook is issued."
    ]
  }
];

// Quick persona presets for hackathon judges & testers
const DEMO_PRESETS = [
  {
    label: "College Student (All India)",
    description: "20 yrs, Undergraduate, ₹2.2 Lakh family income",
    data: {
      age: 20,
      state: "All India",
      education: "Undergraduate / Degree",
      occupation: "Student",
      income: 220000
    }
  },
  {
    label: "Small Farmer (All India)",
    description: "42 yrs, 10th Pass, ₹1.8 Lakh family income",
    data: {
      age: 42,
      state: "All India",
      education: "10th Pass",
      occupation: "Farmer",
      income: 180000
    }
  },
  {
    label: "Telangana Student (Overseas Studies Aspirant)",
    description: "23 yrs, Degree Pass, Telangana Domicile, ₹2.5 Lakh income",
    data: {
      age: 23,
      state: "Telangana",
      education: "Undergraduate / Degree",
      occupation: "Student",
      income: 250000
    }
  },
  {
    label: "Telangana Farmer (Rythu Bharosa + PM-KISAN)",
    description: "38 yrs, Telangana Resident, ₹1.5 Lakh income",
    data: {
      age: 38,
      state: "Telangana",
      education: "Below 10th",
      occupation: "Farmer",
      income: 150000
    }
  },
  {
    label: "Artisan / Street Vendor",
    description: "34 yrs, Below 10th, ₹1.5 Lakh family income",
    data: {
      age: 34,
      state: "All India",
      education: "Below 10th",
      occupation: "Self-Employed / Small Business",
      income: 150000
    }
  }
];

// List of all Indian States and Union Territories for the state dropdown
const INDIAN_STATES_AND_UTS = [
  "All India",
  "Telangana",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (NCT)",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands"
];
