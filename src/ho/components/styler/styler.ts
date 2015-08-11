module ho.components.styler {

	export interface IStyler {
		applyStyle(component: Component, css?: string): void
	}

	interface StyleBlock {
		selector: string;
		rules: Array<StyleRule>;
	}

	interface StyleRule {
		property: string;
		value: string;
	}

	class Styler implements IStyler {
		public applyStyle(component: Component, css = component.style): void {
			let style = this.parseStyle(component.style);
			style.forEach(s => {
				this.applyStyleBlock(component, s);
			});
		}

		protected applyStyleBlock(component: Component, style: StyleBlock): void {
			if(style.selector.trim().toLowerCase() === 'this') {
				style.rules.forEach(r => {
					this.applyRule(component.element, r);
				});
			}
			else {
				Array.prototype.forEach.call(component.element.querySelectorAll(style.selector), el => {
					style.rules.forEach(r => {
						this.applyRule(el, r);
					});
				});
			}
		}

		protected applyRule(element: HTMLElement, rule: StyleRule): void {
			let prop = rule.property.replace(/-(\w)/g, (_, letter: string) => {
				return letter.toUpperCase();
			}).trim();
			element.style[prop] = rule.value;
		}

		protected parseStyle(css: string): Array<StyleBlock> {
			let r = /(.+?)\s*{(.*?)}/gm;
			let r2 = /(.+?)\s?:(.+?);/gm;
			css = css.replace(/\n/g, '');
			let blocks: StyleBlock[] = (<string[]>css.match(r) || [])
				.map(b => {
					if(!b.match(r))
						return null;

					let [_, selector, _rules] = r.exec(b);
					let rules: StyleRule[] = (<string[]>_rules.match(r2) || [])
						.map(r => {
							if(!r.match(r2))
								return null;

							let [_, property, value] = r2.exec(r);
							return {property, value};
						})
						.filter(r => {
							return r !== null;
						});
					return {selector, rules};
				})
				.filter(b => {
					return b !== null;
				});


			return blocks;
		}
	}

	export let instance: IStyler = new Styler();
}
