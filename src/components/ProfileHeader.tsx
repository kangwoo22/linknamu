import Image from "next/image";
import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Image
        src={profile.imageUrl}
        alt={`${profile.name} 프로필 사진`}
        width={192}
        height={192}
        priority
        className="h-40 w-40 rounded-full object-cover ring-4 ring-white shadow-md sm:h-48 sm:w-48 dark:ring-zinc-800"
      />
      <h1 className="mt-6 text-xl font-semibold tracking-tight">
        {profile.name}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {profile.bio}
      </p>
    </header>
  );
}
