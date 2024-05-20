'use client'

import { CardAdComponent } from "@/components/business/cards/card-ad.component";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@radix-ui/react-select";

export default function DashboardPage() {
  return (
    <div className="w-full lg:grid lg:min-h-[600px] xl:min-h-[800px]">
      <div>
        {/* <FilterBarComponent> */}
        {/* </FilterBarComponent> */}
      </div>
      <div className="lg:grid lg:grid-cols-4">
        <CardAdComponent />
        <CardAdComponent />
        <CardAdComponent />
        <CardAdComponent />
        <CardAdComponent />
      </div>
    </div>
  );
}
