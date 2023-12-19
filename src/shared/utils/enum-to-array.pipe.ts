import { Pipe, PipeTransform } from "@angular/core";
import { EnumOptionsWrap } from "./enum-helper";

@Pipe({
    name: 'enumToArray'
})
export class EnumToArrayPipe implements PipeTransform {
    transform(value: any): { key: number, value: string }[] {
        const enumOptionsWrap = new EnumOptionsWrap(value);

        return enumOptionsWrap.keys.map(e => {
            return {
                key: e,
                value: enumOptionsWrap.v(e)
            }
        });
    }

}