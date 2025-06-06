import { LoginDto } from "@/types/dto/login.dto";
import { SignInDto } from "@/types/dto/sign-up.dto";
import { userModel } from "@/types/model/user.model";
import apiClient from "./api-cliente.service";

class AuthService {
  /**
   * Realiza o login do usuário com as credenciais fornecidas.
   * @param {LoginDto} credentials - Credenciais do usuário (email e senha).
   * @returns {Promise<string>} Dados do usuário retornados em JWT.
   */
  async login(credentials: LoginDto): Promise<string> {
    const response = await apiClient.post<{ access_token: string }>('/auth/login', credentials);
    console.log(response.data);
    return response.data.access_token;
  }

  async createTokenFacebook(code: string): Promise<userModel> {
    const response = await apiClient.post<userModel>('/auth/facebook/callback', {code})
    return response.data;
  }  

  /**
   * Realiza o cadastro de um novo usuário com os dados fornecidos.
   * @param {SignInDto} signInDto - Detalhes do usuário para cadastro.
   * @returns {Promise<userModel>} Dados do usuário retornados pela API.
   */
  async signUp(signInDto: SignInDto): Promise<userModel> {
    const response = await apiClient.post<userModel>('/users', signInDto);

    // Armazena o token no localStorage, se necessário
    // if (typeof window !== 'undefined') {
    //   localStorage.setItem('access_token', response.data.token);
    // }

    return response.data;
  }

  async getProfile(): Promise<userModel> {
    const response = await apiClient.get<userModel>('/auth/profile');
    return response.data;
  }
}

export default AuthService;
