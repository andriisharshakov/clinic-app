import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FindPtComponent } from './find-pt/find-pt.component';
import { MyLibraryComponent } from './therapist/my-library/my-library.component';
import { TherapistAppointmentsComponent } from './appointments/therapist-appointments/therapist-appointments.component';
import { PatientAppointmentsComponent } from './appointments/patient-appointments/patient-appointments.component';
import { AppointmentComponent } from './appointments/video-appointment/appointment/appointment.component';
import { VideocallRouteGuard } from '@shared/common/videocall/videocall-route-guard';
import { MyPatientsComponent } from './therapist/my-patients/my-patients.component';
import { ViewPatientProfileComponent } from './therapist/view-patient-profile/view-patient-profile.component';
import { GymComponent } from './patient/gym/gym.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: "find-pt", component: FindPtComponent, data: { permission: "Pages.Tenant.FindPT" } },
                    // { path: 'dashboard', component: DashboardComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: "/find-pt", redirectTo: "find-pt", pathMatch: "full" },
                    { path: 'patient/appointments', component: PatientAppointmentsComponent, data: { permission: 'Pages.Tenant.Patient.Appointments' } },
                    { path: 'patient/gym', component: GymComponent, data: { permission: 'Pages.Tenant.Patient.Gym' } },
                    { path: 'patient/:id', component: ViewPatientProfileComponent, data: { permission: 'Pages.Tenant.Therapist.MyPatients' } },
                    { path: 'therapist/appointments', component: TherapistAppointmentsComponent, data: { permission: 'Pages.Tenant.Therapist.Appointments' } },
                    { path: 'general-library', component: MyLibraryComponent },
                    { path: 'therapist/my-library', component: MyLibraryComponent, data: { permission: 'Pages.Tenant.Therapist.MyLibrary' } },
                    { path: 'therapist/my-patients', component: MyPatientsComponent, data: { permission: 'Pages.Tenant.Therapist.MyPatients' } },
                    { path: 'appointment/:id', component: AppointmentComponent, data: { permission: 'Pages.Tenant.Appointment.VideoCall' }, canDeactivate: [VideocallRouteGuard] },
                    { path: '', redirectTo: 'find-pt', pathMatch: 'full' },
                    { path: "**", redirectTo: "find-pt" },
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MainRoutingModule { }