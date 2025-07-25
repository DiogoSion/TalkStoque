import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de Requisição (Request Interceptor)
apiClient.interceptors.request.use(
    (config) => {
        // Recupere o token de onde armazena
        const token = localStorage.getItem('authToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Resposta (Response Interceptor)
apiClient.interceptors.response.use(
    (response) => {
        // Qualquer código de status que esteja dentro do intervalo de 2xx faz com que esta função seja acionada
        // Faça algo com os dados de resposta
        return response;
    },
    (error) => {
        // Qualquer código de status que caia fora do intervalo de 2xx faz com que esta função seja acionada
        // Faça algo com o erro de resposta
        // Ex: redirecionar para login se for erro 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // Lógica para deslogar o usuário ou redirecionar para a página de login
            // localStorage.removeItem('authToken');
            // window.location.href = '/login';
            console.error('Não autorizado! Redirecionando para login ou tratando o erro.');
        }
        return Promise.reject(error);
    }
);

export default apiClient;