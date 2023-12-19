import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ViewPtProfileModalComponent } from '@app/main/find-pt/pt-profile/view-pt-profile-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditLibraryEntryDto, KeywordDto, KeywordServiceProxy } from '@shared/service-proxies/service-proxies';
import { LibraryEntryWithVideoSource } from './my-library-common';
import { MyLibraryResultsComponent } from './my-library-results/my-library-results.component';
import { MyLibraryUploadModalComponent } from './my-library-upload-modal/my-library-upload-modal.component';
import { MyLibraryViewModalComponent } from './my-library-view-modal/my-library-view-modal.component';

@Component({
    selector: 'app-my-library',
    templateUrl: './my-library.component.html',
    styleUrls: ['./my-library.component.less']
})
export class MyLibraryComponent extends AppComponentBase implements OnInit {
    @ViewChild('viewPtProfileModal', { static: true }) viewPtProfileModal: ViewPtProfileModalComponent;
    @ViewChild('myLibraryUploadModal', { static: true }) myLibraryUploadModal: MyLibraryUploadModalComponent;
    @ViewChild('myLibraryViewModal', { static: true }) myLibraryViewModal: MyLibraryViewModalComponent;
    @ViewChild('myLibraryResults', { static: true }) myLibraryResults: MyLibraryResultsComponent;

    advancedFiltersAreShown = false;
    
    textFilter: string;
    titleFilter: string;
    descriptionFilter: string;
    keywordsFilter: KeywordDto[] = [];
    
    suggestedKeywords: KeywordDto[];
    allKeywords: KeywordDto[];

    isGeneral: boolean;
    entryId: number;

    constructor(
        injector: Injector,
        private _activatedRoute: ActivatedRoute,
        private _keywordService: KeywordServiceProxy
    ) {
        super(injector);

        this.isGeneral = this._activatedRoute.snapshot.url.join("").toLowerCase().includes("general-library");

        this._activatedRoute.queryParams.subscribe(params => {
            this.entryId = params['id'];
        });
    }

    ngOnInit(): void {
        this.getKeywords();
    }

    reloadResults(): void {
        this.myLibraryResults.reload();
    }

    viewMedia(libraryEntry: LibraryEntryWithVideoSource): void {
        this.myLibraryViewModal.show(libraryEntry);
    }

    uploadMedia(): void {
        this.myLibraryUploadModal.show(new CreateOrEditLibraryEntryDto);
    }

    editMedia(libraryEntry: CreateOrEditLibraryEntryDto): void {
        this.myLibraryUploadModal.show(libraryEntry as CreateOrEditLibraryEntryDto);
    }

    showPtProfile(therapistId: number): void {
        this.viewPtProfileModal.show(therapistId);
    }

    getKeywords(): void {
        this._keywordService.getAll()
            .subscribe((result) => {
                this.allKeywords = result;
            });
    }

    filterKeywords(event) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < this.allKeywords.length; i++) {
            let keyword = this.allKeywords[i];

            // if not selected already
            if (!this.keywordsFilter || this.keywordsFilter.find(n => n.name == keyword.name) == null) {
                // and the query string found                
                if (query.length == 1) {
                    if (keyword.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
                        filtered.push(keyword);
                    }
                } else if (keyword.name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
                    filtered.push(keyword);
                }
            }
        }

        this.suggestedKeywords = filtered;
    }

    createFauxKeyword(event: KeyboardEvent): void {
        event.preventDefault();

        if (event.key == "Enter" || event.key == "Tab") {
            //TODO: apparently this will become a deprecated approach eventually. There's a feature request to support adding new tags to autocomplete
            //here => https://github.com/primefaces/primeng/issues/3211
            var inputText = event.srcElement as any;

            // Checks if there's any white space (regex) on the auto complete text
            if (!inputText.value && event.key == "Enter") {
                this.reloadResults();
                return;
            }

            if (!inputText.value ||
                /\s/.test(inputText.value)) {
                this.notify.warn(this.l('Keyword.WhiteSpaceValidation'));
                return;
            }
            
            // Only adds if the autocomplete text is not already present
            if (this.keywordsFilter.find(l => l.name == inputText.value)) {
                this.notify.warn(this.l('Keyword.AlreadyAdded'));
                return;
            }
            
            // Checks if the keyword already exist at the database. If so, simply add it
            let existingKeyword = this.allKeywords.find(l => l.name == inputText.value);
            if (existingKeyword !== undefined) {
                this.keywordsFilter.push(existingKeyword);
                inputText.value = '';
                return;
            }

            // If none of the conditions above apply, simply creates a new keyword
            let keyword = new KeywordDto();
            keyword.name = inputText.value;
            keyword.id = 0;

            this.keywordsFilter.push(keyword);

            inputText.value = '';
        }
    }
}