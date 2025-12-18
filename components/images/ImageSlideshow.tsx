'use client';

import { useEffect, useState } from 'react';
import S3Image from './S3Image';

const classes = {
  slideshow:
    'relative w-full h-full rounded-lg overflow-hidden shadow-[0_0_8px_rgba(0,0,0,0.5)]',
  imageBase:
    'absolute top-0 left-0 w-full h-full object-cover transform scale-110 -translate-x-4 -rotate-6 opacity-0 transition-all duration-500 ease-in-out',
  active:
    'z-[1] opacity-100 scale-100 translate-x-0 rotate-0',
};
export interface SlideshowImage {
  id: number;
  title: string;
  imageUrl: string;
  summary?: string;
}

// Use `SlideshowImage` for props
interface ImageSlideshowProps {
  images: SlideshowImage[];
}


export default function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex < images.length - 1 ? prevIndex + 1 : 0
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
        No images available
      </div>
    );
  }

  return (
    <div className={classes.slideshow}>
      {images.map((img, index) => (
        <S3Image
          key={img.id}
          s3Key={img.imageUrl}
          alt={img.title}
          className={`${classes.imageBase} ${
            index === currentImageIndex ? classes.active : ''
          }`}
          width={1200}
          height={800}
        />
      ))}
    </div>
  );
}
