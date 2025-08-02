
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-500 text-primary-foreground hover:bg-green-500/80",
        secondary:
          "border-transparent bg-gray-500 text-white hover:bg-gray-500/80",
        destructive:
          "border-transparent bg-red-500 text-destructive-foreground hover:bg-red-500/80",
        outline: "text-foreground border-yellow-500",
        info: "border-transparent bg-sky-500 text-white hover:bg-sky-500/80",
        special: "border-transparent bg-purple-500 text-white hover:bg-purple-500/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
