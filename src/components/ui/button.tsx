import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * The site kit's control shape (see src/components/site/button.tsx), behind
 * shadcn's API so every existing call site picks it up. Pill radius, medium
 * weight, a small lift on hover.
 *
 * Colour roles follow the site: `hero` and `secondary-gradient` are the orange
 * reserved for commitment actions (book, pay, get started); `default` is the
 * deep-teal ink every other lead action takes; `accent` is the brand teal.
 * The gradient variants keep their names for compatibility but no longer
 * paint gradients.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-dm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-foreground text-white hover:-translate-y-0.5 hover:bg-foreground/90 active:translate-y-0",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background text-foreground hover:bg-muted",
        secondary: "bg-muted text-foreground hover:bg-muted/70",
        ghost: "text-foreground hover:bg-muted",
        link: "rounded-none text-primary underline-offset-4 hover:underline",
        hero: "bg-secondary text-secondary-foreground shadow-medium hover:-translate-y-0.5 hover:bg-secondary-hover hover:shadow-large active:translate-y-0",
        accent: "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0",
        "secondary-gradient": "bg-secondary text-secondary-foreground shadow-medium hover:-translate-y-0.5 hover:bg-secondary-hover hover:shadow-large active:translate-y-0",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-[0.8125rem]",
        lg: "h-11 px-6 text-[0.9375rem]",
        xl: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
