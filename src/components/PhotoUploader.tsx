import React from 'react';
import MaterialIcon from './MaterialIcon';

interface PhotoUploaderProps {
  photos: File[];
  onChange: (photos: File[]) => void;
  maxPhotos?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 5,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = React.useState<string[]>([]);

  React.useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  const handleAdd = () => {
    if (photos.length >= maxPhotos) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).slice(0, maxPhotos - photos.length);
    onChange([...photos, ...newFiles]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="font-base">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2.5">
        {previews.map((src, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden border border-border"
          >
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              onClick={() => handleRemove(i)}
              className="absolute top-0.5 right-0.5 min-w-[44px] min-h-[44px] rounded-full bg-[rgba(0,0,0,0.7)] text-white border-none cursor-pointer flex items-center justify-center p-0"
            >
              <MaterialIcon name="close" size={12} />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleAdd}
            className="aspect-square rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.12)] bg-bg-input text-text-tertiary cursor-pointer flex flex-col items-center justify-center gap-1 transition-all duration-150"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.color = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <MaterialIcon name="photo_camera" size={20} />
            <span className="text-[11px] font-medium">Add</span>
          </button>
        )}
      </div>

      <div className="mt-2 text-xs text-text-tertiary text-right">
        {photos.length}/{maxPhotos}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUploader;
