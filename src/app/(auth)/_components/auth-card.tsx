import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthCard({ title, description, children, footer }: Props) {
  return (
    <main className="mx-auto w-full max-w-md p-4">
      <div className="mb-4">
        <Link
          href="/"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">{children}</CardContent>

        {footer ? (
          <div className="border-t border-border p-4">{footer}</div>
        ) : null}
      </Card>
    </main>
  );
}
