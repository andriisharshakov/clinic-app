import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TherapistAppointmenServiceProxy, TherapistAppointmentDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { OptionsInput, EventInput, EventApi, View } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import momentPlugin from '@fullcalendar/moment';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import { userTzNow } from '@shared/utils/time-utils';
import { AppointmentModalComponent } from '../appointment-modal/appointment-modal.component';

@Component({
    templateUrl: './therapist-appointments.component.html',
    styleUrls: ['./therapist-appointments.component.less']
})
export class TherapistAppointmentsComponent extends AppComponentBase implements OnInit {
    @ViewChild('appointmentsModal', { static: true }) appointmentsModal: AppointmentModalComponent;

    appointments: TherapistAppointmentDto[] = null;
    isLoading = false;
    calendarOptions: OptionsInput = {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, momentTimezonePlugin, momentPlugin, bootstrapPlugin],
        defaultView: 'timeGridCustom',
        timeGridEventMinHeight: 30,
        timeZone: abp.timing.timeZoneInfo.iana.timeZoneId,
        nowIndicator: true,
        displayEventTime: false,
        height: 'auto',
        themeSystem: 'bootstrap',
        views: {
            timeGridCustom: {
                type: 'timeGrid',
                dayCount: 5,

            }
        },
        eventClick: (args) => this.eventClickHandler(args),
        eventRender: (args) => {
            if (args.event.extendedProps?.isAppointment) {
                args.el.classList.add('event-appointment');
            }
            else {
                args.el.classList.add('muted');
            }
        }
    };
    calendarEvents: EventInput[] = [];

    constructor(
        injector: Injector,
        private therapistAppointmentsService: TherapistAppointmenServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const start = userTzNow();
        const end = moment(start).add(30, 'days');
        this.loadAppoiintments(start, end);
    }

    appointmentCancelled(appointmentId: number) {
        this.calendarEvents = this.calendarEvents.filter(x => (x.extendedProps as any)?.appointmentDto?.id !== appointmentId);
    }

    private loadAppoiintments(start: moment.Moment, end: moment.Moment) {
        this.isLoading = true;
        this.therapistAppointmentsService.getTherapistAppointments(start, end)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(x => {
                this.appointments = x;
                this.calendarEvents = this.createEvents(x);
                this.isLoading = false;
            });
    }

    private createEvents(appointments: TherapistAppointmentDto[]) {
        return appointments.map<EventInput>(x => ({
            start: x.start.toDate(),
            end: x.end.toDate(),
            ...this.getDynamicEventPart(x)
        }));
    }

    private eventClickHandler = (arg: { el: HTMLElement; event: EventApi; jsEvent: MouseEvent; view: View; }): boolean | void => {
        if (!arg.event.extendedProps?.isAppointment) {
            return;
        }

        console.log(arg);
        this.appointmentsModal.show(arg.event.extendedProps.appointmentDto);
    }

    private getDynamicEventPart(appointment: TherapistAppointmentDto): Partial<EventInput> {
        return appointment.patient
            ? {
                title: `${this.getFullName(appointment.patient)}`,
                extendedProps: {
                    isAppointment: true,
                    appointmentDto: appointment
                }
            }
            : {
                title: appointment.title,
            };
    }
}
