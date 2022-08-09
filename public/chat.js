
document.addEventListener('DOMContentLoaded', (event) => {
    const socket = io();
    socket.connect();

    function callUserAPI() {
        const HTTP = new XMLHttpRequest();
        const user_url = "https://randomuser.me/api/";
        HTTP.open("GET", user_url);
        HTTP.send();

        // This is the async call
        HTTP.onreadystatechange = function() {
            if (HTTP.readyState === 4 && HTTP.status === 200) {
                let userJSON = JSON.parse(HTTP.responseText);
                console.log(userJSON);   
            }
        }
    }
    
    // adding a post to the page
    function addPost(client_content) {
        chatDiv.scrollTop = chatDiv.scrollHeight;
        const containerNode = document.createElement("div");
        containerNode.classList.add("post-you-container");


        const containerImgNode = document.createElement("div");
        containerImgNode.classList.add("post-you-img");
        let containerImg = document.createElement("img");
        containerImg.style = "width: 40px; margin: auto; border-radius: 50%; height: auto; padding-right: 5px;"
        containerImg.src = client_content.user_image;
        containerImgNode.appendChild(containerImg);

        containerNode.appendChild(containerImgNode);
        
        // const HTTP = new XMLHttpRequest();
        // HTTP.open("GET", "https://randomuser.me/api/");
        // HTTP.send();
        
        const postNode = document.createElement("div");
        postNode.classList.add("post-you");

        let usernameNode = document.createElement("p");
        usernameNode.style = "font-size: 12px; font-weight: 600; font-style: bold; color: #7FFF00; letter-spacing: 2px;"

        usernameNode.innerText = client_content.user_name;

        let textNode = document.createElement("p");
        let linkExpression = /(www|http:|https:)+[^\s]+[\w]/;

        let text = client_content.messageContent;
        if (text !== undefined)
            text = text.replace(linkExpression, `<a href=$& target="_blank">$&</a>`);

        textNode.innerHTML = text;
        // node.appendChild(usrImage);
        postNode.appendChild(usernameNode);
        postNode.appendChild(textNode);

        containerNode.appendChild(postNode);

        element.append(containerNode);

        // On Success callback
        // HTTP.onreadystatechange = function() {
        //     if (HTTP.readyState === 4 && HTTP.status === 200) {

        //     }
        // }

    }

    // when someone else sends a message
    socket.on('sendResp', (client_content, callback) => {
        let audio = new Audio('./assets/notification.mp3');
        audio.play();
        addPost(client_content);
    });

    socket.on('logoutResp', (args, callback) => {
        addPost(args, true);
    });

    socket.on('usr_typing', (client_content, callback) => {
        console.log(client_content.user_name + " is typing!");
    });

    var element = document.getElementById("chat-container");
    let postButton = document.getElementById("send");

    let textAreaElement = document.getElementById("chat-text");
    textAreaElement.addEventListener("keyup",  (event) => {
        // remove newlines each time!
        textAreaElement.value = textAreaElement.value.replace(/[\r\n\v]+/g, '');
        socket.emit("typing");
    });
    

    var chatDiv = document.getElementById("chat-container");


    postButton.addEventListener("click", (event) => {
        callUserAPI();
        let textElement = document.getElementById("chat-text");
        let text = textElement.value;
        textElement.value = '';
        if (text === '') return;
        socket.emit("send", text, (response) => {
            addPost(response); // For the current client!
        });
    });

    document.addEventListener('keypress', (event) => {
        let textElement = document.getElementById("chat-text");
        if (event.key === 'Enter' && textElement.value.trim() !== '') {
            let text = textElement.value;
            textElement.value = '';
            socket.emit("send", text, (client_data) => {
                addPost(client_data); // For the current client!
            });
        }
    });
});

