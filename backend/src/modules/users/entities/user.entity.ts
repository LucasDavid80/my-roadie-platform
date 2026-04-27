export class User {
    id: string;
    email: string;
    name?: string;
    role?: 'MUSICIAN' | 'ROADIE' | 'ADMIN';
    password: string;
}
