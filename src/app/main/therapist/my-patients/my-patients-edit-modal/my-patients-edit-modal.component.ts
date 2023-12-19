import { EventEmitter } from '@angular/core';
import { Component, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PatientDto, LibraryEntryDto, LibraryEntryServiceProxy, MyPatientsServiceProxy, PatientLibraryEntryDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AutoComplete } from 'primeng';
import { finalize } from 'rxjs/operators';
import { PatientPrescription } from '../my-patients-common';

@Component({
    selector: 'app-my-patients-edit-modal',
    templateUrl: './my-patients-edit-modal.component.html',
    styleUrls: ['./my-patients-edit-modal.component.less']
})
export class MyPatientsEditModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('modal', { static: true }) modal: ModalDirective;
    
    @ViewChild('libraryEntriesAutoComplete') autoComplete: AutoComplete;

    @Output() myPatientSavedEvent = new EventEmitter();

    myPatient: PatientDto;

    myLibrary: LibraryEntryDto[] = [];
    suggestedLibraryEntries: LibraryEntryDto[];

    gym: PatientPrescription[] = [];
    selectedPrescription: PatientPrescription;

    active = false;

    constructor(
        injector: Injector,
        private _libraryEntryService: LibraryEntryServiceProxy,
        private _myPatientsService: MyPatientsServiceProxy,
        private _notifyService: NotifyService
    ) {
        super(injector)
    }

    get isPrescriptionSelectionEmpty(): boolean {
        return this.selectedPrescription === undefined;
    }

    get isPrescriptionListEmpty(): boolean {
        return this.gym.length == 0;
    }

    ngOnInit(): void { }
    
    show(myPatient: PatientDto) {
        this.myPatient = myPatient;
        if (!myPatient.gym)
            myPatient.gym = [];

        this.gym = myPatient.gym.map<PatientPrescription>(o => ({
            ...o,
            isSelected: false,
        }));
        
        this.getMyLibrary();

        this.active = true;
        this.modal.show();
    }

    close(success?: boolean) {
        this.active = false;
        this.modal.hide();

        this.myPatient = null;
        this.selectedPrescription = undefined;
    }

    getMyLibrary() {
        this._libraryEntryService.getMyLibrary()
            .subscribe(async result => {
                this.myLibrary = result;
            });
    }

    removeLibraryEntry(prescription: PatientPrescription): void {
        if (prescription.isSelected) {
            prescription.isSelected = false;
            this.selectedPrescription = undefined;
        }
        
        this.gym = this.gym.filter(l => l !== prescription);
    }

    chooseLibraryEntry(libraryEntry: LibraryEntryDto): void {
        if (!this.gym.find(n => n.libraryEntry.id == libraryEntry.id)) {
            
            const prescription = new PatientPrescription();
            prescription.libraryEntry = libraryEntry;
            prescription.isSelected = false;

            this.gym.push(prescription);
        }

        this.autoComplete.writeValue('');
    }

    selectPrescription(prescription: PatientPrescription): void {
        if (this.selectedPrescription &&
            prescription.libraryEntry.id == this.selectedPrescription.libraryEntry.id) {
            
            prescription.isSelected = false;
            this.selectedPrescription = undefined;
            return;
        }

        this.gym.map(o => o.isSelected = false);

        prescription.isSelected = true;
        this.selectedPrescription = prescription;
    }

    filterLibraryEntries(event) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < this.myLibrary.length; i++) {
            let libraryEntry = this.myLibrary[i];

            // if not selected already
            if (!this.gym || this.gym.find(n => n.libraryEntry.title == libraryEntry.title) == null) {
                // and the query string found                
                if (query.length == 1) {
                    if (libraryEntry.title.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                        filtered.push(libraryEntry);
                    }
                } else if (libraryEntry.title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                    filtered.push(libraryEntry);
                }
            }
        }

        this.suggestedLibraryEntries = filtered;
    }

    async submit() {
        this.myPatient.gym = this.gym.map<PatientLibraryEntryDto>(o => ({
            ...o,
            init: null,
            toJSON: null
        }));

        this._myPatientsService.update(this.myPatient)
            .pipe(finalize(() => { this.hideMainSpinner() }))
            .subscribe(async () => {
                this._notifyService.success(this.l("Therapist.MyPatients.Modal.Success"));

                this.myPatientSavedEvent.emit();

                this.close();
            });
    }
}