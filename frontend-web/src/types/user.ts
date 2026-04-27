export interface UserEntity {
    id: string;
    name: string;
    experience: string;
    phone: string;
    instagram: string;
    city: string;
    federativeUnit: string;
    minCache: number;
    youtubeLink: string;
    bio: string;
    instruments: string[];
    styles: string[];
    isAvailable: boolean;
    // Note: Adicionei o e-mail aqui porque o seu backend NestJS o utiliza como campo obrigatório
    email?: string;
}

// Para o formulário de cadastro inicial (Step 1), geralmente usamos apenas um subconjunto:
export type CreateUserData = Pick<UserEntity, 'name' | 'email'> & {
    password?: string;
    role?: 'MUSICIAN' | 'ROADIE' | 'ADMIN';
};