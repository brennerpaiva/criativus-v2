"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";

import { CardAdComponent } from "@/components/business/cards/card-creative.component";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { SelectGeneric } from "@/components/business/filter/select-demo";
import { DatePickerWithRange } from "@/components/ui/custom/date-picker-range";
import { useAuth } from "@/context/auth.context";
import FacebookAdsService from "@/service/graph-api.service";
import {
  CreativeGroup,
  groupAdsByCreative,
  sortGroupsByPurchases,
} from "@/utils/creative.util";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { adAccount } = useAuth();

  // Estado com dados agrupados
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);

  // Estado para controlar o intervalo de datas
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 1, 15), // 2025-02-15
    to: new Date(2025, 1, 16),   // 2025-02-16
  });

  // Estado para indicar se estamos carregando
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ao montar, se já tivermos adAccount e dateRange, podemos fetchar uma vez inicial (opcional)
  useEffect(() => {
    if (adAccount && dateRange?.from && dateRange.to) {
      fetchData(dateRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adAccount]);

  // Função que chamamos sempre que o usuário clica em "Apply" no date picker
  async function onDateRangeApply(newRange: DateRange | undefined) {
    setDateRange(newRange);
    if (newRange && adAccount) {
      await fetchData(newRange);
    }
  }

  // Lógica de buscar dados e agrupar
  async function fetchData(range: DateRange) {
    try {
      setIsLoading(true);

      const { from, to } = range;
      if (!from || !to || !adAccount) return;

      console.log("Buscando insights para a conta:", adAccount);

      // Formatar datas em 'yyyy-MM-dd'
      const since = format(from, "yyyy-MM-dd");
      const until = format(to, "yyyy-MM-dd");

      // 1) Obter insights de todos os anúncios nesse período
      const insights = await FacebookAdsService.getAdInsights(adAccount.id, since, until);

      // 2) Extrair os ad_ids
      const adIds = insights.data.map((item) => item.ad_id);
      console.log("IDs obtidos via Insights:", adIds);

      if (adIds.length === 0) {
        setGroupedData([]);
        return; // não tem nenhum anúncio
      }

      // 3) Obter dados filtrados (criativos e metrics no mesmo período)
      const filteredAds = await FacebookAdsService.getFilteredAds(adAccount.id, adIds, since, until);
      const adsDesorganizados = filteredAds.data;

      // Agrupar
      const grouped = groupAdsByCreative(adsDesorganizados);
      const sortedGroups = sortGroupsByPurchases(grouped);

      setGroupedData(sortedGroups);
      console.log("Dados agrupados:", sortedGroups);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full lg:min-h-[600px] xl:min-h-[800px] max-w-screen-xl mx-auto flex flex-col gap-6">
      <div className="flex my-auto">
        <img src="fire.gif" alt="" className="w-10" />
        <h1 className="text-3xl font-bold text-center my-auto">
          {" "}
          Top Criativos
        </h1>
      </div>

      <FilterBarComponent>
        {/* 
          Passamos:
          1) o "value" (dateRange atual)
          2) onChange => chama onDateRangeApply (ao clicar em Apply)
          3) isLoading => desabilita o botão "Apply"
        */}
        <DatePickerWithRange
          value={dateRange}
          onChange={onDateRangeApply}
        />

        <SelectGeneric
          label="Grupo Ads"
          placeholder="Grupo Ads"
          items={[
            { value: "apple", label: "Apple" },
            { value: "banana", label: "Banana" },
            { value: "blueberry", label: "Blueberry" },
            { value: "grapes", label: "Grapes" },
            { value: "pineapple", label: "Pineapple" },
          ]}
          className="w-[140px]"
        />
      </FilterBarComponent>

      <div className="max-w-[100%]">
        {isLoading ? (
          <div className="min-h-full h-full flex">
            Carregando dados...  <Loader2 className="animate-spin" />
          </div>
        ) : groupedData ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {groupedData.map((group) => (
              <div key={group.creative.id}>
                <CardAdComponent
                  title={group.ads[0].name || group.creative.id}
                  imageUrl={
                    group.creative.object_story_spec?.video_data?.image_url ||
                    "/teste.pnj"
                  }
                  metrics={[
                    {
                      label: "Compras",
                      value: group.aggregatedInsights.actions.purchase ?? 0,
                    },
                    {
                      label: "ROAS",
                      value: group.aggregatedInsights.purchaseRoas.toFixed(2),
                    },
                    {
                      label: "Gasto Total",
                      value: group.aggregatedInsights.spend.toFixed(2),
                    },
                    {
                      label: "Impressões",
                      value: `${group.aggregatedInsights.impressions}`,
                    },
                    {
                      label: "Cliques",
                      value: `${group.aggregatedInsights.clicks}`,
                    },
                    {
                      label: "CTR",
                      value: `${group.aggregatedInsights.ctr.toFixed(2)}%`,
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="min-h-full h-full flex">
            Nenhum dado encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
