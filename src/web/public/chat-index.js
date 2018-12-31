(function(chatyApp){

    function fetchChatDetail(){
        var apiUrl = chatyApp.apis.getChatDetail + window.params.uid + '/' + window.params.chatId;
        chatyApp.request('GET', apiUrl, showChat);

        function showChat(response){
            var chat = JSON.parse(response);
            var contentSection = document.getElementById('chat-content');
            
            chatyApp.emptyElement(contentSection);
            chat.forEach(function(item){
                var typeName = Object.keys(chatyApp.messageType).find(function(k){
                    return chatyApp.messageType[k] === item._content._type;
                });
                typeName = typeName.toLocaleLowerCase();
        
                var template = document.getElementById('chat-template-' + typeName);
                if(!template){
                    template = document.getElementById('chat-template-text');
                }
                
                var templateFn = vash.compile(template.textContent);
                var div = document.createElement('DIV');
                div.className = 'chat-item ' + typeName; 
                div.innerHTML = templateFn(item);
                
                contentSection.appendChild(div);
            });
        }
    }



    fetchChatDetail();

})(window.chatyApp);





