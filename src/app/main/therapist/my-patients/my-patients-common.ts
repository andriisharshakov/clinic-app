import { IPatientDto, IPatientLibraryEntryDto, LibraryEntryDto } from "@shared/service-proxies/service-proxies";

export interface MyPatientWithPictureUrl extends IPatientDto {
    profilePictureUrl?: string;
}

export class PatientPrescription implements IPatientLibraryEntryDto {
    id: number;
    prescription: string | undefined;
    libraryEntry: LibraryEntryDto;
    isSelected: boolean;
}