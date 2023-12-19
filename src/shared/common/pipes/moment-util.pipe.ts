import { PipeTransform, Pipe } from '@angular/core';
import { getTimeInUserTz } from '@shared/utils/time-utils';

@Pipe({ name: 'userTzMoment', pure: false })
export class UserTimeZoneMoment implements PipeTransform {
    transform(value: moment.MomentInput | Date) {
        return getTimeInUserTz(value);
    }
}

@Pipe({ name: 'mToNow' })
export class MomentToNow implements PipeTransform {
    transform(value: moment.Moment, withoutPrefix = false) {
        return value.toNow(withoutPrefix);
    }
}

@Pipe({ name: 'mFromNow' })
export class MomentFromNow implements PipeTransform {
    transform(value: moment.Moment, withoutPrefix = false) {
        return value.fromNow(withoutPrefix);
    }
}
