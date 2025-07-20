
"use client";

import { PageClient } from "@/components/page-client";
import { AuthProvider } from "@/hooks/use-auth";

export default function Home() {
  return (
    <main>
      <AuthProvider>
        <PageClient />
      </AuthProvider>
    </main>
  );
}
