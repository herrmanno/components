CFW.register({

	name: "MyHeader",

	requires: ["InnerHTML"],

	html: "<div style='color:red;'><InnerHTML selector='h1'></InnerHTML></div><InnerHTML selector='h3'></InnerHTML>",

	properties: [],

	init: function() {
	},

});
