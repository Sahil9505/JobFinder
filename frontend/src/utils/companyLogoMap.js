/**
 * Company Logo Mapping Utility
 * 
 * Maps company names to their local logo files stored in /public/logos/
 * Supports case-insensitive matching and common company name variations
 * 
 * Usage:
 * import { getCompanyLogo } from './utils/companyLogoMap';
 * const logoUrl = getCompanyLogo('Google');
 */

// Company name to logo filename mapping
// Add new companies here with their logo filenames
const COMPANY_LOGO_MAP = {
  // Tech Giants
  'google': 'google.png',
  'google india': 'google.png',
  'microsoft': 'microsoft.png',
  'microsoft india': 'microsoft.png',
  'amazon': 'amazon.png',
  'amazon india': 'amazon.png',
  'apple': 'apple.png',
  'samsung': 'samsung-electronics.png',
  'samsung electronics': 'samsung-electronics.png',
  
  // Indian Companies - IT Services
  'tcs': 'tcs.png',
  'tata consultancy services': 'tcs.png',
  'infosys': 'infosys.png',
  'wipro': 'wipro.png',
  'hcl': 'hcltech.png',
  'hcl technologies': 'hcltech.png',
  'hcltech': 'hcltech.png',
  'tech mahindra': 'tech-mahindra.png',
  'techmahindra': 'tech-mahindra.png',
  'cognizant': 'cognizant.png',
  'accenture': 'accenture.png',
  'capgemini': 'capgemini.png',
  
  // Indian Unicorns & Startups
  'flipkart': 'flipkart.png',
  'paytm': 'paytm.png',
  'zomato': 'zomato.png',
  'swiggy': 'swiggy.png',
  'razorpay': 'razorpay.png',
  'byjus': 'byjus.png',
  'byju\'s': 'byjus.png',
  
  // Platforms
  'internshala': 'internshala.png',
  'unstop': 'unstop.png',
  
  // Zoho
  'zoho': 'zoho.png',
  'zoho corporation': 'zoho.png',
  
  // Additional Companies
  'alphasoft': 'alphasoftware.png',
  'alpha software': 'alphasoftware.png',
  'betasystems': 'betasystems.png',
  'beta systems': 'betasystems.png',
  'byteworks': 'byteworks.png',
  'campuspartners': 'campuspartners.png',
  'campus partners': 'campuspartners.png',
  'campus partner': 'campuspartners.png',
  'devsphere': 'devsphere.png',
  'dev sphere': 'devsphere.png',
  'edutechlabs': 'edutechlabs.png',
  'edutech labs': 'edutechlabs.png',
  'gammasolutions': 'gammasolutions.png',
  'gamma solutions': 'gammasolutions.png',
  'horizonlabs': 'horizonlabs.com.png',
  'horizon labs': 'horizonlabs.com.png',
  'horizonlabscom': 'horizonlabs.com.png',
  'neotech': 'neotech.png',
  'neo tech': 'neotech.png',
  
  // Add more companies as needed
  // Format: 'company name': 'filename.png',
};

/**
 * Normalizes company name for consistent matching
 * @param {string} companyName - The company name to normalize
 * @returns {string} Normalized company name
 */
const normalizeCompanyName = (companyName) => {
  if (!companyName) return '';
  return companyName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s&']/g, ''); // Remove special characters except &, '
};

/**
 * Gets the logo URL for a company
 * @param {string} companyName - The company name
 * @returns {string|null} Logo URL if exists, null otherwise
 */
export const getCompanyLogo = (companyName) => {
  if (!companyName) return null;
  
  const normalized = normalizeCompanyName(companyName);
  const logoFilename = COMPANY_LOGO_MAP[normalized];
  
  if (logoFilename) {
    return `/logos/${logoFilename}`;
  }
  
  return null;
};

/**
 * Checks if a company has a local logo
 * @param {string} companyName - The company name
 * @returns {boolean} True if logo exists
 */
export const hasCompanyLogo = (companyName) => {
  if (!companyName) return false;
  const normalized = normalizeCompanyName(companyName);
  return COMPANY_LOGO_MAP[normalized] !== undefined;
};

/**
 * Gets all registered company names
 * @returns {string[]} Array of company names
 */
export const getAllCompanies = () => {
  return Object.keys(COMPANY_LOGO_MAP);
};

/**
 * Adds a new company logo mapping dynamically
 * @param {string} companyName - The company name
 * @param {string} logoFilename - The logo filename
 */
export const addCompanyLogo = (companyName, logoFilename) => {
  const normalized = normalizeCompanyName(companyName);
  COMPANY_LOGO_MAP[normalized] = logoFilename;
};

export default {
  getCompanyLogo,
  hasCompanyLogo,
  getAllCompanies,
  addCompanyLogo,
};
