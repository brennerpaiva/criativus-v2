import { AggregatedInsights, SnapshotResponse } from "@/types/model/snapshot.model";
import apiClient from "./api-cliente.service";


const SnapshotService = {
    async createSnapshot(groupedData: AggregatedInsights[]) {
        const response = await apiClient.post<{ slug: string }>('/snapshots', {
          snapshotData: groupedData,
        });
        return response.data; // { slug: '...' }
      },
      

      async findSnapshot(slug: string): Promise<SnapshotResponse> {
        const response = await apiClient.get<SnapshotResponse>(`/snapshots/${slug}`);
        return response.data;
      }
      
}

export default SnapshotService;