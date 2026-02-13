import { getFallbackBlogPosts } from "@/data/blogPosts";
import HomeClient from "./HomeClient";

// Server Component
export default function Home() {
  const latestPosts = getFallbackBlogPosts(4);

  return <HomeClient latestPosts={latestPosts} />;
}
