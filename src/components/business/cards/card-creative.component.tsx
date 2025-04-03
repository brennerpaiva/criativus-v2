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
  metrics: { label: string; value: string | number; difference?: string | number }[];
  onCardClick?: () => void;
}

export function CardAdComponent({ title, thumbUrl, mediaType, metrics, onCardClick }: CardAdProps) {
  return (
    <TooltipProvider>
      <Card className={cn("w-full h-fit")} onClick={onCardClick}>
        <CardHeader className="p-0 cursor-pointer">
          {/* Container com position:relative para comportar a tag "video" */}
          <div className="relative w-full h-[240px] overflow-hidden">
            <Image
              src={thumbUrl}
              width={241}
              height={241}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Tag "video" no topo esquerdo (ou mude para "top-2 right-2" se quiser no canto direito) */}
            <span className="absolute top-2 left-2 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded">
              {mediaType === "VIDEO" ? (
                <VideoIcon className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </span>
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
