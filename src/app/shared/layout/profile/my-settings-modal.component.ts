import { Component, EventEmitter, Injector, Output, ViewChild, OnInit, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    CurrentUserProfileEditDto,
    SettingScopes,
    ProfileServiceProxy,
    UpdateGoogleAuthenticatorKeyOutput,
    SendVerificationSmsInputDto,
    AreaOfSpeciality,
    KeyValuePairOfStringString,
    CalendarSyncInfoDto,
    AttachmentType
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SmsVerificationModalComponent } from './sms-verification-modal.component';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AreaOfSpecialityComponent } from './area-of-speciality.component';
import { openWindowCentered } from '@shared/utils/window.utils';
import { SelfReportingComponent } from '@app/shared/common/self-reporting/self-reporting.component';
import { AttachmentsPanelComponent } from '@app/shared/common/attachments-panel/attachments-panel.component';
import * as moment from 'moment';

@Component({
    selector: 'mySettingsModal',
    templateUrl: './my-settings-modal.component.html',
    styleUrls: ['./my-settings-modal.less'],
})

export class MySettingsModalComponent
    extends AppComponentBase
    implements OnInit {
    @ViewChild('mySettingsModal', { static: true }) modal: ModalDirective;
    @ViewChild('smsVerificationModal')
    smsVerificationModal: SmsVerificationModalComponent;
    @ViewChild('areaOfSpeciality') areaOfSpeciality: AreaOfSpecialityComponent;
    @ViewChild('selfReporting') selfReporting: SelfReportingComponent;
    @ViewChild('patientMedicalForms') patientMedicalForms: AttachmentsPanelComponent;
    @ViewChild('patientDocuments') patientDocuments: AttachmentsPanelComponent;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    attachmentType = AttachmentType;
    userId: number;
    
    public active = false;
    public saving = false;
    public isGoogleAuthenticatorEnabled = false;
    public isPhoneNumberConfirmed: boolean;
    public smsEnabled: boolean;
    public user: CurrentUserProfileEditDto;
    public showTimezoneSelection: boolean =
        abp.clock.provider.supportsMultipleTimezone;
    public canChangeUserName: boolean;
    public defaultTimezoneScope: SettingScopes = SettingScopes.User;
    private _initialTimezone: string = undefined;
    public savedPhoneNumber: string;
    public newPhoneNumber: string;
    public specialities: AreaOfSpeciality[] = [];
    profilePicture = AppConsts.appBaseUrl + '/assets/common/images/default-profile-picture.png';
    isMultiTenancyEnabled: boolean = this.multiTenancy.isEnabled;
    isTwoFactorLoginEnabledForApplication = false;
    calendars: KeyValuePairOfStringString[] = [];

    userDateOfBirth: Date;

    constructor(
        injector: Injector,
        private _profileService: ProfileServiceProxy,
        private _httpClient: HttpClient,
        private zone: NgZone
    ) {
        super(injector);
    }

    get calendarAccessGranted() {
        return this.isGranted('Pages.Tenant.Therapist.Settings.CalendarSync');
    }

    ngOnInit(): void {
        this.isTwoFactorLoginEnabledForApplication = abp.setting.getBoolean(
            'Abp.Zero.UserManagement.TwoFactorLogin.IsEnabled'
        );
        this.refreshProfilePicture();
        abp.event.on('profilePictureChanged', () => {
            this.refreshProfilePicture();
        });
        if (this.calendarAccessGranted) {

        }

        this.userId = abp.session.userId;
    }

    show(): void {
        this.active = true;
        forkJoin({
            user: this._profileService.getCurrentUserProfileForEdit(),
            ...(this.calendarAccessGranted ? { calendars: this._profileService.getGoogleCalendarsList() } : {})})
            .subscribe(result => {
                const { user, calendars } = result;
                this.smsEnabled = this.setting.getBoolean('App.UserManagement.SmsVerificationEnabled');
                this.user = user;
                this.specialities = user.specialties;
                this._initialTimezone = user.timezone;
                this.canChangeUserName =
                    this.user.userName !==
                    AppConsts.userManagement.defaultAdminUserName;
                this.modal.show();
                this.isGoogleAuthenticatorEnabled =
                    user.isGoogleAuthenticatorEnabled;
                this.isPhoneNumberConfirmed = user.isPhoneNumberConfirmed;
                this.savedPhoneNumber = user.phoneNumber;
                if (this.calendarAccessGranted) {
                    this.calendars = calendars;
                }

                if (this.user.dateOfBirth) {
                    this.userDateOfBirth = moment.utc(this.user.dateOfBirth.format('YYYY-MM-DDTHH:mm:ss')).toDate();
                }
                console.log("this.user.dateOfBirth", this.user.dateOfBirth);
                console.log("this.userDateOfBirth", this.userDateOfBirth);
            });
        // this._profileService
        //     .getCurrentUserProfileForEdit()
        //     .subscribe((result) => {
        //         this.smsEnabled = this.setting.getBoolean(
        //             'App.UserManagement.SmsVerificationEnabled'
        //         );
        //         this.user = result;
        //         this.specialities = result.specialties;
        //         this._initialTimezone = result.timezone;
        //         this.canChangeUserName =
        //             this.user.userName !==
        //             AppConsts.userManagement.defaultAdminUserName;
        //         this.modal.show();
        //         this.isGoogleAuthenticatorEnabled =
        //             result.isGoogleAuthenticatorEnabled;
        //         this.isPhoneNumberConfirmed = result.isPhoneNumberConfirmed;
        //         this.savedPhoneNumber = result.phoneNumber;
        //     });
    }

    updateQrCodeSetupImageUrl(): void {
        this._profileService
            .updateGoogleAuthenticatorKey()
            .subscribe((result: UpdateGoogleAuthenticatorKeyOutput) => {
                this.user.qrCodeSetupImageUrl = result.qrCodeSetupImageUrl;
                this.isGoogleAuthenticatorEnabled = true;
            });
    }

    disableGoogleAuthenticator(): void {
        this._profileService.disableGoogleAuthenticator().subscribe(() => {
            this.isGoogleAuthenticatorEnabled = false;
        });
    }

    smsVerify(): void {
        let input = new SendVerificationSmsInputDto();
        input.phoneNumber = this.user.phoneNumber;
        this._profileService.sendVerificationSms(input).subscribe(() => {
            this.smsVerificationModal.show();
        });
    }

    changePhoneNumberToVerified(): void {
        this.isPhoneNumberConfirmed = true;
        this.savedPhoneNumber = this.user.phoneNumber;
    }

    onShown(): void {
        document.getElementById('Name').focus();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    save(): void {
        this.saving = true;

        // update user's DOB if any given
        console.log("this.userDateOfBirth", this.userDateOfBirth);
        this.user.dateOfBirth = this.getMomentDateTime(this.userDateOfBirth);
        console.log("this.user.dateOfBirth", this.user.dateOfBirth);

        // update self-report of issue is necessary:
        console.log("call pushSelfReportPictureToUploader when saving the modal");
        this.selfReporting.pushSelfReportPictureToUploader();

        if (this.areaOfSpeciality) {
            this.user.specialties = this.areaOfSpeciality.getSelectedSpecialities();
        }

        this._profileService
            .updateCurrentUserProfile(this.user)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.appSession.user.name = this.user.name;
                this.appSession.user.surname = this.user.surname;
                this.appSession.user.userName = this.user.userName;
                this.appSession.user.emailAddress = this.user.emailAddress;
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);

                if (
                    abp.clock.provider.supportsMultipleTimezone &&
                    this._initialTimezone !== this.user.timezone
                ) {
                    this.message
                        .info(this.l('TimeZoneSettingChangedRefreshPageNotification'))
                        .then(() => {
                            window.location.reload();
                        });
                }
            });
    }

    getMomentDateTime(dtDate: Date, toUtc: boolean = true): moment.Moment {
        if (!dtDate) {
            return null;
        }

        let mDate = new Date(
            dtDate.getFullYear(),
            dtDate.getMonth(),
            dtDate.getDate(),
            dtDate.getHours(),
            dtDate.getMinutes(),
            0
        );
        return toUtc ? moment.utc(moment(mDate).format('YYYY-MM-DDTHH:mm:ss')) : moment(mDate);
    }

    connectGoogleAccount() {
        const url = `${AppConsts.remoteServiceBaseUrl}/GApi/AssociateGoogleUser?accessToken=${abp.auth.getToken()}`;
        const win = openWindowCentered(url, 'google_auth', 605, 650);
        const listener = (args: MessageEvent) => {
            if (args.data == 'true') {
                this.notify.success(this.l('MySettings.CalendarSynchronization.GoogleConnected'));
                this.zone.run(() => {
                    this.loadCalendarsFromGoogle();
                });
            }

            window.removeEventListener('message', listener);
            win.close();
        };
        window.addEventListener('message', listener);
        win.focus();
    }

    disconnectGoogleAccount() {
        this.saving = true;
        this._profileService.disconnectGoogleCalendar()
            .pipe(finalize(() => this.saving = false))
            .subscribe(() => {
                this.notify.success(this.l('MySettings.CalendarSynchronization.GoogleDisconnected'));
                this.calendars = [];
                this.user.calendaerInfo = null;
                this.saving = false;
            });
    }

    private loadCalendarsFromGoogle() {
        this.user.calendaerInfo = this.user.calendaerInfo || new CalendarSyncInfoDto();
        this._profileService.getGoogleCalendarsList().subscribe(x => {
            this.calendars = x;
        });
    }

    openProfilePictureModal() {
        abp.event.trigger('app.show.changeProfilePictureModal');
    }

    refreshProfilePicture(): void {
        this._profileService.getProfilePicture().subscribe(result => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            }
        });
    }
}