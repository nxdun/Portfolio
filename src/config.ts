export const BLOG_PATH = "src/data/blog";

export const SITE = {
  website: "https://nadzu.me/", // deployed domain
  author: "Nadun Lakshan", //me
  profile: "https://nadzu.me/",
  desc: "i am nadun Lkashan, a software engineer with Exceptional DevOps skills i write Blogs about software development, DevOps, and cloud computing.",
  title: "~/nadzu",
  ogImage: "nadzu-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 8,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/nxdun/portfolio/edit/main/",
  },
  dynamicOgImage: true,
  dir: "auto", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Colombo", // Default global timezone (IANA format)
} as const;
