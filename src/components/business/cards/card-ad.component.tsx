'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const notifications = [
  {
    title: "Your call has been confirmed.",
    description: "1 hour ago",
  },
  {
    title: "You have a new message!",
    description: "1 hour ago",
  },
  {
    title: "Your subscription is expiring soon!",
    description: "2 hours ago",
  },
]

type CardProps = React.ComponentProps<typeof Card>

export function CardAdComponent({ className, ...props }: CardProps) {
  return (
    <Card className={cn("w-[280px] h-[360px]", className)} {...props}>
      <CardHeader className="p-0">
      <div className="w-full h-[240px] overflow-hidden">
        <img
          src="/teste.jpg"
          alt="Image"
          className="w-full h-[240px]"
        />
      </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3  p-4 overflow-hidden">
        <div className="flex">
         {/* TODO: Deixar a quebra de parecida com o projeto marvel */}
          <CardTitle className="text-sm">TESTE</CardTitle> 
        </div>
        <div className="flex flex-col gap-3">
        <CardDescription className="flex flex-1 justify-between">
          <span>Roas</span>
          <span>50</span>
        </CardDescription>
        <CardDescription className="flex flex-1 justify-between">
          <span>Roas</span>
          <span>50</span>
        </CardDescription>
        </div>

      </CardContent>
    </Card>
  )
}
