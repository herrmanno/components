/// <reference path="../../../bower_components/ho-promise/dist/promise.d.ts"/>
/// <reference path="../../../bower_components/ho-classloader/dist/classloader.d.ts"/>
/// <reference path="../../../bower_components/ho-watch/dist/watch.d.ts"/>

module ho.components {
	export function run(): ho.promise.Promise<any, any> {
		return ho.components.registry.instance.run();
	}

	export function register(c: typeof Component | typeof Attribute): void {
		ho.components.registry.instance.register(c);
	}

}
