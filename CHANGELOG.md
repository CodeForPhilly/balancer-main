# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Conditional PDF Access Based on Authentication** (2025-01-XX)
  - Logged-in users see "View PDF" button that opens PDF viewer in new tab
  - Non-logged-in users see "Download PDF" button that directly downloads the file
  - Backend: Added `upload_file_guid` field to risk/source API responses
  - Frontend: Conditional rendering based on Redux authentication state
  - Fallback GUID extraction from URL if backend field is missing

  **Backend Changes:**

  *File: `server/api/views/risk/views_riskWithSources.py`*
  ```python
  # Added to source_info dictionary in 3 locations (lines ~138, ~252, ~359):
  source_info = {
      'filename': filename,
      'title': getattr(embedding, 'title', None),
      'publication': getattr(embedding, 'publication', ''),
      'text': getattr(embedding, 'text', ''),
      'rule_type': medrule.rule_type,
      'history_type': medrule.history_type,
      'upload_fileid': getattr(embedding, 'upload_file_id', None),
      'page': getattr(embedding, 'page_num', None),
      'link_url': self._build_pdf_link(embedding),
      'upload_file_guid': str(embedding.upload_file.guid) if embedding.upload_file else None  # NEW
  }
  ```

  **Frontend Changes:**

  *File: `frontend/src/pages/PatientManager/PatientManager.tsx`*
  ```typescript
  // Added imports:
  import { useSelector } from "react-redux";
  import { RootState } from "../../services/actions/types";

  // Added hook to get auth state:
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Passed to PatientSummary:
  <PatientSummary
    // ... existing props
    isAuthenticated={isAuthenticated}
  />
  ```

  *File: `frontend/src/pages/PatientManager/PatientSummary.tsx`*
  ```typescript
  // Updated interface:
  interface PatientSummaryProps {
    // ... existing props
    isAuthenticated?: boolean;  // NEW
  }

  // Updated SourceItem type:
  type SourceItem = {
    // ... existing fields
    upload_file_guid?: string | null;  // NEW
  };

  // Added helper function:
  const extractGuidFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.searchParams.get('guid');
    } catch {
      return null;
    }
  };

  // Updated component:
  const PatientSummary = ({
    // ... existing props
    isAuthenticated = false,  // NEW
  }: PatientSummaryProps) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';  // NEW

  // Updated MedicationItem props:
  const MedicationItem = ({
    // ... existing props
    isAuthenticated,  // NEW
    baseURL,  // NEW
  }: {
    // ... existing types
    isAuthenticated: boolean;  // NEW
    baseURL: string;  // NEW
  }) => {

  // Updated MedicationTier props:
  const MedicationTier = ({
    // ... existing props
    isAuthenticated,  // NEW
    baseURL,  // NEW
  }: {
    // ... existing types
    isAuthenticated: boolean;  // NEW
    baseURL: string;  // NEW
  }) => (
    // ... passes to MedicationItem
    <MedicationItem
      // ... existing props
      isAuthenticated={isAuthenticated}
      baseURL={baseURL}
    />
  );

  // Conditional button rendering:
  {s.link_url && (() => {
    const guid = s.upload_file_guid || extractGuidFromUrl(s.link_url);
    if (!guid) return null;

    return isAuthenticated ? (
      <a
        href={s.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
      >
        View PDF
      </a>
    ) : (
      <a
        href={`${baseURL}/v1/api/uploadFile/${guid}`}
        download
        className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
      >
        Download PDF
      </a>
    );
  })()}

  // Updated all MedicationTier calls to pass new props:
  <MedicationTier
    // ... existing props
    isAuthenticated={isAuthenticated}
    baseURL={baseURL}
  />
  ```

### Fixed
- **URL Route Case Consistency** (2025-01-XX)
  - Fixed case mismatch between backend URL generation (`/drugsummary`) and frontend route (`/drugSummary`)
  - Updated all references to use consistent camelCase `/drugSummary` route
  - Affected files: `views_riskWithSources.py`, `Layout_V2_Sidebar.tsx`, `Layout_V2_Header.tsx`, `FileRow.tsx`

- **Protected Route Authentication Flow** (2025-01-XX)
  - Fixed blank page issue when opening protected routes in new tab
  - `ProtectedRoute` now waits for authentication check to complete before redirecting
  - Added `useAuth()` hook to `Layout_V2_Main` to trigger auth verification

### Changed
- **PatientSummary Component** (2025-01-XX)
  - Now receives `isAuthenticated` prop from Redux state
  - Props passed through component hierarchy: `PatientManager` → `PatientSummary` → `MedicationTier` → `MedicationItem`
  - Added `baseURL` constant for API endpoint construction

## [Previous versions would go here]
