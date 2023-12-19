import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { LocalVideoTrack } from 'twilio-video';
import { LocalVideoTrackService } from '../../local-video-track.service';

@Component({
    selector: 'app-camera',
    templateUrl: './camera.component.html',
    styleUrls: ['./camera.component.less']
})
export class CameraComponent implements AfterViewInit, OnDestroy {
    @ViewChild('preview', { static: false }) previewElement: ElementRef;

    isInitializing: boolean = true;
    videoTrack: LocalVideoTrack = null;
    private videoElement: HTMLVideoElement = null;

    constructor(
        private readonly localVideoTrackService: LocalVideoTrackService,
        private readonly renderer: Renderer2) { }

    ngOnDestroy(): void {
        this.finalizePreview();
    }

    ngAfterViewInit() {
        if (this.previewElement && this.previewElement.nativeElement) {
            this.localVideoTrackService.localVideoTrack.subscribe(track => {
                this.initializeDevice2(track);
            });
        }
    }

    finalizePreview() {
        try {
            if (this.videoTrack) {
                this.videoTrack.detach(this.videoElement);
                this.videoElement.remove();
            }
            this.videoTrack = null;
            this.videoElement = null;
        } catch (e) {
            console.error(e);
        }
    }

    private initializeDevice2(track: LocalVideoTrack) {
        try {
            this.isInitializing = true;
            this.finalizePreview();
            this.videoTrack = track;

            const videoElement = this.videoTrack.attach(document.createElement('video'));
            this.videoElement = videoElement;
            this.renderer.setStyle(videoElement, 'height', '100%');
            this.renderer.setStyle(videoElement, 'width', '100%');
            (this.previewElement.nativeElement as HTMLDivElement).childNodes.forEach(child => {
                this.renderer.removeChild(this.previewElement.nativeElement, child);
            });
            this.renderer.appendChild(this.previewElement.nativeElement, videoElement);
        } finally {
            this.isInitializing = false;
        }
    }
}
