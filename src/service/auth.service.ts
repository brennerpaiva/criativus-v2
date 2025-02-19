import { LoginDto } from "@/types/dto/login.dto";
import { userModel } from "@/types/model/user.model";
import apiClient from "./api-cliente.service";

class AuthService {
  /**
   * Realiza o login do usuário com as credenciais fornecidas.
   * @param {LoginDto} credentials - Credenciais do usuário (email e senha).
   * @returns {Promise<userModel>} Dados do usuário retornados pela API.
   */
  async login(credentials: LoginDto): Promise<userModel> {
    const response = await apiClient.post<userModel>('/auth/login', credentials);
    return response.data;
  }

  /**
   * Realiza o cadastro de um novo usuário com os dados fornecidos.
   * @param {Partial<userModel>} userDetails - Detalhes do usuário para cadastro.
   * @returns {Promise<userModel>} Dados do usuário retornados pela API.
   */
  async signup(userDetails: Partial<userModel>): Promise<userModel> {
    const response = await apiClient.post<userModel>('/users', userDetails);

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
