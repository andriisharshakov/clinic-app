import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { getTherapistFullName } from '@app/main/find-pt/find-pt-common';
import { getLibraryEntryVideoSource } from '@app/main/therapist/my-library/my-library-common';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GymServiceProxy, PrescriptionOutput, TherapistDto } from '@shared/service-proxies/service-proxies';
import { isEmpty } from 'lodash';
import { LazyLoadEvent, Paginator } from 'primeng';
import { finalize } from 'rxjs/operators';
import { GroupedPrescription, LibraryEntryWithPrescription } from '../gym-common';

@Component({
    selector: 'app-gym-results',
    templateUrl: './gym-results.component.html',
    styleUrls: ['./gym-results.component.less']
})
export class GymResultsComponent extends AppComponentBase implements OnInit {
    @Input("patientId") public patientId: number;
    @Output() viewPrescriptionEvent = new EventEmitter<LibraryEntryWithPrescription>();

    constructor(
        injector: Injector,
        private _gymService: GymServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        if (this.patientId) {
            this.getPrescriptionsForPatientProfile();
        } else {
            this.getPrescriptions();
        }
    }

    getPrescriptionsForPatientProfile(event?: LazyLoadEvent) {
        this.primengTableHelper.showLoadingIndicator();
        this._gymService.getPatientPrescriptions(this.patientId)
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;

                const therapists = this.uniqueTherapists(result.items.map<TherapistDto>(x => x.therapist));
                const groupedPrescriptions = therapists.map<GroupedPrescription>(th => ({
                    therapist: th,
                    prescriptions: this.getLibraryEntriesWithPrescriptions(result.items.filter(l => l.libraryEntry.ownerUserId == th.id))
                }))

                this.primengTableHelper.records = groupedPrescriptions;

                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    getPrescriptions(event?: LazyLoadEvent) {
        this.primengTableHelper.showLoadingIndicator();
        this._gymService.getMyPrescriptions()
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;

                const therapists = this.uniqueTherapists(result.items.map<TherapistDto>(x => x.therapist));
                const groupedPrescriptions = therapists.map<GroupedPrescription>(th => ({
                    therapist: th,
                    prescriptions: this.getLibraryEntriesWithPrescriptions(result.items.filter(l => l.libraryEntry.ownerUserId == th.id))
                }))

                this.primengTableHelper.records = groupedPrescriptions;

                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    getFullName(therapist: TherapistDto) {
        return getTherapistFullName(therapist);
    }

    isEmpty(obj: any): boolean {
        return isEmpty(obj);
    }

    viewPrescription(prescription: LibraryEntryWithPrescription): void {
        this.viewPrescriptionEvent.emit(prescription);
    }

    private getLibraryEntriesWithPrescriptions(prescriptions: PrescriptionOutput[]) {
        return prescriptions.map<LibraryEntryWithPrescription>(x => ({
            ...x.libraryEntry,
            prescription: x.prescription,
            videoSourceUrls: getLibraryEntryVideoSource(x.libraryEntry),
            posterImage: x.libraryEntry.imageName !== null
                ? `${AppConsts.remoteServiceBaseUrl}/ImageFile/Download/${x.libraryEntry.imageName}`
                //TODO: create meant to replace poster images that lack an uploaded thumbnail for the video
                : ''
        }));
    }

    private uniqueTherapists(array: TherapistDto[]): TherapistDto[] {
        var uniqueIds = [];
        var distinct = [];

        for (let i = 0; i < array.length; i++) {
            if (!uniqueIds[array[i].id]) {
                distinct.push(array[i]);
                uniqueIds[array[i].id] = 1;
            }
        }

        return distinct;
    }
}
