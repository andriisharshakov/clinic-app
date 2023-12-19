import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { PatientAppointmentServiceProxy, PatientAppointmentDto, AreaOfSpeciality } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { finalize } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';
import { Subject } from 'rxjs';

@Component({
    templateUrl: './patient-appointments.component.html',
    styleUrls: ['./patient-appointments.component.less']
})
export class PatientAppointmentsComponent extends AppComponentBase implements OnInit, OnDestroy {
    appointments: PatientAppointmentDto[] = [];
    allSpecialities = AreaOfSpeciality;
    refreshAppointmentsSubscription: Subscription;
    refreshAppointmentsSubject = new Subject<any>();

    constructor(
        injector: Injector,
        private patientAppointmentService: PatientAppointmentServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.loadAppointments();

        const source = interval(60000); // 60 seconds interval
        this.refreshAppointmentsSubscription = source.subscribe(() => {
            this.refreshAppointmentsSubject.next();
        });
    }

    // Preventing any memory leaks
    ngOnDestroy(): void {
        this.refreshAppointmentsSubscription.unsubscribe();
        this.refreshAppointmentsSubject.complete();
    }

    private loadAppointments() {
        this.isLoading = true;
        this.patientAppointmentService.getUpcomingPatientAppointments()
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(res => {
                this.appointments = res;
                this.isLoading = false;
            });
    }

    cancelAppointment(appointment: PatientAppointmentDto) {
        this.message.confirm(
            this.l('Therapist.Appointments.ConfirmCancel', this.getFullName(appointment.therapist)),
            null,
            (result) => {
                if (result) {
                    this.isLoading = true;
                    this.patientAppointmentService.cancellPatientAppointment(appointment.id)
                        .pipe(finalize(() => this.isLoading = false))
                        .subscribe(x => {
                            this.notify.success(this.l('Therapist.Appointments.AppointmentCancelled'));
                            this.isLoading = false;
                            this.loadAppointments();
                        });
                }
            });
    }

}
