import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, ReplaySubject } from 'rxjs';
import { LocalVideoTrack, createLocalVideoTrack } from 'twilio-video';
import { CameraStorageService } from './camera-storage.service';
import { filter } from 'rxjs/operators';

@Injectable()
export class LocalVideoTrackService {
    private subject: ReplaySubject<LocalVideoTrack>;
    private videoTrackObs: Observable<LocalVideoTrack>;
    private activeTrack: LocalVideoTrack = null;
    private isVideoTrackInitializing = false;

    constructor(
        private readonly cameraStorage: CameraStorageService) {
        this.initializeSubject();
    }

    get localVideoTrack() {
        if (this.activeTrack == null) {
            this.initializeVideoTrack();
        }

        return this.videoTrackObs;
    }

    private async initializeVideoTrack() {
        if (this.isVideoTrackInitializing) {
            return;
        }

        this.isVideoTrackInitializing = true;
        const selectedVideoDeviceId = this.cameraStorage.get('videoInputId') || undefined;
        const track = await createLocalVideoTrack({ deviceId: selectedVideoDeviceId });
        this.activeTrack = track;
        this.subject.next(track);
        this.isVideoTrackInitializing = false;
    }

    private initializeSubject() {
        this.subject = new ReplaySubject<LocalVideoTrack>(1);
        this.videoTrackObs = this.subject.asObservable().pipe(filter(x => x != null));
    }

    updateVideoTrack(deviceId: string) {
        this.disposeCurrentTrack();
        from(createLocalVideoTrack({ deviceId }))
            .subscribe(track => {
                this.subject.next(track);
            });
    }

    disposeCurrentTrack() {
        if (this.activeTrack) {
            this.activeTrack.detach();
            this.activeTrack.stop();
            this.activeTrack = null;
        }

        this.subject.unsubscribe();
        this.initializeSubject();
    }
}
