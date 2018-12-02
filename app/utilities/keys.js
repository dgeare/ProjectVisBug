import { keyMap } from './keyMap.js';

/**
 * API for keys. Return a new string builder with a property for each key which adds
 * the key to a queue and returns a reference to self.
 * Uses the keyMap to map environment/user preference overrides to the app namespace.
 * 
 * Example:
 * keys().cmd.plus.up.string(); //returns "cmd+up"
 * 
 * `${keys().cmd.plus.up}`; //returns "cmd+up"
 * 
 * keys().up.down.left.right.array(); //returns ["up","down","left","right"]
 * 
 * Options:
 *   spaces - join keys with a space character
 * @param {Object} opts options for formatting
 */
export const keys = function(opts = {}){
    let inner = {
        __queue : []
    };
    keyMap.constructor.KEYS.forEach(key => {
        Object.defineProperty(
            inner,
            key,
            {
                get : function(){
                    inner.__queue.push(keyMap[key]);//add to queue
                    return inner;//return self reference for chaining
                }
            }
        );
    });
    /**
     * U/X nicety. If used in a string context, just return the string
     */
    inner.toString = function(){
        return this.__queue.reduce((acc,cur) => acc + (opts.spaces ? " ": "") + cur);
    }

    //explicit means of ending the chaining
    inner.string = () => inner.toString()
    inner.array = () => inner.__queue;

    return inner;
};
