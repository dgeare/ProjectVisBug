const chars = ["q","w","e","r","t","y","u","i","o","p","a","s","d","f","g","h","j","k","l","z","x","c","v","b","n","m","[","]","\\",";","'",",",".","/","tab","shift","cmd","alt","up","down","left","right"];

const _keyDefaults = {};
chars.forEach(char => _keyDefaults[char] = char);

export const keyDefaults = _keyDefaults;

export const mergeDefaults = overrides => {
	const ret = _keyDefaults;
	for(const k in overrides){
		ret[k] = overrides[k];
	}
	return ret;
}
