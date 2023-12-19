import { Directive, HostListener, Injector, Input } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { CreateFriendshipRequestInput, FriendshipServiceProxy, FriendshipState } from "@shared/service-proxies/service-proxies";

@Directive({
    selector: '[app-init-chat]'
})
export class InitChatDirective extends AppComponentBase {
    @Input('app-init-chat') correspondent: { id: number, isFriendOfSessionUser: boolean };

    constructor(
        injector: Injector,
        private _friendshipService: FriendshipServiceProxy,
    ) {
        super(injector);
    }

    @HostListener('click')
    initChat() {
        if (this.correspondent.isFriendOfSessionUser) {
            this.toggleChat(this.correspondent.id);
        } else {
            const requestInput = new CreateFriendshipRequestInput({
                userId: this.correspondent.id,
                tenantId: this.appSession.tenantId,
            });
            this._friendshipService.getOrCreateFriendshipRequest(requestInput).subscribe((friend) => {
                if (friend.state === FriendshipState.Accepted) {
                    this.correspondent.isFriendOfSessionUser = true;
                    this.toggleChat(friend);
                } else {
                    this.notify.warn("Something went wrong when trying to init chat dialog.");
                }
            });
        }
    }
    
    private toggleChat(friend: number | { friendUserId: number, friendTenantId: number }) {
        if (typeof friend === 'number') {
            friend = {
                friendUserId: friend,
                friendTenantId: this.appSession.tenantId,
            };
        }
        abp.event.trigger('app.chat.chatbarToggled', {
            targetUserId: friend.friendUserId,
            targetTenantId: friend.friendTenantId
        });
    }
}