import { CreativeGroup } from "@/utils/creative.util";

export interface CreateSnapshotDto {
    groupedData: CreativeGroup[],
    since?: string;
    until?: string;
    comment?: string;
}