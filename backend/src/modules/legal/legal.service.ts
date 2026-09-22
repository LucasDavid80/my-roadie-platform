import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalService {
  getCurrentVersion() {
    return {
      version: 'v1.0.0',
      updatedAt: '2026-09-20T00:00:00Z',
    };
  }
}
