(function () {

    var chatyApp = {};
    var noCredential = false;

    chatyApp.apis = {
        getStatus: "/bot/status",
        postStart: "/bot/start",
        postStop: "/bot/stop",

        getFile: "/chat/file",
        getUidList: "/chat/list",
        getListByUid: "/chat/list/",

        getChatDetail: "/chat/detail/"
    };
    chatyApp.pages = {
        showChatDetail: "/chat/show/"
    }

    chatyApp.chatyBotStatus = {
        Unknown: 0,

        Starting: 1,
        Started: 2,

        WaitingForScan: 3,
        LoggedIn: 4,

        Stopping: 9,
        Stopped: 10,

        StartError: 77,
        StopError: 99
    };

    chatyApp.messageType = {
        Unknown : 0,
        Text : 1,
        
        Image : 2,
        Video : 4,
        Url : 5,
        Attachment : 8,
        
        ChatHistory : 17
    };


    chatyApp.request = function (method, url, fn, fnFail) {
        if(noCredential){
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status <= 399) {
                    fn && fn.apply(this, [this.responseText]);
                } else {
                    if(this.status === 401){
                        noCredential = true;
                        var cred = prompt('请输入凭据（格式 username:passowrd）：');
                        if(cred){
                            window.sessionStorage.setItem('chaty-credential', cred);
                            location.reload();
                            return;
                        }
                    }
                    
                    fnFail && fnFail.apply(this);
                }
            }
        };

        xhr.onerror = xhr.onabort = fnFail;
        xhr.open(method, url, true);

        var storedCred = window.sessionStorage.getItem('chaty-credential');
        if(storedCred){
            xhr.setRequestHeader('Authorization', 'Basic ' + btoa(storedCred));
        }
        xhr.send();
    };

    chatyApp.emptyElement = function (el) {
        while (el.lastChild) {
            el.removeChild(el.lastChild);
        }
    };

    chatyApp.setupClick = function (selector, handler) {
        var item = typeof (selector) === 'string' ? document.querySelector(selector) : selector;
        item.addEventListener('click', function (ev) {
            ev.preventDefault();
            handler.apply(this, [ev]);
        });
    };


    window.chatyApp = chatyApp;
})();