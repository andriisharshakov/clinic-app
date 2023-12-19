import { AppConsts } from "@shared/AppConsts";
import { ILibraryEntryDto } from "@shared/service-proxies/service-proxies";

export interface LibraryEntryWithVideoSource extends ILibraryEntryDto {
    videoSourceUrls?: Plyr.Source[];
    posterImage: string;
}

export function getLibraryEntryVideoSource(libraryEntry: ILibraryEntryDto) {
    return [{
        title: libraryEntry.title,
        src: `${AppConsts.remoteServiceBaseUrl}/download/${libraryEntry.blobName}`
    }];
}