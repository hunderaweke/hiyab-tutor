import * as React from "react";
import { cn } from "@/lib/utils";

function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };
