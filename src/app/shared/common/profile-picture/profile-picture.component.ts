import { Component, OnInit, Injector, Input, ChangeDetectionStrategy } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'app-profile-picture',
    templateUrl: './profile-picture.component.html',
    styleUrls: ['./profile-picture.component.less']
})
export class ProfilePictureComponent extends AppComponentBase implements OnInit {
    @Input() divClass?: string = '';
    @Input() fullName: string = '';
    private _userId: number;

    @Input()
    set userId(userId: number) {
        this._userId = userId;
        this.getUrl(userId).then(x => {
            this.profilePictureUrl = x;
        });
    }

    get userId() {
        return this._userId;
    }

    profilePictureUrl: string = AppConsts.appBaseUrl + '/assets/common/images/default-profile-picture.png';

    constructor(
        injector: Injector,
        private _localStorageService: LocalStorageService) {
        super(injector);
    }

    ngOnInit(): void {
    }

    private async getUrl(userId: number) {
        const tokenContainer = await this._localStorageService.getItemPromise<{ token: string; }>(AppConsts.authorization.encrptedAuthTokenName);
        return this.getUserProfilePitureUrl(userId, tokenContainer.token);
    }
}
