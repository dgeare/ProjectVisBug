//@todo extract defaults into a helper lib and include all common keys
const defaults = {
  up : 'up',
  left : 'left',
  down : 'down',
  right : 'right'
}

/**
 * Factory function which returns a keys utility. Dependency injects a mapping object to specify
 * user/env preferences.
 *
 * The returned Object has a method: keyUtils.keyEvents(items, combine, opts) where items is an array
 * of strings, combine is a string or array of strings to join with each elements in items, and opts is an object
 * specifying behaviors. By default the return of the method is an array of combined strings.
 *
 * If an array of strings is passed as the second argument, all combinations of those strings (joined with the '+' symbol)
 * will be concatenated with each element of items. This matches the current usage pattern where shift & cmd need to be concatenated
 * to items both individually, and in concert. Eg:
 * keyUtils(["up","down"],["alt","shift"]) => "up,up+alt,up+shift,up+shift+alt,down,down+alt,down+shift,down+shift+alt"
 * keyUtils(["up","down"],"shift") => "up,up+shift,down,down+shift"
 *
 * Options: {
 *  includeOriginal : (default:true) whether to include items passed in the first argument as part of the result
 *  asString : (default:false) whether to join the result array into a comma separated string for output
 * }
 *
 * The returned Object also had an "arrows" property as a shorthand to specify all 4 directions.
 *
 * The returned Object is proxied to allow for retrieval of any property of the keyMap injected in the factory function
 * to be returned as a property of the object.
 *
 * @param {Object} keys Overriding map for the keymap object
 */
export const makeKeyUtils = (keys = defaults) => {
	class kUtil{
        keyEvents(iterator = [], add = [], {includeOriginal = true, asString = false} = {}){
			if(!Array.isArray(add)){
				add = [add];
			}
			const joiners = deriveCombinations(add);
			let result = iterator.reduce((acc, item) => {
				return acc.concat(joiners.map(val => item + "+" + val));
			}, []);
			if(includeOriginal){
				result = iterator.concat(result);
			}
			if(asString)
				return result.join(',');
			return result;
		}

    	get arrows(){
			return ["up","right","down","left"].map((k) => keys[k] || k)
		}
	}

	//proxy the object to map to dep injected keys object. If not found return the requested property as a string
	let proxy = new Proxy(new kUtil(), {
		get: (target, property, receiver) => {
			return target[property] || keys[property] || property;
		}
	})
	return proxy;
}


/**
 * Returns an array of all unordered permutations of ways to choose N from a given array
 * with elements concatenated with the '+' symbol.
 * Examples:
 * ["a","b","c"], 2 = ["a+b","a+c","b+c"]
 * ["a","b","c"], 3 = ["a+b+c"]
 *
 * @param {Array} arr Array of items to choose from
 * @param {Number} n Integer number of items to choose
 */
const chooseN = (arr, n) => {
	if(n <= 1) return arr;
	let newArr = [];
	while(arr.length > n - 1){
		let [first,...rest] = arr;
		arr = rest;
		let t = chooseN(rest, n-1);
		t.forEach((item) => {
			newArr.push(first + "+" + item);
		});
	}
	return newArr;
}

/**
 * Computes and returns an array of all possible combinations of the array elements in the form of "firstElement+secondElement"
 * where each possible grouping of elements is joined as a string with a '+' between
 * Examples:
 * ["a","b"] = ["a","b","a+b"]
 * ["a","b","c"] = ["a","b","c","a+b","a+c","b+c","a+b+c"]
 * ["a","b","c","d"] = ["a","b","c","d","a+b","a+c","a+d","b+c","b+d,"c+d","a+b+c","a+b+d","a+c+d","b+c+d","a+b+c+d"]
 *
 * Honestly I know this reads as overkill, but I think that this is needed to preserve the intuition of how the
 * keyEvents method's second argument behaves. As of the time of creation, only 2 arguments are required, but the
 * object consumer could have the reasonable expectation that more than two could be passed, and that the resulting output
 * would the the combination of all three elements with each of the items of the first argument.
 *
 * @param {String[]} arr Array to derive the combinations of
 */
const deriveCombinations = (arr) => {
  let result = [];
  for(let i = 1; i <= arr.length; i++){
      result = result.concat(chooseN(arr, arr.length + (i - arr.length)));
  }
  return result;
}
