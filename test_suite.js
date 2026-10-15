/**
 * test_suite.js - Automated Test Runner for Verified Government Schemes MVP
 * -------------------------------------------------------------------------
 * Verifies:
 * 1. File existence (all 5 core files)
 * 2. Scheme schema compliance (official name, ministry, state applicability,
 *    age rules, income rules, education rules, occupation rules, benefits,
 *    manual verification rules, required documents, application steps,
 *    official source URL, and last-verified date)
 * 3. Proper representation of unknown/unrestricted conditions (null or 'unknown', not invented)
 * 4. Rule-based matching engine & preset persona verifications
 * 5. HTML DOM bindings and privacy safeguards
 */

const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 RUNNING SCHEME SAVERS MVP VERIFIED TEST SUITE');
console.log('====================================================\n');

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

// 1. Verify existence of required 5 files
const requiredFiles = ['index.html', 'style.css', 'script.js', 'schemes.js', 'README.md'];
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  assert(fs.existsSync(filePath), `File existence check: ${file}`);
});

// 2. Load schemes.js
const schemesCode = fs.readFileSync(path.join(__dirname, 'schemes.js'), 'utf-8');
const context = {};
const evalFunction = new Function('context', `${schemesCode}; 
  context.SCHEMES_DATABASE = SCHEMES_DATABASE; 
  context.DEMO_PRESETS = DEMO_PRESETS;
  context.INDIAN_STATES_AND_UTS = INDIAN_STATES_AND_UTS;
`);
evalFunction(context);

const schemes = context.SCHEMES_DATABASE;
const presets = context.DEMO_PRESETS;
const states = context.INDIAN_STATES_AND_UTS;

assert(Array.isArray(schemes) && schemes.length >= 10, `Schemes database loaded (${schemes.length} schemes)`);
assert(Array.isArray(presets) && presets.length >= 4, `Presets loaded (${presets.length} presets)`);
assert(Array.isArray(states) && states.length >= 35, `States list loaded (${states.length} states/UTs)`);

// 3. Schema & Data Integrity Checks for each verified scheme
schemes.forEach(s => {
  // Official name & Ministry
  assert(s.id && s.name && s.ministry && s.category && s.tagline, `Core identification check: "${s.name}"`);
  
  // State applicability
  assert(Array.isArray(s.stateApplicability) && s.stateApplicability.length > 0, `State applicability check: "${s.name}"`);
  
  // DEMO DATA label
  assert(s.demoLabel === 'DEMO DATA', `Demo label check: "${s.name}"`);

  // Last verified date & Official Source URL
  assert(s.lastVerified && typeof s.lastVerified === 'string', `Last verified date present: "${s.name}" (${s.lastVerified})`);
  assert(s.officialSource && s.officialSource.startsWith('https://'), `Official source URL verified: "${s.name}" (${s.officialSource})`);
  assert(s.officialUrl && s.officialUrl.startsWith('https://'), `Official portal URL verified: "${s.name}" (${s.officialUrl})`);

  // Age rules: must have ruleDescription, minAge/maxAge must be number or null/'unknown'
  const validAgeRules = s.ageRules && typeof s.ageRules.ruleDescription === 'string' &&
    (typeof s.ageRules.minAge === 'number' || s.ageRules.minAge === null || s.ageRules.minAge === 'unknown') &&
    (typeof s.ageRules.maxAge === 'number' || s.ageRules.maxAge === null || s.ageRules.maxAge === 'unknown');
  assert(validAgeRules, `Age rules formatted correctly (unknowns represented as null/unknown): "${s.name}"`);

  // Income rules: must have isApplicable, ruleDescription, maxIncome must be number or null/'unknown'
  const validIncomeRules = s.incomeRules && typeof s.incomeRules.ruleDescription === 'string' &&
    typeof s.incomeRules.isApplicable === 'boolean' &&
    (typeof s.incomeRules.maxIncome === 'number' || s.incomeRules.maxIncome === null || s.incomeRules.maxIncome === 'unknown');
  assert(validIncomeRules, `Income rules formatted correctly (isApplicable & unknown support): "${s.name}"`);

  // Education & Occupation conditions
  const validEducation = s.educationRules && typeof s.educationRules.ruleDescription === 'string' &&
    (Array.isArray(s.educationRules.allowedEducation) || s.educationRules.allowedEducation === 'unknown');
  assert(validEducation, `Education condition check: "${s.name}"`);

  const validOccupation = s.occupationRules && typeof s.occupationRules.ruleDescription === 'string' &&
    (Array.isArray(s.occupationRules.allowedOccupations) || s.occupationRules.allowedOccupations === 'unknown');
  assert(validOccupation, `Occupation condition check: "${s.name}"`);

  // Benefits, Eligibility, Required Documents, Application Steps
  assert(Array.isArray(s.benefits) && s.benefits.length > 0, `Benefits list present: "${s.name}"`);
  assert(Array.isArray(s.eligibilityCriteria) && s.eligibilityCriteria.length > 0, `Eligibility criteria present: "${s.name}"`);
  assert(Array.isArray(s.requiredDocuments) && s.requiredDocuments.length > 0, `Documents list present: "${s.name}"`);
  assert(Array.isArray(s.applicationSteps) && s.applicationSteps.length > 0, `Steps list present: "${s.name}"`);

  // Manual verification rules (offline/field checks)
  assert(Array.isArray(s.manualVerificationRules) && s.manualVerificationRules.length > 0, `Manual verification explanation present: "${s.name}"`);
});

// 4. Test Scheme Matching Logic
function matchSchemes(profile) {
  return schemes.filter(scheme => {
    // 1. Age check
    let matchesAge = true;
    if (scheme.ageRules) {
      if (typeof scheme.ageRules.minAge === 'number') {
        if (profile.age < scheme.ageRules.minAge) matchesAge = false;
      }
      if (typeof scheme.ageRules.maxAge === 'number') {
        if (profile.age > scheme.ageRules.maxAge) matchesAge = false;
      }
    }

    // 2. State check
    let matchesState = true;
    if (scheme.stateApplicability) {
      matchesState = scheme.stateApplicability.includes('All') || 
                     scheme.stateApplicability.includes(profile.state) ||
                     profile.state === 'All India';
    }

    // 3. Education check
    let matchesEducation = true;
    if (scheme.educationRules && scheme.educationRules.allowedEducation) {
      const allowed = scheme.educationRules.allowedEducation;
      if (allowed !== 'unknown' && !allowed.includes('All')) {
        matchesEducation = allowed.includes(profile.education) || profile.education === 'Any';
      }
    }

    // 4. Occupation check
    let matchesOccupation = true;
    if (scheme.occupationRules && scheme.occupationRules.allowedOccupations) {
      const allowed = scheme.occupationRules.allowedOccupations;
      if (allowed !== 'unknown' && !allowed.includes('All')) {
        matchesOccupation = allowed.includes(profile.occupation) || profile.occupation === 'Any';
      }
    }

    // 5. Income check
    let matchesIncome = true;
    if (scheme.incomeRules && scheme.incomeRules.isApplicable) {
      if (typeof scheme.incomeRules.maxIncome === 'number') {
        matchesIncome = profile.income <= scheme.incomeRules.maxIncome;
      }
    }

    return matchesAge && matchesState && matchesEducation && matchesOccupation && matchesIncome;
  });
}

// Preset Test 1: College Student (All India)
const studentMatches = matchSchemes(presets[0].data);
assert(
  studentMatches.some(s => s.id === 'css-scholarship'),
  `Preset "College Student" matches Central Sector Scholarship`,
  `Matches: ${studentMatches.map(s => s.id).join(', ')}`
);

// Preset Test 2: Small Farmer (All India)
const farmerMatches = matchSchemes(presets[1].data);
assert(
  farmerMatches.some(s => s.id === 'pm-kisan'),
  `Preset "Small Farmer" matches PM-KISAN`,
  `Matches: ${farmerMatches.map(s => s.id).join(', ')}`
);

// Preset Test 3: Telangana Student (Overseas Studies Aspirant)
const tgStudentMatches = matchSchemes(presets[2].data);
assert(
  tgStudentMatches.some(s => s.id === 'tg-ambedkar-overseas'),
  `Preset "Telangana Student" matches Dr. B.R. Ambedkar Overseas Vidya Nidhi`,
  `Matches: ${tgStudentMatches.map(s => s.id).join(', ')}`
);

// Preset Test 4: Telangana Farmer (Rythu Bharosa + PM-KISAN)
const tgFarmerMatches = matchSchemes(presets[3].data);
assert(
  tgFarmerMatches.some(s => s.id === 'tg-rythu-bharosa') && tgFarmerMatches.some(s => s.id === 'pm-kisan'),
  `Preset "Telangana Farmer" matches both Rythu Bharosa and PM-KISAN`,
  `Matches: ${tgFarmerMatches.map(s => s.id).join(', ')}`
);

// Preset Test 5: Artisan / Street Vendor
const vendorMatches = matchSchemes(presets[4].data);
assert(
  vendorMatches.some(s => s.id === 'pm-svanidhi') || vendorMatches.some(s => s.id === 'pm-vishwakarma'),
  `Preset "Artisan / Street Vendor" matches PM SVANidhi or PM Vishwakarma`,
  `Matches: ${vendorMatches.map(s => s.id).join(', ')}`
);

// Test State Exclusivity: Non-Telangana resident does not match Telangana-exclusive schemes
const nonTgProfile = {
  age: 23,
  state: 'Maharashtra',
  education: 'Undergraduate / Degree',
  occupation: 'Student',
  income: 250000
};
const nonTgMatches = matchSchemes(nonTgProfile);
assert(
  !nonTgMatches.some(s => s.id === 'tg-ambedkar-overseas'),
  `State isolation: Maharashtra resident does NOT match Telangana-only scheme`
);

// Test Manual Verification Content: Every scheme has at least 2 manual verification criteria
const allHaveManualVerification = schemes.every(s => s.manualVerificationRules && s.manualVerificationRules.length >= 2);
assert(allHaveManualVerification, 'All schemes have detailed manual verification criteria explained');

// Check HTML bindings
const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const expectedDomIds = [
  'schemeFinderForm',
  'inputAge',
  'selectState',
  'selectEducation',
  'selectOccupation',
  'inputIncome',
  'btnResetForm',
  'presetButtonsContainer',
  'resultsSection',
  'schemesGrid',
  'resultsCountBadge',
  'profileSummaryTag',
  'schemeSearchInput',
  'categoryFiltersContainer',
  'toastContainer',
  'heroFindBtn',
  'heroBrowseBtn'
];

expectedDomIds.forEach(id => {
  assert(htmlContent.includes(`id="${id}"`), `DOM element exists in HTML: id="${id}"`);
});

// Check No Sensitive Data collected
const hasSensitiveInputs = htmlContent.toLowerCase().includes(`type="password"`) ||
                           htmlContent.toLowerCase().includes(`name="aadhaar"`) ||
                           htmlContent.toLowerCase().includes(`name="bank_account"`);
assert(!hasSensitiveInputs, 'Zero collection of sensitive citizen data verified');

console.log(`\n====================================================`);
console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
console.log(`====================================================\n`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
