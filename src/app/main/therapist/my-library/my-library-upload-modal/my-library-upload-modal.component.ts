import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateOrEditLibraryEntryDto, KeywordDto, KeywordServiceProxy, LibraryEntryServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';

import { newGuid } from '@shared/utils/string-utils';
import { NotifyService } from 'abp-ng2-module';
import { catchError, finalize } from 'rxjs/operators';
import { AutoComplete, FileUpload, LazyLoadEvent } from 'primeng';
import { DomHandler } from 'primeng/dom';
import { AppConsts } from '@shared/AppConsts';
import { throwError } from 'rxjs';
import { FileUploader } from 'ng2-file-upload';
import { isEmpty } from 'lodash';

@Component({
    selector: 'app-my-library-upload-modal',
    templateUrl: './my-library-upload-modal.component.html',
    styleUrls: ['./my-library-upload-modal.component.less']
})
export class MyLibraryUploadModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('modal', { static: true }) modal: ModalDirective;

    @ViewChild('autoCompleteObject') autoCompleteObject: AutoComplete;
    @ViewChild('uploadVideoComponent') uploadVideoComponent: FileUpload;
    @ViewChild('uploadImageComponent') uploadImageComponent: FileUpload;
    
    
    @Output() libraryEntrySavedEvent = new EventEmitter();

    libraryEntry: CreateOrEditLibraryEntryDto;

    active = false;
    title: string;

    thumbnailUploader: FileUploader;

    allKeywords: KeywordDto[];
    suggestedKeywords: KeywordDto[];

    videoFile: File;
    uploadVideoProgress: number;

    get isFormAllowed(): boolean {
        return (this.videoFile !== null || !this.isLibraryEntryNew) && !isEmpty(this.libraryEntry.title);
    }

    get uploadVideoPercentage(): string {
        return `${this.uploadVideoProgress} %`;
    }

    get isLibraryEntryNew(): boolean {
        return !this.libraryEntry.id;
    }

    get isImageEmpty(): boolean {
        return !this.libraryEntry.imageName;
    }

    get imagePath(): string {
        return `${AppConsts.remoteServiceBaseUrl}/ImageFile/Download?id=${this.libraryEntry?.imageName}`;
    }

    constructor(
        injector: Injector,
        private _httpClient: HttpClient,
        private _libraryEntryService: LibraryEntryServiceProxy,
        private _keywordService: KeywordServiceProxy,
        private _notifyService: NotifyService) {
        super(injector);
    }

    ngOnInit(): void {
    }
    
    show(libraryEntry: CreateOrEditLibraryEntryDto) {
        this.libraryEntry = libraryEntry;
        
        if (this.isLibraryEntryNew)
            this.title = this.l('Therapist.MyLibrary.Create');
        else
            this.title = this.l('Therapist.MyLibrary.Edit');
        
        this.videoFile = null;
        
        this.active = true;

        this.getKeywords();

        this.modal.show();
    }

    close(success?: boolean) {
        this.active = false;
        this.modal.hide();

        this.libraryEntry = null;
        this.videoFile = null;
    }

    uploadVideo(data: { files: File }) {
        this.videoFile = data.files[0];

        this.libraryEntry.isVideoNew = true;
    }

    async uploadImage(data: { files: File }) {
        const imageName = await this.uploadImageFile(data.files[0]);

        this.libraryEntry.isImageNew = true;
        this.libraryEntry.imageName = imageName;
    }

    clearVideoUploader() {
        this.uploadVideoComponent.clear();
        this.libraryEntry.blobName = undefined;
    }

    clearImageUploader() {
        this.uploadImageComponent.clear();
        this.libraryEntry.imageName = undefined;
    }

    filterKeywords(event) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < this.allKeywords.length; i++) {
            let keyword = this.allKeywords[i];

            // if not selected already
            if (!this.libraryEntry.keywords || this.libraryEntry.keywords.find(n => n.name == keyword.name) == null) {
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

    async submit() {
        // If a video file was provided
        if (this.videoFile !== null) {
            // Creating blob entry on Azure Storage Account
            const { BlobServiceClient } = require("@azure/storage-blob");
    
            //TODO: find a better spot to store those keys other than directly on the source code
            // This is from Raelson's test Azure Storage Account
            const account = "ptlinicdevstorage"
            const accountSas = "?sv=2019-12-12&ss=bfqt&srt=sco&sp=rwdlacupx&se=2021-07-21T18:40:54Z&st=2021-02-16T11:40:54Z&spr=https&sig=9NSXx9pCZOD7zds4t3tVYM%2BGCodNdGXvVRbWDv2pK8I%3D";
            
            const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net${accountSas}`);
    
            const containerClient = blobServiceClient.getContainerClient("video-container");
    
            const content = this.videoFile;
            const blobName = newGuid();
    
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
            this.uploadVideoProgress = 0;
            this.showMainSpinner(this.uploadVideoPercentage);
            const uploadBlobResponse = await blockBlobClient.uploadBrowserData(content, {
                blockSize: 1 * 1024 * 1024, // 1MB block size
                concurrency: 20, // 20 concurrency
                onProgress: (ev) => {
                    this.uploadVideoProgress = (100 * ev.loadedBytes / content.size) | 0;
                    this.showMainSpinner(this.uploadVideoPercentage);
                },
                blobHTTPHeaders: { blobContentType: content.type }
            });
    
            if (uploadBlobResponse._response.status == 201) {
                this.libraryEntry.blobName = blobName;
                this.saveLibraryEntry();
            } else {
                // If the upload returns anything other than successful
                this._notifyService.success("Upload failed");
            }
        }
        // If a video file wasn't provided
        else {
            this.saveLibraryEntry();
        }
    }

    createKeyword(event: KeyboardEvent): void {
        event.preventDefault();

        if (event.key == "Enter" || event.key == "Tab") {
            //TODO: apparently this will become a deprecated approach eventually. There's a feature request to support adding new tags to autocomplete
            //here => https://github.com/primefaces/primeng/issues/3211
            var inputText = event.srcElement as any;

            if (this.libraryEntry.keywords === undefined)
                this.libraryEntry.keywords = [];
            
            // Checks if there's any white space (regex) on the auto complete text
            if (!inputText.value ||
                /\s/.test(inputText.value)) {
                this._notifyService.warn(this.l('Keyword.WhiteSpaceValidation'));
                return;
            }
            
            // Only adds if the autocomplete text is not already present
            if (this.libraryEntry.keywords.find(l => l.name == inputText.value)) {
                this._notifyService.warn(this.l('Keyword.AlreadyAdded'));
                return;
            }
            
            // Checks if the keyword already exist at the database. If so, simply add it
            let existingKeyword = this.allKeywords.find(l => l.name == inputText.value);
            if (existingKeyword !== undefined) {
                this.libraryEntry.keywords.push(existingKeyword);
                inputText.value = '';
                return;
            }

            // If none of the conditions above apply, simply creates a new keyword
            let keyword = new KeywordDto();
            keyword.name = inputText.value;

            this.libraryEntry.keywords.push(keyword);

            inputText.value = '';
        }
    }

    private saveLibraryEntry() {
        this._libraryEntryService.createOrEdit(this.libraryEntry)
            .pipe(
                finalize(() => { this.hideMainSpinner() }),
                //TODO: this approach might be unsecure. Review this with the team
                catchError((e: any) => {
                    if (this.libraryEntry.blobName)
                        this._httpClient.post(`${AppConsts.remoteServiceBaseUrl}/blob/delete/${this.libraryEntry.blobName}`, null);
                    
                    return throwError(e);
                })
            )
            .subscribe(async () => {
                this._notifyService.success(this.l("Therapist.MyLibrary.Modal.Success"));

                this.libraryEntrySavedEvent.emit();

                this.close();
            });
    }

    private getKeywords(): void {
        this._keywordService.getAll()
            .subscribe((result) => {
                this.allKeywords = result;
            });
    }

    private uploadImageFile(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const uploadData = new FormData();
            uploadData.append('file', file);

            return this._httpClient.post<any>(`${AppConsts.remoteServiceBaseUrl}/ImageFile/Upload`, uploadData).toPromise()
                .then(result => {
                    if (result.success) {
                        const { id } = result.result;
                        resolve(id);
                    } else if (result.error != null) {
                        this.notify.error(result.error.message);
                        reject();
                    }
                })
                .catch((error) => {
                    this.notify.error(this.l("AnErrorOccurred"));
                    reject();
                })
                .finally(() => this.hideMainSpinner());
        });
    }
}
