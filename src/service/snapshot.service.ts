import { CreateSnapshotDto } from "@/types/dto/create-snapshot.dto";
import { SnapshotResponse } from "@/types/model/snapshot.model";
import apiClient from "./api-cliente.service";


const SnapshotService = {
  async createSnapshot(snapshotBody: CreateSnapshotDto) {
    const response = await apiClient.post<{ slug: string }>('/snapshots', {
      snapshotBody,
    });
    return response.data;
  },
  
  async findSnapshot(slug: string): Promise<SnapshotResponse> {
    const response = await apiClient.get<SnapshotResponse>(`/snapshots/${slug}`);
    return response.data;
  }   
}

export default SnapshotService;