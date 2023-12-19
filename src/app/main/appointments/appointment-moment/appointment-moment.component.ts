import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PatientAppointmentDto } from '@shared/service-proxies/service-proxies';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-appointment-moment',
    templateUrl: './appointment-moment.component.html',
    styleUrls: ['./appointment-moment.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentMomentComponent extends AppComponentBase implements OnInit {
    @Input() appointment: PatientAppointmentDto;
    @Input() changeDetectionSubject: Subject<any>;

    constructor(
        injector: Injector,
        private ref: ChangeDetectorRef) {
        super(injector);
    }

    ngOnInit(): void {
        this.changeDetectionSubject.subscribe(() => this.detectChanges());
    }

    detectChanges() {
        console.log('Detection works!');
        this.ref.markForCheck();
    }
}
