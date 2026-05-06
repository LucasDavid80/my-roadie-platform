# ERD (Entidade-Relacionamento) — My Roadie

Modelo atual (resumido a partir de `prisma/schema.prisma`):

Entities principais:

- User
  - id: uuid (PK)
  - email: string (unique)
  - name: string?
  - role: enum {MUSICIAN, ROADIE, ADMIN}
  - supabaseId: string (unique)
  - createdAt, updatedAt

- Band
  - id: uuid (PK)
  - name
  - createdAt, updatedAt

- BandMember
  - id: uuid (PK)
  - userId -> User.id
  - bandId -> Band.id
  - role (string?)
  - joinedAt
  - unique[userId, bandId]

- Event
  - id: uuid (PK)
  - title, date, location, description, status
  - bandId -> Band.id
  - createdById -> User.id
  - createdAt, updatedAt

- Task
  - id: uuid (PK)
  - description, isDone
  - eventId -> Event.id (onDelete: Cascade)
  - createdAt

- RepertoireSong
  - id: uuid (PK)
  - title, artist?, key?, position, notes
  - bandId -> Band.id

- Transaction
  - id: uuid (PK)
  - description, amount (Decimal), type (INCOME|EXPENSE), date
  - bandId -> Band.id
  - eventId? -> Event.id
  - userId -> User.id
  - createdAt

Mermaid diagram (visual):

```mermaid
erDiagram
  USER ||--o{ BANDMEMBER : belongs_to
  BAND ||--o{ BANDMEMBER : has
  BAND ||--o{ EVENT : organizes
  EVENT ||--o{ TASK : has
  BAND ||--o{ REPERTORESONG : contains
  BAND ||--o{ TRANSACTION : records
  EVENT ||--o{ TRANSACTION : may_record

  USER {
    String id PK
    String email
    String name
    String role
    String supabaseId
  }
  BAND {
    String id PK
    String name
  }
  EVENT {
    String id PK
    String title
    DateTime date
    String location
    String description
    String status
    String createdById FK
    String bandId FK
  }
  TASK {
    String id PK
    String description
    Boolean isDone
    String eventId FK
  }
  TRANSACTION {
    String id PK
    Decimal amount
    String type
    DateTime date
    String bandId FK
    String userId FK
  }
```

Notas:
- BandMember possui índice único `[userId, bandId]`.
- Ao alterar o schema, execute migrations e `npx prisma generate`. 