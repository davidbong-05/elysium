import axios from "axios";

class ApiClient {
  constructor(baseUrl, headers) {
    this.baseUrl = baseUrl || "";
    this.headers = headers;
  }

  get = async (url, additionalHeaders) => {
    const headers = {
      ...this.headers,
      ...additionalHeaders,
    };

    return await axios.get(`${this.baseUrl}${url}`, {
      headers,
    });
  };

  post = async (url, data, headers) => {
    return await axios.post(`${this.baseUrl}${url}`, data, {
      headers: {
        ...this.headers,
        headers,
      },
    });
  };

  put = async (url, data, headers) => {
    return await axios.put(`${this.baseUrl}${url}`, data, {
      headers: {
        ...this.headers,
        headers,
      },
    });
  };
}

export default ApiClient;
