/// <reference path="../../bower_components/ho-watch/dist/d.ts/watch.d.ts"/>
/// <reference path="../../bower_components/ho-promise/dist/d.ts/promise.d.ts"/>

module ho.components {

	import Promise = ho.promise.Promise;

	/**
		Baseclass for Attributes.
		Used Attributes needs to be specified by Component#attributes property to get loaded properly.
	*/
	export class Attribute {

		protected element: HTMLElement;
		protected component: Component;
		protected value: string;

		constructor(element: HTMLElement, value?: string) {
			this.element = element;
			this.component = Component.getComponent(element);
			this.value = value;

			this.init();
		}

		protected init(): void {}

		get name() {
			return Attribute.getName(this);
		}


		public update(): void {

		}


		static getName(clazz: typeof Attribute | Attribute): string {
            if(clazz instanceof Attribute)
                return clazz.constructor.toString().match(/\w+/g)[1];
            else
                return clazz.toString().match(/\w+/g)[1];
        }
	}

	export class WatchAttribute extends Attribute {

		protected r: RegExp = /#(.+?)#/g;

		constructor(element: HTMLElement, value?: string) {
			super(element, value);

			let m: any[] = this.value.match(this.r) || [];
			m.map(function(w) {
				w = w.substr(1, w.length-2);
				this.watch(w);
			}.bind(this));
			this.value = this.value.replace(/#/g, '');
		}


		protected watch(path: string): void {
			let pathArr = path.split('.');
			let prop = pathArr.pop();
			let obj = this.component;

			pathArr.map((part) => {
				obj = obj[part];
			});

			ho.watch.watch(obj, prop, this.update.bind(this));
		}

		protected eval(path: string): any {
			let model = this.component;
			model = new Function(Object.keys(model).toString(), "return " + path)
				.apply(null, Object.keys(model).map((k) => {return model[k]}) );
			return model;
		}

	}
}
