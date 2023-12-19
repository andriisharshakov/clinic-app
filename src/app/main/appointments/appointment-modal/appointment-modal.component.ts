import { Component, OnInit, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TherapistAppointmentDto, TherapistAppointmenServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-appointment-modal',
    templateUrl: './appointment-modal.component.html',
    styleUrls: ['./appointment-modal.component.less']
})
export class AppointmentModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('modal', { static: true }) modal: ModalDirective;
    @Output() onAppointmentCancelled = new EventEmitter<number>();
    active = false;
    saving = false;
    appointment: TherapistAppointmentDto = null;
    fullName = '';

    constructor(
        injector: Injector,
        private therapistAppointmentsService: TherapistAppointmenServiceProxy) {
        super(injector);
    }

    ngOnInit(): void {
    }

    show(appointment: TherapistAppointmentDto) {
        this.appointment = appointment;
        this.fullName = this.getFullName(appointment.patient);

        this.active = true;
        this.modal.show();
    }

    close() {
        this.active = false;
        this.modal.hide();
        this.appointment = null;
        this.fullName = '';
    }

    onShown() {
        // document.getElementById('Name').focus();
    }

    cancelAppointment() {
        this.message.confirm(
            this.l('Therapist.Appointments.ConfirmCancel', this.fullName),
            null,
            (result) => {
                if (result) {
                    this.isLoading = true;
                    this.therapistAppointmentsService.cancellPatientAppointment(this.appointment.id)
                        .pipe(finalize(() => this.isLoading = false))
                        .subscribe(x => {
                            this.notify.success(this.l('Therapist.Appointments.AppointmentCancelled'));
                            this.isLoading = false;
                            this.onAppointmentCancelled.emit(this.appointment.id);
                            this.close();
                        });
                }
            });
    }
}
