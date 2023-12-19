import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AppointmentComponent } from "@app/main/appointments/video-appointment/appointment/appointment.component";
import { AppConsts } from "@shared/AppConsts";
import { LocalizationService, MessageService } from "abp-ng2-module";
import { Observable } from "rxjs";
import { CanDeactivateComponentBase } from "../can-deactivate-component-base";

@Injectable()
export class VideocallRouteGuard implements CanDeactivate<CanDeactivateComponentBase> {

    localizationSourceName = AppConsts.localization.defaultLocalizationSourceName;

    constructor(
        private _messageService: MessageService,
        private _localizationService: LocalizationService
    ) { }

    canDeactivate(
        component: AppointmentComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return new Observable((observer) => {
            this._messageService.confirm(
                this._localizationService.localize("Pages.AppointmentCall.ConfirmCancel", this.localizationSourceName),
                this._localizationService.localize("Warning", this.localizationSourceName),
                result => {
                    return observer.next(result);
                });
        });
    }
}