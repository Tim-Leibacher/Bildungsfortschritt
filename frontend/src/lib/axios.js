import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "https://your-production-url.com/api";
const api = axios.create({
  baseURL: BASE_URL,
});

export default api;
