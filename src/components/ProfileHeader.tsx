import Image from "next/image";
import type { Profile } from "@/data/profile";

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <header className="flex flex-col items-center text-center">
      {/* 밝은 테두리 + 위쪽 하이라이트 + 부드러운 그림자로 살짝 떠 있는 입체감 */}
      <div className="rounded-full bg-gradient-to-b from-white to-white/40 p-1 shadow-[0_2px_4px_rgb(120_80_60/0.08),0_18px_40px_-12px_rgb(120_80_60/0.35)] dark:from-white/25 dark:to-white/5 dark:shadow-[0_18px_40px_-12px_rgb(0_0_0/0.6)]">
        <Image
          src={profile.imageUrl}
          alt={`${profile.name} 프로필 사진`}
          width={112}
          height={112}
          priority
          className="h-28 w-28 rounded-full object-cover"
        />
      </div>
      <h1 className="mt-6 text-[22px] font-bold tracking-[-0.02em]">
        {profile.name}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        {profile.bio}
      </p>
    </header>
  );
}
