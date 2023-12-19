import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { LibraryEntryWithPrescription } from '@app/main/patient/gym/gym-common';
import { AppComponentBase } from '@shared/common/app-component-base';
import { isEmpty } from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LibraryEntryWithVideoSource } from '../my-library-common';

@Component({
    selector: 'app-my-library-view-modal',
    templateUrl: './my-library-view-modal.component.html',
    styleUrls: ['./my-library-view-modal.component.less']
})
export class MyLibraryViewModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('modal', { static: true }) modal: ModalDirective;

    player: Plyr;

    prescription: string;

    isBusy: boolean;
    libraryEntry: LibraryEntryWithVideoSource;
    videoOptions = {
        controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'fullscreen'],
    };

    constructor(
        injector: Injector) { 
        super(injector);
    }

    ngOnInit(): void {
    }

    show(libraryEntry: LibraryEntryWithVideoSource) {
        this.libraryEntry = libraryEntry;
        this.modal.show();
    }

    showPrescription(prescription: LibraryEntryWithPrescription) {
        this.prescription = prescription.prescription;
        this.libraryEntry = prescription;
        this.modal.show();
    }

    close(success?: boolean) {
        this.player.stop();
        this.libraryEntry = null;
        
        this.modal.hide();
    }

    isEmpty(obj: any): boolean {
        return isEmpty(obj);
    }
}
