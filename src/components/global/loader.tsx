"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

type LoaderProps = {
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
};

const Loader = ({ loading = false, children, className }: LoaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className
      )}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin text-white" />
      )}
      <span>{children}</span>
    </div>
  );
};

export default Loader;