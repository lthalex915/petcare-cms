import axios from "axios";
const api = axios.create({
    baseURL: "/api"
});
api.interceptors.request.use((request) => {
    const token = localStorage.getItem("petcare_token");
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }
    const adminMode = localStorage.getItem("petcare_admin_mode") === "true";
    request.headers["x-admin-mode"] = String(adminMode);
    return request;
});
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem("petcare_token");
        localStorage.removeItem("petcare_user");
    }
    return Promise.reject(error);
});
export default api;
