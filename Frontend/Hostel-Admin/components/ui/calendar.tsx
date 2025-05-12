"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

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
      className={cn(
        "p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900",
        className
      )}
      classNames={{
        months: "flex flex-col gap-4",
        month: "space-y-4",
        caption: "flex justify-between items-center px-2",
        caption_label: "text-lg font-semibold text-gray-900 dark:text-gray-100",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "hidden", 
        head_cell: "hidden", 
        row: "flex w-full mt-1",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-800",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-full aria-selected:opacity-100",
          "text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700",
          "focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        ),
        day_selected: cn(
          "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
          "focus:bg-blue-700 focus:text-white"
        ),
        day_today: "border border-blue-500 text-blue-600 dark:text-blue-400",
        day_outside: "text-gray-400 dark:text-gray-500",
        day_disabled: "text-gray-300 dark:text-gray-600 opacity-50",
        day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900 dark:aria-selected:bg-gray-700 dark:aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconNext: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }