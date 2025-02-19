'use client';

import { CardAdComponent } from '@/components/business/cards/card-creative.component';
// import { SelectDemo } from "@/components/business/filter/card-demo";
import { FilterBarComponent } from '@/components/business/filter/filter-bar.component';
import { SelectGeneric } from '@/components/business/filter/select-demo';
import { SkeletonCardCreative } from '@/components/ui/custom/skeleton-card-creative';
import { useAuth } from '@/context/auth.context';
import FacebookAdsService from '@/service/graph-api.service';
import { userModel } from '@/types/model/user.model';
import { useEffect, useState } from 'react';

export default  function DashboardPage() {
  const [data, setData] = useState<userModel[] | null>(null);
  const { login, user, adAccount, logout } = useAuth();
  useEffect(() => {
    async function fetchData() {
      if (adAccount) {
        try {
          const result = await FacebookAdsService.getCreativeInsights(adAccount.account_id);
          console.log(result);
          setData(result);
        } catch (err) {
          console.log(err)
        }
        alert('teste');
      }
     
     
    }
    fetchData();
  }, []);

  return (
    <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
      <div>
        <FilterBarComponent>
          <SelectGeneric
            label="Grupo Ads"
            placeholder="Grupo Ads"
            items={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'blueberry', label: 'Blueberry' },
              { value: 'grapes', label: 'Grapes' },
              { value: 'pineapple', label: 'Pineapple' },
            ]}
            className="w-[140px]"
          />
          <SelectGeneric
            label="Grupo Ads"
            placeholder="Grupo Ads"
            items={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'blueberry', label: 'Blueberry' },
              { value: 'grapes', label: 'Grapes' },
              { value: 'pineapple', label: 'Pineapple' },
            ]}
            className="w-[140px]"
          />
          <SelectGeneric
            label="Grupo Ads"
            placeholder="Grupo Ads"
            items={[
              { value: 'apple', label: 'Apple' },
              { value: 'banana', label: 'Banana' },
              { value: 'blueberry', label: 'Blueberry' },
              { value: 'grapes', label: 'Grapes' },
              { value: 'pineapple', label: 'Pineapple' },
            ]}
            className="w-[140px]"
          />
        </FilterBarComponent>
      </div>
      <div className="max-w-[100%] ">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <SkeletonCardCreative />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
          <div className="m-auto p-4">
            <CardAdComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
