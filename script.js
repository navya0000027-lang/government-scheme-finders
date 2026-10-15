/**
 * script.js - Application Logic for Government Scheme Finder
 * -----------------------------------------------------------
 * Team: Scheme Savers (National Hackathon MVP)
 * 
 * This file is written using vanilla JavaScript without external dependencies.
 * It contains beginner-friendly comments explaining each function, data flow,
 * validation step, and matching rule.
 */

// =============================================================================
// 1. DOM Elements Selection
// =============================================================================
// Form and Input Elements
const schemeFinderForm = document.getElementById('schemeFinderForm');
const inputAge = document.getElementById('inputAge');
const selectState = document.getElementById('selectState');
const selectEducation = document.getElementById('selectEducation');
const selectOccupation = document.getElementById('selectOccupation');
const inputIncome = document.getElementById('inputIncome');
const btnResetForm = document.getElementById('btnResetForm');
const presetButtonsContainer = document.getElementById('presetButtonsContainer');
const incomeChips = document.querySelectorAll('.income-chip');

// Results Section Elements
const resultsSection = document.getElementById('resultsSection');
const schemesGrid = document.getElementById('schemesGrid');
const resultsCountBadge = document.getElementById('resultsCountBadge');
const profileSummaryTag = document.getElementById('profileSummaryTag');
const schemeSearchInput = document.getElementById('schemeSearchInput');
const categoryFiltersContainer = document.getElementById('categoryFiltersContainer');

// Hero & Navigation Buttons
const heroFindBtn = document.getElementById('heroFindBtn');
const heroBrowseBtn = document.getElementById('heroBrowseBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const toastContainer = document.getElementById('toastContainer');

// State Variables to hold active search & results
let currentMatchingSchemes = [];
let activeCategoryFilter = 'All';
let activeSearchQuery = '';

// =============================================================================
// 2. Initialization & Event Listeners
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Populate the State Dropdown from schemes.js database
  populateStatesDropdown();

  // 2. Create the Demo Persona Preset Buttons for Judges/Testers
  renderPresetButtons();

  // 3. Attach Form Submission & Reset handlers
  schemeFinderForm.addEventListener('submit', handleFormSubmit);
  btnResetForm.addEventListener('click', handleFormReset);

  // 4. Attach Income Quick-Select Chips
  incomeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const incomeValue = chip.getAttribute('data-income');
      inputIncome.value = incomeValue;
      clearFieldError('groupIncome', inputIncome);
      showToast(`Annual family income set to ₹${Number(incomeValue).toLocaleString('en-IN')}`);
    });
  });

  // 5. Attach Real-Time Search & Category Filter Listeners
  schemeSearchInput.addEventListener('input', handleSearchInput);
  categoryFiltersContainer.addEventListener('click', handleCategoryFilterClick);

  // 6. Hero "Browse All Schemes" button
  heroBrowseBtn.addEventListener('click', showAllSchemes);

  // 7. Mobile Navigation Toggle
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('mobile-open');
    const isExpanded = navLinks.classList.contains('mobile-open');
    mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Close mobile nav when clicking a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('mobile-open');
      mobileMenuBtn.setAttribute('aria-expanded', false);
    });
  });

  // 8. FAQ Accordion Interaction
  initFaqAccordion();

  // 9. Sticky Header Shadow on Scroll
  window.addEventListener('scroll', () => {
    const header = document.getElementById('siteHeader');
    if (header) {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // 10. Live validation clearing on input
  inputAge.addEventListener('input', () => clearFieldError('groupAge', inputAge));
  selectState.addEventListener('change', () => clearFieldError('groupState', selectState));
  selectEducation.addEventListener('change', () => clearFieldError('groupEducation', selectEducation));
  selectOccupation.addEventListener('change', () => clearFieldError('groupOccupation', selectOccupation));
  inputIncome.addEventListener('input', () => clearFieldError('groupIncome', inputIncome));
});

// =============================================================================
// 3. Helper Functions: State Dropdown & Presets
// =============================================================================

/**
 * Populates the State/UT dropdown options from the INDIAN_STATES_AND_UTS array in schemes.js
 */
function populateStatesDropdown() {
  if (typeof INDIAN_STATES_AND_UTS === 'undefined') return;

  INDIAN_STATES_AND_UTS.forEach(stateName => {
    const option = document.createElement('option');
    option.value = stateName;
    option.textContent = stateName;
    selectState.appendChild(option);
  });
}

/**
 * Creates quick-fill buttons for hackathon judges so they can test instantly
 */
function renderPresetButtons() {
  if (typeof DEMO_PRESETS === 'undefined') return;

  presetButtonsContainer.innerHTML = '';
  DEMO_PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-preset';
    btn.textContent = preset.label;
    btn.title = preset.description;

    btn.addEventListener('click', () => {
      // Fill the form fields with preset values
      inputAge.value = preset.data.age;
      selectState.value = preset.data.state;
      selectEducation.value = preset.data.education;
      selectOccupation.value = preset.data.occupation;
      inputIncome.value = preset.data.income;

      // Clear any validation errors
      clearAllValidationErrors();

      // Show friendly confirmation toast
      showToast(`Loaded Persona: "${preset.label}"`);

      // Trigger automatic matching for instant evaluator gratification
      processMatching({
        age: preset.data.age,
        state: preset.data.state,
        education: preset.data.education,
        occupation: preset.data.occupation,
        income: preset.data.income
      });
    });

    presetButtonsContainer.appendChild(btn);
  });
}

// =============================================================================
// 4. Form Validation Logic
// =============================================================================

/**
 * Validates all form inputs.
 * Returns true if all fields are valid; false otherwise.
 */
function validateForm() {
  let isValid = true;

  // Validate Age: Must be a number between 1 and 120
  const ageValue = parseInt(inputAge.value, 10);
  if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
    showFieldError('groupAge', inputAge);
    isValid = false;
  } else {
    markFieldValid('groupAge', inputAge);
  }

  // Validate State: Must have a selection
  if (!selectState.value || selectState.value === '') {
    showFieldError('groupState', selectState);
    isValid = false;
  } else {
    markFieldValid('groupState', selectState);
  }

  // Validate Education: Must have a selection
  if (!selectEducation.value || selectEducation.value === '') {
    showFieldError('groupEducation', selectEducation);
    isValid = false;
  } else {
    markFieldValid('groupEducation', selectEducation);
  }

  // Validate Occupation: Must have a selection
  if (!selectOccupation.value || selectOccupation.value === '') {
    showFieldError('groupOccupation', selectOccupation);
    isValid = false;
  } else {
    markFieldValid('groupOccupation', selectOccupation);
  }

  // Validate Income: Must be a number >= 0
  const incomeValue = parseFloat(inputIncome.value);
  if (isNaN(incomeValue) || incomeValue < 0) {
    showFieldError('groupIncome', inputIncome);
    isValid = false;
  } else {
    markFieldValid('groupIncome', inputIncome);
  }

  return isValid;
}

function showFieldError(groupId, inputEl) {
  const group = document.getElementById(groupId);
  if (group) group.classList.add('has-error');
  if (inputEl) {
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');
  }
}

function markFieldValid(groupId, inputEl) {
  const group = document.getElementById(groupId);
  if (group) group.classList.remove('has-error');
  if (inputEl) {
    inputEl.classList.remove('is-invalid');
    inputEl.classList.add('is-valid');
  }
}

function clearFieldError(groupId, inputEl) {
  const group = document.getElementById(groupId);
  if (group) group.classList.remove('has-error');
  if (inputEl) {
    inputEl.classList.remove('is-invalid');
  }
}

function clearAllValidationErrors() {
  ['groupAge', 'groupState', 'groupEducation', 'groupOccupation', 'groupIncome'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('has-error');
  });

  [inputAge, selectState, selectEducation, selectOccupation, inputIncome].forEach(input => {
    if (input) {
      input.classList.remove('is-invalid');
      input.classList.remove('is-valid');
    }
  });
}

// =============================================================================
// 5. Form Submission & Matching Algorithm
// =============================================================================

function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    showToast('⚠️ Please correct highlighted fields before submitting.', 'error');
    return;
  }

  const userProfile = {
    age: parseInt(inputAge.value, 10),
    state: selectState.value,
    education: selectEducation.value,
    occupation: selectOccupation.value,
    income: parseFloat(inputIncome.value)
  };

  processMatching(userProfile);
}

/**
 * Evaluates candidate schemes against the user's profile.
 * Only marks a scheme as a "Possible Match" when all applicable rules have been checked:
 * 1. Age Rule: checked if minAge or maxAge is specified (not null / not 'unknown')
 * 2. State Rule: checked if state is in stateApplicability (or 'All' or 'All India')
 * 3. Education Rule: checked if qualification is allowed (or 'All' or 'unknown')
 * 4. Occupation Rule: checked if occupation is allowed (or 'All' or 'unknown')
 * 5. Income Rule: checked if isApplicable is true and maxIncome is specified
 * 
 * Unknown or non-applicable conditions pass automatically rather than disqualifying the citizen,
 * and any requirements that cannot be checked digitally are flagged for manual verification.
 */
function processMatching(profile) {
  if (typeof SCHEMES_DATABASE === 'undefined') {
    console.error('SCHEMES_DATABASE not found!');
    return;
  }

  currentMatchingSchemes = SCHEMES_DATABASE.filter(scheme => {
    // 1. Age Rule Evaluation
    let matchesAge = true;
    if (scheme.ageRules) {
      if (typeof scheme.ageRules.minAge === 'number') {
        if (profile.age < scheme.ageRules.minAge) matchesAge = false;
      }
      if (typeof scheme.ageRules.maxAge === 'number') {
        if (profile.age > scheme.ageRules.maxAge) matchesAge = false;
      }
    }

    // 2. State Applicability Evaluation
    let matchesState = true;
    if (scheme.stateApplicability) {
      matchesState = scheme.stateApplicability.includes('All') || 
                     scheme.stateApplicability.includes(profile.state) ||
                     profile.state === 'All India';
    }

    // 3. Education Condition Evaluation
    let matchesEducation = true;
    if (scheme.educationRules && scheme.educationRules.allowedEducation) {
      const allowed = scheme.educationRules.allowedEducation;
      if (allowed !== 'unknown' && !allowed.includes('All')) {
        matchesEducation = allowed.includes(profile.education) || profile.education === 'Any';
      }
    }

    // 4. Occupation Condition Evaluation
    let matchesOccupation = true;
    if (scheme.occupationRules && scheme.occupationRules.allowedOccupations) {
      const allowed = scheme.occupationRules.allowedOccupations;
      if (allowed !== 'unknown' && !allowed.includes('All')) {
        matchesOccupation = allowed.includes(profile.occupation) || profile.occupation === 'Any';
      }
    }

    // 5. Income Rule Evaluation (Only checked when isApplicable is true)
    let matchesIncome = true;
    if (scheme.incomeRules && scheme.incomeRules.isApplicable) {
      if (typeof scheme.incomeRules.maxIncome === 'number') {
        matchesIncome = profile.income <= scheme.incomeRules.maxIncome;
      }
    }

    return matchesAge && matchesState && matchesEducation && matchesOccupation && matchesIncome;
  });

  // Display summary of profile in results top bar
  const formattedIncome = Number(profile.income).toLocaleString('en-IN');
  profileSummaryTag.textContent = `Profile: Age ${profile.age} • ${profile.state} • ${profile.occupation} • ${profile.education} • ₹${formattedIncome}/yr`;

  // Reset search and category filters
  activeCategoryFilter = 'All';
  activeSearchQuery = '';
  schemeSearchInput.value = '';
  updateCategoryChipsUI();

  // Render matching cards
  renderSchemes();

  // Display results section and smoothly scroll to it
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Toast feedback
  showToast(`Found ${currentMatchingSchemes.length} possible matching scheme${currentMatchingSchemes.length === 1 ? '' : 's'} with checked rules!`);
}

/**
 * Resets the form to initial blank state and hides results
 */
function handleFormReset() {
  schemeFinderForm.reset();
  clearAllValidationErrors();
  currentMatchingSchemes = [];
  resultsSection.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('Form and results have been reset.');
}

/**
 * Browse All 12 Schemes without filling the form (evaluator convenience)
 */
function showAllSchemes() {
  if (typeof SCHEMES_DATABASE === 'undefined') return;

  currentMatchingSchemes = [...SCHEMES_DATABASE];
  profileSummaryTag.textContent = 'Showing All Verified Schemes (Unfiltered Catalogue)';

  activeCategoryFilter = 'All';
  activeSearchQuery = '';
  schemeSearchInput.value = '';
  updateCategoryChipsUI();

  renderSchemes();

  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast('Showing all verified government schemes.');
}

// =============================================================================
// 6. Schemes Rendering & Dynamic Card Generation
// =============================================================================

/**
 * Renders the filtered list of schemes into schemesGrid.
 * Takes active category filter and search query into account.
 */
function renderSchemes() {
  schemesGrid.innerHTML = '';

  // Apply Category Filter & Search Filter on currentMatchingSchemes
  const displayedSchemes = currentMatchingSchemes.filter(scheme => {
    const matchesCategory = (activeCategoryFilter === 'All') || (scheme.category === activeCategoryFilter);
    const query = activeSearchQuery.trim().toLowerCase();
    const matchesQuery = !query || 
      scheme.name.toLowerCase().includes(query) ||
      scheme.tagline.toLowerCase().includes(query) ||
      scheme.ministry.toLowerCase().includes(query) ||
      scheme.category.toLowerCase().includes(query) ||
      (scheme.stateApplicability && scheme.stateApplicability.some(s => s.toLowerCase().includes(query)));

    return matchesCategory && matchesQuery;
  });

  // Update Badge Count
  resultsCountBadge.textContent = displayedSchemes.length;

  // Handle No Results State
  if (displayedSchemes.length === 0) {
    schemesGrid.innerHTML = `
      <div class="no-results-card">
        <div class="no-results-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 class="no-results-title">No Matching Schemes Found</h3>
        <p class="no-results-desc">
          No government schemes currently match your specific criteria or search term. 
          State-specific schemes (like Telangana initiatives) require selecting that specific state. 
          Try broadening parameters or browse our full catalogue of verified schemes.
        </p>
        <div class="no-results-actions">
          <button type="button" class="btn btn-outline" id="btnNoResultsReset">
            Adjust Parameters
          </button>
          <button type="button" class="btn btn-primary" id="btnNoResultsAll">
            Browse All Schemes
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnNoResultsReset').addEventListener('click', () => {
      document.getElementById('finderSection').scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('btnNoResultsAll').addEventListener('click', showAllSchemes);
    return;
  }

  // Render Each Scheme Card
  displayedSchemes.forEach(scheme => {
    const cardEl = createSchemeCardElement(scheme);
    schemesGrid.appendChild(cardEl);
  });
}

/**
 * Creates the DOM element for an individual scheme card.
 * Incorporates:
 * - Official Scheme Name & Ministry
 * - State Applicability Badge
 * - Verified Date & Source URL
 * - Demo Data & Possible Match Badges
 * - Highlight Benefit Box
 * - 5 Interactive Tabs:
 *   1. Benefits
 *   2. Eligibility & Checked Rules
 *   3. Manual Verification Required (rules requiring offline proof)
 *   4. Required Documents
 *   5. How to Apply
 * - Verified Official Portal Button
 */
function createSchemeCardElement(scheme) {
  const card = document.createElement('div');
  card.className = 'scheme-card';
  card.id = `card-${scheme.id}`;

  // State Badge text and styling
  const isTelangana = scheme.stateApplicability && scheme.stateApplicability.includes('Telangana') && !scheme.stateApplicability.includes('All');
  const stateBadgeText = scheme.stateApplicability.includes('All') ? 'All India' : scheme.stateApplicability.join(', ');
  const stateBadgeClass = isTelangana ? 'badge-state state-telangana' : 'badge-state';

  // Build Benefits List HTML
  const benefitsListHtml = scheme.benefits.map(b => `
    <li class="detail-item">
      <span class="detail-bullet">✓</span>
      <span>${escapeHtml(b)}</span>
    </li>
  `).join('');

  // Build Checked Rules List HTML
  const checkedRulesHtml = `
    <li class="detail-item">
      <span class="rule-meta-tag ${typeof scheme.ageRules.minAge === 'number' || typeof scheme.ageRules.maxAge === 'number' ? 'rule-meta-checked' : 'rule-meta-unknown'}">
        ${typeof scheme.ageRules.minAge === 'number' || typeof scheme.ageRules.maxAge === 'number' ? 'CHECKED' : 'UNRESTRICTED'}
      </span>
      <span><strong>Age Rule:</strong> ${escapeHtml(scheme.ageRules.ruleDescription)}</span>
    </li>
    <li class="detail-item">
      <span class="rule-meta-tag ${scheme.incomeRules.isApplicable && typeof scheme.incomeRules.maxIncome === 'number' ? 'rule-meta-checked' : 'rule-meta-unknown'}">
        ${scheme.incomeRules.isApplicable && typeof scheme.incomeRules.maxIncome === 'number' ? 'CHECKED' : 'NOT CAPPED'}
      </span>
      <span><strong>Income Rule:</strong> ${escapeHtml(scheme.incomeRules.ruleDescription)}</span>
    </li>
    <li class="detail-item">
      <span class="rule-meta-tag ${scheme.educationRules.allowedEducation !== 'unknown' && !scheme.educationRules.allowedEducation.includes('All') ? 'rule-meta-checked' : 'rule-meta-unknown'}">
        ${scheme.educationRules.allowedEducation !== 'unknown' && !scheme.educationRules.allowedEducation.includes('All') ? 'CHECKED' : 'ALL QUALIFICATIONS'}
      </span>
      <span><strong>Education Condition:</strong> ${escapeHtml(scheme.educationRules.ruleDescription)}</span>
    </li>
    <li class="detail-item">
      <span class="rule-meta-tag ${scheme.occupationRules.allowedOccupations !== 'unknown' && !scheme.occupationRules.allowedOccupations.includes('All') ? 'rule-meta-checked' : 'rule-meta-unknown'}">
        ${scheme.occupationRules.allowedOccupations !== 'unknown' && !scheme.occupationRules.allowedOccupations.includes('All') ? 'CHECKED' : 'ALL OCCUPATIONS'}
      </span>
      <span><strong>Occupation Condition:</strong> ${escapeHtml(scheme.occupationRules.ruleDescription)}</span>
    </li>
    <li class="detail-item">
      <span class="rule-meta-tag rule-meta-checked">CHECKED</span>
      <span><strong>State Applicability:</strong> Valid for residents of ${escapeHtml(stateBadgeText)}.</span>
    </li>
    ${scheme.eligibilityCriteria.map(c => `
      <li class="detail-item">
        <span class="detail-bullet">▸</span>
        <span>${escapeHtml(c)}</span>
      </li>
    `).join('')}
  `;

  // Build Manual Verification Rules List HTML
  const manualVerificationHtml = `
    <div class="manual-verify-box">
      <div class="manual-verify-title">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        Manual / Offline Verification Required
      </div>
      <div>
        The rules above were matched against your 5 self-declared inputs. However, government authorities mandate the following 
        <strong>physical, documentary, or field verifications</strong> before granting final benefits:
      </div>
    </div>
    <ul class="detail-list" style="margin-top: 1rem;">
      ${scheme.manualVerificationRules.map(m => `
        <li class="detail-item">
          <span class="rule-meta-tag rule-meta-manual">REQUIRED</span>
          <span>${escapeHtml(m)}</span>
        </li>
      `).join('')}
    </ul>
  `;

  // Build Documents List HTML
  const documentsListHtml = scheme.requiredDocuments.map(d => `
    <li class="detail-item">
      <span class="detail-bullet">📄</span>
      <span>${escapeHtml(d)}</span>
    </li>
  `).join('');

  // Build Steps List HTML
  const stepsListHtml = scheme.applicationSteps.map((s, idx) => `
    <li class="detail-item">
      <span class="step-num">${idx + 1}</span>
      <span>${escapeHtml(s)}</span>
    </li>
  `).join('');

  // Assemble Card Content
  card.innerHTML = `
    <!-- Card Header with Badges -->
    <div class="scheme-card-header">
      <div class="scheme-card-badges">
        <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
          <span class="badge badge-category">${escapeHtml(scheme.category)}</span>
          <span class="badge ${stateBadgeClass}">${escapeHtml(stateBadgeText)}</span>
        </div>
        <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
          <span class="badge badge-match" title="All applicable criteria checked">Possible Match</span>
          <span class="badge badge-verified" title="Verified against official portal">Verified ${escapeHtml(scheme.lastVerified)}</span>
          <span class="badge badge-demo" title="Curated demo data for hackathon evaluation">${escapeHtml(scheme.demoLabel)}</span>
        </div>
      </div>
      <h3 class="scheme-name">${escapeHtml(scheme.name)}</h3>
      <p class="scheme-ministry">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M14 10v11M12 3l9 7H3l9-7z"/>
        </svg>
        ${escapeHtml(scheme.ministry)}
      </p>
      <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.35rem;">
        Official Reference: <a href="${scheme.officialSource}" target="_blank" rel="noopener noreferrer" style="color: var(--green-primary); text-decoration: underline; font-weight: 500;">${escapeHtml(scheme.officialSource)}</a>
      </div>
    </div>

    <!-- Highlight Benefit Callout -->
    <div class="benefit-highlight-box">
      <div class="benefit-title">Primary Benefit</div>
      <div class="benefit-text">${escapeHtml(scheme.tagline)}</div>
    </div>

    <!-- Interactive Tabs Header -->
    <div class="card-tabs-nav" role="tablist">
      <button type="button" class="card-tab-btn active" data-tab="benefits" role="tab">Benefits</button>
      <button type="button" class="card-tab-btn" data-tab="rules" role="tab">Checked Rules</button>
      <button type="button" class="card-tab-btn" data-tab="manual" role="tab" style="color: #b45309;">Manual Verification</button>
      <button type="button" class="card-tab-btn" data-tab="documents" role="tab">Documents</button>
      <button type="button" class="card-tab-btn" data-tab="steps" role="tab">How to Apply</button>
    </div>

    <!-- Tab Panels Body -->
    <div class="card-body">
      <!-- 1. Benefits Tab -->
      <div class="tab-pane active" data-pane="benefits">
        <ul class="detail-list">
          ${benefitsListHtml}
        </ul>
      </div>

      <!-- 2. Checked Rules Tab -->
      <div class="tab-pane" data-pane="rules">
        <ul class="detail-list">
          ${checkedRulesHtml}
        </ul>
      </div>

      <!-- 3. Manual Verification Tab -->
      <div class="tab-pane" data-pane="manual">
        ${manualVerificationHtml}
      </div>

      <!-- 4. Documents Tab -->
      <div class="tab-pane" data-pane="documents">
        <ul class="detail-list">
          ${documentsListHtml}
        </ul>
      </div>

      <!-- 5. Steps Tab -->
      <div class="tab-pane" data-pane="steps">
        <ul class="detail-list">
          ${stepsListHtml}
        </ul>
      </div>
    </div>

    <!-- Card Action Footer -->
    <div class="scheme-card-footer">
      <div class="portal-text">
        Verified Portal: <span class="portal-domain">${escapeHtml(scheme.portalDisplay)}</span>
      </div>
      <div class="card-actions">
        <button type="button" class="btn btn-outline btn-sm btn-copy-scheme" data-id="${scheme.id}" title="Copy scheme details to clipboard">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Share
        </button>
        <a href="${scheme.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" title="Open verified official portal">
          Official Portal
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  `;

  // Attach Tab Switching Logic for this card
  const tabButtons = card.querySelectorAll('.card-tab-btn');
  const tabPanes = card.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');

      // Set active button
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Set active pane
      tabPanes.forEach(p => {
        if (p.getAttribute('data-pane') === tabTarget) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
    });
  });

  // Attach Copy / Share Button Logic
  const copyBtn = card.querySelector('.btn-copy-scheme');
  copyBtn.addEventListener('click', () => {
    const textToCopy = `${scheme.name}\nMinistry: ${scheme.ministry}\nState: ${stateBadgeText}\nTagline: ${scheme.tagline}\nApply at: ${scheme.officialUrl}\nOfficial Source: ${scheme.officialSource}\n(Discovered via Government Scheme Finder - Team Scheme Savers)`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied details for "${scheme.name}"!`);
      }).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  });

  return card;
}

/**
 * Fallback copy method for browsers restricting clipboard API
 */
function fallbackCopyText(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Scheme details copied to clipboard!');
  } catch (err) {
    showToast('Unable to copy automatically.', 'error');
  }
  document.body.removeChild(textarea);
}

// =============================================================================
// 7. Search & Category Filters Handlers
// =============================================================================

function handleSearchInput(e) {
  activeSearchQuery = e.target.value;
  renderSchemes();
}

function handleCategoryFilterClick(e) {
  const button = e.target.closest('.filter-chip');
  if (!button) return;

  activeCategoryFilter = button.getAttribute('data-category');
  updateCategoryChipsUI();
  renderSchemes();
}

function updateCategoryChipsUI() {
  const chips = categoryFiltersContainer.querySelectorAll('.filter-chip');
  chips.forEach(chip => {
    if (chip.getAttribute('data-category') === activeCategoryFilter) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// =============================================================================
// 8. FAQ Accordion Interaction
// =============================================================================

function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      // Close all items
      faqItems.forEach(i => i.classList.remove('active'));
      // Toggle current
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

// =============================================================================
// 9. Toast Notifications
// =============================================================================

/**
 * Displays a non-intrusive floating toast notification
 */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderLeftColor = '#ef4444';
  }

  toast.innerHTML = `
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 3.2 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toastContainer && toastContainer.contains(toast)) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, 3200);
}

/**
 * Utility function to sanitize HTML strings and prevent XSS
 */
function escapeHtml(string) {
  if (typeof string !== 'string') return string;
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
