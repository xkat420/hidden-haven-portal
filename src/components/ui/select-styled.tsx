import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectStyledProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const SelectStyled = React.forwardRef<HTMLSelectElement, SelectStyledProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none cursor-pointer",
          // Dropdown arrow
          "bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 4 5\"><path fill=\"%23666\" d=\"M2 0L0 2h4zm0 5L0 3h4z\"/></svg>')] bg-no-repeat bg-right bg-[length:12px_12px] pr-8",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
SelectStyled.displayName = "SelectStyled"

interface OptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode
}

const Option = React.forwardRef<HTMLOptionElement, OptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <option
        className={cn(
          "py-2 px-3 text-foreground bg-background hover:bg-accent",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </option>
    )
  }
)
Option.displayName = "Option"

export { SelectStyled, Option }