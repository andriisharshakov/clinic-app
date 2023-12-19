import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainRoutingModule } from './main-routing.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CalendarModule } from 'primeng/calendar';
import { FullCalendarModule } from 'primeng/fullcalendar';

import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { FindPtComponent } from './find-pt/find-pt.component';
import { AutoCompleteModule, DataViewModule, EditorModule, FileUploadModule, PaginatorModule } from 'primeng';
import { FindPtResultsComponent } from './find-pt/find-pt-results/find-pt-results.component';
import { TherapistAppointmentsComponent } from './appointments/therapist-appointments/therapist-appointments.component';
import { ScheduleAppointmentModalComponent } from './find-pt/schedule-appointment-modal/schedule-appointment-modal.component';
import { ViewPtProfileModalComponent } from './find-pt/pt-profile/view-pt-profile-modal.component';
import { ViewPatientProfileComponent } from './therapist/view-patient-profile/view-patient-profile.component';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
import { AppointmentModalComponent } from './appointments/appointment-modal/appointment-modal.component';
import { PatientAppointmentsComponent } from './appointments/patient-appointments/patient-appointments.component';
import { MyLibraryComponent } from './therapist/my-library/my-library.component';
import { MyLibraryResultsComponent } from './therapist/my-library/my-library-results/my-library-results.component';
import { MyLibraryUploadModalComponent } from './therapist/my-library/my-library-upload-modal/my-library-upload-modal.component';
import { PlyrModule } from 'ngx-plyr';
import { MyLibraryViewModalComponent } from './therapist/my-library/my-library-view-modal/my-library-view-modal.component';
import { AppointmentComponent } from './appointments/video-appointment/appointment/appointment.component';
import { CameraComponent } from './appointments/video-appointment/appointment/camera/camera.component';
import { CameraStorageService } from './appointments/video-appointment/camera-storage.service';
import { GotoAppointmentBtnComponent } from './appointments/goto-appointment-btn/goto-appointment-btn.component';
import { VideoSettingsModalComponent } from './appointments/video-appointment/appointment/video-settings/video-settings-modal.component';
import { DeviceSelectComponent } from './appointments/video-appointment/appointment/device-select/device-select.component';
import { DeviceService } from './appointments/video-appointment/device.service';
import { LocalVideoTrackService } from './appointments/video-appointment/local-video-track.service';
import { AppointmentMomentComponent } from './appointments/appointment-moment/appointment-moment.component';
import { MyPatientsComponent } from './therapist/my-patients/my-patients.component';
import { MyPatientsResultsComponent } from './therapist/my-patients/my-patients-results/my-patients-results.component';
import { MyPatientsEditModalComponent } from './therapist/my-patients/my-patients-edit-modal/my-patients-edit-modal.component';
import { GymComponent } from './patient/gym/gym.component';
import { GymResultsComponent } from './patient/gym/gym-results/gym-results.component';
import { InitChatDirective } from './shared/init-chat.directive';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        MainRoutingModule,
        CountoModule,
        NgxChartsModule,
        DataViewModule,
        PaginatorModule,
        AutoCompleteModule,
        // BrowserAnimationsModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        AppBsModalModule,
        CalendarModule,
        FullCalendarModule,
        FileUploadModule,
        PlyrModule,
        EditorModule,
    ],
    declarations: [
        DashboardComponent,
        FindPtComponent,
        FindPtResultsComponent,
        TherapistAppointmentsComponent,
        ScheduleAppointmentModalComponent,
        ViewPtProfileModalComponent,
        ViewPatientProfileComponent,
        AppointmentModalComponent,
        PatientAppointmentsComponent,
        MyLibraryComponent,
        MyLibraryResultsComponent,
        MyLibraryUploadModalComponent,
        MyLibraryViewModalComponent,
        PatientAppointmentsComponent,
        AppointmentComponent,
        CameraComponent,
        GotoAppointmentBtnComponent,
        VideoSettingsModalComponent,
        DeviceSelectComponent,
        AppointmentMomentComponent,
        MyPatientsComponent,
        MyPatientsResultsComponent,
        MyPatientsEditModalComponent,
        GymComponent,
        GymResultsComponent,
        InitChatDirective,
    ],
    providers: [
        CameraStorageService,
        DeviceService,
        LocalVideoTrackService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class MainModule { }
