'use client';

import { CardAdComponent } from '@/components/business/cards/card-creative.component';
import SnapshotService from '@/service/snapshot.service'; // Exemplo do seu serviço
import { CreativeGroup } from '@/utils/creative.util';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SnapshotPage() {
  const [groupedData, setGroupedData] = useState<CreativeGroup[] | null>(null);
  // Em vez de router.query.slug, usamos useParams():
  const { slug } = useParams(); 

  const [snapshotData, setSnapshotData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return; // Se ainda não temos o slug, não faz nada.

    setLoading(true);

    async function fetchSnapshot() {
      try {
        // Se o seu serviço faz uma chamada fetch/axios para
        // GET /snapshots/:slug, por exemplo:
        const snapshot = await SnapshotService.findSnapshot(slug as string);
        const groupedsCreativs = JSON.parse(snapshot.data);
        console.log(groupedsCreativs.snapshotData);
        // Exemplo: converter snapshot se for string JSON:
        setGroupedData(groupedsCreativs.snapshotData);
        console.log()
        // setSnapshotData(JSON.parse(snapshot));
        // ou se o snapshot já vier como objeto:
        setSnapshotData(snapshot);
      } catch (err) {
        console.error('Erro ao buscar snapshot:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSnapshot();
  }, [slug]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="max-w-[100%] h-full flex">
        {loading ? (
          <div className="m-auto h-full my-auto flex items-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : groupedData && groupedData.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groupedData.map((group) => {
              const firstAd = group.ads[0];
              const creative = group.creative;
              const poster = creative.object_story_spec?.video_data?.image_url;
              const title = firstAd.name || creative.id;

              return (
                <div key={creative.id}>
                  <CardAdComponent
                    title={title}
                    imageUrl={poster || "/teste.png"}
                    metrics={[
                      {
                        label: "Compras",
                        value: group.aggregatedInsights.actions.purchase ?? 0,
                      },
                      {
                        label: "Gasto Total",
                        value: group.aggregatedInsights.spend.toFixed(2),
                      },
                      {
                        label: "CTR",
                        value: `${group.aggregatedInsights.ctr?.toFixed(2)}%`,
                      },
                      {
                        label: "Tumbstop",
                        value: `${group.aggregatedInsights.tumbstock.toFixed(2)}%`,
                      },
                      {
                        label: "Click to purchase",
                        value: `${group.aggregatedInsights.clickToPurchase.toFixed(2)}%`,
                      },
                      {
                        label: "Custo por LP view",
                        value: `R$${group.aggregatedInsights.costPerLandingPageView.toFixed(2)}`,
                      },
                    ]}
                    onCardClick={() => {
                      const videoId = creative.object_story_spec?.video_data?.video_id;
                      if (videoId) {
                        searchVideoCreative(videoId, poster, title);
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="m-auto h-full my-auto flex items-center">
            Nenhum dado encontrado
          </div>
        )}
      </div>
  );
}
