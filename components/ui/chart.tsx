"use client"

import * as React from "react"
import { Legend, Tooltip, TooltipProps } from "recharts"
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color?: string
  }
>

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("h-full w-full", className)}
      style={
        {
          "--color-primary": "hsl(var(--primary))",
          ...Object.fromEntries(
            Object.entries(config).map(([key, value]) => [
              `--color-${key}`,
              value.color ?? "hsl(var(--primary))",
            ])
          ),
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: TooltipProps<ValueType, NameType>["payload"]
  label?: string
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
  indicator?: "line" | "dot"
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter = (label) => label,
  valueFormatter = (value) => value.toString(),
  indicator = "line",
  className,
  ...props
}: ChartTooltipContentProps) {
  if (active && payload?.length) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-background p-2 shadow-sm",
          className
        )}
        {...props}
      >
        <div className="grid gap-2">
          <div className="grid gap-1">
            <div className="text-sm font-medium">
              {label ? labelFormatter(label) : null}
            </div>
            <div className="grid gap-1">
              {payload.map((data, i) => (
                <div key={i} className="flex items-center gap-2">
                  {indicator === "line" ? (
                    <div
                      className="h-0.5 w-4 rounded-full"
                      style={{
                        backgroundColor: data.color,
                      }}
                    />
                  ) : (
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: data.color,
                      }}
                    />
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">
                      {data.name && data.dataKey !== data.name
                        ? `${data.name}:`
                        : null}
                    </span>
                    <span>
                      {typeof data.value === "number"
                        ? valueFormatter(data.value)
                        : data.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export const ChartTooltip = Tooltip

interface ChartLegendContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  payload?: Array<{
    value: string
    type: string
    id: string
    color: string
  }>
}

export function ChartLegendContent({
  payload,
  className,
  ...props
}: ChartLegendContentProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-4 text-sm", className)}
      {...props}
    >
      {payload?.map((entry, i) => (
        <div key={`item-${i}`} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: entry.color,
            }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export const ChartLegend = Legend
