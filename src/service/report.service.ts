import { CreateReportDto } from "@/types/dto/report/create-report.dto";
import { ReportModel } from "@/types/model/report.model";
import apiClient from "./api-cliente.service";
import { UpdateReportDto } from "@/types/dto/report/update-report.dto";


const ReportService = {
  async listReports() {
    const { data } = await apiClient.get<ReportModel[]>('/reports');
    return data;
  },

  async createReport(createReportDto: CreateReportDto) {
    const response = await apiClient.post<ReportModel>('/reports', createReportDto);
    return response.data;
  },
  
  async findBySlug(slug: string): Promise<ReportModel> {
    const response = await apiClient.get<ReportModel>(`/reports/${slug}`);
    return response.data;
  },

  async updateReportBySlug(updateReportDto: UpdateReportDto, slug: string): Promise<ReportModel> {
    const response = await apiClient.put<ReportModel>(`/reports/${slug}`, updateReportDto);
    return response.data;
  },
  
  async deleteReportBySlug(slug: string): Promise<ReportModel> {
    const response = await apiClient.delete<ReportModel>(`/reports/${slug}`);
    return response.data;
  },
}

export default ReportService;