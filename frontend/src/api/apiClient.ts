import axios from "axios";
import { FormValues } from "../pages/Feedback/FeedbackForm";
import { Conversation } from "../components/Header/Chat";
import {
  V1_API_ENDPOINTS,
  CONVERSATION_ENDPOINTS,
  endpoints,
} from "./endpoints";

// Use empty string for relative URLs - all API calls will be relative to current domain
const baseURL = "";

export const publicApi = axios.create({ baseURL });

export const adminApi = axios.create({
  baseURL,
  headers: {
    Authorization: `JWT ${localStorage.getItem("access")}`,
  },
});

// Request interceptor to set the Authorization header
adminApi.interceptors.request.use(
  (configuration) => {
    const token = localStorage.getItem("access");
    if (token) {
      configuration.headers.Authorization = `JWT ${token}`;
    }
    return configuration;
  },
  (error) => Promise.reject(error),
);

const handleSubmitFeedback = async (
  feedbackType: FormValues["feedbackType"],
  name: FormValues["name"],
  email: FormValues["email"],
  message: FormValues["message"],
) => {
  try {
    const response = await publicApi.post(V1_API_ENDPOINTS.FEEDBACK, {
      feedbacktype: feedbackType,
      name,
      email,
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error(s) during handleSubmitFeedback: ", error);
    throw error;
  }
};

const handleSendDrugSummary = async (
  message: FormValues["message"],
  guid: string,
) => {
  try {
    const endpoint = endpoints.embeddingsAsk(guid);
    const response = await adminApi.post(endpoint, {
      message,
    });
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error(s) during handleSubmitFeedback: ", error);
    throw error;
  }
};

const handleRuleExtraction = async (guid: string) => {
  try {
    const response = await adminApi.get(endpoints.ruleExtraction(guid));
    // console.log("Rule extraction response:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error(s) during handleRuleExtraction: ", error);
    throw error;
  }
};

const fetchRiskDataWithSources = async (
  medication: string,
  source: "include" | "diagnosis" | "diagnosis_depressed" = "include",
) => {
  try {
    const response = await publicApi.post(V1_API_ENDPOINTS.RISK_WITH_SOURCES, {
      drug: medication,
      source: source,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching risk data: ", error);
    throw error;
  }
};

interface StreamCallbacks {
  onContent?: (content: string) => void;
  onComplete?: (data: { embeddings_info: any[]; done: boolean }) => void;
  onError?: (error: string) => void;
  onMetadata?: (data: { question: string; embeddings_count: number }) => void;
}

const handleSendDrugSummaryStream = async (
  message: string,
  guid: string,
  callbacks: StreamCallbacks,
): Promise<void> => {
  const token = localStorage.getItem("access");
  const endpoint = endpoints.embeddingsAskStream(guid);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Save incomplete line

      for (const line of lines) {
        if (!line.trim().startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr);

          if (data.content) {
            callbacks.onContent?.(data.content);
          } else if (data.done) {
            callbacks.onComplete?.({ embeddings_info: [], done: true });
          } else if (data.error) {
            callbacks.onError?.(data.error);
          } else if (data.type) {
            switch (data.type) {
              case "metadata":
                callbacks.onMetadata?.({
                  question: data.question,
                  embeddings_count: data.embeddings_count,
                });
                break;
              case "content":
                callbacks.onContent?.(data.content);
                break;
              case "complete":
                callbacks.onComplete?.(data);
                break;
              case "error":
                callbacks.onError?.(data.error);
                break;
            }
          }
        } catch (parseError) {
          console.error(
            "Failed to parse SSE data:",
            parseError,
            "Raw line:",
            line,
          );
        }
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error in stream:", errorMessage);
    callbacks.onError?.(errorMessage);
    throw error;
  }
};

// Legacy function for backward compatibility
const handleSendDrugSummaryStreamLegacy = async (
  message: string,
  guid: string,
  onChunk: (chunk: string) => void,
): Promise<void> => {
  return handleSendDrugSummaryStream(message, guid, {
    onContent: onChunk,
    onError: (error) => console.error("Stream error:", error),
    onComplete: () => console.log("Stream completed"),
  });
};

const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await publicApi.get(CONVERSATION_ENDPOINTS.CONVERSATIONS);
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversations: ", error);
    throw error;
  }
};

const fetchConversation = async (id: string): Promise<Conversation> => {
  try {
    const response = await publicApi.get(endpoints.conversation(id));
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversation: ", error);
    throw error;
  }
};

const newConversation = async (): Promise<Conversation> => {
  try {
    const response = await adminApi.post(CONVERSATION_ENDPOINTS.CONVERSATIONS, {
      messages: [],
    });
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversation: ", error);
    throw error;
  }
};

const continueConversation = async (
  id: string,
  message: string,
  page_context?: string,
): Promise<{ response: string; title: Conversation["title"] }> => {
  try {
    const response = await adminApi.post(
      endpoints.continueConversation(id),
      {
        message,
        page_context,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error(s) during continueConversation: ", error);
    throw error;
  }
};

const deleteConversation = async (id: string) => {
  try {
    const response = await adminApi.delete(endpoints.conversation(id));
    return response.data;
  } catch (error) {
    console.error("Error(s) during deleteConversation: ", error);
    throw error;
  }
};

const updateConversationTitle = async (
  id: Conversation["id"],
  newTitle: Conversation["title"],
): Promise<
  { status: string; title: Conversation["title"] } | { error: string }
> => {
  try {
    const response = await adminApi.patch(endpoints.updateConversationTitle(id), {
      title: newTitle,
    });
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversation: ", error);
    throw error;
  }
};

// Assistant API functions
const sendAssistantMessage = async (
  message: string,
  previousResponseId?: string,
) => {
  try {
    const response = await publicApi.post(V1_API_ENDPOINTS.ASSISTANT, {
      message,
      previous_response_id: previousResponseId,
    });
    return response.data;
  } catch (error) {
    console.error("Error(s) during sendAssistantMessage: ", error);
    throw error;
  }
};

export {
  handleSubmitFeedback,
  handleSendDrugSummary,
  handleRuleExtraction,
  fetchConversations,
  fetchConversation,
  newConversation,
  continueConversation,
  deleteConversation,
  updateConversationTitle,
  handleSendDrugSummaryStream,
  handleSendDrugSummaryStreamLegacy,
  fetchRiskDataWithSources,
  sendAssistantMessage,
};
