import axios from 'axios';

// Dynamically determine backend URL based on where frontend is served
const API_BASE_URL = `http://${window.location.hostname}:8000`;

export interface Product {
    id: string;
    name: string;
    color: string;
    price: number;
    year: number;
    meta_hash: string;
    pid_hash: string;
    short_hash: string;
    predicted_status: string;
    pred_proba: number;
    qr_file?: string;
    tracking_url?: string;
    image_file?: string;
    tracking_history?: {
        status: string;
        date: string;
        loc: string;
        completed: boolean;
    }[];
}

export interface PaginatedResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

export const api = {
    getProducts: async (page: number = 1, limit: number = 12, search: string = '') => {
        const response = await axios.get<PaginatedResponse>(`${API_BASE_URL}/api/products`, {
            params: { page, limit, search },
        });
        return response.data;
    },
    getProduct: async (id: string) => {
        const response = await axios.get<Product>(`${API_BASE_URL}/api/products/${id}`);
        return response.data;
    },
    updateTracking: async (id: string, tracking_history: any[]) => {
        const response = await axios.put(`${API_BASE_URL}/api/products/${id}/tracking`, {
            tracking_history
        });
        return response.data;
    },
    getImageUrl: (path?: string) => {
        if (!path) return undefined;
        // If path is absolute or external, return as is (though backend serves local files)
        if (path.startsWith('http')) return path;
        // Remove 'backend/data/' prefix if present to match static mount
        const cleanPath = path.replace('backend/data/', '').replace('uploads/', 'uploads/');
        // Actually, backend mounts DATA_DIR at /static
        // If path is "uploads/foo.jpg", url is /static/uploads/foo.jpg
        return `${API_BASE_URL}/static/${cleanPath}`;
    }
};
