export interface BandEntity {
    id: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateBandData {
    name: string;
}

export interface UpdateBandData {
    name?: string;
}
