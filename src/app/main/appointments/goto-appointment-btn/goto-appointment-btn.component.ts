import { Component, OnInit, ChangeDetectionStrategy, Injector, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import * as moment from 'moment';

export interface AppointmentInformation {
    start: moment.Moment;
    end: moment.Moment;
    id: number;
}

@Component({
    selector: 'app-goto-appointment-btn',
    templateUrl: './goto-appointment-btn.component.html',
    styleUrls: ['./goto-appointment-btn.component.less'],
})
export class GotoAppointmentBtnComponent extends AppComponentBase implements OnInit {
    @Input() appointment: AppointmentInformation;
    @Input() withName: string = '';

    @Input() changeDetectionSubject: Subject<any>;

    constructor(
        injector: Injector,
        private router: Router,
        private ref: ChangeDetectorRef) {
        super(injector);
    }

    get intervalThreshold(): number {
        return parseInt(abp.setting.get('PTLinic.Appointment.IntervalThreshold'));
    }

    get isEnabled(): boolean {
        return abp.clock.now() >= this.appointment.start.clone().subtract(this.intervalThreshold, 'minutes').toDate() &&
            abp.clock.now() < this.appointment.end.clone().add(this.intervalThreshold, 'minutes').toDate();
    }

    ngOnInit(): void {
        this.changeDetectionSubject.subscribe(() => this.detectChanges());
    }

    //TODO: check with the team why is this method no longer being used (should it be removed?)
    gotoAppointment() {
        if (!this.isEnabled) {
            this.message.warn(this.l('Appointment.HasEnded'));
            return false;
        }    
            
        this.router.navigate(['/app/main/appointment', this.appointment.id]);
    }

    detectChanges() {
        console.log('Detection works!');
        this.ref.markForCheck();
    }
}
