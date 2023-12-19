import { Component, OnInit, OnDestroy, ViewChild, Input, Output, EventEmitter, Injector } from '@angular/core';
import { CameraComponent } from '../camera/camera.component';
import { DeviceSelectComponent } from '../device-select/device-select.component';
import { DeviceService } from '../../device.service';
import { debounceTime } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LocalVideoTrackService } from '../../local-video-track.service';

@Component({
    selector: 'app-video-settings-modal',
    templateUrl: './video-settings-modal.component.html',
    styleUrls: ['./video-settings-modal.component.less']
})
export class VideoSettingsModalComponent extends AppComponentBase implements OnInit, OnDestroy {
    @ViewChild('modal', { static: true }) modal: ModalDirective;
    active = false;
    saving = false;
    devices: MediaDeviceInfo[] = [];
    videoDeviceId: string;

    @ViewChild('camera') camera: CameraComponent;
    @ViewChild('videoSelect') video: DeviceSelectComponent;

    @Input('isPreviewing') isPreviewing: boolean;
    @Output() settingsChanged = new EventEmitter<MediaDeviceInfo>();

    constructor(
        injector: Injector,
        private readonly localVideoTrackService: LocalVideoTrackService,
        private readonly deviceService: DeviceService) {
        super(injector);
    }


    get hasAudioInputOptions(): boolean {
        return this.devices && this.devices.filter(d => d.kind === 'audioinput').length > 0;
    }
    get hasAudioOutputOptions(): boolean {
        return this.devices && this.devices.filter(d => d.kind === 'audiooutput').length > 0;
    }
    get hasVideoInputOptions(): boolean {
        return this.devices && this.devices.filter(d => d.kind === 'videoinput').length > 0;
    }

    ngOnInit() {
        this.addSubscriptionToClear(
            this.deviceService
                .$devicesUpdated
                .pipe(debounceTime(350))
                .subscribe(async deviceListPromise => {
                    this.devices = await deviceListPromise;
                    this.handleDeviceAvailabilityChanges();
                }));
    }

    ngOnDestroy() {
        this.clearSubscriptions();
    }

    show() {
        this.active = true;
        this.modal.show();
    }

    close() {
        this.active = false;
        this.modal.hide();
    }

    onShown() {
        // document.getElementById('Name').focus();
    }

    async onSettingsChanged(deviceInfo: MediaDeviceInfo) {
        this.localVideoTrackService.updateVideoTrack(deviceInfo.deviceId);
        this.settingsChanged.emit(deviceInfo);
    }

    private handleDeviceAvailabilityChanges() {
        if (this.devices && this.devices.length && this.video && this.video.selectedId) {
            let videoDevice = this.devices.find(d => d.deviceId === this.video.selectedId);
            if (!videoDevice) {
                videoDevice = this.devices.find(d => d.kind === 'videoinput');
                if (videoDevice) {
                    this.video.selectedId = videoDevice.deviceId;
                    this.onSettingsChanged(videoDevice);
                }
            }
        }
    }
}
