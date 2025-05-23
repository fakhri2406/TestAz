export interface SignupDTO {
    email: string;
    password: string;
    name: string;
    surname: string;
    role?: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    message: string;
    id?: string;
    email?: string;
    role?: string;
    token?: string;
    name?: string;
}

export interface UserDTO {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
} 