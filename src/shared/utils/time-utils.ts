
import { memoize } from 'lodash';
import * as moment from 'moment';

export function toUtcDate(date: Date): moment.Moment {
    let year = date.getUTCFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let str = `${year}-${month}-${day}`;
    return moment.utc(str, 'YYYY-MM-DD');
}

export const getTimezonesList = memoize(() => {
    const names = moment.tz.names();
    const zones = names.map(x => moment.tz.zone(x));
    return zones;
});

export function userTzNow() {
    let now = moment(new Date(abp.clock.now()));
    if (isCurrentProviderUtc()) {
        now = now.utc();
    }
    return now;
}

export function isCurrentProviderUtc() {
    return abp.clock.provider === abp.timing.utcClockProvider;
}

export function getTimeInUserTz(date: moment.MomentInput | Date) {
    return moment(abp.timing.convertToUserTimezone(moment(date).toDate()));
}
