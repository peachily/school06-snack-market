import { useState } from 'react';
import { isImagePath } from '../data/imagePath';
import { ImagePlaceholder } from './ImagePlaceholder';

type AssetImageProps = {
  src?: string;
  alt: string;
};

function ImageContent({ src, alt }: AssetImageProps) {
  const [failed, setFailed] = useState(false);

  if (!isImagePath(src) || failed) {
    return <ImagePlaceholder label={`${alt} 이미지 없음`} />;
  }

  return <img src={src} alt={alt} draggable={false} onError={() => setFailed(true)} />;
}

export function AssetImage({ src, alt }: AssetImageProps) {
  return (
    <div className="asset-image">
      <ImageContent key={src} src={src} alt={alt} />
    </div>
  );
}
