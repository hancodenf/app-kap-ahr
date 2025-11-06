export type RoleType = 'admin' | 'client' | 'company' | 'partner' | 'staff' | 'klien';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: RoleType;
    position?: string;
    profile_photo?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
