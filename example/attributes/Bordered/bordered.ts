/// <reference path="../../dist/d.ts/attribute.d.ts"/>

class Bordered extends ho.components.Attribute {

	update():void {
		this.element.style.border = '2px dashed orange';
	}
}
