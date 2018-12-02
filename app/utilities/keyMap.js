const defaults = {
    // mod1 : 'cmd',
    // mod2 : 'shift',
    // mod3 : 'opt',
    plus : '+',
    comma : ','
}
class KeyMapping{
    static get KEYS(){
        return [
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
            "q",
            "r",
            "s",
            "t",
            "u",
            "v",
            "w",
            "x",
            "y",
            "z",
            "comma",
            "up",
            "down",
            "left",
            "right",
            "plus",
            "cmd",
            "shift",
            "alt"
        ];
    }
    constructor(){
        //default to label as value if not in defaults
        for(const key of KeyMapping.KEYS){
            this[key] = defaults[key] || key;
        }
    }

    /**
    * Override default binding by passing in an object {label : value}
    */
    set(opts){
        for(const [label, value] of Object.entries(opts)){
            this[label] = value;
        }
    }
}

export const keyMap = new KeyMapping();