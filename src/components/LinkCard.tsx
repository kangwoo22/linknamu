import type { LinkItem } from "@/data/profile";

export default function LinkCard({ link }: { link: LinkItem }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass)] px-6 py-[18px] text-center text-[15px] font-semibold tracking-[-0.01em] shadow-[var(--glass-shadow)] backdrop-blur-xl backdrop-saturate-150 transition duration-300 ease-out hover:-translate-y-px hover:bg-[var(--glass-hover)] hover:shadow-[var(--glass-shadow-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40 active:translate-y-0 active:scale-[0.99] motion-reduce:transition-none"
    >
      {link.title}
    </a>
  );
}
