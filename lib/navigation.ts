export type NavLeaf = {
  label: string;
  href: string;
};

export type NavBranch = {
  label: string;
  href: string;
  children?: NavLeaf[];
};

export type NavSection = {
  label: string;
  items: NavBranch[];
};

export const NAVIGATION: NavSection[] = [
  {
    label: "Products",
    items: [
      {
        label: "Haircare",
        href: "/products/haircare",
        children: [
          { label: "Shampoo", href: "/products/haircare/shampoo" },
          { label: "Conditioner", href: "/products/haircare/conditioner" },
          { label: "Mask", href: "/products/haircare/mask" },
          { label: "Serum", href: "/products/haircare/serum" },
          { label: "Cream", href: "/products/haircare/cream" },
          { label: "Mist", href: "/products/haircare/mist" },
          { label: "Styling Paste", href: "/products/haircare/styling-paste" },
        ],
      },
      {
        label: "Body",
        href: "/products/body",
        children: [
          { label: "Shower", href: "/products/body/shower" },
          { label: "Balm", href: "/products/body/balm" },
          { label: "Serum", href: "/products/body/serum" },
          { label: "Deodorant", href: "/products/body/deodorant" },
        ],
      },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "Ingredient Database", href: "/ingredients" },
      { label: "Science", href: "/science" },
    ],
  },
  {
    label: "Brand",
    items: [
      { label: "Visual World", href: "/visual-world" },
      { label: "In Media", href: "/in-media" },
    ],
  },
];

export function findNavLabel(pathname: string): string | null {
  for (const section of NAVIGATION) {
    for (const item of section.items) {
      if (item.href === pathname) return item.label;
      if (item.children) {
        for (const child of item.children) {
          if (child.href === pathname) return child.label;
        }
      }
    }
  }
  return null;
}

export function findNavBreadcrumb(pathname: string): string[] {
  for (const section of NAVIGATION) {
    for (const item of section.items) {
      if (item.href === pathname) return [section.label, item.label];
      if (item.children) {
        for (const child of item.children) {
          if (child.href === pathname) return [section.label, item.label, child.label];
        }
      }
    }
  }
  return [];
}
