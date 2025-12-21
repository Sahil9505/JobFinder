# Company Logos Setup Guide

## Directory Structure
```
/public/logos/
├── google.png
├── microsoft.png
├── amazon.png
├── meta.png
└── ... (add more logos here)
```

## How to Add New Company Logos

### Step 1: Prepare Your Logo Files
1. **Recommended Format**: PNG with transparent background (or SVG)
2. **Recommended Size**: 200x200px to 400x400px
3. **File Naming**: Use lowercase, no spaces (e.g., `microsoft.png`, `tcs.png`)
4. **Aspect Ratio**: Square or the logo will be centered with padding

### Step 2: Add Logo to /public/logos/
Place your logo file in:
```
backend/frontend/public/logos/your-company.png
```

### Step 3: Register in companyLogoMap.js
Open `src/utils/companyLogoMap.js` and add to `COMPANY_LOGO_MAP`:
```javascript
const COMPANY_LOGO_MAP = {
  // ... existing entries
  'your company name': 'your-company.png',
  'company variation': 'your-company.png', // Same logo for variations
};
```

### Step 4: Test
The logo will automatically appear in:
- Job cards (JobCard.jsx)
- Company cards (CompanyCard.jsx)
- Any component using `<CompanyLogo />` component

## Where to Get Logos

### Free Logo Sources:
1. **Official Company Websites**
   - Look for "Press Kit" or "Brand Resources"
   - Usually in footer or "About" section

2. **Logo Repositories** (check license):
   - clearbit.com/logo (download and save locally)
   - seeklogo.com
   - worldvectorlogo.com

3. **Create Simple Text Logos**:
   - Use Canva or Figma
   - Export as PNG with transparent background

## Example Logos Already Configured

The following companies are ready to use (just add their logo files):
- Google (`google.png`)
- Microsoft (`microsoft.png`)
- Amazon (`amazon.png`)
- Meta/Facebook (`meta.png`)
- Apple (`apple.png`)
- Netflix (`netflix.png`)
- TCS (`tcs.png`)
- Infosys (`infosys.png`)
- Wipro (`wipro.png`)
- And many more (see companyLogoMap.js)

## Logo Fallback System

If a logo is **NOT found**, the system automatically shows:
✓ Gradient background (colorful)
✓ Company first letter (e.g., "G" for Google)

This ensures the UI always looks good, even without logos.

## Logo Sizes

The `<CompanyLogo />` component supports 3 sizes:
- `sm` - 40x40px (small cards)
- `md` - 56x56px (job cards) **← default**
- `lg` - 80x80px (company cards)

## Usage in Custom Components

```jsx
import CompanyLogo from './components/CompanyLogo';

// Basic usage
<CompanyLogo companyName="Google" />

// With size
<CompanyLogo companyName="Microsoft" size="lg" />

// With custom classes
<CompanyLogo companyName="Amazon" size="md" className="my-4" />
```

## Tips for Best Results

1. **Use Square Logos**: Rectangular logos will have padding
2. **Transparent Backgrounds**: Logos blend better with gradient containers
3. **High Resolution**: Use at least 200x200px for crisp display
4. **Consistent Style**: Try to use similar logo styles (all with text, or all icons)
5. **Test Dark Theme**: Make sure logos are visible on dark backgrounds

## Troubleshooting

### Logo Not Showing?
1. Check if file exists in `/public/logos/`
2. Check if filename matches in `companyLogoMap.js`
3. Check browser console for 404 errors
4. Clear browser cache (Ctrl+F5)
5. Verify company name spelling is exact

### Logo Too Small/Large?
- The logo is auto-sized to fit the container
- Container size is fixed (sm/md/lg)
- Logo will be centered with padding if needed

### Logo Has Wrong Background?
- Use PNG with transparent background
- Or use SVG format
- Avoid JPEG (no transparency support)

## Production Optimization

Before deploying to production:
1. Optimize PNG files using TinyPNG or similar tools
2. Consider converting to WebP format for better performance
3. Add lazy loading (already implemented in CompanyLogo.jsx)
4. Ensure all logos are under 50KB each

## Adding Logos Programmatically

You can also add logos dynamically:
```javascript
import { addCompanyLogo } from './utils/companyLogoMap';

// Add a new company logo at runtime
addCompanyLogo('New Startup', 'newstartup.png');
```

---

**Need Help?** Check the code comments in:
- `src/utils/companyLogoMap.js`
- `src/components/CompanyLogo.jsx`
