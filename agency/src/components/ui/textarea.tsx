import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base transition-all outline-none placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-2 aria-invalid:ring-rose-500/20 md:text-sm shadow-2xs",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
