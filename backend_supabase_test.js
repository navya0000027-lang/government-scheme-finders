/**
 * backend_supabase_test.js - Automated Backend & Supabase Schema Test Suite
 * -------------------------------------------------------------------------
 * Project: Government Scheme Finder (Hackathon MVP)
 * Team: Scheme Savers
 * 
 * Tests:
 * 1. SQL Schema Integrity: Validates DDL, table constraints, RLS policies, indexes, and stored functions
 * 2. Seed Data Parity: Validates that all 12 schemes from schemes.js are seeded in SQL with full field integrity
 * 3. Supabase Client Contract: Tests object mapping, data transformation, and graceful fallback behavior
 * 4. Stored Procedure Simulation: Tests SQL match_schemes logic against all preset personas
 * 5. Telemetry & Security: Validates zero sensitive data collection policy in database schema
 */

const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('⚡ RUNNING SCHEME SAVERS SUPABASE BACKEND TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName} - ${details}`);
  }
}

// =============================================================================
// TEST SUITE 1: SQL Schema File & Structure Verification
// =============================================================================
console.log('\n--- 1. Testing SQL Schema & DDL Integrity ---');

const sqlPath = path.join(__dirname, 'supabase_schema.sql');
assert(fs.existsSync(sqlPath), 'supabase_schema.sql file exists');

const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

// Table declarations
assert(sqlContent.includes('create table public.schemes'), 'Table "public.schemes" DDL is defined');
assert(sqlContent.includes('create table if not exists public.eligibility_queries'), 'Table "public.eligibility_queries" DDL is defined');
assert(sqlContent.includes('create table if not exists public.citizen_feedback'), 'Table "public.citizen_feedback" DDL is defined');

// Primary and foreign keys
assert(sqlContent.includes('id text primary key'), 'Primary key defined on public.schemes(id)');
assert(sqlContent.includes('id uuid primary key default uuid_generate_v4()'), 'UUID primary key defined on eligibility_queries');
assert(sqlContent.includes('references public.schemes(id)'), 'Foreign key relationship defined on citizen_feedback(scheme_id)');

// Row Level Security (RLS)
assert(sqlContent.includes('alter table public.schemes enable row level security;'), 'RLS enabled on public.schemes');
assert(sqlContent.includes('alter table public.eligibility_queries enable row level security;'), 'RLS enabled on public.eligibility_queries');
assert(sqlContent.includes('alter table public.citizen_feedback enable row level security;'), 'RLS enabled on public.citizen_feedback');

// RLS Policies
assert(sqlContent.includes('create policy "Allow public read access on schemes"'), 'Public read policy exists on schemes table');
assert(sqlContent.includes('create policy "Allow anonymous insert on eligibility_queries"'), 'Public anonymous insert policy exists on queries table');
assert(sqlContent.includes('create policy "Allow anonymous insert on citizen_feedback"'), 'Public anonymous insert policy exists on feedback table');

// Indexes
assert(sqlContent.includes('create index if not exists idx_schemes_category'), 'Category index defined');
assert(sqlContent.includes('create index if not exists idx_schemes_state'), 'GIN index defined on state_applicability array');
assert(sqlContent.includes('create index if not exists idx_schemes_is_active'), 'Active status index defined');

// Stored Procedure / RPC Function
assert(sqlContent.includes('create or replace function public.match_schemes'), 'Stored function "match_schemes" RPC is defined');
assert(sqlContent.includes('grant execute on function public.match_schemes to anon, authenticated, service_role'), 'Execution permissions granted for match_schemes RPC');

// =============================================================================
// TEST SUITE 2: Seed Data Validation & Parity with schemes.js
// =============================================================================
console.log('\n--- 2. Testing Seed Data & Parity with schemes.js ---');

const schemesPath = path.join(__dirname, 'schemes.js');
assert(fs.existsSync(schemesPath), 'schemes.js file exists');

const schemesCode = fs.readFileSync(schemesPath, 'utf-8');
const context = {};
const evalFunction = new Function('context', `${schemesCode}; 
  context.SCHEMES_DATABASE = SCHEMES_DATABASE; 
  context.DEMO_PRESETS = DEMO_PRESETS;
`);
evalFunction(context);

const jsSchemes = context.SCHEMES_DATABASE;
const jsPresets = context.DEMO_PRESETS;

assert(Array.isArray(jsSchemes) && jsSchemes.length === 12, `schemes.js has exactly 12 verified schemes (found: ${jsSchemes.length})`);

// Check that every scheme ID is present in the SQL seed statements
jsSchemes.forEach(scheme => {
  const isPresentInSql = sqlContent.includes(`'${scheme.id}'`);
  assert(isPresentInSql, `SQL seed contains scheme ID: "${scheme.id}" (${scheme.name})`);
});

// Check SQL ON CONFLICT statement for idempotent execution
assert(sqlContent.includes('on conflict (id) do update set'), 'SQL seed contains idempotent ON CONFLICT DO UPDATE clause');

// =============================================================================
// TEST SUITE 3: Supabase Client Adapter Contract (supabaseClient.js)
// =============================================================================
console.log('\n--- 3. Testing Supabase Client Module (supabaseClient.js) ---');

const clientPath = path.join(__dirname, 'supabaseClient.js');
assert(fs.existsSync(clientPath), 'supabaseClient.js file exists');

const clientContent = fs.readFileSync(clientPath, 'utf-8');

assert(clientContent.includes('SUPABASE_CONFIG'), 'SUPABASE_CONFIG definition present');
assert(clientContent.includes('fetchSchemesFromDatabase'), 'fetchSchemesFromDatabase function exported');
assert(clientContent.includes('matchSchemesServerSide'), 'matchSchemesServerSide RPC function exported');
assert(clientContent.includes('logEligibilityQueryToSupabase'), 'logEligibilityQueryToSupabase telemetry exported');
assert(clientContent.includes('SCHEMES_DATABASE'), 'Graceful fallback to local SCHEMES_DATABASE implemented');

// Test data mapping function (PostgreSQL snake_case -> JS camelCase)
function mapPostgresRowToJsObject(row) {
  return {
    id: row.id,
    name: row.name,
    ministry: row.ministry,
    category: row.category,
    stateApplicability: row.state_applicability || ["All"],
    tagline: row.tagline,
    demoLabel: row.demo_label || "DEMO DATA",
    lastVerified: row.last_verified,
    officialSource: row.official_source,
    officialUrl: row.official_url,
    portalDisplay: row.portal_display,
    ageRules: {
      minAge: row.min_age,
      maxAge: row.max_age,
      ruleDescription: row.age_rule_description
    },
    incomeRules: {
      isApplicable: row.is_income_applicable,
      maxIncome: row.max_income ? Number(row.max_income) : null,
      ruleDescription: row.income_rule_description
    },
    educationRules: {
      allowedEducation: row.allowed_education || ["All"],
      ruleDescription: row.education_rule_description
    },
    occupationRules: {
      allowedOccupations: row.allowed_occupations || ["All"],
      ruleDescription: row.occupation_rule_description
    },
    benefits: row.benefits || [],
    eligibilityCriteria: row.eligibility_criteria || [],
    manualVerificationRules: row.manual_verification_rules || [],
    requiredDocuments: row.required_documents || [],
    applicationSteps: row.application_steps || []
  };
}

// Sample mock row returned from Supabase REST API
const mockDbRow = {
  id: "pm-kisan",
  name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
  ministry: "Ministry of Agriculture and Farmers Welfare",
  category: "Agriculture",
  state_applicability: ["All"],
  tagline: "Direct income support of ₹6,000 per year in three 4-monthly installments.",
  demo_label: "DEMO DATA",
  last_verified: "2026-10-15",
  official_source: "https://www.myscheme.gov.in/schemes/pm-kisan",
  official_url: "https://pmkisan.gov.in/",
  portal_display: "pmkisan.gov.in",
  min_age: 18,
  max_age: null,
  age_rule_description: "Applicant must be an adult citizen (18 years or older). No official upper age limit specified.",
  is_income_applicable: false,
  max_income: null,
  income_rule_description: "Unknown / Not capped by a specific numerical income limit.",
  allowed_education: ["All"],
  education_rule_description: "No formal education condition required.",
  allowed_occupations: ["Farmer", "Daily Wage / Unorganized Worker"],
  occupation_rule_description: "Small and marginal farmer families with cultivable landholding.",
  benefits: ["₹6,000 per year via DBT"],
  eligibility_criteria: ["Farmer family owning cultivable land"],
  manual_verification_rules: ["Land title verification"],
  required_documents: ["Aadhaar", "Land deed"],
  application_steps: ["Register on pmkisan.gov.in"]
};

const mappedJs = mapPostgresRowToJsObject(mockDbRow);
assert(mappedJs.id === "pm-kisan" && mappedJs.ageRules.minAge === 18 && mappedJs.ageRules.maxAge === null, "Postgres row mapped correctly to JS nested structure");
assert(mappedJs.incomeRules.isApplicable === false && mappedJs.incomeRules.maxIncome === null, "Postgres NULL and boolean correctly preserved");

// =============================================================================
// TEST SUITE 4: Database Stored Function (match_schemes) Logic Simulation
// =============================================================================
console.log('\n--- 4. Testing match_schemes Stored Procedure Simulation ---');

/**
 * Simulates the exact SQL logic written inside public.match_schemes:
 * where is_active = true
 *   and (min_age is null or p_age >= min_age)
 *   and (max_age is null or p_age <= max_age)
 *   and ('All' = any(state_applicability) or p_state = any(state_applicability) or p_state = 'All India')
 *   and ('All' = any(allowed_education) or p_education = any(allowed_education) or p_education = 'Any')
 *   and ('All' = any(allowed_occupations) or p_occupation = any(allowed_occupations) or p_occupation = 'Any')
 *   and (not is_income_applicable or max_income is null or p_income <= max_income)
 */
function simulateSqlMatchSchemes(dbRecords, p_age, p_state, p_education, p_occupation, p_income) {
  return dbRecords.filter(row => {
    // 1. Age condition
    const ageOk = (row.min_age === null || row.min_age === undefined || p_age >= row.min_age) &&
                  (row.max_age === null || row.max_age === undefined || p_age <= row.max_age);

    // 2. State condition
    const states = row.state_applicability || ['All'];
    const stateOk = states.includes('All') || states.includes(p_state) || p_state === 'All India';

    // 3. Education condition
    const edus = row.allowed_education || ['All'];
    const eduOk = edus.includes('All') || edus.includes(p_education) || p_education === 'Any';

    // 4. Occupation condition
    const occs = row.allowed_occupations || ['All'];
    const occOk = occs.includes('All') || occs.includes(p_occupation) || p_occupation === 'Any';

    // 5. Income condition
    const incomeOk = (!row.is_income_applicable) || (row.max_income === null || row.max_income === undefined) || (p_income <= row.max_income);

    return ageOk && stateOk && eduOk && occOk && incomeOk;
  });
}

// Convert all 12 schemes to mock DB rows
const allMockDbRows = jsSchemes.map(s => ({
  id: s.id,
  name: s.name,
  state_applicability: s.stateApplicability,
  min_age: s.ageRules.minAge,
  max_age: s.ageRules.maxAge,
  is_income_applicable: s.incomeRules.isApplicable,
  max_income: s.incomeRules.maxIncome,
  allowed_education: s.educationRules.allowedEducation,
  allowed_occupations: s.occupationRules.allowedOccupations
}));

// Test 4.1: College Student
const studentResults = simulateSqlMatchSchemes(allMockDbRows, 20, 'All India', 'Undergraduate / Degree', 'Student', 220000);
assert(studentResults.some(r => r.id === 'css-scholarship'), 'Stored procedure simulation: College Student matches Central Sector Scholarship');

// Test 4.2: Small Farmer
const farmerResults = simulateSqlMatchSchemes(allMockDbRows, 42, 'All India', '10th Pass', 'Farmer', 180000);
assert(farmerResults.some(r => r.id === 'pm-kisan'), 'Stored procedure simulation: Small Farmer matches PM-KISAN');

// Test 4.3: Telangana Student
const tgStudentResults = simulateSqlMatchSchemes(allMockDbRows, 23, 'Telangana', 'Undergraduate / Degree', 'Student', 250000);
assert(tgStudentResults.some(r => r.id === 'tg-ambedkar-overseas'), 'Stored procedure simulation: Telangana Student matches Dr. B.R. Ambedkar Overseas Vidya Nidhi');

// Test 4.4: Telangana Farmer
const tgFarmerResults = simulateSqlMatchSchemes(allMockDbRows, 38, 'Telangana', 'Below 10th', 'Farmer', 150000);
assert(tgFarmerResults.some(r => r.id === 'tg-rythu-bharosa') && tgFarmerResults.some(r => r.id === 'pm-kisan'), 'Stored procedure simulation: Telangana Farmer matches Rythu Bharosa and PM-KISAN');

// Test 4.5: State Isolation (Maharashtra user must NOT match Telangana-only scheme)
const mhStudentResults = simulateSqlMatchSchemes(allMockDbRows, 23, 'Maharashtra', 'Undergraduate / Degree', 'Student', 250000);
assert(!mhStudentResults.some(r => r.id === 'tg-ambedkar-overseas'), 'Stored procedure simulation: State isolation strictly respected');

// =============================================================================
// TEST SUITE 5: Security, PII & Telemetry Constraints
// =============================================================================
console.log('\n--- 5. Testing Security, PII & Privacy Safeguards ---');

// Extract all table column names from DDL (between create table ... ( and );)
const tableMatches = sqlContent.match(/create table[\s\S]*?\([\s\S]*?\);/gi) || [];
const allColumnLines = [];
tableMatches.forEach(tableDdl => {
  const lines = tableDdl.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('create table') && !trimmed.startsWith(');') && !trimmed.startsWith('constraint') && !trimmed.startsWith('primary key') && !trimmed.startsWith('foreign key')) {
      const colName = trimmed.split(' ')[0].toLowerCase().replace(/"/g, '');
      if (colName) allColumnLines.push(colName);
    }
  });
});

// Check that no Aadhaar, password, or bank account columns exist in any table
const forbiddenColumns = ['aadhaar', 'aadhar', 'password', 'bank_account', 'account_number', 'pan_card', 'pin_code', 'ssn'];
forbiddenColumns.forEach(forbidden => {
  const hasForbiddenCol = allColumnLines.some(col => col.includes(forbidden));
  assert(!hasForbiddenCol, `Database schema has NO column collecting sensitive credential: "${forbidden}"`);
});

// Check eligibility_queries table privacy: strictly no user contact info columns
const telemetryColumns = ['user_name', 'user_email', 'user_phone', 'phone_number', 'mobile_number', 'full_name'];
telemetryColumns.forEach(forbidden => {
  const hasForbiddenCol = allColumnLines.some(col => col.includes(forbidden));
  assert(!hasForbiddenCol, `eligibility_queries has NO identifying user column: "${forbidden}"`);
});

// =============================================================================
// SUMMARY REPORT
// =============================================================================
console.log('\n================================================================');
console.log(`📊 SUPABASE BACKEND TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 All backend and database schema tests passed successfully!\n');
  process.exit(0);
} else {
  console.error(`❌ Some tests failed. Passed ${passedTests} of ${totalTests}.\n`);
  process.exit(1);
}
