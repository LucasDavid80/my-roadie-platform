export type EventStatus = 'PENDING' | 'CONFIRMED' | 'FINISHED' | 'CANCELLED';

export interface EventEntity {
    id: string;
    title: string;
    date: string | Date;
    startTime?: string;
    endTime?: string;
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
    date: string;
    startTime?: string;
    endTime?: string;
    type?: string;
    fee?: number;
    location: string;
    description?: string;
    bandId?: string;
    status?: EventStatus;
};

export type UpdateEventData = Partial<CreateEventData>;
