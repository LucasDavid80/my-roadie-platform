import { http, HttpResponse } from 'msw';

export const handlers = [
    // Mock do Login
    http.post('http://localhost:3001/auth/login', async ({ request }) => {
        const body: any = await request.json();

        if (body.email === 'lucas@myroadie.br' && body.password === '123456') {
            return HttpResponse.json({
                access_token: 'fake-jwt-token',
                user: { id: '1', name: 'Lucas David', email: body.email }
            }, { status: 200 });
        }

        return new HttpResponse(null, { status: 401 });
    }),

    // Mock do Cadastro
    http.post('http://localhost:3001/users', () => {
        return HttpResponse.json({ id: '2', name: 'Novo Usuário' }, { status: 201 });
    }),
];