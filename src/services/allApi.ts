import commonAPI from "./commonApi";
import SERVER_URL from "./serverUrl";
import { AxiosResponse, AxiosError } from "axios";

// Define types for request body and headers (if applicable)
interface RequestBody {
  [key: string]: any;
}

interface RequestHeaders {
  [key: string]: string;
}



interface Task {
  createdAt: string;
  username: string;
  _id: string;
  taskImage: string;
  image: string;
  progress: number;
  id: string;
  title: string;
  description: string;
  status: string;
}

interface UserData {
  _id: string;
  name?: string;
  username?: string;
  email: string;
  role?: string;
}


// Register API - Register a user
export const registerAPI = async (reqBody: RequestBody): Promise<AxiosResponse<any> | AxiosError> => {
  return await commonAPI("POST", `${SERVER_URL}/register`, reqBody);
};

// Login API - Login a user
export const loginAPI = async (reqBody: RequestBody): Promise<AxiosResponse<any> | AxiosError> => {
  return await commonAPI("POST", `${SERVER_URL}/login`, reqBody);
};


// Add Task API
export const addTaskAPI = async (
  reqBody: RequestBody,
  reqHeader: RequestHeaders
): Promise<AxiosResponse<Task> | AxiosError> => {
  return await commonAPI("POST", `${SERVER_URL}/add-task`, reqBody, reqHeader);
};

// All Tasks API - Fetch all tasks
export const allTaskAPI = async (reqHeader: RequestHeaders): Promise<AxiosResponse<Task[]> | AxiosError> => {
  return await commonAPI("GET", `${SERVER_URL}/all-task`, {}, reqHeader);
};

// Update Task API - Edit a task
export const updateTaskAPI = async (
  id: string,
  reqBody: RequestBody,
  reqHeader: RequestHeaders
): Promise<AxiosResponse<Task> | AxiosError> => {
  return await commonAPI("PUT", `${SERVER_URL}/tasks/${id}/edit-task`, reqBody, reqHeader);
};

// Remove Task API - Delete a task
export const removeTaskAPI = async (
  id: string,
  reqHeader: RequestHeaders
): Promise<AxiosResponse<any> | AxiosError> => {
  return await commonAPI("DELETE", `${SERVER_URL}/tasks/${id}/delete-task`, {}, reqHeader);
};

// Get Single Task API - Fetch a single task
export const getSingleTaskAPI = async (id: string,reqHeader: RequestHeaders): Promise<AxiosResponse<Task> | AxiosError> => {
  return await commonAPI("GET", `${SERVER_URL}/tasks/${id}`, "",reqHeader);
};


// update User API - Edit a user profile
export const UpdateUserAPI = async (
  reqBody: RequestBody,
  reqHeader: RequestHeaders
) => {
  return await commonAPI("PUT", `${SERVER_URL}/edit-user`, reqBody, reqHeader);
};

// // Get All Tasks API - Fetch all tasks
// export const allTasksAPI = async (reqHeader: RequestHeaders): Promise<AxiosResponse<Task[]> | AxiosError> => {
//   return await commonAPI("GET", `${SERVER_URL}/all-tasks`, {}, reqHeader);
// };

// // Get Users API - Fetch all users
//  export const getUsersAPI = async (reqHeader: RequestHeaders): Promise<AxiosResponse<any> | AxiosError> => {
//   return await commonAPI("GET", `${SERVER_URL}/all-users`, {}, reqHeader);
// };



// Get All Tasks API - Fetch all tasks
export const allTasksAPI = async (reqHeader: RequestHeaders): Promise<AxiosResponse<Task[]>> => {
  try {
    const response = await commonAPI("GET", `${SERVER_URL}/all-tasks`, {}, reqHeader);
    return response as AxiosResponse<Task[]>; // Explicitly cast response
  } catch (error) {
    return Promise.reject(error); // Reject the promise instead of returning AxiosError
  }
};

// Get Users API - Fetch all users
export const getUsersAPI = async (reqHeader: RequestHeaders): Promise<AxiosResponse<UserData[]>> => {
  try {
    const response = await commonAPI("GET", `${SERVER_URL}/all-users`, {}, reqHeader);
    return response as AxiosResponse<UserData[]>; // Explicitly cast response
  } catch (error) {
    return Promise.reject(error); // Reject the promise instead of returning AxiosError
  }
};



// delete User API - Delete a user
 export const deleteUserAPI = async (
  id: string,
  reqHeader: RequestHeaders
): Promise<AxiosResponse<any> | AxiosError> => {
  return await commonAPI("DELETE", `${SERVER_URL}/user/${id}/remove`, {}, reqHeader);
};