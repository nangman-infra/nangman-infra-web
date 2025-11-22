import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "차가운 서버실에서 가장 뜨거운 열정을 찾습니다. 보이지 않는 곳에서 세상의 연결을 지탱하는 낭만있는 건축가들입니다.",
  openGraph: {
    title: "About Us | Nangman Infra",
    description: "차가운 서버실에서 가장 뜨거운 열정을 찾습니다. 보이지 않는 곳에서 세상의 연결을 지탱하는 낭만있는 건축가들입니다.",
    url: "https://nangman.io/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

