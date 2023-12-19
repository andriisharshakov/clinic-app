import { Component, Injector, ElementRef, OnInit, Input, QueryList, ViewChildren } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    AttachmentDto,
    AttachmentsServiceProxy,
    AttachmentType,
    CreateOrEditAttachmentDto,
    GetAttachmentForViewDto,
} from '@shared/service-proxies/service-proxies';
import { UtilsService } from 'abp-ng2-module';
import { FileUploader } from "ng2-file-upload";
import { finalize } from "rxjs/operators";

@Component({
    selector: 'attachments-panel',
    templateUrl: './attachments-panel.component.html',
    styleUrls: ['./attachments-panel.component.less']
})
export class AttachmentsPanelComponent extends AppComponentBase implements OnInit {
    @ViewChildren('fileInput') fileInputs: QueryList<ElementRef<any>>;
    @Input("isEditable") public isEditable: boolean = false;
    @Input("userId") public userId: number;
    @Input("attachmentType") public attachmentType: AttachmentType;

    fileType: string;
    fileName: string;
    fileSize: number;
    fileId: string;
    fileReadOnly: boolean = true;
    uploader: FileUploader;
    attachments: Array<GetAttachmentForViewDto>;

    maxAttachmentSizeMb = 100;
    maxAttachmentSize = this.maxAttachmentSizeMb * 1024 * 1024;

    loading = false;
    uploading = false;

    constructor(injector: Injector,
        private _attachmentsServiceProxy: AttachmentsServiceProxy,
        private _httpClient: HttpClient) {
            super(injector);
    }

    private cx: CanvasRenderingContext2D;

    ngOnInit() {
        this.initAttachmentsList(this.userId);
        this.updateFileInfo(null, null);
    }

    initAttachmentsList(userId: number) {
        this.loading = true;
        this.attachments = new Array<GetAttachmentForViewDto>();
        this._attachmentsServiceProxy.getAllByOwnerId(userId, this.attachmentType)
            .pipe(finalize(() => { this.loading = false; }))
            .subscribe((list: Array<GetAttachmentForViewDto>) => {
                this.attachments = list;
            });
    }

    fileChangeEvent(event: Event) {
        const targetElem = event.target as HTMLInputElement;
        const file = targetElem?.files?.[0];
        if (!file) {
            return;
        }
        if (file.size > this.maxAttachmentSize) {
            this.message.warn(this.l('The attachment must be smaller than {0}MB. Please select another file', this.maxAttachmentSizeMb));
            return;
        }
        this.disableFileInput();
        
        this.fileType = file.type;
        this.fileName = file.name;
        this.fileSize = file.size;

        const fileToken = this.guid();
        const formData: FormData = new FormData();
        formData.append("file", file, this.fileName);
        formData.append("FileType", this.fileType);
        formData.append("FileName", this.fileName);
        formData.append("FileToken", fileToken);

        this.uploading = true;
        this._httpClient
            .post(AppConsts.remoteServiceBaseUrl + '/File/UploadTempFile', formData)
            .subscribe(res => {
                const uploadDto: CreateOrEditAttachmentDto = new CreateOrEditAttachmentDto();
                uploadDto.fileType = this.fileType;
                uploadDto.fileName = this.fileName;
                uploadDto.fileSize = this.fileSize;
                uploadDto.tempFileToken = fileToken;
                uploadDto.type = this.attachmentType;
                this._attachmentsServiceProxy.uploadAttachment(uploadDto)
                    .pipe(finalize(() => { this.uploading = false; }))
                    .subscribe((result: AttachmentDto) => {
                        if (result?.objectId) {
                            this.attachments.push(new GetAttachmentForViewDto({ attachment: result, userName: "" }));
                        }
                    });
            });
    }

    fileDeleteEvent(attachment: AttachmentDto) {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._attachmentsServiceProxy.deleteAttachment(attachment.id)
                        .subscribe(() => {
                            this.attachments = this.attachments.filter(a => a.attachment.id != attachment.id);
                            this.resetFileInfo();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    fileDownloadEvent(attachment: AttachmentDto) {
        // DownloadBinaryFile(Guid id, string contentType, string fileName)
        let encryptedAuthToken = new UtilsService().getCookieValue(AppConsts.authorization.encrptedAuthTokenName);
        const url = AppConsts.remoteServiceBaseUrl
            + '/File/DownloadBinaryFile'
            + `?id=${attachment.objectId}&contentType=${attachment.fileType}&fileName=${attachment.fileName}`
            + `&${AppConsts.authorization.encrptedAuthTokenName}=${encodeURIComponent(encryptedAuthToken)}`;
        location.href = url;
    }

    private updateFileInfo(fileName: string, fileId: string) {
        if (fileId == null) {
            this.resetFileInfo();
            return;
        }
        this.fileName = fileName;
        this.fileId = fileId;
    }

    private resetFileInfo() {
        this.fileName = null;
        this.fileId = null;
    }

    private disableFileInput() {
        for (const fileInput of this.fileInputs.toArray()) {
            fileInput.nativeElement.enabled = false;
        }
    }

    private resetFileInput() {
        for (const fileInput of this.fileInputs.toArray()) {
            fileInput.nativeElement.value = null;
            fileInput.nativeElement.enabled = true;
        }
    }
}