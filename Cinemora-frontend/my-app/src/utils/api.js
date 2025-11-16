// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://cinemora-jumy.onrender.com", // backend root URL
  headers: {
    "Content-Type": "application/json"
  }
});

export default API;
