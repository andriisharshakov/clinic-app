import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { MyLibraryViewModalComponent } from '@app/main/therapist/my-library/my-library-view-modal/my-library-view-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LibraryEntryWithPrescription } from './gym-common';
import { GymResultsComponent } from './gym-results/gym-results.component';

@Component({
    selector: 'app-gym',
    templateUrl: './gym.component.html',
    styleUrls: ['./gym.component.less']
})
export class GymComponent extends AppComponentBase implements OnInit {
    @ViewChild('gymViewModal', { static: true }) gymViewModal: MyLibraryViewModalComponent;
    @ViewChild('gymResults', { static: true }) gymResults: GymResultsComponent;

    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    viewMedia(prescription: LibraryEntryWithPrescription): void {
        this.gymViewModal.showPrescription(prescription);
    }
}
