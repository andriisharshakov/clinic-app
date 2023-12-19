import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CameraStorageKey, CameraStorageService } from '../../camera-storage.service';

class IdGenerator {
    protected static id: number = 0;
    static getNext() {
        return ++ IdGenerator.id;
    }
}

@Component({
  selector: 'app-device-select',
  templateUrl: './device-select.component.html',
  styleUrls: ['./device-select.component.less']
})
export class DeviceSelectComponent {
    private localDevices: MediaDeviceInfo[] = [];

    id: string;
    selectedId: string;

    get devices(): MediaDeviceInfo[] {
        return this.localDevices;
    }

    @Input() label: string;
    @Input() kind: MediaDeviceKind;
    @Input() key: CameraStorageKey;
    @Input() set devices(devices: MediaDeviceInfo[]) {
        this.selectedId = this.getOrAdd(this.key, this.localDevices = devices);
    }

    @Output() settingsChanged = new EventEmitter<MediaDeviceInfo>();

    constructor(
        private readonly storageService: CameraStorageService) {
        this.id = `device-select-${IdGenerator.getNext()}`;
    }

    onSettingsChanged(deviceId: string) {
        this.setAndEmitSelections(this.key, this.selectedId = deviceId);
    }

    private getOrAdd(key: CameraStorageKey, devices: MediaDeviceInfo[]) {
        const existingId = this.storageService.get(key);
        if (devices && devices.length > 0) {
            const defaultDevice = devices.find(d => d.deviceId === existingId) || devices[0];
            this.storageService.set(key, defaultDevice.deviceId);
            return defaultDevice.deviceId;
        }

        return null;
    }

    private setAndEmitSelections(key: CameraStorageKey, deviceId: string) {
        this.storageService.set(key, deviceId);
        this.settingsChanged.emit(this.devices.find(d => d.deviceId === deviceId));
    }
}
