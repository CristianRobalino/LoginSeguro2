import axios, { AxiosInstance } from 'axios';

/**
 * API Service - Cliente HTTP para comunicación con el backend
 * Aplica Singleton Pattern
 */
class ApiService {
    private api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        // Interceptor para agregar token JWT
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Interceptor para manejar errores
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expirado o inválido
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints - Reconocimiento Facial
    async startRegistration(email: string, name: string, password: string) {
        const response = await this.api.post('/auth/register/start', {
            email,
            name,
            password,
        });
        return response.data;
    }

    async verifyFaceRegistration(email: string, faceDescriptor: number[]) {
        const response = await this.api.post('/auth/register/verify-face', {
            email,
            faceDescriptor,
        });
        return response.data;
    }

    async completeFaceRegistration(email: string, faceDescriptor: number[]) {
        const response = await this.api.post('/auth/complete-face-registration', {
            email,
            faceDescriptor,
        });
        return response.data;
    }

    async startAuthentication(email: string, password: string) {
        const response = await this.api.post('/auth/login/start', {
            email,
            password,
        });
        return response.data;
    }

    async verifyFaceAuthentication(email: string, faceDescriptor: number[]) {
        const response = await this.api.post('/auth/login/verify-face', {
            email,
            faceDescriptor,
        });
        return response.data;
    }

    // User management endpoints (Admin)
    async createUserByAdmin(email: string, name: string, password: string, role?: 'admin' | 'client') {
        const response = await this.api.post('/users/create-by-admin', {
            email,
            name,
            password,
            role,
        });
        return response.data;
    }

    // Users endpoints
    async getUsers() {
        const response = await this.api.get('/users');
        return response.data;
    }

    async getUser(id: string) {
        const response = await this.api.get(`/users/${id}`);
        return response.data;
    }

    async createUser(data: { email: string; name: string; role: string }) {
        const response = await this.api.post('/users', data);
        return response.data;
    }

    async updateUser(id: string, data: Partial<{ name: string; isActive: boolean }>) {
        const response = await this.api.patch(`/users/${id}`, data);
        return response.data;
    }

    async deleteUser(id: string) {
        const response = await this.api.delete(`/users/${id}`);
        return response.data;
    }

    async searchUsers(email: string) {
        const response = await this.api.get(`/users/search?email=${email}`);
        return response.data;
    }
}

// Exportar instancia única (Singleton)
export const apiService = new ApiService();
