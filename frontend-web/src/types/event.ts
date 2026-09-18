export type EventStatus = 'PENDING' | 'CONFIRMED' | 'FINISHED' | 'CANCELLED';

export interface EventEntity {
    id: string;
    title: string;
    startsAt: string | Date;
    endsAt?: string | Date;
    timezone: string;
    type?: string;
    fee?: number;
    location: string;
    description?: string;
    bandId: string;
    createdById: string;
    status: EventStatus;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateEventData = {
    title: string;
    startsAt: string;
    endsAt?: string;
    timezone: string;
    type?: string;
    fee?: number;
    location: string;
    description?: string;
    bandId?: string;
    status?: EventStatus;
};

export type UpdateEventData = Partial<CreateEventData>;
