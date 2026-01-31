import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-zinc-200 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-zinc-900", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-zinc-500 mt-1", className)} {...props} />;
}

function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("px-6 py-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-zinc-100", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
