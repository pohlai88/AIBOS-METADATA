// packages/ui/src/components/portal.tsx
"use client";

import * as React from "react";
import * as PortalPrimitive from "@radix-ui/react-portal";

export interface PortalProps
  extends React.ComponentPropsWithoutRef<typeof PortalPrimitive.Root> {}

export const Portal = ({ ...props }: PortalProps) => {
  return <PortalPrimitive.Root {...props} />;
};

Portal.displayName = "Portal";

