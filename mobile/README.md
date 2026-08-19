# My Roadie — Mobile

## Executar em um dispositivo físico Android

O backend deve estar em execução na porta `3000` antes de iniciar o app:

```powershell
cd ../backend
npm run start:dev
```

Conecte o aparelho por USB, habilite a depuração USB e confirme que ele foi
autorizado:

```powershell
adb devices
```

### Opção 1 — USB com `adb reverse`

Encaminhe a porta do aparelho para o backend local:

```powershell
adb reverse tcp:3000 tcp:3000
cd ../mobile
flutter run --dart-define=BACKEND_URL=http://localhost:3000
```

Em um aparelho físico, `localhost` e `10.0.2.2` não apontam automaticamente
para a máquina de desenvolvimento. O `adb reverse` permite que o
`localhost:3000` do aparelho alcance o backend em execução no computador.

### Opção 2 — Rede local com `BACKEND_URL`

Mantenha o computador e o aparelho na mesma rede Wi-Fi, obtenha o IPv4 local
do computador e execute o app apontando para esse endereço:

```powershell
cd ../mobile
flutter run --dart-define=BACKEND_URL=http://<IP_LOCAL>:3000
```

Substitua `<IP_LOCAL>` pelo endereço da máquina, por exemplo
`192.168.1.10`. Garanta que a porta `3000` esteja acessível na rede local.

## Validação manual no aparelho

1. Inicie sessão no aplicativo e crie um compromisso informando título, data,
   local e banda.
2. Confirme que o compromisso aparece na agenda após o salvamento.
3. Desative temporariamente a conectividade e tente criar outro compromisso.
   O formulário deve permanecer preenchido e apresentar uma mensagem de erro
   legível.
