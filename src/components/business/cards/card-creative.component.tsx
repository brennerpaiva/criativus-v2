"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CardAdProps {
  title: string;
  imageUrl: string;
  metrics: { label: string; value: string | number }[];
  onCardClick?: () => void; // Prop opcional para capturar clique
}

export function CardAdComponent({ title, imageUrl, metrics, onCardClick }: CardAdProps) {
  return (
    <Card
      // Ajuste das classes e adição de cursor-pointer
      className={cn("w-full h-full cursor-pointer")}
      onClick={onCardClick}
    >
      <CardHeader className="p-0">
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
          <CardTitle className="text-sm truncate">{title}</CardTitle>
        </div>
        <div className="flex flex-col gap-3">
          {metrics.map((metric, index) => (
            <CardDescription key={index} className="flex justify-between">
              <span>{metric.label}</span>
              <span>{metric.value}</span>
            </CardDescription>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
