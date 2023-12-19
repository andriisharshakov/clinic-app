import { Component, HostListener, Injectable, Injector } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    template: ''
})
export abstract class CanDeactivateComponentBase extends AppComponentBase {
    constructor(injector: Injector) {
        super(injector);
    }

    abstract canDeactivate(): boolean;

    @HostListener('window:beforeunload', ['$event'])
    unloadNotification($event: any) {
        if (!this.canDeactivate()) {
            $event.returnValue = true;
        }
    }
}