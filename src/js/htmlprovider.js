var ho;
(function (ho) {
    var components;
    (function (components) {
        var HtmlProvider = (function () {
            function HtmlProvider() {
            }
            HtmlProvider.prototype.getHTML = function (name) {
                return new Promise(function (resolve, reject) {
                    var url = "components/" + name + ".html";
                    var xmlhttp = new XMLHttpRequest();
                    xmlhttp.onreadystatechange = function () {
                        if (xmlhttp.readyState == 4) {
                            var resp = xmlhttp.responseText;
                            if (xmlhttp.status == 200) {
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
            return HtmlProvider;
        })();
        components.HtmlProvider = HtmlProvider;
    })(components = ho.components || (ho.components = {}));
})(ho || (ho = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbHByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMvaHRtbHByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbImhvIiwiaG8uY29tcG9uZW50cyIsImhvLmNvbXBvbmVudHMuSHRtbFByb3ZpZGVyIiwiaG8uY29tcG9uZW50cy5IdG1sUHJvdmlkZXIuY29uc3RydWN0b3IiLCJoby5jb21wb25lbnRzLkh0bWxQcm92aWRlci5nZXRIVE1MIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFPLEVBQUUsQ0E2QlI7QUE3QkQsV0FBTyxFQUFFO0lBQUNBLElBQUFBLFVBQVVBLENBNkJuQkE7SUE3QlNBLFdBQUFBLFVBQVVBLEVBQUNBLENBQUNBO1FBRWxCQztZQUFBQztZQXlCQUMsQ0FBQ0E7WUF2QkdELDhCQUFPQSxHQUFQQSxVQUFRQSxJQUFZQTtnQkFDaEJFLE1BQU1BLENBQUNBLElBQUlBLE9BQU9BLENBQUNBLFVBQUNBLE9BQU9BLEVBQUVBLE1BQU1BO29CQUUvQkEsSUFBSUEsR0FBR0EsR0FBR0EsZ0JBQWNBLElBQUlBLFVBQU9BLENBQUNBO29CQUVwQ0EsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsY0FBY0EsRUFBRUEsQ0FBQ0E7b0JBQzVDQSxPQUFPQSxDQUFDQSxrQkFBa0JBLEdBQUdBO3dCQUM1QixFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzVCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7NEJBQ2hDLEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQ0FDUixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ2pDLENBQUM7NEJBQUMsSUFBSSxDQUFDLENBQUM7Z0NBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNkLENBQUM7d0JBQ0YsQ0FBQztvQkFDRixDQUFDLENBQUNBO29CQUVGQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDL0JBLE9BQU9BLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO2dCQUVWQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNQQSxDQUFDQTtZQUVMRixtQkFBQ0E7UUFBREEsQ0FBQ0EsQUF6QkRELElBeUJDQTtRQXpCWUEsdUJBQVlBLGVBeUJ4QkEsQ0FBQUE7SUFFTEEsQ0FBQ0EsRUE3QlNELFVBQVVBLEdBQVZBLGFBQVVBLEtBQVZBLGFBQVVBLFFBNkJuQkE7QUFBREEsQ0FBQ0EsRUE3Qk0sRUFBRSxLQUFGLEVBQUUsUUE2QlIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUgaG8uY29tcG9uZW50cyB7XG5cbiAgICBleHBvcnQgY2xhc3MgSHRtbFByb3ZpZGVyIHtcblxuICAgICAgICBnZXRIVE1MKG5hbWU6IHN0cmluZyk6IFByb21pc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIGxldCB1cmwgPSBgY29tcG9uZW50cy8ke25hbWV9Lmh0bWxgO1xuXG4gICAgICAgICAgICAgICAgbGV0IHhtbGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICBcdFx0XHR4bWxodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIFx0XHRcdFx0aWYoeG1saHR0cC5yZWFkeVN0YXRlID09IDQpIHtcbiAgICBcdFx0XHRcdFx0bGV0IHJlc3AgPSB4bWxodHRwLnJlc3BvbnNlVGV4dDtcbiAgICBcdFx0XHRcdFx0aWYoeG1saHR0cC5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwKTtcbiAgICBcdFx0XHRcdFx0fSBlbHNlIHtcbiAgICBcdFx0XHRcdFx0XHRyZWplY3QocmVzcCk7XG4gICAgXHRcdFx0XHRcdH1cbiAgICBcdFx0XHRcdH1cbiAgICBcdFx0XHR9O1xuXG4gICAgXHRcdFx0eG1saHR0cC5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgIFx0XHRcdHhtbGh0dHAuc2VuZCgpO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG59XG4iXX0=