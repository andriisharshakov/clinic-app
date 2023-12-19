import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'userTimeFormat' })
export class UserTimeFormatPipe implements PipeTransform {
    transform(value: moment.MomentInput | Date, format: string) {
        if (!value) {
            return '';
        }

        return moment(abp.timing.convertToUserTimezone(moment(value).toDate())).format(format);
    }
}
