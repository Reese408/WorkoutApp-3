'use client';

import Image from 'next/image';

interface S3ImageProps {
  s3Key: string; // this is actually the full image URL from your DB
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function S3Image({ s3Key, alt, className, width, height }: S3ImageProps) {
  if (!s3Key) {
    return (
      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  return (
    <Image
      src={s3Key}
      alt={alt}
      fill={!width && !height}
      width={width}
      height={height}
      className={className}
      unoptimized
    />
  );
}
