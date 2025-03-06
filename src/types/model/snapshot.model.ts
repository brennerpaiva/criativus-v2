// snapshot.types.ts

// Tipos para o call_to_action
export interface CallToActionValue {
    link?: string;
    link_caption?: string;
    link_format?: string;
  }
  
  export interface CallToAction {
    type: string;
    value?: CallToActionValue;
  }
  
  // Tipos para video_data
  export interface VideoData {
    video_id: string;
    call_to_action?: CallToAction;
    image_url?: string;
    image_hash?: string;
    message?: string;
    title?: string;
  }
  
  // Tipos para object_story_spec
  export interface ObjectStorySpec {
    page_id?: string;
    instagram_user_id?: string;
    video_data?: VideoData;
    template_data?: any; // Caso venha dados de template (ex: carrossel)
  }
  
  // Tipos para creative
  export interface Creative {
    id: string;
    name: string;
    object_story_spec: ObjectStorySpec;
  }
  
  // Tipos para o creative de um anúncio (geralmente igual ao creative principal)
  export interface AdCreative {
    id: string;
    name: string;
    object_story_spec: ObjectStorySpec;
  }
  
  // Tipos para as ações (dentro dos insights)
  export interface ActionData {
    action_type: string;
    value: string;
  }
  
  // Tipos para cada item do array "data" em insights
  export interface InsightData {
    spend?: string;
    impressions?: string;
    clicks?: string;
    ctr?: string;
    date_start?: string;
    date_stop?: string;
    actions?: ActionData[];
    purchase_roas?: ActionData[];
  }
  
  // Tipos para insights (opcional: podemos ignorar o objeto "paging")
  export interface Insights {
    data: InsightData[];
    // paging?: any;
  }
  
  // Tipos para cada anúncio (ad)
  export interface Ad {
    id: string;
    name: string;
    effective_status: string;
    creative: AdCreative;
    insights: Insights;
  }
  
  // Tipos para aggregatedInsights
  export interface AggregatedInsights {
    spend: number;
    impressions: number;
    clicks: number | null;
    ctr: number | null;
    purchaseRoas: number;
    actions: Record<string, number>;
    tumbstock: number;
    clickToPurchase: number;
    costPerLandingPageView: number;
  }
  
  // Tipo para cada item do snapshot
  export interface SnapshotItem {
    creative: Creative;
    ads: Ad[];
    aggregatedInsights: AggregatedInsights;
  }

  export interface SnapshotResponse {
    id: number;
    slug: string;
    data: string; // JSON serializado, que deve ser parseado para SnapshotData
    createdAt: string;
  }
  
  