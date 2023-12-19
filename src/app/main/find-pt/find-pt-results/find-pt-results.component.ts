import { Component, Injector, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AreaOfSpeciality, FindPtServiceProxy, FindTherapistsInput, ITherapistDto } from '@shared/service-proxies/service-proxies';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { Paginator, DataView as PrimeDataView, LazyLoadEvent } from 'primeng';
import { finalize } from 'rxjs/operators';
import { getTherapistFullName, ThrerapistWithPictureUrl } from '../find-pt-common';
import { ViewPtProfileModalComponent } from '../pt-profile/view-pt-profile-modal.component';
import { ScheduleAppointmentModalComponent } from '../schedule-appointment-modal/schedule-appointment-modal.component';

@Component({
    selector: 'app-find-pt-results',
    templateUrl: './find-pt-results.component.html',
    styleUrls: ['./find-pt-results.component.less']
})
export class FindPtResultsComponent extends AppComponentBase implements OnInit, OnChanges {
    @ViewChild('scheduleModal', { static: true }) scheduleModal: ScheduleAppointmentModalComponent;
    @ViewChild('viewPtProfileModal', { static: true }) viewPtProfileModal: ViewPtProfileModalComponent;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('dataView', { static: true }) dataView: PrimeDataView;
    @Input() specialty?: AreaOfSpeciality = null;
    allSpecialities = AreaOfSpeciality;
    itemsPerPage = 9;

    constructor(
        injector: Injector,
        private findPtService: FindPtServiceProxy,
        private _localStorageService: LocalStorageService
    ) {
        super(injector);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['specialty'].previousValue !== changes['specialty'].currentValue) {
            this.searchTherapists();
        }
    }

    ngOnInit(): void {
        this.searchTherapists();
    }

    searchTherapists(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);

            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        this.findPtService.findTherapists(new FindTherapistsInput({
            specialty: this.specialty,
            sorting: 'surname asc',
            maxResultCount: this.primengTableHelper.getMaxResultCount(this.paginator, event) || this.itemsPerPage,
            skipCount: this.primengTableHelper.getSkipCount(this.paginator, event)
        }))
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(async result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = await this.getTherapistsWithProfilePictures(result.items);
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    getFullName(therapist: ThrerapistWithPictureUrl) {
        return getTherapistFullName(therapist);
    }

    showPtProfile(therapistId: number) {
        this.viewPtProfileModal.show(therapistId);
    }

    openScheduleModal(therapist: ThrerapistWithPictureUrl) {
        this.scheduleModal.show(therapist);
    }

    async getTherapistsWithProfilePictures(therapists: ITherapistDto[]) {
        const tokenContainer = await this._localStorageService.getItemPromise<{ token: string; }>(AppConsts.authorization.encrptedAuthTokenName);
        return therapists.map<ThrerapistWithPictureUrl>(x => ({
            ...x,
            profilePictureUrl: this.getUserProfilePitureUrl(x.id, tokenContainer.token)
        }));
    }

}
