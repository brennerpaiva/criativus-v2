"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ImageIcon, VideoIcon } from "lucide-react";
import Image from "next/image";

interface CardAdProps {
  title: string;
  thumbUrl: string;
  mediaType?: string;
  metrics: { label: string; value: string | number; difference?: string; invert?: boolean }[];
  onCardClick?: () => void;
}

export function CardAdComponent({ title, thumbUrl, mediaType, metrics, onCardClick }: CardAdProps) {
  return (
    <TooltipProvider>
      <Card className={cn("w-full h-fit")}>
        <CardHeader className="p-0 cursor-pointer">
          <div className="relative w-full h-[240px] overflow-hidden">
            <Image
              src={thumbUrl}
              width={241}
              height={241}
              alt={title}
              className="w-full h-full object-cover"
              onClick={onCardClick}
            />
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
              {mediaType === "VIDEO" ? <VideoIcon className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </span>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 p-4 overflow-hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className="text-sm truncate">{title}</CardTitle>
            </TooltipTrigger>
            <TooltipContent>{title}</TooltipContent>
          </Tooltip>

          <div className="flex flex-col gap-3">
            {metrics.map((metric, idx) => {
              const diffNum = metric.difference ? parseFloat(metric.difference.replace(/\./g, '')) : 0;
              const isInverted = metric.invert === true;
              const isPositive = isInverted ? diffNum <= 0 : diffNum >= 0;
              const opacity = Math.min(Math.abs(diffNum) / 100, 1);
              let bgColor = isPositive
                ? isInverted
                  ? `rgba(34,197,94,${opacity})`  // green when below average for inverted metrics
                  : `rgba(34,197,94,${opacity})`  // green for positive
                : `rgba(107,114,128, 5%)`;   // grey
              if (!metric.difference) {
                bgColor = `rgba(107,114,128, 5%)`
              }
              const textColor = isPositive ? 'text-green-700' : 'text-red-700';

              return (
                <CardDescription key={idx} className="flex justify-between">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{metric.label}</span>
                    </TooltipTrigger>
                    <TooltipContent>{metric.label}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="px-1 py-1 rounded text-card-foreground"
                        style={{ backgroundColor: bgColor }}
                      >
                        {metric.value}
                      </span>
                    </TooltipTrigger>
                    {metric.difference && (
                      <TooltipContent>
                        Diferença da média <span className={textColor}>
                          {diffNum >= 0 ? `+${metric.difference}` : `${metric.difference}`}
                        </span>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </CardDescription>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// src/pages/top-criativos-vendas.tsx remains unchanged

