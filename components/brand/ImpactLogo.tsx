import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ImpactLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showTagline?: boolean;
  asLink?: boolean;
  className?: string;
}

export const ImpactLogo: React.FC<ImpactLogoProps> = ({
  size = "md",
  showText = true,
  showTagline = true,
  asLink = true,
  className = "",
}) => {
  const sizeMap = {
    sm: { icon: 32, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 42, text: "text-xl", sub: "text-[10px]" },
    lg: { icon: 52, text: "text-2xl", sub: "text-xs" },
  };

  const { icon, text, sub } = sizeMap[size];

  const content = (
    <div className={`flex items-center gap-3 group ${className}`}>
      {/* Official IMPACT Logo Icon */}
      <div
        className="relative rounded-xl overflow-hidden flex-shrink-0 shadow-xs border border-brand-border/60 transition-transform duration-200 group-hover:scale-105 bg-[#0D0D0F]"
        style={{ width: icon, height: icon }}
      >
        <Image
          src="/brand/impact-logo.png"
          alt="IMPACT Enterprise"
          fill
          sizes={`${icon}px`}
          className="object-cover"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-black ${text} text-brand-dark tracking-[-0.04em]`}>
            IMPACT
          </span>
          {showTagline && (
            <span className={`font-bold tracking-[0.24em] text-brand-muted uppercase ${sub} mt-0.5`}>
              ENTERPRISE
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" aria-label="IMPACT Enterprise Home" className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
