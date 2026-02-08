/**
 * Centralized API endpoints configuration
 * 
 * This file contains all API endpoint paths used throughout the application.
 * Update endpoints here to change them across the entire frontend.
 */

const API_BASE = '/api';

/** Base path for v1 API (avoids repeating /api/v1/api in every endpoint) */
const V1_API_BASE = `${API_BASE}/v1/api`;

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  JWT_VERIFY: `${API_BASE}/auth/jwt/verify/`,
  JWT_CREATE: `${API_BASE}/auth/jwt/create/`,
  USER_ME: `${API_BASE}/auth/users/me/`,
  RESET_PASSWORD: `${API_BASE}/auth/users/reset_password/`,
  RESET_PASSWORD_CONFIRM: `${API_BASE}/auth/users/reset_password_confirm/`,
} as const;

/**
 * V1 API endpoints
 */
export const V1_API_ENDPOINTS = {
  // Feedback
  FEEDBACK: `${V1_API_BASE}/feedback/`,

  // Embeddings
  EMBEDDINGS_ASK: `${V1_API_BASE}/embeddings/ask_embeddings`,
  RULE_EXTRACTION: `${V1_API_BASE}/rule_extraction_openai`,

  // Risk
  RISK_WITH_SOURCES: `${V1_API_BASE}/riskWithSources`,

  // Assistant
  ASSISTANT: `${V1_API_BASE}/assistant`,

  // File Management
  UPLOAD_FILE: `${V1_API_BASE}/uploadFile`,
  EDIT_METADATA: `${V1_API_BASE}/editmetadata`,

  // Medications
  GET_FULL_LIST_MED: `${V1_API_BASE}/get_full_list_med`,
  GET_MED_RECOMMEND: `${V1_API_BASE}/get_med_recommend`,
  ADD_MEDICATION: `${V1_API_BASE}/add_medication`,
  DELETE_MED: `${V1_API_BASE}/delete_med`,

  // Medication Rules
  MED_RULES: `${V1_API_BASE}/medRules`,

  // Version (build/deploy info)
  VERSION: `${V1_API_BASE}/version`,
} as const;

/**
 * ChatGPT/Conversations endpoints
 */
export const CONVERSATION_ENDPOINTS = {
  CONVERSATIONS: `${API_BASE}/chatgpt/conversations/`,
  EXTRACT_TEXT: `${API_BASE}/chatgpt/extract_text/`,
} as const;

/**
 * AI Settings endpoints
 */
export const AI_SETTINGS_ENDPOINTS = {
  SETTINGS: `${API_BASE}/ai_settings/settings/`,
} as const;

/**
 * Helper functions for dynamic endpoints
 */
export const endpoints = {
  /**
   * Get embeddings endpoint with optional GUID
   */
  embeddingsAsk: (guid?: string): string => {
    const base = V1_API_ENDPOINTS.EMBEDDINGS_ASK;
    return guid ? `${base}?guid=${guid}` : base;
  },
  
  /**
   * Get embeddings streaming endpoint
   */
  embeddingsAskStream: (guid?: string): string => {
    const base = `${V1_API_ENDPOINTS.EMBEDDINGS_ASK}?stream=true`;
    return guid ? `${base}&guid=${guid}` : base;
  },
  
  /**
   * Get rule extraction endpoint with GUID
   */
  ruleExtraction: (guid: string): string => {
    return `${V1_API_ENDPOINTS.RULE_EXTRACTION}?guid=${guid}`;
  },
  
  /**
   * Get conversation by ID
   */
  conversation: (id: string): string => {
    return `${CONVERSATION_ENDPOINTS.CONVERSATIONS}${id}/`;
  },
  
  /**
   * Continue conversation endpoint
   */
  continueConversation: (id: string): string => {
    return `${CONVERSATION_ENDPOINTS.CONVERSATIONS}${id}/continue_conversation/`;
  },
  
  /**
   * Update conversation title endpoint
   */
  updateConversationTitle: (id: string): string => {
    return `${CONVERSATION_ENDPOINTS.CONVERSATIONS}${id}/update_title/`;
  },
  
  /**
   * Get upload file endpoint with GUID
   */
  uploadFile: (guid: string): string => {
    return `${V1_API_ENDPOINTS.UPLOAD_FILE}/${guid}`;
  },
  
  /**
   * Edit metadata endpoint with GUID
   */
  editMetadata: (guid: string): string => {
    return `${V1_API_ENDPOINTS.EDIT_METADATA}/${guid}`;
  },
} as const;

/**
 * Type-safe endpoint values
 */
export type AuthEndpoint = typeof AUTH_ENDPOINTS[keyof typeof AUTH_ENDPOINTS];
export type V1ApiEndpoint = typeof V1_API_ENDPOINTS[keyof typeof V1_API_ENDPOINTS];
export type ConversationEndpoint = typeof CONVERSATION_ENDPOINTS[keyof typeof CONVERSATION_ENDPOINTS];
export type AiSettingsEndpoint = typeof AI_SETTINGS_ENDPOINTS[keyof typeof AI_SETTINGS_ENDPOINTS];

