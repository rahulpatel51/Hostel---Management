"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-900 dark:text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 rounded-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700",
          "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-gray-100 dark:bg-gray-700/50",
          "[&:has([aria-selected])]:bg-gray-100 dark:bg-gray-700",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal rounded-full",
          "aria-selected:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600",
          "transition-colors duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-blue-600 text-white hover:bg-blue-700",
          "focus:bg-blue-700 focus:text-white",
          "dark:bg-blue-500 dark:hover:bg-blue-600",
          "dark:focus:bg-blue-600 dark:focus:text-white"
        ),
        day_today: cn(
          "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white",
          "border border-gray-300 dark:border-gray-600"
        ),
        day_outside: cn(
          "text-gray-400 dark:text-gray-500",
          "aria-selected:bg-gray-100 aria-selected:text-gray-400",
          "dark:aria-selected:bg-gray-700/50 dark:aria-selected:text-gray-500"
        ),
        day_disabled: "text-gray-300 dark:text-gray-600 opacity-50",
        day_range_middle: cn(
          "aria-selected:bg-gray-100 aria-selected:text-gray-900",
          "dark:aria-selected:bg-gray-700 dark:aria-selected:text-white"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }