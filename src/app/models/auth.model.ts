export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
export interface ApiProblem {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string[]>;
}