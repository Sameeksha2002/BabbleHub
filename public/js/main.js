const chatform = document.getElementById('chat-form');
const chats = document.querySelector('.chats');
const roomName = document.getElementById('rooms');
const usersList = document.getElementById('userConst');
const socket = io();

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true
});
// console.log(username, room);

//message from server
socket.on('message', (message) => {
  console.log(message)
    outputMessage(message)
      //scroll down
      chats.scrollTop = chats.scrollHeight;
})

//join chatroom
socket.emit('joinRoom', { username, room });

  //get rooms and users
socket.on('roomUsers', ({ room,users }) => {
    OutputRoomName(room);
    OutputUsers(users);
  })


//message submit
chatform.addEventListener('submit', (e) => {
  e.preventDefault()

  //get message text
    const msg = e.target.elements.usermsg.value;

  //send message to server
    socket.emit('chatmessage', msg)

  //clear input
    e.target.elements.usermsg.value = "";
    e.target.elements.usermsg.focus();

    
})

//output message
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('mssgbox')
    div.innerHTML = `<div class="msginfo">
    <span class="user"> ${message.username}</span>
    <span class="time"> ${message.time}</span>
</div>
<div class="msg">
    ${message.text}
</div>`;
    document.querySelector('.chats').appendChild(div);
}

//output room info
function OutputRoomName(room) {
  roomName.innerHTML = room;
  roomName.classList.add('activeRoom');
}

//output users in room
function OutputUsers(users) {
  usersList.innerHTML = `
  ${users.map(user => `<p class="roomUsers">${user.username}</p>`).join('')} `
}