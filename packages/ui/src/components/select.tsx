// packages/ui/src/components/select.tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  componentTokens,
  colorTokens,
  accessibilityTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
  shadowTokens,
} from "../design/tokens";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`${componentTokens.input} inline-flex items-center justify-between gap-2 ${className ?? ""}`}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 opacity-50"
        aria-hidden="true"
      >
        <path
          d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89247 4.93179 6.06821C5.10753 6.24395 5.39247 6.24395 5.56821 6.06821L7.5 4.13643L9.43179 6.06821C9.60753 6.24395 9.89247 6.24395 10.0682 6.06821C10.2439 5.89247 10.2439 5.60753 10.0682 5.43179L7.81821 3.18179C7.73379 3.09736 7.61933 3.04999 7.5 3.04999C7.38067 3.04999 7.26621 3.09736 7.18179 3.18179L4.93179 5.43179Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        <path
          d="M4.93179 9.56821C5.10753 9.39247 5.39247 9.39247 5.56821 9.56821L7.5 11.5L9.43179 9.56821C9.60753 9.39247 9.89247 9.39247 10.0682 9.56821C10.2439 9.74395 10.2439 10.0289 10.0682 10.2046L7.81821 12.4546C7.73379 12.5391 7.61933 12.5864 7.5 12.5864C7.38067 12.5864 7.26621 12.5391 7.18179 12.4546L4.93179 10.2046C4.75605 10.0289 4.75605 9.74395 4.93179 9.56821Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`${colorTokens.bgElevated} ${accessibilityTokens.textOnBgElevated} ${radiusTokens.md} ${shadowTokens.md} border ${colorTokens.border} p-1 min-w-32 overflow-hidden ${className ?? ""}`}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={`${typographyTokens.labelSm} ${colorTokens.textMuted} px-2 py-1.5 ${className ?? ""}`}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-bg-muted focus:text-fg data-disabled:pointer-events-none data-disabled:opacity-50 ${className ?? ""}`}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
        >
          <path
            d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={`-mx-1 my-1 h-px ${colorTokens.borderSubtle} ${className ?? ""}`}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
