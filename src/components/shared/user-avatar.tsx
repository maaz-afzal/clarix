"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
  decorative?: boolean;
}

export default function UserAvatar({
  name,
  image,
  size = 28,
  className,
  decorative = false,
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = name.trim().slice(0, 2).toUpperCase() || "?";
  const showImage = !!image && failedSrc !== image;

  return (
    <div
      role={decorative ? undefined : "img"}
      aria-label={decorative || showImage ? undefined : name}
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={image}
          alt={decorative ? "" : name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailedSrc(image)}
        />
      ) : (
        <span className="text-xs font-semibold text-primary" aria-hidden="true">
          {initials}
        </span>
      )}
    </div>
  );
}
