/*!
 * Http-Component-Loader v1.0.0
 * http://wuliupo.github.io/http-component-loader
 *
 * Copyright 2018 Liupo Wu
 * Released under the MIT license
 *
 * Date: 2018-12-18
 */
(function(global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global);
    } else if (typeof define === 'function' && define.amd) {
		define([], factory);
    } else {
        factory(global);
    }
}(typeof window !== 'undefined' ? window : this, function(win) {
    var HttpComponentLoader = function(component) {
        component = component || {};
        this.name = component.name ? component.name.replace(/[^\w$]/g, '_') : ('p' + new Date().getTime()); // a random name
        this.jsUrl = component.js;
        this.htmlUrl = component.html;
        this.cssUrl = component.css;
        this.cssContent = this.jsContent = this.htmlContent = '';
    }

    function ajaxGet(url, success) {
        var ajax = new XMLHttpRequest();
        ajax.open('get', url);
        ajax.onreadystatechange = function () {
            ajax.readyState == 4 && ajax.status == 200 && success(ajax.responseText);
        }
        ajax.send();
    }

    function removeResource(id) {
        var dom = id && document.getElementById(id);
        if (dom) {
            dom.parentNode.removeChild(dom);
        }
    }

    function loadJs(jsUrl, jsContent, callback, errorback) {
        if (!jsUrl && !jsContent) {
            return;
        }
        var id = 'temp-' + new Date().getTime();
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.id = id;
        if (jsContent) {
            try {
                script.appendChild(document.createTextNode(jsContent));
            } catch (ex) {
                script.text = jsContent;
            }
            setTimeout(function() {
                removeResource(id);
            }, 1000);
        } else if (jsUrl) {
            script.src = jsUrl;
            script.addEventListener('load', function() {
                callback && callback();
                removeResource(id);
            });
            errorback = errorback || function() {
                console.error('load script error', jsUrl);
            };
            script.addEventListener('error', errorback);
        } else {
            throw new Error('loadScript need src or content');
        }
        document.head.appendChild(script);
    }


    function loadCss(cssUrl, callback, errorback) {
        if (!cssUrl) {
            return;
        }
        var id = 'temp-' + cssUrl.replace(/[\/\.]/g, '');
        var style = document.createElement('link');
        style.rel = 'stylesheet';
        style.id = id;
        style.href = cssUrl;
        callback && style.addEventListener('load', callback);
        errorback = errorback || function() {
            console.error('load style error', cssUrl);
        };
        style.addEventListener('error', errorback);
        document.head.appendChild(style);
    }

    function loadText(url, callback, errorback) {
        ajaxGet(url, callback, errorback);
    }

    HttpComponentLoader.prototype = {
        loadComponent: function(callback) {
            var that = this;
            function combin() {
                var component = that.jsContent;
                if ((that.htmlContent || !that.htmlUrl) && (component || !that.jsUrl)) {
                    component = component || {}; // only template
                    component.template = that.htmlContent || component.template || '';
                    component.name = component.name || ('page-' + that.name);
                    var data = component.data;
                    if (data && (typeof data !== 'function')) {
                        component.data = (function(d) {
                            d = Object.assign({}, d);
                            return function() {
                                return d;
                            };
                        })(data);
                    }
                    callback(component);
                }
            }
            if (this.jsUrl) {
                loadText(this.jsUrl, function(rst) {
                    var content = '~function(){' + rst.replace(/(module\.)?exports/, 'window.temp' + that.name) + '}()'
                    loadJs('', content);
                    that.jsContent = window['temp' + that.name];
                    combin();
                });
            }
            if (this.htmlUrl) {
                loadText(this.htmlUrl, function(rst) {
                    that.htmlContent = rst;
                    combin();
                });
            }
            if (this.cssUrl) {
                loadCss(this.cssUrl);
            }
        }
    };

    HttpComponentLoader.loadCss = loadCss;
    HttpComponentLoader.loadJs = loadJs;
    HttpComponentLoader.loadText = loadText;

    win.HttpComponentLoader = HttpComponentLoader;
    return HttpComponentLoader;
}));
