(function(chatyApp){

    function showQRCode(qrcodeUrl){
        var image = document.createElement('IMG');
        image.src = qrcodeUrl;
        image.setAttribute('width', 200);
        image.setAttribute('height', 200);

        var qrcode = document.getElementById('qrcode');
        chatyApp.emptyElement(qrcode);
        qrcode.appendChild(image);
    }

    function updateStatus(){
        chatyApp.request('GET', chatyApp.apis.getStatus, refreshView, function(){
            refreshView(JSON.stringify({ status: chatyApp.chatyBotStatus.Unknown }));
        });

        function refreshView(response){
            var state = JSON.parse(response);
            var statusName = Object.keys(chatyApp.chatyBotStatus).find(function(k){
                return chatyApp.chatyBotStatus[k] === state.status;
            });
    
            var statusItems = ['status', 'actions', 'qrcode'];
            statusItems.forEach(function(item){
                document.getElementById(item).className = statusName.toLocaleLowerCase();
            });

            if(state.status === chatyApp.chatyBotStatus.WaitingForScan && state.login_qrcode){
                showQRCode(state.login_qrcode);
            }
        }
    }

    function start(){
        chatyApp.request('POST', chatyApp.apis.postStart, botStarted);

        function botStarted(response){
            updateStatus();

            var result = JSON.parse(response);
            if(result.qrcodeUrl){
                showQRCode(result.qrcodeUrl);
            }
        }
    }

    function stop(){
        chatyApp.request('POST', chatyApp.apis.postStop, updateStatus);
    }

    function updateContacts(){
        chatyApp.request('GET', chatyApp.apis.getUidList, uidListUpdated);

        function uidListUpdated(response){
            var uidList = document.getElementById('contact-list').querySelector('ul');

            chatyApp.emptyElement(uidList);
            var dataList = JSON.parse(response);
            dataList.forEach(function(uid){
                var link = document.createElement('A');
                link.innerHTML = uid;
                link.setAttribute('href', 'javascript:;');
                
                chatyApp.setupClick(link, function(){
                    getChatsByContact(uid);
                });

                var li = document.createElement('LI');
                li.appendChild(link);
                uidList.appendChild(li);
            });
        }
    }

    function getChatsByContact(uid){
        chatyApp.request('GET', chatyApp.apis.getListByUid + uid, chatListUpdated);

        function chatListUpdated(response){
            var chatListEL = document.getElementById('chat-list');
            chatListEL.querySelector('h3').innerHTML = uid + ' 的聊天列表';
            
            var chatList = chatListEL.querySelector('ul');
            var dataList = JSON.parse(response);
            chatyApp.emptyElement(chatList);
            dataList.forEach(function(chatId){
                var link = document.createElement('A');
                link.innerHTML = chatId;
                link.setAttribute('href', chatyApp.pages.showChatDetail + uid + '/' + chatId);
                chatList.appendChild(link);

                var li = document.createElement('LI');
                li.appendChild(link);
                chatList.appendChild(li);
            });
        }
    }


    updateStatus();
    setInterval(updateStatus, 3000);

    updateContacts();
    setInterval(updateContacts, 8000);

    chatyApp.setupClick('#actions .start', start);
    chatyApp.setupClick('#actions .stop', stop);

})(window.chatyApp);





