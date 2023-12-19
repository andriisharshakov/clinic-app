import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AreaOfSpeciality, FindPtServiceProxy, ITherapistDto } from "@shared/service-proxies/service-proxies";
import { EnumOptionsWrap } from '@shared/utils/enum-helper';
import { LocalStorageService } from '@shared/utils/local-storage.service';
import { isNumber } from '@shared/utils/smiple-utils';
import { LazyLoadEvent, DataView, Paginator } from 'primeng';
import { finalize } from 'rxjs/operators';

enum Step {
    SelectSpecialty,
    SelectBodyArea,
    ShowResults
}

interface AreaOfSpecialityOption {
    name: string;
    value: AreaOfSpeciality;
}

const areaOfSpecialityWrap = new EnumOptionsWrap(AreaOfSpeciality);

@Component({
    selector: 'app-find-pt',
    templateUrl: './find-pt.component.html',
    styleUrls: ['./find-pt.component.less']
})
export class FindPtComponent extends AppComponentBase implements OnInit {
    @ViewChild('paginator', { static: false }) paginator: Paginator;
    @ViewChild('dataView', { static: false }) dataView: DataView;

    Step = Step;
    allSpecialities = AreaOfSpeciality;

    specialtyOptions: AreaOfSpecialityOption[] = areaOfSpecialityWrap.keys.map(x => ({ name: this.l(areaOfSpecialityWrap.v(x)), value: x }));
    filteredSpecialtyOptions = this.specialtyOptions;
    selectedSpecialty: AreaOfSpeciality = null;
    currentStep = Step.ShowResults;

    constructor(
        injector: Injector,
        private findPtService: FindPtServiceProxy,
        private _localStorageService: LocalStorageService
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    switchToResultsView() {
        this.currentStep = Step.ShowResults;
    }

    filterSpecialtyOptions(event: { query: string; }) {
        const query = (event.query || '').toLowerCase();
        this.filteredSpecialtyOptions = this.specialtyOptions.filter(x => x.name.toLowerCase().startsWith(query));
    }
}
