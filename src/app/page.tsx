import FloatingHearts from "@/components/FloatingHearts";
import ProfileHeader from "@/components/ProfileHeader";
import LinkList from "@/components/LinkList";
import { links, profile } from "@/data/profile";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <FloatingHearts />
      <main className="relative z-10 flex w-full max-w-md flex-col items-center gap-10 px-6 py-16">
        <ProfileHeader profile={profile} />
        <LinkList links={links} />
      </main>
    </div>
  );
}
