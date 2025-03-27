"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Importa os componentes do tooltip
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CardAdProps {
  title: string;
  imageUrl: string;
  metrics: { label: string; value: string | number, difference?: string | number }[];
  onCardClick?: () => void; // Prop opcional para capturar clique
}

export function CardAdComponent({ title, imageUrl, metrics, onCardClick }: CardAdProps) {
  return (
    <TooltipProvider>
      <Card className={cn("w-full h-fit")} onClick={onCardClick}>
        <CardHeader className="p-0 cursor-pointer">
          <div className="w-full h-[240px] overflow-hidden">
            <Image
              src={imageUrl}
              width={241}
              height={241}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 p-4 overflow-hidden">
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <CardTitle className="text-sm truncate">{title}</CardTitle>
              </TooltipTrigger>
              <TooltipContent>{title}</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col gap-3">
            {metrics.map((metric, index) => (
              <CardDescription key={index} className="flex justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{metric.label}</span>
                  </TooltipTrigger>
                  <TooltipContent>{metric.label}</TooltipContent>
                </Tooltip>
                <span>{metric.value}</span>
              </CardDescription>
            ))}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
