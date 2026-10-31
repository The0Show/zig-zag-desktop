type ConVarOnChangeFunction<T> = (newValue: T, oldValue: T) => void | boolean;

type ConVarStoreFunction = (cvar: ConVar<any>, value: any) => boolean;
type ConVarRestoreFunction = (cvar: ConVar<any>) => any;
type ConVarResetFunction = (cvar: ConVar<any>) => any;

export enum FCVarFlags {
    /**
     * Does nothing. Very exciting.
     */
    FCVAR_NONE = 0,
    /**
     * Stores the ConVar in local storage.
     */
    FCVAR_ARCHIVE = 1,
    /**
     * Disables automatic saving.
     */
    FCVAR_ARCHIVE_MANUAL = 2,
    /**
     * Prevents browser DevTools from writing the ConVar.
     */
    FCVAR_READONLY = 4,
    /**
     * Hides the FCVar from browser DevTools in production.
     * **DOES NOT REMOVE FROM COMPILATION**
     */
    FCVAR_DEVELOPMENTONLY = 8,
    /**
     * Sends the value of this ConVar to clients when changed.
     *
     * This also makes the ConVar server authoritative.
     */
    FCVAR_REPLICATE = 16
}

export const FCVarRegistry = new Map<string, FCVar>();
export const ConVarRegistry = new Map<string, ConVar<any>>();

class FCVar {
    readonly varName: string;
    readonly flags: FCVarFlags = 0;

    constructor(pName: string, pFlags: FCVarFlags | FCVarFlags[]) {
        this.varName = pName;
        FCVarRegistry.set(this.varName, this);

        if (Array.isArray(pFlags)) {
            for (let index = 0; index < pFlags.length; index++) {
                const flag = pFlags[index];

                this.flags = this.flags | flag;
            }
        } else {
            this.flags = pFlags;
        }

        console.debug(`${this.varName} ${this.flags}`);
    }

    hasFlag(flag: FCVarFlags) {
        return (this.flags & flag) > 0;
    }
}

export class ConVar<T> extends FCVar {
    static storeFunction: ConVarStoreFunction;
    static restoreFunction: ConVarRestoreFunction;
    static resetFunction: ConVarResetFunction;

    private _value: T;
    private readonly _defaultValue: T;
    private readonly _onChange: ConVarOnChangeFunction<T> | undefined;

    private _temporaryValue: T;

    set temporaryValue(p_val: T) {
        if (p_val == null) {
            this._onChange(this._value, this._temporaryValue);
            this._temporaryValue = null;
        } else {
            this._onChange(p_val, this.value);
            this._temporaryValue = p_val;
        }
    }

    get isDirty() {
        return this._value != this._defaultValue;
    }

    get value() {
        return this._temporaryValue || this._value;
    }

    reset() {
        ConVar.resetFunction(this);
        this._value = this._defaultValue;
    }

    storeCVar() {
        ConVar.storeFunction(this, this._value);
    }

    restoreCVar() {
        // let restoredValue = null;

        // const entry = window.localStorage.getItem(this.varName);
        // if (entry) {
        //     const type = entry[0];

        //     switch (type) {
        //         case "0":
        //             restoredValue = entry.slice(1);
        //             break;

        //         case "1":
        //             restoredValue = Number(entry.slice(1));
        //             break;

        //         case "2":
        //             restoredValue = BigInt(entry.slice(1));
        //             break;

        //         case "3":
        //             restoredValue = true;
        //             break;

        //         case "4":
        //             restoredValue = false;
        //             break;

        //         case "5":
        //             restoredValue = Symbol(entry.slice(1));
        //             break;

        //         case "6":
        //             restoredValue = JSON.parse(entry.slice(1));
        //             break;

        //         default:
        //             restoredValue = null;
        //             break;
        //     }
        // }

        // if (restoredValue == null) return console.warn(`Restored value for CVAR ${this.varName} is <null>, ignoring`);
        // if (typeof restoredValue != typeof this.value) return console.warn(`Restored value for CVAR ${this.varName} has mismatched type, ignoring`);

        // this._value = restoredValue;
        const restored = ConVar.restoreFunction(this);
        if (restored != null) {
            this._value = restored;
        }
    }

    set value(v: T) {
        if (typeof v != typeof this._value) {
            console.warn(`[${this.varName}] Type mismatch (${typeof v} => ${typeof this._value})! Attempting to cast...`);

            switch (typeof this._value) {
                case "bigint":
                    v = BigInt(v as any) as T;
                    break;
                case "boolean":
                    v = Boolean(v == "true" || v == "t" || v == "yes" || v == "y" || parseInt(v as any) > 0) as T;
                    break;
                case "number":
                    v = parseFloat(v as any) as T;
                    break;
                case "string":
                    v = `${v}` as T;
                    break;

                default:
                    console.warn(`[${this.varName}] Failed to cast (${typeof v} => ${typeof this._value}), I hope you know what you're doing!`);
                    break;
            }
        }

        if (this._onChange) {
            this._onChange(v, this._value);
        }

        this._value = v;

        if (this.hasFlag(FCVarFlags.FCVAR_ARCHIVE) && !this.hasFlag(FCVarFlags.FCVAR_ARCHIVE_MANUAL)) this.storeCVar();
    }

    constructor(pName: string, pDefaultValue: T, pFlags: FCVarFlags | FCVarFlags[] = FCVarFlags.FCVAR_NONE, pOnChange?: ConVarOnChangeFunction<T>) {
        super(pName, pFlags);
        this._value = pDefaultValue;
        this._defaultValue = pDefaultValue;
        this._onChange = pOnChange;

        ConVarRegistry.set(pName, this);

        // NOTE: restoring is not possible on servers
        if (this.hasFlag(FCVarFlags.FCVAR_ARCHIVE)) {
            this.restoreCVar();
        }
    }
}
