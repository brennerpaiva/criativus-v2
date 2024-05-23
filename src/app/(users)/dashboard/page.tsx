'use client'

import { CardAdComponent } from "@/components/business/cards/card-ad.component";
// import { SelectDemo } from "@/components/business/filter/card-demo";
import { FilterBarComponent } from "@/components/business/filter/filter-bar.component";
import { MenubarDemo } from "@/components/business/filter/menubar-demo";
import { SelectGeneric } from "@/components/business/filter/select-demo";

export default function DashboardPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
      <MenubarDemo />
      <div>
        <FilterBarComponent>
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
