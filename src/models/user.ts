export interface AuthRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  sessionId: string;
  message: string;
}