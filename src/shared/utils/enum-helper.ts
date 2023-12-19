import { Injectable } from "@angular/core";

@Injectable()
export class EnumOptionsWrap {
    private _keys: number[] = null;

    /**
     * Usage: <option *ngFor="let k of enumRef.keys" [ngValue]="k">{{l(enumRef.v(k))}}</option>
     * @param enumRef Enum type object
     */
    constructor(private enumRef: any) {
        this._keys = Object.keys(enumRef).map(x => parseInt(x)).filter(x => !isNaN(x));
    }

    get keys() {
        return this._keys;
    }

    get ref() {
        return this.enumRef;
    }

    v(key: number) { // short from value
        return this.enumRef[key];
    }
}
