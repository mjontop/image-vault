import { GalleryView } from "@core/components/gallery-view";

export default function GalleryPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Secure Image Gallery</h1>
      <GalleryView />
    </div>
  );
}
