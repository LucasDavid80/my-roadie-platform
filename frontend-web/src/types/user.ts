export interface UserEntity {
    id: string;
    email: string;
    name?: string;
    role: 'MUSICIAN' | 'ROADIE' | 'ADMIN';
    experience?: string;
    phone?: string;
    instagram?: string;
    city?: string;
    federativeUnit?: string;
    minCache?: number;
    youtubeLink?: string;
    bio?: string;
    instruments?: string[];
    styles?: string[];
    isAvailable: boolean;
    supabaseId: string;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateUserData = Pick<UserEntity, 'email' | 'supabaseId'> & {
    name?: string;
    password?: string;
    role?: 'MUSICIAN' | 'ROADIE' | 'ADMIN';
};