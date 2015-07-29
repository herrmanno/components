/// <reference path="../../dist/d.ts/attribute.d.ts"/>

class Centered extends ho.components.Attribute {

	private margin: number;

	constructor(element, value = "50") {
		super(element, value);
		this.margin = (100 - Number(this.value)) / 2;
	}

	update() {
		this.element.style.position = 'relative';
		this.element.style.left = `${this.margin}%`;
		this.element.style.width = `${this.value}%`;
	}
}
