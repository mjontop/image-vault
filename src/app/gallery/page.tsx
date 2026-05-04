import { GalleryView } from "@core/components/gallery-view";
import Link from "next/link";
import { Button } from "@core/components/ui/button";

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-zinc-50 p-8 font-sans dark:bg-black">
      <header className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Secure Image Gallery
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/">← Home</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/vault">View Vault →</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl">
        <GalleryView />
      </main>
    </div>
  );
}
