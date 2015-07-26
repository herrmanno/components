	var CFWOptions = function(opt) {
		opt = opt || {};

		this.renderer = opt.renderer || CFWRenderer();

		this.componentProvider = opt.componentProvider || function(name) {
			var p = new Promise();

			CFW.loadingComponents[name] = p;

			var src = 'components/'+name+'.js';

			var script = document.createElement('script');
			script.setAttribute('src', src);
			script.async = false;
			script.onerror = function(e) {
				p.reject("failed to load script '"+src+"'");
			};

			document.head.appendChild(script);

			return p;
		};

		this.htmlProvider = opt.htmlProvider || function(name) {
			var p = new Promise();

			var url = 'components/'+name+'.html';

			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {
				if(xmlhttp.readyState == 4) {
					var resp = xmlhttp.responseText;
					if(xmlhttp.status == 200) {
						p.resolve(resp);
					} else {
						p.reject(resp);
					}
				}
			};

			xmlhttp.open('GET', url, true);
			xmlhttp.send();

			return p;
		};

	};
