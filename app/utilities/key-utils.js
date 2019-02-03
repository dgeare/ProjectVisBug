const defaults = {
  up : 'up',
  left : 'left',
  down : 'down',
  right : 'right'
}

export const makeKeyUtils = (keys = defaults) => ({
	keyEvents : (iterator, add, {includeOriginal = true, asArray = false} = {}) => {
    if(!Array.isArray(add)){
      add = [add]
    }else{
      //return iterator.reduce((acc, cur) => acc + `,${cur},${cur}+${add}`,"").substring(1)
    }
    const joiners = deriveCombinations(add);
    let result = iterator.reduce((acc, item) => {
      return acc.concat(joiners.map(val => item + "+" + val));
    }, []);
    if(includeOriginal){
      result = iterator.concat(result);
    }
    if(asArray) return result;
    return result.join(',');
	},
	arrows : ["up","right","down","left"]
})
// export default _makeKeyUtils;
// export makeKeyUtils;



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

const deriveCombinations = (arr) => {
  let result = [];
  for(let i = 1; i <= arr.length; i++){
      result = result.concat(chooseN(arr, arr.length + (i - arr.length)));
  }
  return result;
}
