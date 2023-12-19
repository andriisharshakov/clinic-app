import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PatientDto, MyPatientsServiceProxy } from '@shared/service-proxies/service-proxies';
import { MyPatientsEditModalComponent } from './my-patients-edit-modal/my-patients-edit-modal.component';
import { MyPatientsResultsComponent } from './my-patients-results/my-patients-results.component';

@Component({
    selector: 'app-my-patients',
    templateUrl: './my-patients.component.html',
    styleUrls: ['./my-patients.component.less']
})
export class MyPatientsComponent extends AppComponentBase implements OnInit {
    @ViewChild('myPatientsResults', { static: true }) myPatientsResults: MyPatientsResultsComponent;
    @ViewChild('myPatientsEditModal', { static: true }) myPatientsEditModal: MyPatientsEditModalComponent;

    textFilter: string;

    constructor(
        injector: Injector,
        _myPatientsService: MyPatientsServiceProxy
    ) {
        super(injector)
    }

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        this.myPatientsResults.getMyPatients();
    }

    editMyPatient(myPatient: PatientDto): void {
        this.myPatientsEditModal.show(myPatient);
    }
}
