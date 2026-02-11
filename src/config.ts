export const BLOG_PATH = "src/data/blog";

export const SITE = {
  website: "https://proto.nadzu.me/", // deployed domain
  author: "Nadun Lakshan", //me
  profile: "https://proto.nadzu.me/",
  desc: "i am nadun Lkashan, a software engineer and blogger. I write about web development, programming, and technology.",
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
  dynamicOgImage: false,
  dir: "auto", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Colombo", // Default global timezone (IANA format)
} as const;
