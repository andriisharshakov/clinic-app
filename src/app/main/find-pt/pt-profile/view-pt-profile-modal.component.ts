import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ProfileServiceProxy, UserEditDto, UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as _ from 'lodash';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'viewPtProfileModal',
    templateUrl: './view-pt-profile-modal.component.html',
    styleUrls: ['view-pt-profile-modal.component.less']
})
export class ViewPtProfileModalComponent extends AppComponentBase {

    @ViewChild('viewModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;

    user: UserEditDto = new UserEditDto();
    profilePicture: string;

    constructor(
        injector: Injector,
        private _userService: UserServiceProxy,
        private _profileService: ProfileServiceProxy
    ) {
        super(injector);
    }

    show(userId: number): void {
        if (!userId) {
            return;
        }

        this.active = true;
        this.getProfilePicture(userId);

        this._userService.getUserForView(userId).subscribe(userResult => {
            this.user = userResult.user;
            this.modal.show();
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

    close(): void {
        this.active = false;
        this.modal.hide();
    }

}
