import { useEffect, useRef } from "react";

// the start of the array is the newest snapshot, the end of the array is the oldest snapshot
// does not work with reference variables.
export function useHistory<T>(value: T, historySize: number): T[] | undefined {
	const ref = useRef<T[]>([value]);
	useEffect(() => {
		ref.current = [value, ...ref.current]; // Update ref to new value after render
		if (ref.current.length > historySize){
			ref.current.pop();
		}
	}, [value]);
	return ref.current; // Returns the old value before the update
}