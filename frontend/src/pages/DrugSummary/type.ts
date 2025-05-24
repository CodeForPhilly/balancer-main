

export interface ChatMessageItem {
    type: string;
    message: string | MessageResponse;
  }
  
export interface MessageResponse {
  question: string;
  llm_response: string;
  embeddings_info: EmbeddingInfo[];
}
  
  export interface ChatLogItem {
    type: string;
    message: string | SearchResult;
  }
  
  export interface SearchResult {
      question: string;
      llm_response: string;
      embeddings_info: EmbeddingInfo[];
    }
  
  
export interface EmbeddingInfo {
  file_id: string;
  name: string;
  page_number: number;
  chunk_number: number;
  text: string;
}
  
  export interface GetAllPrompts {
      id: number | string;
      guid: string;
      PromptText: string;
      IsActive: null | boolean;
      Area: string;
      CreatedAt: Date;
      LastModified: Date;
    }
  
  