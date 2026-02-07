# Migration Guide: Conditional PDF Access Feature

**Date**: January 2025
**Feature**: Authentication-based PDF viewing and downloading
**PR/Issue**: [Link to PR if applicable]

## Overview

This migration adds conditional behavior to PDF source buttons based on user authentication status:
- **Authenticated users**: "View PDF" button opens PDF viewer in new tab
- **Unauthenticated users**: "Download PDF" button triggers direct file download

## How It Works

### Button Logic Flow

The button checks the user's authentication state and uses the `upload_file_guid` to determine behavior:

```
User clicks medication → Expands to show sources
                              ↓
                    Check: isAuthenticated?
                              ↓
            ┌─────────────────┴─────────────────┐
            ↓                                     ↓
        YES (Logged In)                    NO (Not Logged In)
            ↓                                     ↓
    "View PDF" (Blue Button)              "Download PDF" (Green Button)
            ↓                                     ↓
  Opens /drugSummary page                Direct download via
  with PDF viewer                        /v1/api/uploadFile/<guid>
  (target="_blank")                      (download attribute)
```

### When User is NOT Authenticated:

```typescript
<a
  href={`${baseURL}/v1/api/uploadFile/${upload_file_guid}`}
  download
  className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
>
  Download PDF
</a>
```

- Uses `upload_file_guid` to construct download URL: `/v1/api/uploadFile/<guid>`
- The `download` attribute forces browser to download instead of opening
- Endpoint is **public** (AllowAny permission) - no authentication required
- File downloads directly with original filename from database

### When User IS Authenticated:

```typescript
<a
  href={s.link_url}  // e.g., "/drugSummary?guid=xxx&page=5"
  target="_blank"
  rel="noopener noreferrer"
  className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
>
  View PDF
</a>
```

- Uses `link_url` which points to `/drugSummary` page
- Opens in new tab with `target="_blank"`
- The drugSummary page renders a PDF viewer with navigation controls
- User can navigate between pages, zoom, etc.

### Key Points:

1. ✅ **Both auth types can access PDFs** - the download endpoint (`/v1/api/uploadFile/<guid>`) is public
2. ✅ The difference is **presentation**:
   - **Authenticated**: Rich PDF viewer experience with navigation
   - **Unauthenticated**: Simple direct download to local machine
3. ✅ The `upload_file_guid` is the primary identifier for fetching files from the database
4. ✅ **Fallback mechanism**: If `upload_file_guid` is missing from API response, it's extracted from the `link_url` query parameter

### Code Location:

The conditional logic is in `frontend/src/pages/PatientManager/PatientSummary.tsx` around line 165-180:

```typescript
{s.link_url && (() => {
  // Get GUID from API or extract from URL as fallback
  const guid = s.upload_file_guid || extractGuidFromUrl(s.link_url);
  if (!guid) return null;

  // Render different button based on authentication
  return isAuthenticated ? (
    // Blue "View PDF" button for authenticated users
    <a href={s.link_url} target="_blank" ...>View PDF</a>
  ) : (
    // Green "Download PDF" button for unauthenticated users
    <a href={`${baseURL}/v1/api/uploadFile/${guid}`} download ...>Download PDF</a>
  );
})()}
```

## Breaking Changes

⚠️ **None** - This is a backward-compatible enhancement

## Database Changes

✅ **None** - No migrations required

## API Changes

### Backend: `POST /v1/api/riskWithSources`

**Response Schema Update**:
```python
# New field added to each item in sources array:
{
  "sources": [
    {
      "filename": "example.pdf",
      "title": "Example Document",
      "publication": "Journal Name",
      "text": "...",
      "rule_type": "INCLUDE",
      "history_type": "DIAGNOSIS_MANIC",
      "upload_fileid": 123,
      "page": 5,
      "link_url": "/drugSummary?guid=xxx&page=5",
      "upload_file_guid": "xxx-xxx-xxx"  // NEW FIELD
    }
  ]
}
```

**File**: `server/api/views/risk/views_riskWithSources.py`
**Lines Modified**: ~138-149, ~252-263, ~359-370

## Frontend Changes

### 1. Component Prop Changes

**PatientManager** now retrieves and passes authentication state:
```typescript
// Added imports
import { useSelector } from "react-redux";
import { RootState } from "../../services/actions/types";

// New hook call
const { isAuthenticated } = useSelector((state: RootState) => state.auth);

// New prop passed
<PatientSummary isAuthenticated={isAuthenticated} ... />
```

**PatientSummary** interface updated:
```typescript
interface PatientSummaryProps {
  // ... existing props
  isAuthenticated?: boolean;  // NEW
}

type SourceItem = {
  // ... existing fields
  upload_file_guid?: string | null;  // NEW
}
```

### 2. New Helper Function

```typescript
/**
 * Fallback to extract GUID from URL if API doesn't provide upload_file_guid
 */
const extractGuidFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.searchParams.get('guid');
  } catch {
    return null;
  }
};
```

### 3. Component Hierarchy Updates

Props now flow through: `PatientManager` → `PatientSummary` → `MedicationTier` → `MedicationItem`

Each intermediate component needs `isAuthenticated` and `baseURL` props added.

## Route Changes

### URL Consistency Fix

**Old (inconsistent)**:
- Backend: `/drugsummary` (lowercase)
- Frontend route: `/drugSummary` (camelCase)

**New (consistent)**:
- All references now use: `/drugSummary` (camelCase)

**Files Updated**:
- `server/api/views/risk/views_riskWithSources.py`
- `frontend/src/pages/Layout/Layout_V2_Sidebar.tsx`
- `frontend/src/pages/Layout/Layout_V2_Header.tsx`
- `frontend/src/pages/Files/FileRow.tsx`

## Authentication Flow Fixes

### ProtectedRoute Component

**Problem**: Opening protected routes in new tab caused immediate redirect to login

**Solution**: Wait for auth check to complete
```typescript
if (isAuthenticated === null) {
  return null; // Wait for auth verification
}
```

### Layout_V2_Main Component

**Added**: `useAuth()` hook to trigger authentication check on mount

## Testing Checklist

### Manual Testing Steps

1. **As unauthenticated user**:
   - [ ] Navigate to medication suggester
   - [ ] Submit patient information
   - [ ] Expand medication to view sources
   - [ ] Verify "Download PDF" button appears (green)
   - [ ] Click button and verify file downloads
   - [ ] Verify no redirect to login occurs

2. **As authenticated user**:
   - [ ] Log in to application
   - [ ] Navigate to medication suggester
   - [ ] Submit patient information
   - [ ] Expand medication to view sources
   - [ ] Verify "View PDF" button appears (blue)
   - [ ] Click button and verify PDF viewer opens in new tab
   - [ ] Verify new tab doesn't redirect to login

3. **Edge cases**:
   - [ ] Test with sources that have no link_url
   - [ ] Test with sources that have link_url but no upload_file_guid
   - [ ] Test opening protected route directly in new tab
   - [ ] Test authentication state persistence across tabs

### Automated Tests

**TODO**: Add integration tests for:
- PDF button conditional rendering
- GUID extraction fallback
- Protected route authentication flow

## Deployment Notes

### Backend Deployment

1. Deploy updated Django code
2. **No database migrations required**
3. Restart Django application server
4. Verify API response includes `upload_file_guid` field

### Frontend Deployment

1. Build frontend with updated code: `npm run build`
2. Deploy built assets
3. Clear CDN/browser cache if applicable
4. Verify button behavior for both auth states

### Rollback Plan

If issues occur:
1. Revert backend to previous version (API still compatible)
2. Frontend will use fallback GUID extraction from URL
3. Feature will degrade gracefully - button may show for all users but behavior remains functional

## Environment Variables

No new environment variables required. Uses existing:
- `VITE_API_BASE_URL` - Frontend API base URL

## Known Issues / Limitations

1. **GUID Fallback**: If both `upload_file_guid` and `link_url` are missing/invalid, no button appears
2. **Download Naming**: Downloaded files use server-provided filename, not customizable per-user
3. **Public Access**: Download endpoint is public - PDFs accessible to anyone with GUID

## Future Enhancements

- [ ] Add loading spinner while PDF downloads
- [ ] Add analytics tracking for PDF views/downloads
- [ ] Implement PDF access permissions/restrictions
- [ ] Add rate limiting to download endpoint

## Support

For questions or issues:
- GitHub Issues: [Repository Issues Link]
- Team Contact: balancerteam@codeforphilly.org

## References

- CHANGELOG.md - High-level changes
- CLAUDE.md - Updated project documentation
- Code comments in PatientSummary.tsx
