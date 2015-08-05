/// <reference path="../../dist/d.ts/attribute.d.ts"/>
/// <reference path="../../bower_components/ho-watch/dist/d.ts/watch.d.ts"/>

class Disable extends ho.components.WatchAttribute {

	update() {
		let v = this.eval(this.value);
		this.element.hidden = !!v
	}
}
