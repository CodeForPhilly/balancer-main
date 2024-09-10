import axios from "axios";
const baseURL = import.meta.env.VITE_API_BASE_URL;
import { FormValues } from "../pages/Feedback/FeedbackForm";
import { Conversation } from "../components/Header/Chat";

const api = axios.create({
  baseURL,
  headers: {
    Authorization: `JWT ${localStorage.getItem("access")}`,
  },
});

// Request interceptor to set the Authorization header
api.interceptors.request.use(
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
    const response = await api.post(`/jira/feedback/`, {
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

const handleSendDrugSummary = async (message: FormValues["message"]) => {
  try {
    const response = await api.post(`/v1/api/embeddings/ask_embeddings`, {
      message,
    });
    console.log("Response data:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error(s) during handleSubmitFeedback: ", error);
    throw error;
  }
};

const fetchConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get(`/chatgpt/conversations/`);
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversations: ", error);
    throw error;
  }
};

const fetchConversation = async (id: string): Promise<Conversation> => {
  try {
    const response = await api.get(`/chatgpt/conversations/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversation: ", error);
    throw error;
  }
};

const newConversation = async (): Promise<Conversation> => {
  try {
    const response = await api.post(`/chatgpt/conversations/`, {
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
    const response = await api.post(
      `/chatgpt/conversations/${id}/continue_conversation/`,
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
    const response = await api.delete(`/chatgpt/conversations/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error(s) during deleteConversation: ", error);
    throw error;
  }
};

const updateConversationTitle = async (
  id: Conversation["id"],
  newTitle: Conversation["title"],
): Promise<{status: string, title: Conversation["title"]} | {error: string}> => {
  try {
    const response = await api.patch(`/chatgpt/conversations/${id}/update_title/`, {
      title: newTitle,
    });
    return response.data;
  } catch (error) {
    console.error("Error(s) during getConversation: ", error);
    throw error;
  }
};

export {
  handleSubmitFeedback,
  handleSendDrugSummary,
  fetchConversations,
  fetchConversation,
  newConversation,
  continueConversation,
  deleteConversation,
  updateConversationTitle,
};
