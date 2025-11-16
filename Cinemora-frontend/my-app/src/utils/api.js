import axios from 'axios';

const API = axios.create({
  baseURL: 'https://cinemora-jumy.onrender.com', // backend root
  headers: { 'Content-Type': 'application/json' }
});

export default API;
