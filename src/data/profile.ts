export type Profile = {
  name: string;
  bio: string;
  imageUrl: string;
};

export type LinkItem = {
  id: string;
  title: string;
  url: string;
};

export const profile: Profile = {
  name: "Return to me",
  bio: "나와 내 인연을 찾는 시간",
  imageUrl: "/profile.png",
};

// TODO: 실제 링크로 교체하세요.
export const links: LinkItem[] = [
  { id: "instagram", title: "Instagram", url: "https://instagram.com" },
  { id: "blog", title: "블로그", url: "https://blog.naver.com" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com" },
];
