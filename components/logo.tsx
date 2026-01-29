import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-end gap-2">
      <div className="relative h-10 aspect-140/28 block dark:hidden">
        <Image
          src="/logo.svg"
          alt="Invoice Heaven"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, 140px"
          priority
        />
      </div>
      {/* Dark mode logo - hidden in light mode */}
      <div className="relative h-10 aspect-140/28 hidden dark:block">
        <Image
          src="/logo-light.svg"
          alt="Invoice Heaven"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 100px, (max-width: 768px) 120px, 140px"
          priority
        />
      </div>
      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Calculator</p>
    </div>
  );
}
