import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

// Defining types for the parameters
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestHeaders {
  [key: string]: string;
}

const commonAPI = async (
  httpMethod: HttpMethod,
  url: string,
  reqBody?: any,  
  reqHeader?: RequestHeaders
): Promise<AxiosResponse<any, any> | AxiosError<any>> => {
  const reqConfig: AxiosRequestConfig = {
    method: httpMethod,
    url,
    data: reqBody,
    headers: reqHeader || { "Content-Type": "application/json" },
  };

  try {
    const res = await axios(reqConfig);
    return res;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      // This ensures that TypeScript recognizes 'err' as an AxiosError
      return err;
    }
    // You can return a custom error or throw it, if necessary
    throw new Error('An unexpected error occurred');
  }
};

export default commonAPI;
