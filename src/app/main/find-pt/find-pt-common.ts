import { ITherapistDto } from '@shared/service-proxies/service-proxies';

export interface ThrerapistWithPictureUrl extends ITherapistDto {
    profilePictureUrl?: string;
}

export function getTherapistFullName(therapist: ITherapistDto) {
    return `${therapist.name} ${therapist.surname}`;
}
