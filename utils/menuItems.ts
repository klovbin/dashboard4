export interface MenuItem {
    id: number;
    label: string;
    link: string;
}

export const menuItems: MenuItem[] = [
    {
        id: 1,
        label: "Dashboard",
        link: "/dashboard"
    },
    {
        id: 2,
        label: "Privacy",
        link: "/privacy"
    },
    {
        id: 3,
        label: "Info",
        link: "/"
    }
];