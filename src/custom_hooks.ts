import { useEffect, useRef } from "react";

// the start of the array is the oldest snapshot, the end of the array is the most recent snapshot
// does not work with reference variables.
export function useHistory<T>(value: T, historySize: number): T[] | undefined {
	const ref = useRef<T[]>([value]);
	useEffect(() => {
		if (ref.current.length > historySize){
			ref.current.shift();
		}
		ref.current = [...ref.current, value]; // Update ref to new value after render
	}, [value]);
	return ref.current; // Returns the old value before the update
}