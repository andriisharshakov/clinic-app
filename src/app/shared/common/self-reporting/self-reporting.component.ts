import { Component, Injector, ElementRef, AfterViewInit, ViewChild, Input } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    ProfileServiceProxy,
    UpdateSelfReportPictureInput
} from '@shared/service-proxies/service-proxies';
import { TokenService } from 'abp-ng2-module';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, takeLast, finalize } from 'rxjs/operators'

@Component({
    selector: 'self-reporting',
    templateUrl: './self-reporting.component.html',
    styleUrls: ['./self-reporting.component.less']
})
export class SelfReportingComponent extends AppComponentBase implements AfterViewInit {
    @ViewChild("bodyCanvas") public canvas: ElementRef;
    @Input("isEditable") public isEditable: boolean = false;
    @Input("patientId") public patientId: number;

    WIDTH = 640;
    HEIGTH = 860;
    prevPos: { x: number; y: number; };
    
    public saving = false;
    public wereChangesMade = false;
    public wasPictureLoaded = false;
    selfReportPicture = AppConsts.appBaseUrl + '/assets/common/images/body-contour.png';

    constructor(injector: Injector,
        private _profileService: ProfileServiceProxy,
        private httpClient: HttpClient) {
            super(injector);
    }

    private cx: CanvasRenderingContext2D;

    ngAfterViewInit() {
        this.loadSelfReportPicture(this.patientId);

        // get the context
        const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
        this.cx = canvasEl.getContext('2d');

        // set the width and height
        canvasEl.width = this.WIDTH;
        canvasEl.height = this.HEIGTH;

        // set some default properties about the line
        this.cx.lineWidth = 3;
        this.cx.lineCap = 'round';
        this.cx.strokeStyle = 'rgba(255, 100, 100, 0.7)';

        this.prevPos = null;

        if (this.isEditable) {
            this.captureEvents(canvasEl);
            this.captureTouchEvents(canvasEl);
        }
    }

    public clearCanvas() {
        // incase the context is not set
        if (!this.cx) { return; }

        // start our drawing path
        this.cx.beginPath();

        // we're drawing lines so we need a previous position
        this.cx.clearRect(0, 0, this.WIDTH, this.HEIGTH);

        this.wereChangesMade = this.wasPictureLoaded;
    }

    private captureEvents(canvasEl: HTMLCanvasElement) {
        let mouseDownStream = fromEvent(canvasEl, 'mousedown');
        let mouseUpStream = fromEvent(canvasEl, 'mouseup');
        let mouseMoveStream = fromEvent(canvasEl, 'mousemove');
        let mouseLeaveStream = fromEvent(canvasEl, 'mouseleave');

        mouseDownStream
            .pipe(
                event => event
            )
            .subscribe((res: MouseEvent) => {
                if (!this.prevPos) {
                    const rect = canvasEl.getBoundingClientRect();
    
                    // previous position with the offset
                    this.prevPos = {
                        x: res.clientX - rect.left,
                        y: res.clientY - rect.top
                    };
                }
            });

        mouseDownStream
            .pipe(
                switchMap((event) => {
                    return mouseMoveStream
                        .pipe(
                            // we'll stop (and unsubscribe) once the user releases the mouse
                            // this will trigger a 'mouseup' event    
                            takeUntil(mouseUpStream),
                            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
                            takeUntil(mouseLeaveStream),
                            // pairwise lets us get the previous value to draw a line from
                            // the previous point to the current point    
                            takeLast(1)
                        )
                })
            )
            .subscribe((res: MouseEvent) => {
                    if (this.prevPos) {
                        const rect = canvasEl.getBoundingClientRect();
    
                        // current position with the offset
                        const currentPos = {
                            x: res.clientX - rect.left,
                            y: res.clientY - rect.top
                        };
    
                        // this method we'll implement soon to do the actual drawing
                        this.drawOnCanvas(this.prevPos, currentPos);
                    }
                });
    }

    private captureTouchEvents(canvasEl: HTMLCanvasElement) {
        let touchStartStream = fromEvent(canvasEl, 'touchstart');
        let touchEndStream = fromEvent(canvasEl, 'touchend');
        let touchMoveStream = fromEvent(canvasEl, 'touchmove');
        let touchLeaveStream = fromEvent(canvasEl, 'touchleave');

        touchStartStream
            .pipe(
                event => event
            )
            .subscribe((res: TouchEvent) => {
                if (!this.prevPos) {
                    const rect = canvasEl.getBoundingClientRect();
    
                    // previous position with the offset
                    this.prevPos = {
                        x: res.touches[0].clientX - rect.left,
                        y: res.touches[0].clientY - rect.top
                    };
                }
            });

        touchStartStream
            .pipe(
                switchMap((event) => {
                    return touchMoveStream
                        .pipe(
                            // we'll stop (and unsubscribe) once the user releases the touch
                            // this will trigger a 'touchend' event    
                            takeUntil(touchEndStream),
                            // we'll also stop (and unsubscribe) once the touch leaves the canvas (touchleave event)
                            takeUntil(touchLeaveStream),
                            // pairwise lets us get the previous value to draw a line from
                            // the previous point to the current point    
                            takeLast(1)
                        )
                })
            )
            .subscribe((res: TouchEvent) => {
                    if (this.prevPos) {
                        const rect = canvasEl.getBoundingClientRect();
    
                        // current position with the offset
                        const currentPos = {
                            x: res.touches[0].clientX - rect.left,
                            y: res.touches[0].clientY - rect.top
                        };
    
                        // this method we'll implement soon to do the actual drawing
                        this.drawOnCanvas(this.prevPos, currentPos);
                    }
                });
    }

    private drawOnCanvas(
        prevPos: { x: number, y: number },
        currentPos: { x: number, y: number }
    ) {
        // incase the context is not set
        if (!this.cx) { return; }

        // start our drawing path
        this.cx.beginPath();

        // we're drawing lines so we need a previous position
        if (prevPos) {
            let centerX = Math.abs(currentPos.x + prevPos.x) / 2;
            let centerY = Math.abs(currentPos.y + prevPos.y) / 2;
            var radius = Math.sqrt(Math.pow(currentPos.x - prevPos.x, 2) + Math.pow(currentPos.y - prevPos.y, 2)) / 2;
      
            this.cx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            this.cx.fillStyle = 'rgba(255, 100, 100, 0.5)';
            this.cx.fill();
            this.cx.lineWidth = 3;
            this.cx.strokeStyle = 'rgba(255, 100, 100, 0.7)';

            // strokes the current path with the styles we set earlier
            this.cx.stroke();

            this.prevPos = null;

            this.wereChangesMade = true;
        }
    }

    pushSelfReportPictureToUploader() {
        console.log("pushSelfReportPictureToUploader... wereChangesMade", this.wereChangesMade);
        if (!this.wereChangesMade) {
            return;
        }

        let pictureBase64 = this.canvas.nativeElement.toDataURL();
        let blobBin = atob(pictureBase64.split(',')[1]);
        let array = [];
        for (let i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }

        let fileType = "image/png";
        let fileName = "SelfReportPicture.png";

        let file = new Blob([new Uint8Array(array)], {type: fileType});
        
        const formData: FormData = new FormData();
        formData.append("file", file, fileName);
        formData.append("FileType", fileType);
        formData.append("FileName", fileName);
        formData.append("FileToken", this.guid());

        this.httpClient
            .post(AppConsts.remoteServiceBaseUrl + '/Profile/UploadSelfReportPicture', formData)
            .subscribe((s: { result: { fileName: string; fileToken: string; fileType: string; } }) => {
                this.updateSelfReportPicture(s.result.fileToken)
            });
    }

    updateSelfReportPicture(fileToken: string): void {
        const input = new UpdateSelfReportPictureInput();
        input.fileToken = fileToken;

        this.saving = true;

        console.log("updateSelfReportPicture...", input);
        this._profileService.updateSelfReportPicture(input)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe();
    }
    
    loadSelfReportPicture(patientId: number) {
        console.log("loadSelfReportPicture...");
        this._profileService.getSelfReportPictureByUser(patientId)
            .pipe(finalize(() => {
                console.log("getSelfReportPictureByUser finalize");
                this.drawImage(this.selfReportPicture);
            }))
            .subscribe(result => {
                console.log("getSelfReportPictureByUser subscribe result", result);
                if (result && result.profilePicture) {
                    this.selfReportPicture = 'data:image/jpeg;base64,' + result.profilePicture;
                    this.wasPictureLoaded = true;
                } else {
                    this.selfReportPicture = this.appRootUrl() + 'assets/common/images/body-contour.png';
                }
            });
    }

    drawImage(selfReportPicture: string) {
        let img = new Image();
        img.src = selfReportPicture;

        let context = this.cx;
        let imgWidth = this.WIDTH;
        let imgHeight = this.HEIGTH;
        
        img.onload = function() {
            context.drawImage(img, 0, 0, imgWidth, imgHeight);
        }
    }
}