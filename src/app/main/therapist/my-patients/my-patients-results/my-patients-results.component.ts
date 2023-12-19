import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { IPatientDto, PatientDto, MyPatientsServiceProxy } from '@shared/service-proxies/service-proxies';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { LazyLoadEvent, Paginator } from 'primeng';
import { finalize } from 'rxjs/operators';
import { MyPatientWithPictureUrl } from '../my-patients-common';

@Component({
    selector: 'app-my-patients-results',
    templateUrl: './my-patients-results.component.html',
    styleUrls: ['./my-patients-results.component.less']
})
export class MyPatientsResultsComponent extends AppComponentBase implements OnInit {
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    @Output() editLibraryEntryEvent = new EventEmitter<PatientDto>();

    @Input() textFilter: string;

    // Page parameters
    itemsPerPage = 30;

    constructor(
        injector: Injector,
        private _router: Router,
        private _myPatientsService: MyPatientsServiceProxy,
        private _localStorageService: LocalStorageService
    ) {
        super(injector)
    }

    ngOnInit(): void {
    }

    editMyPatient(myPatient: PatientDto) {
        this.editLibraryEntryEvent.emit(myPatient);
    }

    viewMyPatient(myPatient: PatientDto) {
        this._router.navigate(["/app/main/patient/" + myPatient.patient.id]);
    }

    getMyPatients(event?: LazyLoadEvent): void {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
         
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        this._myPatientsService.getMyPatients(
            this.textFilter,
            "name asc",
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event) || this.itemsPerPage
        )
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(async result => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = await this.getMyPatientsWithProfilePictures(result.items);
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    async getMyPatientsWithProfilePictures(myPatients: IPatientDto[]) {
        const tokenContainer = await this._localStorageService.getItemPromise<{ token: string; }>(AppConsts.authorization.encrptedAuthTokenName);
        return myPatients.map<MyPatientWithPictureUrl>(x => ({
            ...x,
            profilePictureUrl: this.getUserProfilePitureUrl(x.patient.id, tokenContainer.token)
        }));
    }
}
