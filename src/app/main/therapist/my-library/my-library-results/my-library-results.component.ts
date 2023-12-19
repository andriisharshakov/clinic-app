import { Component, Injector, OnInit, OnChanges, ViewChild, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditLibraryEntryDto, ILibraryEntryDto, KeywordDto, LibraryEntryDto, LibraryEntryServiceProxy } from '@shared/service-proxies/service-proxies';
import { LazyLoadEvent, Paginator } from 'primeng';
import { getLibraryEntryVideoSource, LibraryEntryWithVideoSource } from '../my-library-common';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { isEmpty } from 'lodash';

@Component({
    selector: 'app-my-library-results',
    templateUrl: './my-library-results.component.html',
    styleUrls: ['./my-library-results.component.less']
})
export class MyLibraryResultsComponent extends AppComponentBase implements OnInit {
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    
    @Output() editLibraryEntryEvent = new EventEmitter<CreateOrEditLibraryEntryDto>();
    @Output() viewLibraryEntryEvent = new EventEmitter<LibraryEntryWithVideoSource>();
    @Output() showPtProfileEvent = new EventEmitter<number>();

    @Input() textFilter: string;
    @Input() titleFilter: string;
    @Input() descriptionFilter: string;
    @Input() keywordsFilter: KeywordDto[];

    @Input() isGeneral: boolean;
    @Input() entryId: number;
    
    // Page parameters
    itemsPerPage = 6;

    constructor(
        private _libraryEntryService: LibraryEntryServiceProxy,
        injector: Injector
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.searchLibraryEntries();
    }

    reload(): void {
        this.searchLibraryEntries();
    }

    searchLibraryEntries(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
         
            return;
        }

        this.primengTableHelper.showLoadingIndicator();
        if (this.isGeneral) {
            this._libraryEntryService.getAllLibraryEntries(
                this.textFilter,
                this.titleFilter,
                this.descriptionFilter,
                this.keywordsFilter,
                "title asc",
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event) || this.itemsPerPage,
            )
                .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
                .subscribe(async result => {
                    console.log("getAllLibraryEntries result", result);
                    this.primengTableHelper.totalRecordsCount = result.totalCount;
                    if (this.entryId) {
                        this.primengTableHelper.records = await this.getLibraryEntriesWithVideoSources(result.items.filter(e => e.id == this.entryId));
                    } else {
                        this.primengTableHelper.records = await this.getLibraryEntriesWithVideoSources(result.items);
                    }
                    this.primengTableHelper.hideLoadingIndicator();
                });

            return;
        }

        this._libraryEntryService.getLibraryEntries(
            this.textFilter,
            this.titleFilter,
            this.descriptionFilter,
            this.keywordsFilter,
            "title asc",
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event) || this.itemsPerPage,
        )
            .pipe(finalize(() => this.primengTableHelper.hideLoadingIndicator()))
            .subscribe(async result => {
                console.log("getLibraryEntries result", result);
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = await this.getLibraryEntriesWithVideoSources(result.items);
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    async getLibraryEntriesWithVideoSources(libraryEntries: ILibraryEntryDto[]) {
        return libraryEntries.map<LibraryEntryWithVideoSource>(x => ({
            ...x,
            videoSourceUrls: getLibraryEntryVideoSource(x),
            posterImage: x.imageName !== null
                ? `${AppConsts.remoteServiceBaseUrl}/ImageFile/Download/${x.imageName}`
                //TODO: create meant to replace poster images that lack an uploaded thumbnail for the video
                : '',
        }));
    }

    viewLibraryEntry(libraryEntry: LibraryEntryWithVideoSource): void {
        this.viewLibraryEntryEvent.emit(libraryEntry);
    }

    editLibraryEntry(libraryEntry: CreateOrEditLibraryEntryDto): void {
        //TODO: beware, extra properties are coming from the view in libraryEntry variable. Check with the best way to handle this in Typescript
        let entry = new CreateOrEditLibraryEntryDto();
        entry.init(libraryEntry);

        this.editLibraryEntryEvent.emit(entry);
    }

    deleteLibraryEntry(libraryEntry: LibraryEntryDto) {
        this.isLoading = true;

        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._libraryEntryService.delete(libraryEntry.blobName, libraryEntry.id)
                        .pipe(finalize(() => { this.isLoading = false }))
                        .subscribe(() => {
                            this.reload();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    endorseLibraryEntry(libraryEntry: LibraryEntryDto) {
        if (libraryEntry.endorsementStats.doesCurrentUserEndorse) {
            libraryEntry.endorsementStats.endorseCount--;
        } else {
            libraryEntry.endorsementStats.endorseCount++;
        }
        libraryEntry.endorsementStats.doesCurrentUserEndorse = !libraryEntry.endorsementStats.doesCurrentUserEndorse;

        this._libraryEntryService
            .endorse(libraryEntry.id)
            .subscribe(result => {
                libraryEntry.endorsementStats = result;
            });
    }

    reportLibraryEntry(libraryEntry: LibraryEntryDto) {
        this.message.confirm(
            '',
            this.l('AreYouSureYouWantToReportThisEntryAsInappropriate'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._libraryEntryService.report(libraryEntry.id)
                        .subscribe(() => {
                            this.notify.success(this.l('SuccessfullyReported'));
                        });
                }
            }
        );
    }

    isEmpty(obj: any): boolean {
        return isEmpty(obj);
    }

    triggerShowPtProfile(therapistId: number) {
        this.showPtProfileEvent.emit(therapistId);
    }
}
