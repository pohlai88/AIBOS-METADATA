import React from "react";
import Icon from "@mdi/react";
import { cn } from "../../lib/cn";

export type IconColorVariant =
  | "primary"
  | "secondary"
  | "muted"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "css"
  | "react"
  | "vue"
  | "node"
  | "git";

export interface ColoredMDIIconProps {
  path: string;
  size?: number | string;
  className?: string;
  /** The semantic color key */
  variant?: IconColorVariant;
  /** If true, adds a translucent background matching the color */
  withBackground?: boolean;
}

const colorMap: Record<IconColorVariant, string> = {
  primary: "var(--icon-primary)",
  secondary: "var(--icon-secondary)",
  muted: "var(--icon-muted)",
  success: "var(--icon-success)",
  warning: "var(--icon-warning)",
  error: "var(--icon-error)",
  info: "var(--icon-info)",
  javascript: "var(--icon-js)",
  typescript: "var(--icon-ts)",
  python: "var(--icon-py)",
  html: "var(--icon-html)",
  css: "var(--icon-css)",
  react: "var(--icon-react)",
  vue: "var(--icon-vue)",
  node: "var(--icon-node)",
  git: "var(--icon-git)",
};

export const ColoredMDIIcon = ({
  path,
  size = 1,
  variant = "secondary",
  withBackground = false,
  className,
}: ColoredMDIIconProps) => {
  const colorVar = colorMap[variant];

  // Base icon style
  const style = { color: colorVar };

  // If background is requested, we wrap it
  if (withBackground) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
          className
        )}
        style={{
          ...style,
          // The Magic: Uses the text color but with 10% opacity for BG
          backgroundColor: `color-mix(in srgb, ${colorVar}, transparent 85%)`,
        }}
      >
        <Icon path={path} size={size} />
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center", className)} style={style}>
      <Icon path={path} size={size} />
    </div>
  );
};
