import Image from "next/image";
import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Image
        src={profile.imageUrl}
        alt={`${profile.name} 프로필 사진`}
        width={150}
        height={150}
        priority
        className="h-[150px] w-[150px] rounded-full object-cover ring-4 ring-white shadow-md dark:ring-zinc-800"
      />
      <h1 className="mt-6 text-xl font-bold tracking-tight">
        {profile.name}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {profile.bio}
      </p>
    </header>
  );
}
