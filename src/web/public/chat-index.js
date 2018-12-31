(function(chatyApp){

    function fetchChatDetail(){
        var apiUrl = chatyApp.apis.getChatDetail + window.params.uid + '/' + window.params.chatId;
        chatyApp.request('GET', apiUrl, showChat);

        function showChat(response){
            var contentSection = document.getElementById('chat-content');
            contentSection.innerHTML = response;
        }
    }

    fetchChatDetail();

})(window.chatyApp);





