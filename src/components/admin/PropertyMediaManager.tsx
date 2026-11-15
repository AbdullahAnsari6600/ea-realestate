
import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import {
  AdminPropertyError,
  deleteAdminPropertyMedia,
  getAdminMediaUrl,
  getAdminPropertyMedia,
  reorderAdminPropertyMedia,
  setAdminPropertyMediaCover,
  uploadAdminPropertyMedia,
  type AdminPropertyMedia,
  type AdminMediaType,
} from "@/services/adminPropertyService";

interface PropertyMediaManagerProps {
  propertyId: string;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default function PropertyMediaManager({
  propertyId,
}: PropertyMediaManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<AdminPropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadMedia();
    // Load media when the selected property changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function loadMedia() {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminPropertyMedia(propertyId);

      setMedia(result);
    } catch (err) {
      if (err instanceof AdminPropertyError && err.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    setUploading(true);
    setError("");
    setMessage("");

    let successfulUploads = 0;
    const failures: string[] = [];

    let nextSortOrder =
      media.length > 0
        ? Math.max(...media.map((item) => item.sortOrder)) + 1
        : 0;

    let needsCover = !media.some(
      (item) => item.type === "IMAGE" && item.isCover
    );

    try {
      for (const file of files) {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
          failures.push(`${file.name}: Unsupported file type.`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          failures.push(`${file.name}: File exceeds the 100 MB limit.`);
          continue;
        }

        const type: AdminMediaType = isImage ? "IMAGE" : "VIDEO";

        const shouldBeCover = isImage && needsCover;

        try {
          await uploadAdminPropertyMedia(propertyId, file, {
            type,
            sortOrder: nextSortOrder,
            isCover: shouldBeCover,
            altText: isImage ? file.name : undefined,
          });

          successfulUploads++;
          nextSortOrder++;

          if (shouldBeCover) {
            needsCover = false;
          }
        } catch (err) {
          if (err instanceof AdminPropertyError && err.status === 401) {
            window.location.assign("/admin/login");
            return;
          }

          failures.push(`${file.name}: ${getErrorMessage(err)}`);
        }
      }

      await loadMedia();

      if (failures.length > 0) {
        setError(failures.join("\n"));
      }

      if (successfulUploads > 0) {
        setMessage(
          `${successfulUploads} file(s) uploaded successfully.`
        );
      }
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSetCover(item: AdminPropertyMedia) {
    if (item.type !== "IMAGE" || item.isCover) return;

    setProcessingId(item.id);
    setError("");
    setMessage("");

    try {
      await setAdminPropertyMediaCover(propertyId, item.id);

      setMedia((current) =>
        current.map((mediaItem) => ({
          ...mediaItem,
          isCover: mediaItem.id === item.id,
        }))
      );

      setMessage("Cover image updated successfully.");
    } catch (err) {
      if (err instanceof AdminPropertyError && err.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(item: AdminPropertyMedia) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.fileName || "this media"}"?`
    );

    if (!confirmed) return;

    setProcessingId(item.id);
    setError("");
    setMessage("");

    try {
      await deleteAdminPropertyMedia(propertyId, item.id);

      await loadMedia();

      setMessage("Media deleted successfully.");
    } catch (err) {
      if (err instanceof AdminPropertyError && err.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReorder(
    item: AdminPropertyMedia,
    direction: "up" | "down"
  ) {
    const currentIndex = media.findIndex(
      (entry) => entry.id === item.id
    );

    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= media.length) return;

    const reordered = [...media];

    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex],
    ];

    const updatedMedia = reordered.map((entry, index) => ({
      ...entry,
      sortOrder: index,
    }));

    setProcessingId(item.id);
    setError("");
    setMessage("");

    const previousMedia = media;

    setMedia(updatedMedia);

    try {
      const result = await reorderAdminPropertyMedia(
        propertyId,
        updatedMedia.map((entry) => ({
          id: entry.id,
          sortOrder: entry.sortOrder,
        }))
      );

      setMedia(result);
      setMessage("Gallery order updated.");
    } catch (err) {
      setMedia(previousMedia);

      if (err instanceof AdminPropertyError && err.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  const imageCount = media.filter(
    (item) => item.type === "IMAGE"
  ).length;

  const videoCount = media.filter(
    (item) => item.type === "VIDEO"
  ).length;

  return (
    <section className="mt-8 rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-xl sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Property Images & Videos
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Manage your property gallery, cover image and videos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMedia()}
          disabled={loading || uploading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <ImageIcon className="mb-2 text-amber-400" size={20} />
          <p className="text-2xl font-semibold text-white">
            {imageCount}
          </p>
          <p className="text-xs text-gray-400">Images</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <Video className="mb-2 text-amber-400" size={20} />
          <p className="text-2xl font-semibold text-white">
            {videoCount}
          </p>
          <p className="text-xs text-gray-400">Videos</p>
        </div>

        <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:col-span-1">
          <Star className="mb-2 text-amber-400" size={20} />
          <p className="text-2xl font-semibold text-white">
            {media.length}
          </p>
          <p className="text-xs text-gray-400">Total media</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-amber-400/40 bg-amber-400/[0.04] p-5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center">
          <div className="mb-3 rounded-full bg-amber-400/10 p-3">
            <Upload size={24} className="text-amber-400" />
          </div>

          <h3 className="font-medium text-white">
            Upload property media
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Select multiple images and videos at once.
          </p>

          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG, WebP, AVIF, MP4 and WebM · Maximum 100 MB per file
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Uploading files...
              </>
            ) : (
              <>
                <Upload size={17} />
                Choose Files
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 whitespace-pre-line rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
          {message}
        </div>
      )}

      <div className="mt-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Gallery
          </h3>

          <span className="text-xs text-gray-400">
            {media.length} item(s)
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            Loading gallery...
          </div>
        ) : media.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] py-12 text-center">
            <ImageIcon
              size={32}
              className="mx-auto mb-3 text-gray-500"
            />

            <p className="text-sm text-gray-300">
              No images or videos uploaded yet.
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Upload media to create this property's gallery.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item, index) => {
              const isProcessing = processingId === item.id;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1220]"
                >
                  <div className="relative aspect-[4/3] bg-black">
                    {item.type === "IMAGE" ? (
                      <img
                        src={getAdminMediaUrl(item.url)}
                        alt={item.altText || item.fileName || "Property image"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <video
                        src={getAdminMediaUrl(item.url)}
                        controls
                        preload="metadata"
                        className="h-full w-full object-contain"
                      />
                    )}

                    {item.isCover && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-gray-950">
                        <Star size={12} fill="currentColor" />
                        Cover Image
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                      {item.type}
                    </span>
                  </div>

                  <div className="p-3">
                    <p
                      className="truncate text-sm font-medium text-white"
                      title={item.fileName || ""}
                    >
                      {item.fileName || "Property media"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Gallery position {index + 1}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleReorder(item, "up")}
                        disabled={
                          isProcessing || index === 0 || uploading
                        }
                        title="Move up"
                        className="rounded-lg border border-white/10 p-2 text-gray-300 transition hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleReorder(item, "down")}
                        disabled={
                          isProcessing ||
                          index === media.length - 1 ||
                          uploading
                        }
                        title="Move down"
                        className="rounded-lg border border-white/10 p-2 text-gray-300 transition hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowDown size={16} />
                      </button>

                      {item.type === "IMAGE" && (
                        <button
                          type="button"
                          onClick={() => void handleSetCover(item)}
                          disabled={
                            isProcessing || item.isCover || uploading
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-400/30 px-3 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-400/10 disabled:opacity-40"
                        >
                          <Star size={14} />
                          {item.isCover ? "Cover" : "Set Cover"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={isProcessing || uploading}
                        title="Delete media"
                        className="ml-auto rounded-lg border border-red-500/20 p-2 text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                      >
                        {isProcessing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
