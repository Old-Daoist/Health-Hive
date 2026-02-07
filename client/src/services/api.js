import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use(
  (req) => {
    const auth = localStorage.getItem("auth");
    if (auth) {
      req.headers.Authorization = `Bearer ${JSON.parse(auth).token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

export default API;
