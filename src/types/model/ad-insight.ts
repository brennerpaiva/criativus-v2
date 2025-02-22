interface AdInsight {
    ad_id: string;
    ad_name: string;
    impressions: string;  // Vem como string na API
    clicks: string;       // Também retorna como string
    spend: string;        // idem
    date_start: string;   // Se solicitado, vem como data
    date_stop: string;    // Se solicitado
}