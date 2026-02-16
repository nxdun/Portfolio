import type { Props } from "astro";
import IconPinterest from "@/assets/icons/IconPinterest.svg";

import IconNuuMail from "@/assets/icons/IcoMail.svg";
import IconNuuWhatsapp from "@/assets/icons/IconWhatsapp.svg";
import IconNuuTelegram from "@/assets/icons/IcoTelegram.svg";
import IconNuuGithub from "@/assets/icons/IcoGithub.svg";
import IconNuuLinkedIn from "@/assets/icons/IcoLinkedin.svg";
import IconInstagram from "@/assets/icons/IcoInstagram.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/nxdun",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconNuuGithub,
  },
  {
    name: "TeleGram",
    href: "https://t.me/DHNSA",
    linkTitle: `${SITE.title} on Telegram`,
    icon: IconNuuTelegram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/nxdun/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconNuuLinkedIn,
  },
  {
    name: "Mail",
    href: "mailto:inbox.nadun@gmail.com",
    linkTitle: `Send an email to ${SITE.title}`,
    icon: IconNuuMail,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "WhatsApp",
    href: "https://api.whatsapp.com/send?phone=94774364177",
    linkTitle: `Share this post via WhatsApp`,
    icon: IconNuuWhatsapp,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/nadu.lk",
    linkTitle: `Share this post on Instagram`,
    icon: IconInstagram,
  },
  {
    name: "Telegram",
    href: "https://t.me/share/url?url=", // todo: addme
    linkTitle: `Share this post via Telegram`,
    icon: IconNuuTelegram,
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com/pin/create/button/?url=", //todo: addme
    linkTitle: `Share this post on Pinterest`,
    icon: IconPinterest,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=", //todo: addme
    linkTitle: `Share this post via email`,
    icon: IconNuuMail,
  },
] as const;
