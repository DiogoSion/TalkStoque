import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api'; // Seu cliente Axios configurado

interface UserInfo {
    id: number | null;
    email: string | null; // 'sub' do token-info
}

interface AuthState {
    token: string | null;
    userInfo: UserInfo;
    isAuthenticated: boolean;
    isLoadingUserInfo: boolean;
    login: (token: string) => Promise<void>; // Modificado para ser async
    logout: () => void;
    fetchUserInfo: () => Promise<void>; // Exposto para re-fetch se necessário
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const [userInfo, setUserInfo] = useState<UserInfo>({ id: null, email: null });
    const [isLoadingUserInfo, setIsLoadingUserInfo] = useState<boolean>(false);

    const fetchUserInfo = useCallback(async () => {
        const currentToken = localStorage.getItem('authToken'); // Sempre verifica o token mais recente
        if (currentToken) {
            setIsLoadingUserInfo(true);
            try {
                // O apiClient já deve incluir o token no header automaticamente via interceptor
                const response = await apiClient.get<{ id: number; sub: string }>('/me/token-info');
                setUserInfo({ id: response.data.id, email: response.data.sub });
            } catch (error) {
                console.error("Falha ao buscar informações do usuário, limpando token:", error);
                // Se falhar (ex: token expirado), deslogar
                localStorage.removeItem('authToken');
                setToken(null);
                setUserInfo({ id: null, email: null });
            } finally {
                setIsLoadingUserInfo(false);
            }
        } else {
            // Se não há token, garantir que userInfo esteja limpo
            setUserInfo({ id: null, email: null });
        }
    }, []);

    useEffect(() => {
        // Ao carregar o AuthProvider, se existir um token, busca as informações do usuário
        if (token) {
            fetchUserInfo();
        }
    }, [token, fetchUserInfo]);

    const login = async (newToken: string) => {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        // fetchUserInfo será chamado automaticamente pelo useEffect acima quando o token mudar
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUserInfo({ id: null, email: null });
        // Opcional: redirecionar para a página de login
        // window.location.href = '/login'; // Ou usar useNavigate se estiver em um componente
    };

    return (
        <AuthContext.Provider value={{
            token,
            userInfo,
            isAuthenticated: !!token && !!userInfo.id, // Considera autenticado se tem token e ID do usuário
            isLoadingUserInfo,
            login,
            logout,
            fetchUserInfo
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
