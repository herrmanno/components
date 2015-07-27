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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50c3Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMvY29tcG9uZW50c3Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbImhvIiwiaG8uY29tcG9uZW50cyIsImhvLmNvbXBvbmVudHMuQ29tcG9uZW50UHJvdmlkZXIiLCJoby5jb21wb25lbnRzLkNvbXBvbmVudFByb3ZpZGVyLmNvbnN0cnVjdG9yIiwiaG8uY29tcG9uZW50cy5Db21wb25lbnRQcm92aWRlci5nZXRDb21wb25lbnQiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sRUFBRSxDQWdDUjtBQWhDRCxXQUFPLEVBQUU7SUFBQ0EsSUFBQUEsVUFBVUEsQ0FnQ25CQTtJQWhDU0EsV0FBQUEsVUFBVUEsRUFBQ0EsQ0FBQ0E7UUFFbEJDO1lBQUFDO1lBNEJBQyxDQUFDQTtZQTFCR0Qsd0NBQVlBLEdBQVpBLFVBQWFBLElBQVlBO2dCQUNyQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsT0FBT0EsQ0FBQ0EsVUFBQ0EsT0FBT0EsRUFBRUEsTUFBTUE7b0JBRS9CQSxJQUFJQSxHQUFHQSxHQUFHQSxnQkFBY0EsSUFBSUEsUUFBS0EsQ0FBQ0E7b0JBRWxDQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxjQUFjQSxFQUFFQSxDQUFDQTtvQkFDNUNBLE9BQU9BLENBQUNBLGtCQUFrQkEsR0FBR0E7d0JBQzVCLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDNUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQzs0QkFDaEMsRUFBRSxDQUFBLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUMxQixJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsWUFBWSxHQUFHLElBQUksR0FBSSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUE7Z0NBQ3pFLElBQUksU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO2dDQUN6QyxvQkFBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQ0FDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNqQyxDQUFDOzRCQUFDLElBQUksQ0FBQyxDQUFDO2dDQUNQLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDZCxDQUFDO3dCQUNGLENBQUM7b0JBQ0YsQ0FBQyxDQUFDQTtvQkFFRkEsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQy9CQSxPQUFPQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtnQkFFVkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDUEEsQ0FBQ0E7WUFFTEYsd0JBQUNBO1FBQURBLENBQUNBLEFBNUJERCxJQTRCQ0E7UUE1QllBLDRCQUFpQkEsb0JBNEI3QkEsQ0FBQUE7SUFFTEEsQ0FBQ0EsRUFoQ1NELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBZ0NuQkE7QUFBREEsQ0FBQ0EsRUFoQ00sRUFBRSxLQUFGLEVBQUUsUUFnQ1IiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uY29tcG9uZW50cyB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIENvbXBvbmVudFByb3ZpZGVyIHtcclxuXHJcbiAgICAgICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgY29tcG9uZW50cy8ke25hbWV9LmpzYDtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgeG1saHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgXHRcdFx0eG1saHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgIFx0XHRcdFx0aWYoeG1saHR0cC5yZWFkeVN0YXRlID09IDQpIHtcclxuICAgIFx0XHRcdFx0XHRsZXQgcmVzcCA9IHhtbGh0dHAucmVzcG9uc2VUZXh0O1xyXG4gICAgXHRcdFx0XHRcdGlmKHhtbGh0dHAuc3RhdHVzID09IDIwMCkge1xyXG4gICAgXHRcdFx0XHRcdFx0bGV0IGZ1bmMgPSByZXNwICsgXCJcXG5yZXR1cm4gIFwiICsgbmFtZSArICBcIlxcbi8vI3NvdXJjZVVSTD1cIiArIGxvY2F0aW9uLm9yaWdpbiArICcvJyArICd1cmw7J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGNvbXBvbmVudCA9IG5ldyBGdW5jdGlvbihcIlwiLCBmdW5jKSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQ29tcG9uZW50LnJlZ2lzdGVyKGNvbXBvbmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3ApO1xyXG4gICAgXHRcdFx0XHRcdH0gZWxzZSB7XHJcbiAgICBcdFx0XHRcdFx0XHRyZWplY3QocmVzcCk7XHJcbiAgICBcdFx0XHRcdFx0fVxyXG4gICAgXHRcdFx0XHR9XHJcbiAgICBcdFx0XHR9O1xyXG5cclxuICAgIFx0XHRcdHhtbGh0dHAub3BlbignR0VUJywgdXJsLCB0cnVlKTtcclxuICAgIFx0XHRcdHhtbGh0dHAuc2VuZCgpO1xyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn1cclxuIl19