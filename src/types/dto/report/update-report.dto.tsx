import { MetricKey } from "@/constants/metric";
import { DateRange } from "react-day-picker";

export interface UpdateReportDto {
    metricsOrder?: MetricKey[];
    sorted?: MetricKey;
    dateRange?: DateRange;
}