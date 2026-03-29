import React from 'react';
import { Camera, X } from 'lucide-react';

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
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '10px',
        }}
      >
        {previews.map((src, i) => (
          <div
            key={i}
            style={{
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <img
              src={src}
              alt={`Photo ${i + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <button
              onClick={() => handleRemove(i)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            onClick={handleAdd}
            style={{
              aspectRatio: '1',
              borderRadius: '12px',
              border: '2px dashed rgba(255,255,255,0.12)',
              backgroundColor: 'var(--color-bg-input, #252525)',
              color: '#6B7280',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.color = '#9CA3AF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <Camera size={20} />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Add</span>
          </button>
        )}
      </div>

      <div
        style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#6B7280',
          textAlign: 'right',
        }}
      >
        {photos.length}/{maxPhotos}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default PhotoUploader;
