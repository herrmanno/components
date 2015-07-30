/// <reference path="../../dist/d.ts/attribute.d.ts"/>

class Bind extends ho.components.WatchAttribute {

	init() {
		switch(this.element.tagName) {
			case 'INPUT':
				this.bindInput();
				break;
			default: throw `Bind: unsupported element ${this.element.tagName}`;
		}
	}

	private bindInput() {
		this.element.onkeyup = (e) => {
			this.eval(`${this.value} = '${(<HTMLInputElement>this.element).value}'`);
		}
	}

}
