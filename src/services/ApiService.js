import axios from "axios";

const defaultBaseURL = "https://survivor-api-ext.rotoballer.com/api";

export const API = axios.create({
  baseURL: defaultBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Allow changing the baseURL dynamically
export const setAPIBaseURL = (url) => {
  API.defaults.baseURL = url;
};
