import FloatingHearts from "@/components/FloatingHearts";
import ProfileHeader from "@/components/ProfileHeader";
import LinkList from "@/components/LinkList";
import { links, profile } from "@/data/profile";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center font-sans">
      <FloatingHearts />
      <main className="relative z-10 flex w-full max-w-[440px] flex-col items-center gap-12 px-7 pt-20 pb-16 sm:px-10 sm:pt-24">
        <ProfileHeader profile={profile} />
        <LinkList links={links} />
      </main>
    </div>
  );
}
