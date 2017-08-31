$(function() {
  var FADE_TIME = 150; // ms
  var TYPING_TIMER_LENGTH = 400; // ms
  var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $chatPage = $('.chat.page'); // The chatroom page

  // Prompt for setting a username
  var username,currentUser;
  var connected = false;
  var typing = false;
  var lastTypingTime;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "Dear user, no one else is online right now";
    } else {
      message += "there are " + data.numUsers + " participants online";
    }
    /*log(message);*/
    $('#participant').text(message)
  }

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: currentUser,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      /*socket.emit('new message', message);*/
      socket.emit('new message',{message:message,date:Date.now()});
    }
  }

  // Log a message
  function log (message, options) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data, options) {
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);
    options = options || {};
    if ($typingMessages.length !== 0) {
      options.fade = false;
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data.message);

    var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .addClass(typingClass)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    data.typing = true;
    data.message = 'is typing';
    addChatMessage(data);
  }

  // Removes the visual chat typing message
  function removeChatTyping (data) {
    getTypingMessages(data).fadeOut(function () {
      $(this).remove();
    });
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);


    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(FADE_TIME);
    }
    if (options.prepend) {
      $messages.prepend($el);
    } else {
      $messages.append($el);
    }
    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Updates the typing event
  function updateTyping () {
    if (connected) {
      if (!typing) {
        typing = true;
        socket.emit('typing');
      }
      lastTypingTime = (new Date()).getTime();

      setTimeout(function () {
        var typingTimer = (new Date()).getTime();
        var timeDiff = typingTimer - lastTypingTime;
        if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
          socket.emit('stop typing');
          typing = false;
        }
      }, TYPING_TIMER_LENGTH);
    }
  }

  // Gets the 'X is typing' messages of a user
  function getTypingMessages (data) {
    return $('.typing.message').filter(function (i) {
      return $(this).data('username') === data.username;
    });
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (currentUser) {
        sendMessage();
        socket.emit('stop typing');
        typing = false;
      } else {
        //setUsername();
      }
    }
  });

  $inputMessage.on('input', function() {
    updateTyping();
  });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputMessage.click(function () {
    $inputMessage.focus();
  });
 

  $(document).on('click',"#back",function(){
    $loginPage.fadeIn();

  })

  $(document).on("click","#list li",function(){
    
    $messages.empty();
    var usn = $(this).text();
    username = usn.replace(" ", "");
    
    $loginPage.fadeOut();
    $chatPage.show();
    $loginPage.off('click');
    $currentInput = $inputMessage.focus();
    socket.emit('join', [currentUser,username]);

  });

  // Socket events

   socket.on('connect',function(){
    
      currentUser = $("#user").text();
      socket.emit('add user', currentUser );
      socket.emit('currentUser', currentUser );

   })

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    
    
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', function (data) {
    addChatMessage(data);
  });
  //listens create room event and initiates getchat
  socket.on('createRoom',function(room){
    
    // Display the welcome message
    var message = "Say hi to "+username;
    log(message, {
      prepend: true
    });

    socket.emit('getChat',{room:room,user:currentUser});
  })


  //when chats sent 
  socket.on('sendChat',function(result){
    
      //checks the chat's sender and displays according to sender and reciever

      for(var x in result){
        if(result[x].sender==currentUser){
          
          addChatMessage({
            username: currentUser,
            message: result[x].message
          });
        }else if(result[x].sender==username){

            addChatMessage({
            username: username,
            message: result[x].message
          });

        }
      }



  })
  //on users event displays all users if online or not
  socket.on('users', function (data) {
    $('#list').empty();
    
    for(var x in data){
      if(x!=currentUser){
        if(data[x]==true){
          $('#list').append($('<li>').html('<span class="btn" style="font-size:200%;display:block"><i class="fa fa-circle" aria-hidden="true" style="font-size:15px;color:green"></i> '+x+'</span>'));
        }else if(data[x]==false){
          $('#list').append($('<li>').html('<span class="btn" style="font-size:200%;display:block"><i class="fa fa-circle" aria-hidden="true" style="font-size:15px;color:red"></i> '+x+'</span>'));

        }
      }
    } 
  });

  // Whenever the server emits 'user joined', log it in the chat body
  socket.on('user joined', function (data) {
    /*log(data.username + ' joined');*/ 
    $("#logger").text(data.username + ' joined');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the chat body
  socket.on('user left', function (data) {
    /*log(data.username + ' left');*/
    $("#logger").text(data.username + ' left')
    addParticipantsMessage(data);
    removeChatTyping(data);
  });

  // Whenever the server emits 'typing', show the typing message
  socket.on('typing', function (data) {
    addChatTyping(data);
  });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
    removeChatTyping(data);
  });

  socket.on('disconnect', function () {
     $('#list').empty();
    log('you have been disconnected');
    $('#participant').empty();
    $("#logger").text('you have been disconnected')
  });

  socket.on('reconnect', function () {
    log('you have been reconnected');
    $("#logger").text('you have been reconnected')
    $loginPage.fadeIn();
    socket.emit('currentUser', currentUser );
  });

  socket.on('reconnect_error', function () {
    log('attempt to reconnect has failed');
    $("#logger").text('attempt to reconnect has failed')
  });

});
