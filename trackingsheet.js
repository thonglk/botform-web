(function () {

    var getID = function (e) {
        if (!e) {
            for (var t = document.getElementsByTagName("script"), n = t.length - 1, r = 0; r < t.length; r++) -1 !== t[r].src.indexOf("trackingsheet.js") && (n = r);
            e = t[n].src
        }
        var a = e.replace(/^[^\?]+\??/, "");
        return JSON.parse('{"' + decodeURI(a).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}').sheet
    }
    var sheet = getID()


    var HttpClient = function () {
        this.get = function (aUrl, aCallback) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function () {
                if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                    aCallback(anHttpRequest.responseText);
            }

            anHttpRequest.open("GET", aUrl, true);
            anHttpRequest.send(null);
        }
        this.post = function (url, params, aCallback) {
            var http = new XMLHttpRequest();
            var params = JSON.stringify(params);
            http.open("POST", url, true);

            http.setRequestHeader("Content-type", "application/json; charset=utf-8");
            http.setRequestHeader("Content-length", params.length);
            http.setRequestHeader("Connection", "close");

            http.onreadystatechange = function () {
                if (http.readyState == 4 && http.status == 200) {
                    aCallback(http.responseText);
                }
            }

            http.send(params);
        }
    };
    var client = new HttpClient();


    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function createCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        console.log("createCookie()", name, value, days)
        var url = window.location.href;
        var domainWithHttp = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/i)
        var domain = domainWithHttp[1]
        document.cookie = name + "=" + value + expires + "; domain=." + domain + "; path=/";
    }

    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    var id = getParameterByName('id') || readCookie('id') || `${Math.round(1000000 * Math.random())}`


    var utm_source = getParameterByName('utm_source') || readCookie('utm_source');
    var utm_medium = getParameterByName('utm_medium') || readCookie('utm_medium')
    var utm_campaign = getParameterByName('utm_campaign') || readCookie('utm_campaign')
    var utm_term = getParameterByName('utm_term') || readCookie('utm_term')
    var utm_content = getParameterByName('utm_content') || readCookie('utm_content')
    var promo = getParameterByName('p') || readCookie('p')
    var ref = getParameterByName('ref') || readCookie('ref')

    if (utm_source && !readCookie('utm_source')) createCookie('utm_source', utm_source, 180);
    if (utm_medium && !readCookie('utm_medium')) createCookie('utm_medium', utm_medium, 180);
    if (utm_campaign && !readCookie('utm_campaign')) createCookie('utm_campaign', utm_campaign, 180);
    if (utm_term && !readCookie('utm_term')) createCookie('utm_term', utm_term, 180);
    if (utm_content && !readCookie('utm_content')) createCookie('utm_content', utm_content, 180);
    if (promo && !readCookie('promo')) createCookie('promo', promo, 180);
    if (id && !readCookie('id')) createCookie('id', id, 180);
    if (ref && !readCookie('ref')) createCookie('ref', promo, 180);

    var tracking = {url: window.location.href}
    if (id) tracking.id = id
    if (ref) tracking.ref = ref
    if (promo) tracking.promo = promo
    if (utm_source) tracking.utm_source = utm_source
    if (utm_medium) tracking.utm_medium = utm_medium
    if (utm_campaign) tracking.utm_campaign = utm_campaign
    if (utm_term) tracking.utm_term = utm_term
    if (utm_content) tracking.utm_content = utm_content


    console.log('custom_track', tracking)

    window.ts = function ts(action = 'PageView',key,value) {
        if(key && value)  tracking[key] = value
        tracking.action = action
        client.post(`https://customtracking.glitch.me/post?sheet=${sheet}&range=customtracking`, tracking,function (callback) {
            console.log(callback)
        })
    }

    window.ts("PageView")


})();
