/// <reference path="../../../dist/components.d.ts"/>

class Centered extends ho.components.Attribute {

	private margin: number;

	constructor(element, value = "50") {
		super(element, value);
		this.margin = (100 - Number(this.value)) / 2;
	}

	update() {
		this.element.style.display = 'block';
		this.element.style.margin = 'auto';
		this.element.style.width = `${this.value}%`;
	}
}
