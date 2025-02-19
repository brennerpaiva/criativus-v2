import { userModel } from "@/types/model/user.model";
import apiClient from "./api-cliente.service";

class UserService {
  /**
   * Recupera todos os usuários.
   * @returns {Promise<userModel[]>} - Retorna um array de usuários.
   */
  async findAllUsers(): Promise<userModel[]> {
    const response = await apiClient.get<userModel[]>('/users');
    return response.data;
  }

  // Aqui você pode incluir outros métodos do UserService, por exemplo:
  // - findUserById(id: string): Promise<userModel>
  // - createUser(userData: Partial<userModel>): Promise<userModel>
  // - updateUser(id: string, userData: Partial<userModel>): Promise<userModel>
  // - deleteUser(id: string): Promise<void>
}

// Exporta uma instância única da classe
export default new UserService();
