import { Injectable } from '@angular/core';

export type CameraStorageKey = 'audioInputId' | 'audioOutputId' | 'videoInputId';

@Injectable()
export class CameraStorageService {
    constructor() { }

    get(key: CameraStorageKey): string {
        return localStorage.getItem(this.formatAppStorageKey(key));
    }

    set(key: CameraStorageKey, value: string) {
        if (value && value !== 'null') {
            localStorage.setItem(this.formatAppStorageKey(key), value);
        }
    }

    remove(key: CameraStorageKey) {
        localStorage.removeItem(this.formatAppStorageKey(key));
    }

    private formatAppStorageKey(key: CameraStorageKey) {
        return `appointment-video.${key}`;
    }


}
