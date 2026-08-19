import { EventStatus } from '@prisma/client';

export class Event {
  id!: string;
  title!: string;
  date!: Date;
  startTime?: string | null;
  endTime?: string | null;
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

