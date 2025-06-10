import { NavItem } from "@/types/nav";

interface SiteConfig {
  name: string;
  description: string;
  mainNav: NavItem[];
  links: {
    twitter: string;
    github: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "NOVA.AI",
  description: "Draw diagram with natural language.",
  mainNav: [],
  links: {
    twitter: "",
    github: "",
  },
};
