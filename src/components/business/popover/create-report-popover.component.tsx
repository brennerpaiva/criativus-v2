// src/components/business/reports/create-report-popover.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import ReportService from "@/service/report.service";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function CreateReportPopover() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const reportService = ReportService;
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload = {
        name,
        description
      }
      const res = await reportService.createReport(payload)

      if (!res) throw new Error("Falha ao criar relatório");
      const report = await res; // { id, slug, ... }

      setOpen(false);
      router.push(`/reports/${report.slug}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="px-2 mx-2">
          <Plus className="mr-2 h-4 w-4" />
          Criar relatório
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-4" align="start">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="r-name" className="text-sm font-medium">
              Nome <span className="text-red-500">*</span>
            </label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1">
            <label htmlFor="r-desc" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="r-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? "Criando…" : "Criar"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
