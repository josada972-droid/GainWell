import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/** Locale-aware navigation. Route paths are the same in both languages. */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
