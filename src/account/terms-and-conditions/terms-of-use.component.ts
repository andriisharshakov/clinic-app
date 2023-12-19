import { Component, Injector, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { accountModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    templateUrl: './terms-of-use.component.html',
    animations: [accountModuleAnimation()],
    styleUrls: ['./terms-of-use.component.less']
})
export class TermsOfUseComponent extends AppComponentBase implements OnInit {

    constructor(
        injector: Injector,
        private _titleService: Title
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._titleService.setTitle("Terms of Use — PTlinic");
    }
}
