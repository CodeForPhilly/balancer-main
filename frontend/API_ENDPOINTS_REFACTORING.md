# API Endpoints Refactoring Guide

This document explains how to refactor API URLs to use the centralized endpoints configuration.

## Overview

All API endpoints are now centralized in `src/api/endpoints.ts`. This makes it:
- **Maintainable**: Change URLs in one place
- **Type-safe**: TypeScript ensures correct usage
- **Discoverable**: All endpoints are documented in one file
- **Consistent**: No more typos or inconsistent paths

## Usage Patterns

### 1. Simple Static Endpoints

**Before:**
```typescript
const url = `/api/v1/api/feedback/`;
await publicApi.post(url, data);
```

**After:**
```typescript
import { V1_API_ENDPOINTS } from "../api/endpoints";

await publicApi.post(V1_API_ENDPOINTS.FEEDBACK, data);
```

### 2. Dynamic Endpoints with Parameters

**Before:**
```typescript
const url = `/api/v1/api/uploadFile/${guid}`;
await fetch(url);
```

**After:**
```typescript
import { endpoints } from "../api/endpoints";

const url = endpoints.uploadFile(guid);
await fetch(url);
```

### 3. Endpoints with Query Parameters

**Before:**
```typescript
const endpoint = guid 
  ? `/api/v1/api/embeddings/ask_embeddings?guid=${guid}` 
  : '/api/v1/api/embeddings/ask_embeddings';
```

**After:**
```typescript
import { endpoints } from "../api/endpoints";

const endpoint = endpoints.embeddingsAsk(guid);
```

## Available Endpoint Groups

### Authentication Endpoints
```typescript
import { AUTH_ENDPOINTS } from "../api/endpoints";

AUTH_ENDPOINTS.JWT_VERIFY
AUTH_ENDPOINTS.JWT_CREATE
AUTH_ENDPOINTS.USER_ME
AUTH_ENDPOINTS.RESET_PASSWORD
AUTH_ENDPOINTS.RESET_PASSWORD_CONFIRM
```

### V1 API Endpoints
```typescript
import { V1_API_ENDPOINTS } from "../api/endpoints";

V1_API_ENDPOINTS.FEEDBACK
V1_API_ENDPOINTS.UPLOAD_FILE
V1_API_ENDPOINTS.GET_FULL_LIST_MED
V1_API_ENDPOINTS.MED_RULES
// ... and more
```

### Conversation Endpoints
```typescript
import { CONVERSATION_ENDPOINTS } from "../api/endpoints";

CONVERSATION_ENDPOINTS.CONVERSATIONS
CONVERSATION_ENDPOINTS.EXTRACT_TEXT
```

### AI Settings Endpoints
```typescript
import { AI_SETTINGS_ENDPOINTS } from "../api/endpoints";

AI_SETTINGS_ENDPOINTS.SETTINGS
```

### Helper Functions
```typescript
import { endpoints } from "../api/endpoints";

endpoints.embeddingsAsk(guid?)
endpoints.embeddingsAskStream(guid?)
endpoints.ruleExtraction(guid)
endpoints.conversation(id)
endpoints.continueConversation(id)
endpoints.updateConversationTitle(id)
endpoints.uploadFile(guid)
endpoints.editMetadata(guid)
```

## Files to Refactor

The following files still need to be updated to use the centralized endpoints:

1. `src/pages/Settings/SettingsManager.tsx` - Use `AI_SETTINGS_ENDPOINTS.SETTINGS`
2. `src/pages/RulesManager/RulesManager.tsx` - Use `V1_API_ENDPOINTS.MED_RULES`
3. `src/pages/PatientManager/NewPatientForm.tsx` - Use `V1_API_ENDPOINTS.GET_MED_RECOMMEND`
4. `src/pages/ManageMeds/ManageMeds.tsx` - Use `V1_API_ENDPOINTS.*` for all medication endpoints
5. `src/pages/ListMeds/useMedications.tsx` - Use `V1_API_ENDPOINTS.GET_FULL_LIST_MED`
6. `src/pages/Layout/Layout_V2_Sidebar.tsx` - Use `V1_API_ENDPOINTS.UPLOAD_FILE`
7. `src/pages/Files/ListOfFiles.tsx` - Use `V1_API_ENDPOINTS.UPLOAD_FILE`
8. `src/pages/DocumentManager/UploadFile.tsx` - Use `V1_API_ENDPOINTS.UPLOAD_FILE`
9. `src/pages/Files/FileRow.tsx` - Use `endpoints.editMetadata(guid)`
10. `src/pages/DrugSummary/PDFViewer.tsx` - Use `endpoints.uploadFile(guid)`
11. `src/pages/PatientManager/PatientSummary.tsx` - Use `endpoints.uploadFile(guid)`

## Example Refactoring

### Example 1: SettingsManager.tsx

**Before:**
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const url = `${baseUrl}/ai_settings/settings/`;
```

**After:**
```typescript
import { AI_SETTINGS_ENDPOINTS } from "../../api/endpoints";

const url = AI_SETTINGS_ENDPOINTS.SETTINGS;
```

### Example 2: FileRow.tsx

**Before:**
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
await fetch(`${baseUrl}/v1/api/editmetadata/${file.guid}`, {
```

**After:**
```typescript
import { endpoints } from "../../api/endpoints";

await fetch(endpoints.editMetadata(file.guid), {
```

### Example 3: ManageMeds.tsx

**Before:**
```typescript
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const url = `${baseUrl}/v1/api/get_full_list_med`;
await adminApi.delete(`${baseUrl}/v1/api/delete_med`, { data: { name } });
await adminApi.post(`${baseUrl}/v1/api/add_medication`, { ... });
```

**After:**
```typescript
import { V1_API_ENDPOINTS } from "../../api/endpoints";

const url = V1_API_ENDPOINTS.GET_FULL_LIST_MED;
await adminApi.delete(V1_API_ENDPOINTS.DELETE_MED, { data: { name } });
await adminApi.post(V1_API_ENDPOINTS.ADD_MEDICATION, { ... });
```

## Benefits

1. **Single Source of Truth**: All endpoints defined in one place
2. **Easy Updates**: Change an endpoint once, updates everywhere
3. **Type Safety**: TypeScript catches typos and incorrect usage
4. **Better IDE Support**: Autocomplete for all available endpoints
5. **Documentation**: Endpoints are self-documenting with clear names
6. **Refactoring Safety**: Rename endpoints safely across the codebase

## Adding New Endpoints

When adding a new endpoint:

1. Add it to the appropriate group in `src/api/endpoints.ts`
2. If it needs dynamic parameters, add a helper function to `endpoints` object
3. Use the new endpoint in your code
4. Update this guide if needed

Example:
```typescript
// In endpoints.ts
export const V1_API_ENDPOINTS = {
  // ... existing endpoints
  NEW_ENDPOINT: `${API_BASE}/v1/api/new_endpoint`,
} as const;

// If it needs parameters:
export const endpoints = {
  // ... existing helpers
  newEndpoint: (id: string, param: string): string => {
    return `${V1_API_ENDPOINTS.NEW_ENDPOINT}/${id}?param=${param}`;
  },
} as const;
```

