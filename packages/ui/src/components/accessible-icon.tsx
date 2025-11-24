// packages/ui/src/components/accessible-icon.tsx
"use client";

import * as React from "react";
import * as AccessibleIconPrimitive from "@radix-ui/react-accessible-icon";

export interface AccessibleIconProps
  extends React.ComponentPropsWithoutRef<typeof AccessibleIconPrimitive.Root> {}

export const AccessibleIcon = ({ ...props }: AccessibleIconProps) => {
  return <AccessibleIconPrimitive.Root {...props} />;
};

AccessibleIcon.displayName = "AccessibleIcon";

