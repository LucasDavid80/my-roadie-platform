import { EventStatus } from '@prisma/client';

export class Event {
  id!: string;
  title!: string;
  startsAt!: Date;
  endsAt?: Date | null;
  timezone!: string;
  type?: string | null;
  fee?: number | null;
  location!: string;
  description?: string | null;
  createdById!: string;
  createdAt!: Date;
  bandId!: string;
  updatedAt!: Date;
  status!: EventStatus;
}
