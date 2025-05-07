import { userModel } from "./user.model";

export interface ReportModel {
    id: number;
    userId: number;
    user: userModel;
    name: string;
    description?: string;
    slug: string;
    createdAt: Date;
  }
  