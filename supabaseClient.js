/**
 * supabaseClient.js - Supabase API Integration Layer
 * ----------------------------------------------------
 * Project: Government Scheme Finder (Hackathon MVP)
 * Team: Scheme Savers
 * 
 * INSTRUCTIONS TO LINK WITH YOUR SUPABASE PROJECT:
 * 1. Create a free project at https://supabase.com
 * 2. In your Supabase Dashboard, open the "SQL Editor" and run the script in "supabase_schema.sql".
 * 3. Go to "Project Settings" -> "API".
 * 4. Copy your Project URL and anon/public API Key.
 * 5. Replace SUPABASE_URL and SUPABASE_ANON_KEY below.
 * 
 * FALLBACK SAFETY:
 * If Supabase is not yet configured or if the network is offline, this module
 * automatically falls back to the local schemes.js database with zero interruption!
 */

// =============================================================================
// 1. Supabase Project Credentials (Configure Here)
// =============================================================================
const SUPABASE_CONFIG = {
  // Replace with your actual Supabase Project URL (e.g., https://xyzcompany.supabase.co)
  url: "https://sb_publishable_5_QpVEmVmLxqzbQlJtSNYw_LNo4lSig.supabase.co",

  // Replace with your Project "anon" / "public" API Key
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjanlrcGRudnp3Zml1bm93YXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwOTgzNzgsImV4cCI6MjEwNzY3NDM3OH0.zk8o6bx8-Y5JPdBUKOe7T6_lyYmYiorLG5-cDaaevG4",

  // Enable / disable remote queries
  enabled: false // Set to true once you paste your credentials above
};

// =============================================================================
// 2. Client Initialization
// =============================================================================
let supabaseClientInstance = null;

/**
 * Initializes and returns the Supabase client instance
 */
function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  // Check if credentials have been provided and library is loaded
  const isConfigured = SUPABASE_CONFIG.enabled &&
    SUPABASE_CONFIG.url &&
    !SUPABASE_CONFIG.url.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjanlrcGRudnp3Zml1bm93YXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwOTgzNzgsImV4cCI6MjEwNzY3NDM3OH0.zk8o6bx8-Y5JPdBUKOe7T6_lyYmYiorLG5-cDaaevG4") &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.anonKey.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjanlrcGRudnp3Zml1bm93YXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwOTgzNzgsImV4cCI6MjEwNzY3NDM3OH0.zk8o6bx8-Y5JPdBUKOe7T6_lyYmYiorLG5-cDaaevG4");

  if (isConfigured && typeof window !== "undefined" && window.supabase) {
    try {
      supabaseClientInstance = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log("⚡ [Scheme Savers] Connected to Supabase Cloud Database successfully!");
    } catch (err) {
      console.warn("⚠️ [Scheme Savers] Supabase initialization failed, falling back to local database:", err);
    }
  }

  return supabaseClientInstance;
}

/**
 * Checks whether Supabase is actively configured and online
 */
function isSupabaseActive() {
  return getSupabaseClient() !== null;
}

// =============================================================================
// 3. Database API Methods
// =============================================================================

/**
 * Fetches all active government schemes from the Supabase "schemes" table.
 * If Supabase is not configured or offline, falls back seamlessly to SCHEMES_DATABASE.
 */
async function fetchSchemesFromDatabase() {
  const client = getSupabaseClient();

  if (!client) {
    // Graceful offline fallback
    if (typeof SCHEMES_DATABASE !== "undefined") {
      return SCHEMES_DATABASE;
    }
    return [];
  }

  try {
    const { data, error } = await client
      .from("schemes")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;

    // Transform PostgreSQL column format to matching frontend object model
    return data.map(row => ({
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
    }));
  } catch (err) {
    console.warn("⚠️ [Scheme Savers] Supabase fetch error, using local fallback:", err.message);
    return typeof SCHEMES_DATABASE !== "undefined" ? SCHEMES_DATABASE : [];
  }
}

/**
 * Server-Side Matching: Calls the PostgreSQL stored RPC function 'match_schemes'
 * directly on the Supabase database engine!
 */
async function matchSchemesServerSide(profile) {
  const client = getSupabaseClient();
  if (!client) return null; // Null indicates client should use client-side matching

  try {
    const { data, error } = await client.rpc("match_schemes", {
      p_age: profile.age,
      p_state: profile.state,
      p_education: profile.education,
      p_occupation: profile.occupation,
      p_income: profile.income
    });

    if (error) throw error;

    // Map rows
    return data.map(row => ({
      id: row.id,
      name: row.name,
      ministry: row.ministry,
      category: row.category,
      stateApplicability: row.state_applicability,
      tagline: row.tagline,
      demoLabel: row.demo_label,
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
        allowedEducation: row.allowed_education,
        ruleDescription: row.education_rule_description
      },
      occupationRules: {
        allowedOccupations: row.allowed_occupations,
        ruleDescription: row.occupation_rule_description
      },
      benefits: row.benefits,
      eligibilityCriteria: row.eligibility_criteria,
      manualVerificationRules: row.manual_verification_rules,
      requiredDocuments: row.required_documents,
      applicationSteps: row.application_steps
    }));
  } catch (err) {
    console.warn("⚠️ [Scheme Savers] RPC server matching failed, using client-side engine:", err.message);
    return null;
  }
}

/**
 * Anonymously logs eligibility queries to Supabase for telemetry/analytics
 * (Zero sensitive data: strictly stores only the 5 public criteria and match count)
 */
async function logEligibilityQueryToSupabase(profile, matchCount) {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from("eligibility_queries").insert({
      user_age: profile.age,
      user_state: profile.state,
      user_education: profile.education,
      user_occupation: profile.occupation,
      user_income: profile.income,
      matched_schemes_count: matchCount
    });
  } catch (err) {
    // Non-blocking telemetry
    console.log("Telemetry notice:", err.message);
  }
}

// Expose on global window object for browser access
if (typeof window !== "undefined") {
  window.SUPABASE_CONFIG = SUPABASE_CONFIG;
  window.getSupabaseClient = getSupabaseClient;
  window.isSupabaseActive = isSupabaseActive;
  window.fetchSchemesFromDatabase = fetchSchemesFromDatabase;
  window.matchSchemesServerSide = matchSchemesServerSide;
  window.logEligibilityQueryToSupabase = logEligibilityQueryToSupabase;
}
