export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} | Early Approve Real Estate Group™` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | Early Approve Real Estate Group™` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
