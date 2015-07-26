var ho;
(function (ho) {
    var components;
    (function (components) {
        var ComponentProvider = (function () {
            function ComponentProvider() {
            }
            ComponentProvider.prototype.getComponent = function (name) {
                return new Promise(function (resolve, reject) {
                    var url = "components/" + name + ".js";
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            var resp = xmlhttp.responseText;
                            if (xmlhttp.status == 200) {
                                var func = resp + "\nreturn  " + name + "\n//#sourceURL=" + location.origin + '/' + 'url;';
                                var component = new Function("", func)();
                                components.Component.register(component);
                                resolve(resp);
                            }
                            else {
                                reject(resp);
                            }
                        }
                    };
                    xmlhttp.open('GET', url, true);
                    xmlhttp.send();
                });
            };
            return ComponentProvider;
        })();
        components.ComponentProvider = ComponentProvider;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50c3Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMvY29tcG9uZW50c3Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbImhvIiwiaG8uY29tcG9uZW50cyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50UHJvdmlkZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudFByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sRUFBRSxDQWdDUjtBQWhDRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0FnQ25CQTtJQWhDU0EsV0FBQUEsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFFbEJDO1lBQUFDO1lBNEJBQyxDQUFDQTtZQTFCR0Qsd0NBQVlBLEdBQVpBLFVBQWFBLElBQVlBO2dCQUNyQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7b0JBRS9CQSxJQUFJQSxHQUFHQSxHQUFHQSxnQkFBY0EsSUFBSUEsUUFBS0EsQ0FBQ0E7b0JBRWxDQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtvQkFDNUNBLE9BQU9BLENBQUNBLGtCQUFrQkEsR0FBR0E7d0JBQzVCLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDNUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQzs0QkFDaEMsRUFBRSxDQUFBLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUMxQixJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsWUFBWSxHQUFHLElBQUksR0FBSSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUE7Z0NBQ3pFLElBQUksU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO2dDQUN6QyxvQkFBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQ0FDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNqQyxDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDZCxDQUFDO3dCQUNGLENBQUM7b0JBQ0YsQ0FBQyxDQUFDQTtvQkFFRkEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQy9CQSxPQUFPQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFFVkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDUEEsQ0FBQ0E7WUFFTEYsd0JBQUNBO1FBQURBLENBQUNBLEFBNUJERCxJQTRCQ0E7UUE1QllBLDRCQUFpQkEsb0JBNEI3QkEsQ0FBQUE7SUFFTEEsQ0FBQ0EsRUFoQ1NELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBZ0NuQkE7QUFBREEsQ0FBQ0EsRUFoQ00sRUFBRSxLQUFGLEVBQUUsUUFnQ1IiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uY29tcG9uZW50cyB7XG5cbiAgICBleHBvcnQgY2xhc3MgQ29tcG9uZW50UHJvdmlkZXIge1xuXG4gICAgICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICBsZXQgdXJsID0gYGNvbXBvbmVudHMvJHtuYW1lfS5qc2A7XG5cbiAgICAgICAgICAgICAgICBsZXQgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIFx0XHRcdHhtbGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgXHRcdFx0XHRpZih4bWxodHRwLnJlYWR5U3RhdGUgPT0gNCkge1xuICAgIFx0XHRcdFx0XHRsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xuICAgIFx0XHRcdFx0XHRpZih4bWxodHRwLnN0YXR1cyA9PSAyMDApIHtcbiAgICBcdFx0XHRcdFx0XHRsZXQgZnVuYyA9IHJlc3AgKyBcIlxcbnJldHVybiAgXCIgKyBuYW1lICsgIFwiXFxuLy8jc291cmNlVVJMPVwiICsgbG9jYXRpb24ub3JpZ2luICsgJy8nICsgJ3VybDsnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudCA9IG5ldyBGdW5jdGlvbihcIlwiLCBmdW5jKSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbXBvbmVudC5yZWdpc3Rlcihjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcCk7XG4gICAgXHRcdFx0XHRcdH0gZWxzZSB7XG4gICAgXHRcdFx0XHRcdFx0cmVqZWN0KHJlc3ApO1xuICAgIFx0XHRcdFx0XHR9XG4gICAgXHRcdFx0XHR9XG4gICAgXHRcdFx0fTtcblxuICAgIFx0XHRcdHhtbGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICBcdFx0XHR4bWxodHRwLnNlbmQoKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cblxufVxuIl19