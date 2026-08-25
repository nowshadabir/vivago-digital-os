"use client";

import React from "react";
import { useSidebar } from "@/components/sidebar-context";
import { cn } from "@/lib/utils";

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function SidebarInset({ children, className, ...props }: SidebarInsetProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={cn(
        "min-w-0 transition-[margin] duration-300 ease-in-out",
        isCollapsed ? "lg:ml-[96px]" : "lg:ml-[320px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
