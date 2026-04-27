"use client";

import { Progress } from "@core/components/ui/progress";
import { CloudUpload, ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react";
import { Stats } from "../types/file";

interface ProgressDashboardProps {
  stats: Stats;
}

export function ProgressDashboard({ stats }: ProgressDashboardProps) {
  return (
    <div className="sticky top-4 z-10 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">Encrypted</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span className="text-lg font-semibold">
              {stats.encrypted} / {stats.total}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">Uploaded</span>
          <div className="flex items-center gap-2">
            <CloudUpload className="h-4 w-4 text-blue-500" />
            <span className="text-lg font-semibold">
              {stats.uploaded} / {stats.total}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">
            Failed Encryption
          </span>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-semibold">
              {stats.failedEncrypt} / {stats.total}
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">Failed Upload</span>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-lg font-semibold">
              {stats.failedUpload} / {stats.total}
            </span>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
          <span>Overall Progress</span>
          <span>{Math.round(stats.overallProgress)}%</span>
        </div>
        <Progress value={stats.overallProgress} className="h-2" />
      </div>
    </div>
  );
}
