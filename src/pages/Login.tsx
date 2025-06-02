// src/pages/Login.tsx
import React, { useState } from 'react'; // Importa React e o hook useState para gerenciar estado local
import { useNavigate } from 'react-router-dom'; // Hook para navegação programática entre rotas
import { KeyRound } from 'lucide-react'; // Ícone de chave para a UI
import apiClient from '../services/api'; // Cliente Axios configurado para chamadas à API
import { useAuth } from '../contexts/AuthContext'; // Hook customizado para acessar o contexto de autenticação

// Define o componente funcional Login
function Login() {
  // Estado para armazenar o valor do campo de email (usado como username para a API)
  const [email, setEmail] = useState('');
  // Estado para armazenar o valor do campo de senha
  const [password, setPassword] = useState('');
  // Estado para armazenar mensagens de erro que podem ocorrer durante o login
  const [error, setError] = useState<string | null>(null);

  // Hook para permitir a navegação para outras rotas após o login
  const navigate = useNavigate();
  // Hook para acessar as funções e estados do contexto de autenticação (ex: auth.login)
  const auth = useAuth();

  /**
   * Lida com a submissão do formulário de login.
   * É uma função assíncrona pois faz uma chamada à API.
   * @param e Evento do formulário.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário (recarregar a página)
    setError(null); // Limpa mensagens de erro anteriores ao tentar um novo login

    // Prepara os dados para serem enviados no formato 'application/x-www-form-urlencoded',
    // que é o esperado pelo endpoint /token da API (conforme openapi.json).
    const params = new URLSearchParams();
    params.append('username', email); // A API espera 'username', mas estamos usando o campo 'email' do formulário para isso.
    params.append('password', password);
    // Se a API /token precisr de 'grant_type' ou 'scope', eles serão adicionados aqui.
    // params.append('grant_type', 'password');

    try {
      // Faz a chamada POST para o endpoint /token da API com os parâmetros de login.
      // O cabeçalho 'Content-Type' é sobrescrito aqui para 'application/x-www-form-urlencoded'
      // especificamente para esta requisição, pois o apiClient pode ter um padrão diferente (ex: application/json).
      const response = await apiClient.post(
        '/token', // Endpoint de autenticação da API
        params,   // Dados do formulário no formato URLSearchParams
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Extrai o token de acesso da resposta da API.
      // O schema 'Token' no openapi.json define que a resposta tem 'access_token'.
      const token = response.data.access_token;

      if (token) {
        // Se o token foi recebido com sucesso:
        // 1. Chama a função 'login' do AuthContext, passando o token.
        //    Esta função no AuthContext irá armazenar o token (no localStorage)
        //    e também disparar a busca das informações do usuário logado (usando /me/token-info)
        await auth.login(token);

        // 2. Navega o usuário para a página de administração ('/admin').
        //    Isso acontece após o auth.login() completar, o que idealmente significa
        //    que as informações do usuário já foram buscadas e o estado de autenticação atualizado.
        navigate('/admin');
      } else {
        // Se a API respondeu com sucesso mas não retornou um token (caso improvável, mas para segurança)
        setError('Token não recebido da API.');
      }
    } catch (err: any) { // Captura qualquer erro que ocorra durante a chamada à API ou processamento
      console.error('Erro no login:', err); // Loga o erro completo no console para depuração

      // Tenta extrair e exibir uma mensagem de erro mais amigável para o usuário.
      // A API FastAPI, quando há erros de validação (HTTP 422) ou outros,
      // geralmente retorna um objeto 'detail' na resposta.
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) { // Se 'detail' for uma lista de erros (comum em validação Pydantic)
          setError(err.response.data.detail.map((d: any) => d.msg).join(', ')); // Concatena as mensagens
        } else if (typeof err.response.data.detail === 'string') { // Se 'detail' for uma string simples
          setError(err.response.data.detail);
        } else { // Caso genérico se 'detail' não for string ou array
          setError('Falha no login. Verifique suas credenciais.');
        }
      } else { // Se não houver 'detail' na resposta do erro, mostra uma mensagem genérica
        setError('Falha no login. Verifique suas credenciais ou a conexão com a API.');
      }
    }
  };

  // Renderização do componente Login (JSX)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Seção do cabeçalho do formulário de login */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <KeyRound className="h-12 w-12 text-blue-600" /> {/* Ícone */}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Admin Portal
        </h2>
      </div>

      {/* Seção do corpo do formulário de login */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campo de Email (usado como Username) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address (Username)
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email" // Ajuda o navegador a preencher automaticamente
                  required // Campo obrigatório
                  value={email} // Controlado pelo estado 'email'
                  onChange={(e) => setEmail(e.target.value)} // Atualiza o estado 'email' ao digitar
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Campo de Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password" // Ajuda o navegador a preencher
                  required // Campo obrigatório
                  value={password} // Controlado pelo estado 'password'
                  onChange={(e) => setPassword(e.target.value)} // Atualiza o estado 'password' ao digitar
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Exibição de mensagem de erro, se houver */}
            {error && (
              <div>
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Botão de Submit */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
