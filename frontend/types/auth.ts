export interface Owner {
  id: string;
  email: string;
  role: 'owner';
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  owner: Owner;
}
