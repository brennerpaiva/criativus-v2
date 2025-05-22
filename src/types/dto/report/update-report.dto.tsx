import { SimpleRange } from "@/components/ui/custom/date-picker-range";
import { MetricKey } from "@/constants/metric";

export interface UpdateReportDto {
    metricsOrder?: MetricKey[];
    sorted?: MetricKey;
    dateRange?: SimpleRange;
}  