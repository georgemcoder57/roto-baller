import axios from "axios";

const defaultBaseURL =
  "https://api.sportsdata.io/v3/nfl/scores/json/TeamsBasic?key=df0a8ea9a7b949e098fba1d12543bf3f";

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
