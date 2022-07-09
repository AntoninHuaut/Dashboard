export interface JWTUser {
  id: number;
  email: string;
  username: string;
  roles: string;
}

export interface RefreshToken {
  refresh_token: string;
}

export interface TokenProperty {
  value: string;
  maxAge: number;
}

export interface GeneratedToken {
  access_token: TokenProperty;
  refresh_token: TokenProperty;
}
