import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TherapistAppointmenServiceProxy, TherapistAppointmentDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-therapist-upcoming-appointments',
    templateUrl: './therapist-upcoming-appointments.component.html',
    styleUrls: ['./therapist-upcoming-appointments.component.less']
})
export class TherapistUpcomingAppointmentsComponent extends AppComponentBase implements OnInit {
    private lastLoaded: moment.Moment = null;
    appointments: TherapistAppointmentDto[] = [];

    constructor(
        injector: Injector,
        private therapistAppointmentsService: TherapistAppointmenServiceProxy) {
        super(injector);
    }

    get enabled() {
        return this.isGranted('Pages.Tenant.Therapist.Appointments');
    }

    ngOnInit(): void {
    }

    openChange(isOpened: boolean) {
        if (isOpened) {
            this.loadAppointments();
        }
    }

    private loadAppointments() {
        if (this.enabled && (!this.lastLoaded || this.lastLoaded < moment().add(-1, 'minute') )) {
            this.isLoading = true;
            this.lastLoaded = moment();
            this.therapistAppointmentsService.getUpcomingTherapistAppointments()
                .pipe(finalize(() => this.isLoading = false))
                .subscribe(x => {
                    this.appointments = x;
                });
        }
    }
}
