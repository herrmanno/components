
module ho.components.temp {
		var c: number = -1;
		var data: any[] = [];

		export function set(d: any): number {
			c++;
			data[c] = d;
			return c;
		}

		export function get(i: number): any {
			return data[i];
		}

		export function call(i: number, ...args): void {
			data[i](...args);
		}
}
