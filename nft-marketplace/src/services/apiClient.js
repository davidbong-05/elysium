import axios from "axios";

class ApiClient {
  constructor(baseUrl, headers) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  get = async (url, additionalHeaders) => {
    const headers = {
      ...this.headers,
      ...additionalHeaders,
    };

    return await axios.get(`${url}`, {
      headers,
    });
  };

  post = async (url, data, headers) => {
    return await axios.post(url, data, {
      headers: {
        ...this.headers,
        headers,
      },
    });
  };

  put = async (url, data, headers) => {
    return await axios.put(url, data, {
      headers: {
        ...this.headers,
        headers,
      },
    });
  };
}

export default ApiClient;
