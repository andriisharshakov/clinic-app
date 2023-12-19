import { NullTemplateVisitor } from '@angular/compiler';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Theme } from '@fullcalendar/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PatientAppointmentServiceProxy, RequestAppointmentInput, TimeSlotDto } from '@shared/service-proxies/service-proxies';
import { toUtcDate } from '@shared/utils/time-utils';
import * as moment from 'moment';
import { BsDatepickerConfig, BsDatepickerViewMode } from 'ngx-bootstrap/datepicker';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { getTherapistFullName, ThrerapistWithPictureUrl } from '../find-pt-common';

enum Step {
    ChooseDate,
    ChooseTimeSlot,
    Confirm
}

@Component({
    selector: 'app-schedule-appointment-modal',
    templateUrl: './schedule-appointment-modal.component.html',
    styleUrls: ['./schedule-appointment-modal.component.less']
})
export class ScheduleAppointmentModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('modal', { static: true }) modal: ModalDirective;
    bsConfig: Partial<BsDatepickerConfig> = {
        //selectWeek: false,
        minDate: moment().toDate(),
        maxDate: moment().add(2, 'months').toDate(),
        // minMode: 'day',
        //useUtc: true
    };

    Step = Step;
    therapist: ThrerapistWithPictureUrl = null;
    selectedDate: moment.Moment = null;
    therapistSlots: TimeSlotDto[] = null;
    selectedSlot: TimeSlotDto = null;

    currentStep = Step.ChooseDate;
    isLoadingTimeSlots = false;
    active = false;
    saving = false;

    constructor(
        injector: Injector,
        private patientAppointmentService: PatientAppointmentServiceProxy) {
        super(injector);
    }

    ngOnInit() {
    }

    show(therapist: ThrerapistWithPictureUrl) {
        this.active = true;

        this.therapist = therapist;
        this.modal.show();
    }

    close() {
        this.active = false;
        this.modal.hide();
        this.therapist = null;
        this.selectedDate = null;
        this.selectedSlot = null;
        this.currentStep = Step.ChooseDate;
    }

    submit() {
        this.patientAppointmentService.requestAppointment(new RequestAppointmentInput({
            date: this.selectedDate,
            therapistId: this.therapist.id,
            timeSlotId: this.selectedSlot.slotUid
        })).subscribe(() => {
            this.notify.success(this.l('FindPT.Appointmet.ScheduledSuccess'));
            this.close();
        });
    }

    onShown() {
        // document.getElementById('Name').focus();
    }

    getTherapistFullName(therapist: ThrerapistWithPictureUrl) {
        return getTherapistFullName(therapist);
    }

    selectSlot(slot: TimeSlotDto) {
        if (slot.isBusy) {
            return;
        }

        this.selectedSlot = slot;
        this.currentStep = Step.Confirm;
    }

    dateSelected(date: Date) {
        this.selectedDate = toUtcDate(date);
        this.currentStep = Step.ChooseTimeSlot;
        this.patientAppointmentService.getTherapistDayTimeSlots(this.therapist.id, this.selectedDate)
            .subscribe(x => {
                this.therapistSlots = x;
            });
    }

    backToDateSelection() {
        this.selectedDate = null;
        this.currentStep = Step.ChooseDate;
        this.therapistSlots = null;
    }
}
