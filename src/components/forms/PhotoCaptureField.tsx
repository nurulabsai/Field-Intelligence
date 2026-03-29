import { useRef, useState } from 'react';
import NeonButton from '../ui/NeonButton';

interface PhotoCaptureFieldProps {
  photos: Array<{ id: string; thumbnail: string; analyzing?: boolean; result?: string }>;
  onCapture: (file: File) => void;
  onRemove: (id: string) => void;
  maxPhotos?: number;
}

export default function PhotoCaptureField({
  photos,
  onCapture,
  onRemove,
  maxPhotos = 5,
}: PhotoCaptureFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB');
      return;
    }

    setError('');
    onCapture(file);

    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="font-manrope text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
        PHOTOS ({photos.length}/{maxPhotos})
      </label>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square overflow-hidden rounded-[12px] border border-white/5">
              <img
                src={photo.thumbnail}
                alt="Captured"
                className="h-full w-full object-cover"
              />
              {photo.analyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="material-symbols-outlined animate-spin text-neon-cyan text-[20px]">
                    progress_activity
                  </span>
                </div>
              )}
              {photo.result && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                  <p className="truncate font-manrope text-[9px] text-neon-lime">{photo.result}</p>
                </div>
              )}
              <button
                onClick={() => onRemove(photo.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
                aria-label="Remove photo"
              >
                <span className="material-symbols-outlined text-white text-[12px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Capture button */}
      {photos.length < maxPhotos && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="hidden"
            aria-label="Capture photo"
          />
          <NeonButton
            variant="ghost"
            icon="photo_camera"
            iconPosition="left"
            onClick={() => inputRef.current?.click()}
            fullWidth
          >
            {photos.length === 0 ? 'Take Photo' : 'Add Photo'}
          </NeonButton>
        </>
      )}

      {error && (
        <p className="flex items-center gap-1 font-manrope text-[11px] text-neon-red" role="alert">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}
