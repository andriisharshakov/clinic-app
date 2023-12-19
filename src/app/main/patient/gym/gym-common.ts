import { TherapistDto } from "@shared/service-proxies/service-proxies";
import { ILibraryEntryDto } from "@shared/service-proxies/service-proxies";

export class GroupedPrescription {
    therapist?: TherapistDto;
    prescriptions?: LibraryEntryWithPrescription[];
}

export interface LibraryEntryWithPrescription extends ILibraryEntryDto {
    videoSourceUrls?: Plyr.Source[];
    posterImage: string;
    prescription: string;
}