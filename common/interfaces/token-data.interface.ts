export interface TokenData {
    userId: string;
    email: string;
    type: TokenType;
    metadata?: Record<string, unknown>;
    createdAt: number;
    expiresAt: number;
  }
  
  export enum TokenType {
    PASSWORD_RESET = 'password_reset',
    EMAIL_VERIFICATION = 'email_verification',
    ACCESS_TOKEN = 'access_token',
    REFRESH_TOKEN = 'refresh_token',
    API_TOKEN = 'api_token',
    INVITATION_TOKEN = 'invitation_token',
    TWO_FACTOR_AUTH = 'two_factor_auth',
  }
  