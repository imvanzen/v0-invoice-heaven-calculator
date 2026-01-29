/**
 * Shared footer for pages
 * Displays feedback link and version
 */
export function PageFooter() {
  return (
    <>
      <a
        href="https://forms.gle/wGpx3q8DCcsHWGou9"
        className="mt-4 text-sm text-muted-foreground hover:underline"
        rel="noopener noreferrer nofollow"
        target="_blank"
      >
        Leave feedback 📣
      </a>
      <span className="text-sm text-muted-foreground/20">
        Version {process.env.NEXT_PUBLIC_VERSION}
      </span>
    </>
  );
}

