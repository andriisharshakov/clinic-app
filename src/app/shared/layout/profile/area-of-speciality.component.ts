import { Component, Injector, Input, Output } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AreaOfSpeciality } from "@shared/service-proxies/service-proxies";

@Component({
    selector: 'area-of-speciality',
    templateUrl: './area-of-speciality.component.html',
    styleUrls: ['./area-of-speciality.component.less']
})
export class AreaOfSpecialityComponent extends AppComponentBase {
    @Input() specialities: AreaOfSpeciality[] = [];

    allSpecialities = AreaOfSpeciality;

    constructor(injector: Injector) {
        super(injector);
    }

    isSelected(value: number): boolean {
        return this.specialities.some(e => e == value);
    }

    specialityChanged(value: boolean, specialityKey: number) {
        if (value) {
            this.specialities.push(specialityKey);
        } else {
            let index = this.specialities.findIndex(e => e == specialityKey);
            this.specialities.splice(index, 1);
        }

        console.log(this.specialities);
    }

    getSelectedSpecialities() {
        return this.specialities;
    }
} 