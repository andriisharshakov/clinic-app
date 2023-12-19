import { Component, Injector, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LibraryEntryWithPrescription } from '@app/main/patient/gym/gym-common';
import { GymResultsComponent } from '@app/main/patient/gym/gym-results/gym-results.component';
import { AttachmentsPanelComponent } from '@app/shared/common/attachments-panel/attachments-panel.component';
import { SelfReportingComponent } from '@app/shared/common/self-reporting/self-reporting.component';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AttachmentDto, AttachmentType, IPatientDto, MyPatientsServiceProxy, ProfileServiceProxy } from '@shared/service-proxies/service-proxies';
import { UtilsService } from 'abp-ng2-module';
import * as _ from 'lodash';
import { MyLibraryViewModalComponent } from '../my-library/my-library-view-modal/my-library-view-modal.component';

@Component({
    selector: 'viewPatientProfile',
    templateUrl: './view-patient-profile.component.html',
    styleUrls: ['view-patient-profile.component.less']
})
export class ViewPatientProfileComponent extends AppComponentBase {
    @ViewChild('selfReporting') selfReporting: SelfReportingComponent;
    @ViewChild('patientMedicalForms') patientMedicalForms: AttachmentsPanelComponent;
    @ViewChild('patientDocuments') patientDocuments: AttachmentsPanelComponent;
    @ViewChild('therapistBillingDocuments') therapistBillingDocuments: AttachmentsPanelComponent;
    @ViewChild('gymViewModal', { static: true }) gymViewModal: MyLibraryViewModalComponent;
    @ViewChild('gymResults', { static: true }) gymResults: GymResultsComponent;

    active = false;

    profile: IPatientDto;
    profilePicture: string;

    attachmentType = AttachmentType;
    userId: number;

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _patientService: MyPatientsServiceProxy,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        const patientIdStr = this._activatedRoute.snapshot.params['id'];
        const patientId = Number.parseInt(patientIdStr);
        this.userId = abp.session.userId;
        this.show(patientId);
    }

    show(userId: number): void {
        if (!userId) {
            this.back();
            return;
        }

        this.getProfilePicture(userId);
        
        this._patientService.getPatientProfile(userId).subscribe(patientProfile => {
            this.profile = patientProfile;
            this.active = true;
        },
        error => {
            this.back();
            return;
        });
    }

    getProfilePicture(userId: number): void {
        if (!userId) {
            this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            return;
        }

        this._profileService.getProfilePictureByUser(userId).subscribe(result => {
            if (result && result.profilePicture) {
                this.profilePicture = 'data:image/jpeg;base64,' + result.profilePicture;
            } else {
                this.profilePicture = this.appRootUrl() + 'assets/common/images/default-profile-picture.png';
            }
        });
    }

    fileDownloadEvent(attachment: AttachmentDto) {
        // DownloadBinaryFile(Guid id, string contentType, string fileName)
        let encryptedAuthToken = new UtilsService().getCookieValue(AppConsts.authorization.encrptedAuthTokenName);
        const url = AppConsts.remoteServiceBaseUrl
            + '/File/DownloadBinaryFile'
            + `?id=${attachment.objectId}&contentType=${attachment.fileType}&fileName=${attachment.fileName}`
            + `&${AppConsts.authorization.encrptedAuthTokenName}=${encodeURIComponent(encryptedAuthToken)}`;
        location.href = url;
    }

    back(): void {
        this.active = false;

        this._router.navigate(['/app/main/therapist/my-patients']);
    }

    viewMedia(prescription: LibraryEntryWithPrescription): void {
        this.gymViewModal.showPrescription(prescription);
    }

}
