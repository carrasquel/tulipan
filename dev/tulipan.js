/*!
 * tulipan.js v1.0.0
 * (c) 2020 Nelson Carrasquel
 * Released under the MIT License.
 */

 var StorePlugin = new Object;

 StorePlugin.install = function(TurpialCore) {

    TurpialCore.prototype.$store = store;
 };

 var UnderscorePlugin = new Object;

 UnderscorePlugin.install = function(TurpialCore) {

    TurpialCore.prototype.$_ = _;
 };

 UnderscorePlugin.install = function(TurpialCore) {

    TurpialCore.prototype.$router = new Navigo(null, true, '#!');
 };

var _tulipan = (function() {
    var _apps = new Map();
    var _routes = new Map();

    var _router = new Navigo(null, true, '#!');
    
    function _hideApps(){
        for (const [key, app] of _routes.entries()) {
            app.$set("visibleApp", false);
        }
    }

    function _showApp(_id){
        for (const [key, app] of _routes.entries()) {
            if (key == _id){    
                app.$set("visibleApp", true);
                return;
            }
        }
    }

    function _getApp(el){
        return _apps.get(el);
    }

    function _pushApp(el, app){
        _apps.set(el, app);
    }

    function route(options){
        var _id = options.app.$el.getAttribute("id");
        var app = options.app;

        _apps.set(_id, options.app);
        _routes.set(_id, options.app);
        var route = options.route;

        var router_options = new Object();

        var handler = function(params, query){
            _hideApps();

            if (typeof(options.main) !== "undefined"){
                
                _showApp(options.main.replace("#", ""));

            }
                
            if (query !== "" && typeof(query) !== "undefined"){
                var queryObject = JSON.parse('{"' + query.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
            }
            
            if(typeof(app.before) !== "undefined"){
                app.before(params, queryObject);
            }

            app.$set("visibleApp", true);

            if(typeof(app.after) !== "undefined"){
                app.after(params, queryObject);
            }

        }

        if(typeof(app.leave) !== "undefined"){
            router_options.leave = app.leave;
        }

        _router.on(route, handler, router_options);
    }

    function resolve(){
        _router.resolve();
    }
  
    return {
      route: route,
      router_resolve: resolve,
      getApp: _getApp
    };
})();

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Tulipan = factory());
}(this, (function () { 'use strict';

    function asyncLoadHTML(url, callback){
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.send();
        req.onload = function(){
            callback(req.responseText);
        }
    }

    function syncLoadHTML(url){
        var req = new XMLHttpRequest();
        req.open('GET', url, false);
        req.send(null);

        if (req.status === 200) {
            return req.responseText;
        }
    }

    function createElementFromHTML(htmlString) {
        var div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild; 
    }

    function top_router(element){
        
        for (var i = 0; i < element.children.length; i++) {
            if (element.children[i].tagName == "ROUTER-VIEW"){
                return element.children[i];
            }
        }

        for (var i = 0; i < element.children.length; i++) {
            
            var result = top_router(element.children[i]);
            
            if (typeof(result) !== "undefined"){
                
                if (result.tagName == "ROUTER-VIEW")
                {
                    return result;
                }

            }
        }
    }

    function registerRoute(divApp, options){

        options.data.visibleApp = false;
        divApp.setAttribute("tp-show", "visibleApp");

        if (typeof(options.route) == "object"){
            var main = options.route.main;
            var route = options.route.route;
            var main_div = document.querySelector(main + " " + "router-view");
        } else {
            var route = options.route;
            var body = document.getElementsByTagName("body")[0];
            var main_div = top_router(body);
        }

        main_div.appendChild(divApp);

        var app = new TurpialCore(options);
        
        if (typeof(options.route) == "object"){
            _tulipan.route({
                main: main,
                route: route,
                app: app
            });
        } else {
            _tulipan.route({
                route: route,
                app: app
            });
        }

        _tulipan.router_resolve();

        return app;
    }
    
    function Tulipan(options) {

        if(typeof(options.route) !== "undefined"){

            var app = null;

            if (typeof(options.template) !== "undefined"){

                options["tplOpts"] = options["template"];
                delete options['template'];

                var template = options.tplOpts;
                var div_app = null;

                if (typeof(template.url) !== "undefined"){
                    
                    var templateUrl = template.url;

                    if (template.async == true){

                        asyncLoadHTML(templateUrl, function(html){
                            div_app = createElementFromHTML(html);
                            
                            if (div_app.id == ""){
                                var rand = Math.floor(Math.random() * 999);
                                div_app.setAttribute("id", "tp-" + rand);
                                options.el = "#tp-" + rand;
                            } else {
                                options.el = "#" + div_app.id;
                            }

                            app = registerRoute(div_app, options);
                        });

                        return app;

                    } else {

                        var html = syncLoadHTML(templateUrl);

                    }
                } else {

                    var html = template.html;

                }

                div_app = createElementFromHTML(html);
                
                if (div_app.id == ""){
                    var rand = Math.floor(Math.random() * 999);
                    div_app.setAttribute("id", "tp-" + rand);
                    options.el = "#tp-" + rand;
                } else {
                    options.el = "#" + div_app.id;
                }
                
            } else {

                var _id = options.el;
                var div_app = document.querySelector(_id);
                
            }

            app = registerRoute(div_app, options);

        } else {
            var app = new TurpialCore(options);

            app.$navigate = function(path){
                _router.navigate(path);
            }
        }
        
        return app;
    }

    Tulipan.version = '1.0.2';

    Tulipan.extend = function(options) {
        TurpialCore.extend(options);
    };

    Tulipan.nextTick = function(callback){
        TurpialCore.nextTick(callback);
    };

    Tulipan.set = function(object, key, value){
        Vue.set(object, key, value);
    };

    Tulipan.delete = function(object, key){
        Vue.delete(object, key);
    };

    Tulipan.directive = function () {

        if (arguments.length == 1){
            return TurpialCore.directive(arguments[0]);
        }

        if (arguments.length == 2){
            return TurpialCore.directive(arguments[0], arguments[1]);
        }
    };

    Tulipan.filter = function (name, callback) {
        TurpialCore.filter(name, callback);
    };

    Tulipan.use = function() {
        if (arguments.length == 1){
            return TurpialCore.use(arguments[0]);
        }

        if (arguments.length == 2){
            return TurpialCore.use(arguments[0], arguments[1]);
        }
    };

    Tulipan.getApp = function(el){
        return _tulipan.getApp(el);
    };
    
    Tulipan.use(StorePlugin);

    Tulipan.use(UnderscorePlugin);

    return Tulipan;
})));