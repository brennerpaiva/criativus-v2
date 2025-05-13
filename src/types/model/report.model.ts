import { MetricKey } from "@/constants/metric";
import { DateRange } from "react-day-picker"; // ainda útil para uso interno
import { userModel } from "./user.model";

export interface ReportModel {
  id: number;

  userId: number;
  user: userModel;

  name: string;
  description?: string;

  slug: string;

  /* ---- configurações dinâmicas ---- */
  sorted?: MetricKey | null;              // métrica usada para ordenação
  metricsOrder?: MetricKey[] | null;   // ordem das métricas no card

  /** Datas ISO (YYYY-MM-DD) vindas do backend */
  dateStart?: string | null;
  dateEnd?: string | null;

  /** Helper interno caso queira agrupar as duas datas em um único objeto */
  dateRange?: DateRange;               // você pode montar isso no adapter

  /* --------------------------------- */
  createdAt: string;                   // ISO vindo do backend
}
