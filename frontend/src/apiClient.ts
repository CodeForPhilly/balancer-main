import axios from "axios";
import { FormValues } from "./pages/Feedback/FeedbackForm";
const baseURL = import.meta.env.VITE_API_BASE_URL;

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
  (error) => Promise.reject(error)
);

const handleSubmitFeedback = async (
  feedbackType: FormValues["feedbackType"],
  name: FormValues["name"],
  email: FormValues["email"],
  message: FormValues["message"]
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
    console.error("Error(s) during handleSubmitFeeedback: ", error);
    throw error;
  }
};

export { handleSubmitFeedback };
