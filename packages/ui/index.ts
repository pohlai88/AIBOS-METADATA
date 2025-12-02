/**
 * AIBOS Design System - Main Export
 * 
 * This package provides the design system foundation:
 * - Design tokens (CSS variables)
 * - Theme provider (light/dark mode)
 * - UI Components (Button, Input, Card, etc.)
 * 
 * Usage:
 * import { Button, Card, ThemeProvider } from '@aibos/ui';
 * import '@aibos/ui/design/globals.css';
 */

// Export ThemeProvider and useTheme hook
export { ThemeProvider, useTheme, ThemeToggle } from './components/ThemeProvider';

// Export utility functions
export { cn } from './utils/cn';

// Export UI Components
export { Button, buttonVariants, type ButtonProps } from './components/Button';
export { Input, type InputProps } from './components/Input';
export { Label } from './components/Label';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/Card';
export { Badge, badgeVariants, RoleBadge, StatusBadge, type BadgeProps } from './components/Badge';
export { Avatar, AvatarImage, AvatarFallback, UserAvatar } from './components/Avatar';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/Tabs';
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/Dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/DropdownMenu';
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './components/Toast';

// Type exports for TypeScript
export type Theme = 'light' | 'dark' | 'system';

