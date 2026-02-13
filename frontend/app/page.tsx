import { getLatestBlogPosts } from "@/data/blogPosts";
import HomeClient from "./HomeClient";

// Server Component
export default async function Home() {
  // Fetch data on the server with fallback data when backend is unavailable.
  const latestPosts = await getLatestBlogPosts(4);

  return <HomeClient latestPosts={latestPosts} />;
}
