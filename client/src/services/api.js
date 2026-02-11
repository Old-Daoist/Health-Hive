import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false,
});

/* ===========================
   ATTACH TOKEN IF PRESENT
=========================== */
API.interceptors.request.use(
  (req) => {
    const auth = localStorage.getItem("auth");

    if (auth) {
      const { token } = JSON.parse(auth);
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;
