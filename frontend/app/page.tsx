import { getLatestBlogPosts } from "@/data/blogPosts";
import HomeClient from "./HomeClient";

// Server Component
export default async function Home() {
  // Fetch data on the server
  // This runs at build time (SSG) or request time (SSR) depending on configuration
  // Since we use 'no-store' or revalidate in getLatestBlogPosts, it will be dynamic.
  const latestPosts = await getLatestBlogPosts(4);

  return <HomeClient latestPosts={latestPosts} />;
}
