-- =============================================================================
-- Supabase Database Schema & Seed Script
-- Project: Government Scheme Finder (Hackathon MVP)
-- Team: Scheme Savers
-- Compatible with: Supabase (PostgreSQL 15+)
-- =============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. Table: schemes
-- Stores all central and state government schemes with structured rules
-- =============================================================================
drop table if exists public.schemes cascade;

create table public.schemes (
    id text primary key,                                   -- e.g. 'pm-kisan', 'tg-rythu-bharosa'
    name text not null,                                   -- Official scheme title
    ministry text not null,                               -- Ministry / State department
    category text not null,                               -- e.g. 'Agriculture', 'Education', etc.
    state_applicability text[] not null default array['All'], -- array of states or ['All']
    tagline text not null,                                -- Primary benefit summary
    demo_label text not null default 'DEMO DATA',         -- Demo tag
    last_verified date not null default current_date,     -- Date verified with official source
    official_source text not null,                        -- e.g. 'https://www.myscheme.gov.in/...'
    official_url text not null,                           -- Portal URL (.gov.in / .nic.in)
    portal_display text not null,                         -- Display domain e.g. 'pmkisan.gov.in'
    
    -- Age Conditions (Unknowns represented as NULL)
    min_age integer,                                      -- NULL if no minimum age
    max_age integer,                                      -- NULL if no upper age limit
    age_rule_description text not null,
    
    -- Income Conditions (Unknowns / Non-applicable represented as NULL / is_income_applicable = false)
    is_income_applicable boolean not null default false,  -- false if no numerical household cap
    max_income numeric(12, 2),                            -- NULL if not capped
    income_rule_description text not null,
    
    -- Education & Occupation Conditions
    allowed_education text[] not null default array['All'],
    education_rule_description text not null,
    allowed_occupations text[] not null default array['All'],
    occupation_rule_description text not null,
    
    -- Detailed Lists (Stored as PostgreSQL Text Arrays)
    benefits text[] not null default array[]::text[],
    eligibility_criteria text[] not null default array[]::text[],
    manual_verification_rules text[] not null default array[]::text[],
    required_documents text[] not null default array[]::text[],
    application_steps text[] not null default array[]::text[],
    
    -- Status & Audit Timestamps
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments for database documentation
comment on table public.schemes is 'Official central and state government schemes curated for Team Scheme Savers MVP';
comment on column public.schemes.manual_verification_rules is 'Rules that require physical/offline verification before final grant';

-- =============================================================================
-- 2. Table: eligibility_queries (Anonymous Search Analytics)
-- Logs citizen parameter searches with ZERO sensitive credentials (no Aadhaar/bank)
-- =============================================================================
create table if not exists public.eligibility_queries (
    id uuid primary key default uuid_generate_v4(),
    user_age integer,
    user_state text,
    user_education text,
    user_occupation text,
    user_income numeric(12, 2),
    matched_schemes_count integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.eligibility_queries is 'Anonymous query telemetry (strictly no PII, no Aadhaar, no passwords)';

-- =============================================================================
-- 3. Table: citizen_feedback
-- Optional table for judges or citizens submitting feedback on scheme usefulness
-- =============================================================================
create table if not exists public.citizen_feedback (
    id uuid primary key default uuid_generate_v4(),
    scheme_id text references public.schemes(id) on delete cascade,
    rating integer check (rating >= 1 and rating <= 5),
    feedback_text text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================================================
-- 4. Indexes for High-Performance Querying
-- =============================================================================
create index if not exists idx_schemes_category on public.schemes(category);
create index if not exists idx_schemes_state on public.schemes using gin(state_applicability);
create index if not exists idx_schemes_is_active on public.schemes(is_active);
create index if not exists idx_eligibility_queries_created on public.eligibility_queries(created_at desc);

-- =============================================================================
-- 5. Row Level Security (RLS) Configuration
-- =============================================================================
-- Enable RLS on all tables
alter table public.schemes enable row level security;
alter table public.eligibility_queries enable row level security;
alter table public.citizen_feedback enable row level security;

-- Schemes policies: Public read-only access (anyone can view active schemes)
create policy "Allow public read access on schemes"
    on public.schemes for select
    using (is_active = true);

-- Schemes policies: Modification restricted to service role / authenticated admins
create policy "Allow service role full access on schemes"
    on public.schemes for all
    using (auth.role() = 'service_role');

-- Eligibility queries policies: Anyone can insert anonymous search logs
create policy "Allow anonymous insert on eligibility_queries"
    on public.eligibility_queries for insert
    with check (true);

create policy "Allow service role read on eligibility_queries"
    on public.eligibility_queries for select
    using (auth.role() = 'service_role');

-- Feedback policies: Anyone can submit feedback
create policy "Allow anonymous insert on citizen_feedback"
    on public.citizen_feedback for insert
    with check (true);

-- =============================================================================
-- 6. Stored Function: match_schemes (Server-Side Database Matching)
-- Can be invoked directly via Supabase API:
-- supabase.rpc('match_schemes', { p_age: 20, p_state: 'Telangana', ... })
-- =============================================================================
create or replace function public.match_schemes(
    p_age integer,
    p_state text,
    p_education text,
    p_occupation text,
    p_income numeric
)
returns setof public.schemes
language sql
stable
security definer
as $$
    select *
    from public.schemes
    where is_active = true
      -- 1. Age condition (only evaluated if rule specified)
      and (min_age is null or p_age >= min_age)
      and (max_age is null or p_age <= max_age)
      -- 2. State applicability
      and ('All' = any(state_applicability) or p_state = any(state_applicability) or p_state = 'All India')
      -- 3. Education condition
      and ('All' = any(allowed_education) or p_education = any(allowed_education) or p_education = 'Any')
      -- 4. Occupation condition
      and ('All' = any(allowed_occupations) or p_occupation = any(allowed_occupations) or p_occupation = 'Any')
      -- 5. Income condition
      and (not is_income_applicable or max_income is null or p_income <= max_income)
    order by category asc, name asc;
$$;

-- Grant execution permissions
grant execute on function public.match_schemes to anon, authenticated, service_role;

-- =============================================================================
-- 7. Seed Data: Insert All 12 Verified Schemes from schemes.js
-- =============================================================================
insert into public.schemes (
    id, name, ministry, category, state_applicability, tagline, demo_label,
    last_verified, official_source, official_url, portal_display,
    min_age, max_age, age_rule_description,
    is_income_applicable, max_income, income_rule_description,
    allowed_education, education_rule_description,
    allowed_occupations, occupation_rule_description,
    benefits, eligibility_criteria, manual_verification_rules,
    required_documents, application_steps, is_active
) values
-- 1. PM-KISAN
(
    'pm-kisan',
    'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    'Ministry of Agriculture and Farmers Welfare',
    'Agriculture',
    array['All'],
    'Direct income support of ₹6,000 per year in three 4-monthly installments.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/pm-kisan',
    'https://pmkisan.gov.in/',
    'pmkisan.gov.in',
    18,
    null,
    'Applicant must be an adult citizen (18 years or older). No official upper age limit specified.',
    false,
    null,
    'Unknown / Not capped by a specific numerical income limit. Exclusion is structural (income tax payers and institutional landholders are excluded).',
    array['All'],
    'No formal education condition required.',
    array['Farmer', 'Daily Wage / Unorganized Worker'],
    'Small and marginal farmer families with cultivable landholding.',
    array[
        'Financial assistance of ₹6,000 per year transferred directly to bank account via DBT.',
        'Disbursed in three equal four-monthly tranches of ₹2,000 each.',
        '100% centrally funded scheme with transparent direct bank disbursement.'
    ],
    array[
        'Farmer family comprising husband, wife, and minor children owning cultivable land.',
        'Valid land ownership records updated in state land registry (Khasra/Khatauni).',
        'Excludes constitutional post holders, serving/retired government employees, and income-tax payers.'
    ],
    array[
        'Physical / digital verification of cultivable landholding title against state revenue records.',
        'e-KYC biometric authentication via Aadhaar OTP or facial recognition on PM-KISAN portal.',
        'Verification of non-income-tax-payer status against IT department database.'
    ],
    array[
        'Proof of Identity (Voter ID, Driving License, or Aadhaar for authentication)',
        'Land ownership title deed / RoR (Record of Rights) / Pattadar Passbook',
        'Active DBT-enabled Bank Account Passbook',
        'Valid Aadhaar-linked Mobile Number'
    ],
    array[
        'Navigate to the official PM-KISAN portal (pmkisan.gov.in).',
        'Under Farmers Corner, click New Farmer Registration.',
        'Select Rural or Urban Farmer Registration and enter State, District, Sub-District, Block, and Village.',
        'Enter land survey/khasra numbers and upload supporting land records.',
        'Submit application and note Farmer Registration ID for status tracking.'
    ],
    true
),
-- 2. Rythu Bharosa / Rythu Bandhu (Telangana)
(
    'tg-rythu-bharosa',
    'Rythu Bharosa / Rythu Bandhu Investment Support Scheme',
    'Department of Agriculture & Farmers Welfare, Government of Telangana',
    'Agriculture',
    array['Telangana'],
    'Direct crop investment financial assistance per acre per season for Telangana farmers.',
    'DEMO DATA',
    '2026-10-15',
    'https://telangana.gov.in/',
    'https://rythubandhu.telangana.gov.in/',
    'telangana.gov.in / rythubandhu.telangana.gov.in',
    18,
    null,
    'Minimum age of 18 years for legal title holders. Upper age limit is unknown / not restricted.',
    false,
    null,
    'Not capped by household income bracket; granted on basis of cultivable land acreage.',
    array['All'],
    'No formal education condition required.',
    array['Farmer'],
    'Resident farmers, landholders, and recognized cultivators in Telangana.',
    array[
        'Direct financial support per acre per season to purchase agriculture inputs (seeds, fertilizer, labor).',
        'Credited electronically via Treasury and Direct Benefit Transfer (DBT).',
        'Relieves farmers from exploitative non-institutional debt cycles.'
    ],
    array[
        'Must be a resident farmer of Telangana holding cultivable agricultural land.',
        'Must hold a valid digital Pattadar Passbook issued via the Dharani / Bhu Bharati portal.',
        'Applicable strictly to agricultural land under active cultivation.'
    ],
    array[
        'Field verification of active cultivation by Agricultural Extension Officer (AEO).',
        'Land title validation against digital Dharani land registry.',
        'Confirmation that land is not converted for non-agricultural/real-estate layouts.'
    ],
    array[
        'Dharani Pattadar Passbook / Digital Title Deed',
        'Telangana Resident Proof / Voter Identity',
        'Aadhaar-seeded Bank Account details',
        'Crop sowing self-declaration form'
    ],
    array[
        'Check inclusion in the Village Revenue Agriculture Beneficiary List at local Gram Panchayat.',
        'Ensure Pattadar Passbook details are updated on the Dharani portal.',
        'Submit bank account details to the local Agriculture Extension Officer (AEO).',
        'Track disbursement status on the official Telangana Rythu Bandhu portal.'
    ],
    true
),
-- 3. Central Sector Scholarship
(
    'css-scholarship',
    'Central Sector Scheme of Scholarship for College and University Students',
    'Ministry of Education (Department of Higher Education)',
    'Education',
    array['All'],
    'Merit-cum-means financial scholarship for college undergraduate & postgraduate students.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/css-scholarship',
    'https://scholarships.gov.in/',
    'scholarships.gov.in',
    17,
    25,
    'Must be between 17 and 25 years of age at the time of college admission.',
    true,
    450000,
    'Gross annual family income from all sources must not exceed ₹4,50,000 per annum.',
    array['12th Pass', 'Undergraduate / Degree', 'Postgraduate'],
    'Passed Class 12 board exam and enrolled in regular undergraduate/postgraduate degree program.',
    array['Student'],
    'Regular full-time students in recognized universities, colleges, or institutions.',
    array[
        '₹12,000 per year at Graduation level for first 3 years of higher education.',
        '₹20,000 per year at Post-Graduation level.',
        'Direct Benefit Transfer into student personal bank account.'
    ],
    array[
        'Students above 80th percentile of successful candidates in relevant stream from respective Class 12 Examination Board.',
        'Pursuing regular full-time degree courses (distance/correspondence education not eligible).',
        'Family income from all sources must not exceed ₹4,50,000 per annum.',
        'Not availing any other scholarship/stipend concurrently.'
    ],
    array[
        'Institutional verification of admission & regular attendance by College Nodal Officer (INO).',
        'Verification of 80th percentile cutoff criteria against state board merit list.',
        'Verification of family income certificate by District Revenue Authority (SNO).'
    ],
    array[
        'Class 12th Board Marksheet and Passing Certificate',
        'Income Certificate issued by competent revenue authority (Tahsildar / SDO)',
        'College Bonafide Student Certificate and Admission Fee Receipt',
        'Student Bank Account Passbook (Aadhaar linked)'
    ],
    array[
        'Register on the National Scholarship Portal (scholarships.gov.in).',
        'Fill in academic details, Class 12 roll number, and institution code (AISHE).',
        'Upload verified income certificate and previous examination mark sheets.',
        'Submit application and hand over printed copy to College Nodal Officer for online verification.'
    ],
    true
),
-- 4. Dr. B.R. Ambedkar Overseas Vidya Nidhi (Telangana)
(
    'tg-ambedkar-overseas',
    'Dr. B.R. Ambedkar Overseas Vidya Nidhi Scheme',
    'Scheduled Castes / ST / BC / Minorities Welfare Department, Government of Telangana',
    'Education',
    array['Telangana'],
    'Overseas study scholarship grant up to ₹20 Lakhs for post-graduate and doctoral studies abroad.',
    'DEMO DATA',
    '2026-10-15',
    'https://telangana.gov.in/',
    'https://telanganaepass.cgg.gov.in/',
    'telanganaepass.cgg.gov.in',
    20,
    35,
    'Must be below 35 years of age as of July 1st of the notification year.',
    true,
    500000,
    'Total family income from all sources must not exceed ₹5,00,000 per annum.',
    array['Undergraduate / Degree', 'Postgraduate'],
    'Minimum 60% marks in Degree (for PG studies abroad) or in PG (for PhD studies abroad).',
    array['Student', 'Unemployed'],
    'Eligible students or young scholars domiciled in Telangana.',
    array[
        'Scholarship grant up to ₹20,00,000 (Twenty Lakhs) or actual course fees/expenses, whichever is less.',
        'One-way economy class airfare and mandatory visa processing charges.',
        'Disbursed in designated installment tranches linked to foreign university progress reports.'
    ],
    array[
        'Must be a permanent resident / domicile of Telangana State.',
        'Candidate must have secured admission into an accredited foreign university in USA, UK, Australia, Canada, Germany, etc.',
        'Valid scores in qualifying tests (GRE / GMAT) and English language tests (IELTS / TOEFL / PTE).',
        'Restricted strictly to only one student per family.'
    ],
    array[
        'In-person interview and certificate verification by the State Level Screening Committee.',
        'Verification of I-20 / CAS / University unconditional offer letter from foreign institution.',
        'MeeSeva Caste and Integrated Income Certificate verification by District Collectorate.'
    ],
    array[
        'Telangana Resident Certificate & Integrated Caste Certificate from MeeSeva',
        'Family Income Certificate (below ₹5 Lakhs p.a.)',
        'Degree Marksheets and Consolidated Marks Memo (minimum 60%)',
        'Scorecards of GRE/GMAT and IELTS/TOEFL',
        'Valid Passport, Student Visa, and University I-20 / Offer Letter'
    ],
    array[
        'Visit the Telangana ePASS official portal (telanganaepass.cgg.gov.in).',
        'Select Overseas Scholarship Services and register under the relevant welfare department.',
        'Upload academic credentials, university admission proof, and standardized test scores.',
        'Attend the document verification and interview session before the State Screening Committee.'
    ],
    true
),
-- 5. Aasara Social Security Pension Scheme (Telangana)
(
    'tg-aasara-pension',
    'Aasara Social Security Pension Scheme',
    'Panchayat Raj & Rural Development Department, Government of Telangana',
    'Housing & Social Welfare',
    array['Telangana'],
    'Monthly social security pension of ₹2,016 (₹3,016 for disabled) to protect vulnerable citizens.',
    'DEMO DATA',
    '2026-10-15',
    'https://telangana.gov.in/',
    'https://aasara.telangana.gov.in/',
    'telangana.gov.in / aasara.telangana.gov.in',
    57,
    null,
    '57 years and above for Old Age Pension (or 18+ for widows/disabled with medical certificate).',
    true,
    200000,
    'Annual family income must not exceed ₹1,50,000 in rural areas and ₹2,00,000 in urban areas.',
    array['All'],
    'No formal education condition required.',
    array['Daily Wage / Unorganized Worker', 'Unemployed', 'Farmer', 'Any'],
    'Vulnerable individuals, informal laborers, senior citizens, and persons without institutional livelihood.',
    array[
        'Monthly pension of ₹2,016 for senior citizens, widows, weavers, and toddy tappers.',
        'Enhanced monthly pension of ₹3,016 for persons with disabilities (40%+ disability).',
        'Direct DBT credit into Post Office savings account or biometric disbursement via Village Panchayat.'
    ],
    array[
        'Permanent resident of Telangana belonging to below-poverty-line (BPL) household.',
        'Old age applicants must have completed 57 years of age.',
        'Applicant must not be a government pensioner or income-tax payer.',
        'Only one pension is sanctioned per household (excluding specific disability exemptions).'
    ],
    array[
        'Door-to-door physical verification by Gram Panchayat Secretary / Municipal Ward Officer.',
        'SADAREM medical board certificate verification for disability claims.',
        'Cross-check against national database to prevent dual pension claims.'
    ],
    array[
        'Food Security Card (Ration Card) or BPL Household Certificate',
        'Age proof certificate (Voter ID, School certificate, or Medical age certificate)',
        'SADAREM Disability Certificate (for PWD applicants)',
        'Death Certificate of husband (for Widow pension)',
        'Bank / Post Office Passbook copy'
    ],
    array[
        'Obtain and fill the Aasara application form from local Gram Panchayat or MeeSeva centre.',
        'Submit with proof of age, residence, food security card, and passbook.',
        'Verification is conducted by the Panchayat Secretary or Bill Collector.',
        'Approved beneficiaries receive an Aasara Pension Card with unique Pensioner ID.'
    ],
    true
),
-- 6. PM Vishwakarma Scheme
(
    'pm-vishwakarma',
    'PM Vishwakarma Scheme',
    'Ministry of Micro, Small and Medium Enterprises (MSME)',
    'Skill Development',
    array['All'],
    'End-to-end support, modern toolkit incentive of ₹15,000, and collateral-free enterprise loans up to ₹3 Lakhs.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/pm-vishwakarma',
    'https://pmvishwakarma.gov.in/',
    'pmvishwakarma.gov.in',
    18,
    null,
    'Must be at least 18 years of age on date of registration. Upper age cap is unknown / not restricted.',
    false,
    null,
    'Unknown / No formal household income ceiling. Eligibility depends on traditional trade engagement and non-government employment.',
    array['All'],
    'No formal education condition required.',
    array['Self-Employed / Small Business', 'Daily Wage / Unorganized Worker'],
    'Artisans and craftspeople engaged hands-on in 18 recognized traditional trades (carpenter, blacksmith, potter, tailor, mason, etc.).',
    array[
        'PM Vishwakarma Certificate & ID Card recognizing authentic artisan status.',
        'Basic skill training of 5-7 days and advanced training of 15+ days with daily stipend of ₹500/day.',
        'Modern Toolkit incentive e-voucher of up to ₹15,000.',
        'Collateral-free enterprise loan up to ₹1 Lakh (Tranche 1) and ₹2 Lakhs (Tranche 2) at concessional 5% interest rate.'
    ],
    array[
        'Artisan working with hands and tools in one of the 18 traditional trades in the unorganized sector.',
        'Minimum 18 years of age on registration date.',
        'Must not have availed loans under PMEGP, PM SVANidhi, or Mudra in past 5 years.',
        'Benefits restricted to one member per family; government employees & family are excluded.'
    ],
    array[
        'Stage 1 verification: Local verification by Gram Panchayat Head / Urban Local Body Commissioner.',
        'Stage 2 verification: District Implementation Committee (DIC) appraisal.',
        'Stage 3 verification: Screening by National/State Quality Council.'
    ],
    array[
        'Aadhaar Card and Mobile linked to Aadhaar',
        'Bank Account details (DBT active)',
        'Ration Card or Family Declaration',
        'Trade-specific proof of self-employment / artisan work'
    ],
    array[
        'Visit nearest Common Service Centre (CSC) with Aadhaar and active mobile.',
        'Complete Aadhaar biometric authentication on the PM Vishwakarma portal (pmvishwakarma.gov.in).',
        'Select your traditional trade and submit application.',
        'Track three-tier verification (Gram Panchayat -> District Committee -> State Council).'
    ],
    true
),
-- 7. PM SVANidhi
(
    'pm-svanidhi',
    'PM Street Vendor''s AtmaNirbhar Nidhi (PM SVANidhi)',
    'Ministry of Housing and Urban Affairs',
    'Business & Entrepreneurship',
    array['All'],
    'Collateral-free working capital micro-credit with 7% interest subsidy and cashback for street vendors.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/pmsvanidhi',
    'https://pmsvanidhi.mohua.gov.in/',
    'pmsvanidhi.mohua.gov.in',
    18,
    null,
    'Must be at least 18 years old. Upper age cap is unknown / not restricted.',
    false,
    null,
    'Unknown / No formal household income ceiling; eligibility is based on urban vendor identity.',
    array['All'],
    'No formal education condition required.',
    array['Self-Employed / Small Business', 'Daily Wage / Unorganized Worker'],
    'Street vendors, hawkers, thelawalas, and micro-retailers in urban/peri-urban jurisdictions.',
    array[
        'First tranche: Working capital micro-loan up to ₹10,000 (1-year repayment tenure).',
        'Second & Third tranches: Enhanced loans of ₹20,000 and ₹50,000 upon timely repayment.',
        'Interest subsidy of 7% p.a. credited directly into bank account via DBT on quarterly basis.',
        'Digital transaction cashback incentives up to ₹1,200 per year.'
    ],
    array[
        'Street vendors engaged in vending in urban areas on or before the qualifying scheme dates.',
        'Vendors possessing Certificate of Vending (CoV) or Identity Card issued by Urban Local Body (ULB).',
        'Vendors possessing Letter of Recommendation (LoR) issued by Town Vending Committee (TVC).'
    ],
    array[
        'Physical field verification and issuance of Letter of Recommendation by ULB / Town Vending Committee.',
        'Credit evaluation and sanction by empaneled Lending Institution / Bank.'
    ],
    array[
        'Certificate of Vending (CoV) / Identity Card or LoR from ULB',
        'Government Photo ID Proof',
        'Bank Account details linked with mobile number'
    ],
    array[
        'Access the official PM SVANidhi portal (pmsvanidhi.mohua.gov.in).',
        'Verify mobile number with OTP and check Certificate of Vending status.',
        'Fill online application and choose preferred commercial or rural bank.',
        'Submit application; local ULB coordinators assist with banking correspondent sanction.'
    ],
    true
),
-- 8. Ayushman Bharat (AB-PMJAY)
(
    'pm-jay',
    'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
    'Ministry of Health and Family Welfare / National Health Authority (NHA)',
    'Healthcare',
    array['All'],
    'World''s largest health assurance scheme providing ₹5 Lakh free hospitalization per family per year.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/ab-pmjay',
    'https://pmjay.gov.in/',
    'pmjay.gov.in',
    null,
    null,
    'Unknown / No age restriction; provides cashless cover for all family members regardless of age or gender.',
    true,
    300000,
    'Entitlement based on SECC deprivation criteria and National Food Security Act (NFSA) / BPL income levels.',
    array['All'],
    'No formal education condition required.',
    array['All'],
    'Eligible low-income households, unorganized laborers, and deprived families.',
    array[
        'Cashless and paperless inpatient secondary and tertiary hospital care up to ₹5,00,000 per family per year.',
        'Covers up to 3 days of pre-hospitalization and 15 days of post-hospitalization diagnostics and medicines.',
        'Valid at all empaneled public and private hospitals across India (portable nationwide).'
    ],
    array[
        'Families automatically categorized under deprivation criteria D1 to D7 in rural areas, and 11 occupational categories in urban areas.',
        'Holders of active BPL / NFSA ration cards in participating states/UTs.',
        'Zero restriction on family size, age, or gender.'
    ],
    array[
        'Biometric e-KYC verification and ration card linkage by Arogya Mitra at empaneled hospital helpdesk.',
        'State health agency validation before issuance of Ayushman Golden Card.'
    ],
    array[
        'Ration Card or NFSA Household Entitlement Letter',
        'Government photo identity proof for each family member',
        'Active Mobile number for OTP validation'
    ],
    array[
        'Check eligibility on pmjay.gov.in using Am I Eligible or call helpline 14555.',
        'Visit nearest Empaneled Hospital or Common Service Centre (CSC).',
        'Meet the Pradhan Mantri Arogya Mitra at the helpdesk.',
        'Complete Aadhaar e-KYC to generate your free Ayushman Card on the spot.'
    ],
    true
),
-- 9. Pradhan Mantri MUDRA Yojana (PMMY)
(
    'pm-mudra-yojana',
    'Pradhan Mantri MUDRA Yojana (PMMY)',
    'Ministry of Finance (Department of Financial Services)',
    'Business & Entrepreneurship',
    array['All'],
    'Collateral-free business loans up to ₹10 Lakhs (extended up to ₹20 Lakhs) for micro-enterprises.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/pmmy',
    'https://www.mudra.org.in/',
    'mudra.org.in',
    18,
    65,
    'Borrower must be at least 18 years old and typically up to 65 years at loan maturity.',
    false,
    null,
    'Unknown / No formal household income ceiling; sanction depends on business viability and cash flow.',
    array['All'],
    'No formal education condition required.',
    array['Self-Employed / Small Business', 'Farmer', 'Unemployed', 'Daily Wage / Unorganized Worker'],
    'Non-corporate, non-farm small/micro enterprises in manufacturing, trade, and services.',
    array[
        'Shishu Category: Loans up to ₹50,000 for early-stage micro-ventures.',
        'Kishor Category: Loans from ₹50,000 up to ₹5,00,000 for business expansion.',
        'Tarun Category: Loans from ₹5,00,000 up to ₹10,00,000 (and Tarun Plus up to ₹20 Lakhs).',
        'Zero collateral or third-party guarantee required from the borrower.'
    ],
    array[
        'Any Indian citizen who has a feasible business plan for a non-farm revenue-generating enterprise.',
        'Applicable to manufacturing, services, trading, processing, and allied agricultural activities.',
        'Applicant must not have any prior default records with any scheduled bank.'
    ],
    array[
        'Bank credit appraisal and physical site inspection of the business premises.',
        'CIBIL / Credit bureau report scoring and default check by lending branch.',
        'Verification of equipment/raw material price quotations.'
    ],
    array[
        'Identity Proof (Voter ID, Passport, or Driving License)',
        'Proof of Residence (Electricity bill, Ration card, or Rental agreement)',
        'Business establishment license / Udyam Registration (if operational)',
        'Project report with 1-year projected income/cost estimation'
    ],
    array[
        'Prepare your enterprise project plan and capital estimation.',
        'Apply online through the national portal (udyamimitra.in) or visit any participating commercial/rural bank.',
        'Submit application form along with quotation for machinery/equipment.',
        'Bank processes appraisal and disburses loan with MUDRA Card.'
    ],
    true
),
-- 10. PM Kaushal Vikas Yojana (PMKVY 4.0)
(
    'pmkvy-skills',
    'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    'Ministry of Skill Development and Entrepreneurship (MSDE)',
    'Skill Development',
    array['All'],
    'Free industry-relevant vocational training, NSQF certification, and placement assistance.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/pmkvy',
    'https://www.pmkvyofficial.org/',
    'pmkvyofficial.org / skillindiadigital.gov.in',
    15,
    45,
    'Indian youth between 15 and 45 years of age.',
    false,
    null,
    'Unknown / No formal household income ceiling; open to all school/college dropouts and job seekers.',
    array['Below 10th', '10th Pass', '12th Pass', 'Diploma / Vocational', 'Undergraduate / Degree'],
    'Minimum education depends on the specific Job Role / NSQF Qualification Pack selected.',
    array['Student', 'Unemployed', 'Daily Wage / Unorganized Worker'],
    'Unemployed youth, school/college dropouts, or uncertified informal workers.',
    array[
        '100% government-funded training in emerging tech (AI, Drones, Solar, EV, Coding, Logistics, Healthcare).',
        'Government-recognized National Skill Qualification Framework (NSQF) certification.',
        'Direct monetary reward and travel allowance disbursed via DBT upon course completion and certification.',
        'Employment Rozgar Melas and placement facilitation.'
    ],
    array[
        'Indian national youth looking for marketable job-oriented vocational skills.',
        'Possess basic identity proof and bank account.',
        'Must not have completed identical skill certification under government sponsorship in previous year.'
    ],
    array[
        'Biometric AEPS attendance verification (minimum 70% attendance required).',
        'Independent assessment and practical skill examination by third-party Sector Skill Council.'
    ],
    array[
        'Educational qualification certificates / transfer certificate',
        'Government Photo Identity Card',
        'Recent passport-sized photographs',
        'DBT-enabled Bank Account passbook copy'
    ],
    array[
        'Visit Skill India Digital portal (skillindiadigital.gov.in) or pmkvyofficial.org.',
        'Search accredited training centres by state, district, or job role preference.',
        'Enroll in chosen batch (Short Term Training or Recognition of Prior Learning).',
        'Complete hands-on curriculum and appear for independent Sector Skill Council assessment.'
    ],
    true
),
-- 11. Stand-Up India Scheme
(
    'standup-india',
    'Stand-Up India Scheme',
    'Ministry of Finance (Department of Financial Services)',
    'Business & Entrepreneurship',
    array['All'],
    'Bank loans between ₹10 Lakhs and ₹1 Crore for greenfield commercial ventures by SC/ST & Women.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/stand-up-india',
    'https://www.standupmitra.in/',
    'standupmitra.in',
    18,
    null,
    'Must be at least 18 years of age. Upper age cap is unknown / not restricted.',
    false,
    null,
    'Unknown / No formal household income ceiling; determined by viability of commercial proposal.',
    array['All'],
    'No formal education condition required.',
    array['Self-Employed / Small Business', 'Unemployed', 'Salaried / Working Professional'],
    'SC/ST and/or Woman entrepreneurs starting a new greenfield enterprise.',
    array[
        'Composite bank loan between ₹10 Lakh and ₹1 Crore covering up to 85% of project cost.',
        'Repayable over 7 years with maximum moratorium period of 18 months.',
        'Handholding support via SIDBI and Lead District Managers (LDMs).'
    ],
    array[
        'SC/ST and/or Woman entrepreneurs above 18 years of age.',
        'Loan is granted only for greenfield projects (first-time venture in manufacturing, services, agri-allied, or trading).',
        'In non-individual enterprises, 51% shareholding and controlling stake must be held by SC/ST or woman entrepreneur.'
    ],
    array[
        'Caste certificate and legal gender verification by scheduled commercial bank branch.',
        'Techno-economic project feasibility appraisal by bank credit committee.',
        'Inspection of proposed greenfield land and machinery quotations.'
    ],
    array[
        'Identity Proof and Caste Certificate (for SC/ST applicants)',
        'Proof of Business Premises / Land Title',
        'Project Report detailing machinery, working capital requirement, and market viability',
        'Bank statements and financial projections'
    ],
    array[
        'Visit the Stand-Up Mitra portal (standupmitra.in).',
        'Register as a borrower and fill the greenfield project application.',
        'Select your preferred scheduled commercial bank branch.',
        'Attend the credit appraisal meeting and access handholding assistance.'
    ],
    true
),
-- 12. Sukanya Samriddhi Yojana (SSY)
(
    'sukanya-samriddhi',
    'Sukanya Samriddhi Yojana (SSY)',
    'Ministry of Finance / Department of Posts',
    'Housing & Social Welfare',
    array['All'],
    'High-interest government-backed small savings scheme for girl child education and marriage.',
    'DEMO DATA',
    '2026-10-15',
    'https://www.myscheme.gov.in/schemes/ssy',
    'https://www.indiapost.gov.in/',
    'indiapost.gov.in',
    18,
    null,
    'Parent or legal guardian must be 18+ years old opening account for a girl child below 10 years.',
    false,
    null,
    'Unknown / No income ceiling; open to all families with a girl child.',
    array['All'],
    'No formal education condition required.',
    array['All'],
    'Open to citizens across all occupations.',
    array[
        'Attractive high interest rate (currently 8.2% p.a., compounded annually).',
        'Triple tax exemption: Tax exemption on investment, interest accrued, and maturity withdrawal (EEE status).',
        'Minimum deposit of just ₹250 per year up to maximum ₹1,50,000 per financial year.',
        'Partial withdrawal allowed for higher education after daughter turns 18.'
    ],
    array[
        'Account can be opened by natural or legal guardian for a girl child below 10 years of age.',
        'Maximum of two accounts permitted per family (one for each girl child, exception for twins/triplets).',
        'Account matures after 21 years from opening date or upon marriage of the girl child after age 18.'
    ],
    array[
        'Verification of girl child birth certificate by Post Office / Commercial Bank officer.',
        'Verification of legal guardian status and family tree (maximum two accounts check).'
    ],
    array[
        'Birth Certificate of the girl child',
        'Identity and Address Proof of the parent / legal guardian',
        'Initial deposit amount (minimum ₹250 cash or cheque)',
        'Passport size photographs of guardian and child'
    ],
    array[
        'Visit any Post Office branch or authorized public/private commercial bank.',
        'Obtain and fill the Sukanya Samriddhi Account Opening Form (SSY-1).',
        'Attach child birth certificate and guardian KYC documents.',
        'Deposit the initial account opening amount; a dedicated SSY passbook is issued.'
    ],
    true
)
on conflict (id) do update set
    name = excluded.name,
    ministry = excluded.ministry,
    category = excluded.category,
    state_applicability = excluded.state_applicability,
    tagline = excluded.tagline,
    last_verified = excluded.last_verified,
    official_source = excluded.official_source,
    official_url = excluded.official_url,
    portal_display = excluded.portal_display,
    min_age = excluded.min_age,
    max_age = excluded.max_age,
    age_rule_description = excluded.age_rule_description,
    is_income_applicable = excluded.is_income_applicable,
    max_income = excluded.max_income,
    income_rule_description = excluded.income_rule_description,
    allowed_education = excluded.allowed_education,
    education_rule_description = excluded.education_rule_description,
    allowed_occupations = excluded.allowed_occupations,
    occupation_rule_description = excluded.occupation_rule_description,
    benefits = excluded.benefits,
    eligibility_criteria = excluded.eligibility_criteria,
    manual_verification_rules = excluded.manual_verification_rules,
    required_documents = excluded.required_documents,
    application_steps = excluded.application_steps,
    is_active = excluded.is_active,
    updated_at = timezone('utc'::text, now());
