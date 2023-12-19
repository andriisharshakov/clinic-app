import { Component, OnInit, Injector, ViewChild, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { Location as NgLocation } from '@angular/common';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoCallServiceProxy, VideoAppointmentDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { CameraComponent } from './camera/camera.component';
import { LocalTrack, RemoteTrack } from 'twilio-video/tsdef/types';
import { Room, connect, createLocalAudioTrack, RemoteParticipant, LocalAudioTrack, LocalVideoTrack, RemoteAudioTrack, RemoteVideoTrack, RemoteTrackPublication } from 'twilio-video';
import { ConnectOptions } from 'twilio-video';
import { VideoSettingsModalComponent } from './video-settings/video-settings-modal.component';
import { from, zip } from 'rxjs';
import { LocalVideoTrackService } from '../local-video-track.service';
import { CanDeactivateComponentBase } from '@shared/common/can-deactivate-component-base';

class RemoteHelpers {
    static detachRemoteTrack(track: RemoteTrack) {
        if (this.isDetachable(track)) {
            track.detach().forEach(el => el.remove());
            return true;
        }

        return false;
    }

    static isAttachable(track: RemoteTrack): track is RemoteAudioTrack | RemoteVideoTrack {
        return !!track &&
            ((track as RemoteAudioTrack).attach !== undefined ||
                (track as RemoteVideoTrack).attach !== undefined);
    }

    static isDetachable(track: RemoteTrack): track is RemoteAudioTrack | RemoteVideoTrack {
        return !!track &&
            ((track as RemoteAudioTrack).detach !== undefined ||
                (track as RemoteVideoTrack).detach !== undefined);
    }
}

class LocalHelpers {
    static detachLocalTrack(track: LocalTrack) {
        if (LocalHelpers.isDetachable(track)) {
            track.detach().forEach(el => el.remove());
        }
    }

    static isDetachable(track: LocalTrack): track is LocalAudioTrack | LocalVideoTrack {
        return !!track
            && ((track as LocalAudioTrack).detach !== undefined
                || (track as LocalVideoTrack).detach !== undefined);
    }
}

@Component({
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.less']
})
export class AppointmentComponent extends CanDeactivateComponentBase implements OnInit, OnDestroy {
    @ViewChild('camera') camera: CameraComponent;
    @ViewChild('settingsModal') settings: VideoSettingsModalComponent;
    @ViewChild('participant') participantContainer: ElementRef;

    activeRoom: Room;
    appointment: VideoAppointmentDto = null;
    isMuted = false;
    private jwtToken: string = null;
    private remoteParticipant: RemoteParticipant = null;

    constructor(
        injector: Injector,
        private readonly location: NgLocation,
        private readonly activatedRoute: ActivatedRoute,
        private readonly router: Router,
        private readonly renderer: Renderer2,
        private readonly videoCallService: VideoCallServiceProxy,
        private readonly localVideoTrackService: LocalVideoTrackService) {
        super(injector);
    }

    get hasParticipant() {
        return this.remoteParticipant != null;
    }

    get participantName() {
        if (!this.appointment) {
            return '';
        }

        return this.getFullName(this.appointment.therapist.id == this.appSession.userId
            ? this.appointment.patient
            : this.appointment.therapist);
    }

    ngOnInit(): void {
        const appointmentIdStr = this.activatedRoute.snapshot.params['id'];
        const appointmentId = Number.parseInt(appointmentIdStr);
        this.isLoading = true;
        this.videoCallService.getAppointment(appointmentId)
            .pipe(finalize(() => this.isLoading = false))
            .subscribe(async appointment => {
                this.appointment = appointment;
                if (!appointment.isActive) { // skip for dev
                    if (!appointment.hasStarted) {
                        this.message.error(this.l('Appointment.HasNotStarted'));
                    }
                    else if (!appointment.hasEnded) {
                        this.message.error(this.l('Appointment.HasEnded'));
                    }
                    this.location.back();
                } else {
                    this.joinCall();
                }

                this.isLoading = false;
            });
        this.addSubscriptionToClear(
            this.localVideoTrackService.localVideoTrack.subscribe(async track => {
                if (this.activeRoom) {
                    const localParticipant = this.activeRoom.localParticipant;
                    localParticipant.videoTracks.forEach(publication => publication.unpublish());
                    await localParticipant.publishTrack(track);
                }
            }));
    }

    ngOnDestroy(): void {
        if (this.activeRoom) {
            this.activeRoom?.localParticipant?.tracks?.forEach(x => {
                x.unpublish();
            })
            this.activeRoom.disconnect();
        }

        this.clearSubscriptions();
        this.localVideoTrackService.disposeCurrentTrack();
    }

    canDeactivate(): boolean {
        //TODO: check the proper way to see if the video call is still running. If so, implement the check here
        return false;
    }

    joinCall() {
        zip(
            this.videoCallService.getTwilioJwtToken(this.appointment.id),
            this.localVideoTrackService.localVideoTrack,
            from(createLocalAudioTrack())
        ).subscribe(async ([token, videoTrack, audioTrack]) => {
            this.jwtToken = token;
            this.activeRoom = await this.joinOrCreateRoom(`AP_${this.appointment.id}`, [audioTrack, videoTrack]);
            this.registerRoomEvents();
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.activeRoom.localParticipant.audioTracks.forEach(track => {
            if (this.isMuted) {
                track.track.disable();
            }
            else {
                track.track.enable();
            }
        });
    }

    async joinOrCreateRoom(name: string, tracks: LocalTrack[]) {
        let room: Room = null;
        room = await connect(this.jwtToken, { name, tracks, dominantSpeaker: true } as ConnectOptions);
        // try {
        //     room = await connect(this.jwtToken, { name, tracks, dominantSpeaker: true } as ConnectOptions);
        // } catch (error) {
        //     console.error(`Unable to connect to Room: ${error.message}`);
        // }

        return room;
    }

    private registerRoomEvents() {
        this.activeRoom
            .on('disconnected',
                (room: Room) => room.localParticipant.tracks.forEach(publication => LocalHelpers.detachLocalTrack(publication.track)))
            .on('participantConnected',
                (participant: RemoteParticipant) => this.setRemoteParticipant(participant))
            .on('participantDisconnected',
                (participant: RemoteParticipant) => this.remoteParticipant = null);
        // .on('dominantSpeakerChanged',
        //     (dominantSpeaker: RemoteParticipant) => this.participants.loudest(dominantSpeaker));
        if (this.activeRoom.participants && this.activeRoom.participants.size > 0) {
            const participant = this.activeRoom.participants.values()?.next()?.value;
            this.setRemoteParticipant(participant);
        }
    }

    private setRemoteParticipant(participant: RemoteParticipant) {
        this.remoteParticipant = participant;
        if (participant) {
            this.registerParticipantEvents(participant);
        }
    }

    private registerParticipantEvents(participant: RemoteParticipant) {
        if (participant) {
            participant.tracks.forEach(publication => this.subscribe(publication));
            participant.on('trackPublished', publication => this.subscribe(publication));
            participant.on('trackUnpublished',
                publication => {
                    if (publication && publication.track) {
                        this.detachRemoteTrack(publication.track);
                    }
                });
        }
    }

    private subscribe(publication: RemoteTrackPublication | any) {
        if (publication && publication.on) {
            publication.on('subscribed', track => this.attachRemoteTrack(track));
            publication.on('unsubscribed', track => this.detachRemoteTrack(track));
        }
    }

    private attachRemoteTrack(track: RemoteTrack) {
        if (RemoteHelpers.isAttachable(track)) {
            const element = track.attach();
            this.renderer.data.id = track.sid;
            this.renderer.setStyle(element, 'width', '100%');
            this.renderer.appendChild(this.participantContainer.nativeElement, element);

        }
    }

    private detachRemoteTrack(track: RemoteTrack) {
        if (RemoteHelpers.isDetachable(track)) {
            track.detach().forEach(el => el.remove());
        }
    }
}
