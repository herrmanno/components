CFW.register({

	name: "App",

	requires: ["TodoBox"],

	html: "<TodoBox/>",

	properties: ["username"],

	init: function() {
		this.username = this.username || "Guest";
	},
});
