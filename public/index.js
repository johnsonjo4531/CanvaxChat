(function() {
    var roomName = "/" + window.location.href.split("/").slice(-1)[0];
    var socket = io(roomName);
    var canvas = document.getElementsByClassName('whiteboard')[0];
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');
    var state = {};

    var freeDraw = new FreeDraw(context, state, socket);
    var panTool = new PanTool(context, state, socket);
    var canvasHistory = new CanvasHistory();

    {
      // Do not use these variables. 
      var _color = 'black';
      var _tool = null;
      var _panX = 0;
      var _panY = 0;
      Object.assign(state, {
        get color() {
          return _color;
        },
        set color (val) {
          _color = val;
          freeDraw.setColor(state.color);
        },
        get tool () {
          return _tool;
        },
        set tool (value) {
          if(_tool) {
            _tool.deactivate();
          }
          _tool = value;
          _tool.activate();
        },
        get username () {
          var user = window.localStorage.getItem("username",user);
          if(user) {
            return user;
          } else {
            user = prompt("Enter a username");
            this.username = user;
            return user;
          }
        },
        set username (user) {
          window.localStorage.setItem("username",user);
        },
        get pan () {
          return {
            get x () {
              return _panX;
            },
            set x (x) {
              _panX = x;
            },
            get y () {
              return _panY;
            },
            set y (y) {
              _panY = y;
            }
          }
        },
        drawLine (x0, y0, x1, y1, color, emit) {
          canvasHistory.add({
            execute (dontEmit) {
              freeDraw.drawLine(x0,y0,x1,y1,color, dontEmit ? false : emit);
            }
          });
        },
        resetCanvas () {
          var w = canvas.width;
          var h = canvas.height;
          context.clearRect(-this.pan.x, -this.pan.y, w,h);
          canvasHistory.executeAll();
        }
      });
    }

    //state.tool = freeDraw;

    // add commands here the commands should match the data-command attribute of buttons within elements with class button-toggle-tools.
    var toggleToolCommands = {
      freeDraw: () => {
        state.tool = freeDraw;
      },
      // this is just an example to show the buttons toggle.
      panTool: () => {
        state.tool = panTool;
      }
    };

    var toggleToolSelector = ".button-toggle-tools button[data-command]";
    function toggleToolUI (command) {
      var unselected = "btn-outline-primary";
      var selected = "btn-primary";
      var el = $(toggleToolSelector);
      el.toggleClass(unselected, true).toggleClass(selected, false);

      el.filter(`[data-command="${command}"]`).toggleClass(selected, true).toggleClass(unselected, false);;

      toggleToolCommands[command]();
    }

    // set default tool
    toggleToolUI("freeDraw");

    $(toggleToolSelector).click(function (e) {
      var command = $(this).attr("data-command");
      toggleToolUI(command);
    });


    var drawing = false;
  
    function wrapTouch(fn){
      return (e)=> {
        fn(e.touches[0]);
        e.preventDefault();
      };
    }

    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

    canvas.addEventListener('touchstart', wrapTouch(onMouseDown), false);
    canvas.addEventListener('touchend', wrapTouch(onMouseUp), false);
    canvas.addEventListener('touchcancel', wrapTouch(onMouseUp), false)
    canvas.addEventListener('touchmove', throttle(wrapTouch(onMouseMove), 10), false);
  
    for (var i = 0; i < colors.length; i++){
      colors[i].addEventListener('click', onColorUpdate, false);
    }
  
    socket.on('drawing', onDrawingEvent);

    socket.on('chat-message', function (data) {
      renderPost(data.message, data.user);
    });
  
    window.addEventListener('resize', onResize, false);
    onResize();
  
    function onMouseDown(e){
      state.tool.mousedown(e);
    }
  
    function onMouseUp(e){
      state.tool.mouseup(e);
    }
  
    function onMouseMove(e){
      state.tool.mousemove(e);
      socket.emit("mouse movement", { pos: { x: e.clientX, y: e.clientY } });
    }

      // initial setup, should only happen once right after socket connection has been established
    socket.on('mouse setup', function (mouses) {
      for (var mouse_id in mouses) {
        virtualMouse.move(mouse_id, mouses.mouse_id);
      }
    });
    
    // update mouse position
    socket.on('mouse update', function (mouse) {
      virtualMouse.move(mouse.id, mouse.pos);
    });
    
    // remove disconnected mouse
    socket.on('mouse disconnect', function (mouse) {
      virtualMouse.remove(mouse.id);
    });
  
    function onColorUpdate(e){
      state.color = e.target.className.split(' ')[1];
    }

    // limit the number of events per second
    function throttle(callback, delay) {
      var previousCall = new Date().getTime();
      return function() {
        var time = new Date().getTime();
  
        if ((time - previousCall) >= delay) {
          previousCall = time;
          callback.apply(null, arguments);
        }
      };
    }
  
    function onDrawingEvent(data){
      var w = canvas.width;
      var h = canvas.height;
      state.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }
  
    // make the canvas fill its parent
    function onResize() {
      var width = $(".canvax-chat-canvas").width() - $(".chat-message-window").width();
      canvas.width = width;
      canvas.height = window.innerHeight;
      state.resetCanvas();
    }

    // this function posts chat messages
	var sendMessage = function (e) {
		var message = $("#chat-input").val()
		$("#chat-input").val("")
		if (!message) {
			return;
		}	
		renderPost(message, state.username);
		socket.emit("chat-message",{
			message,
			user: state.username
		});
	};
	
	function renderPost (message, user) {
		$("#chat-messages").append("<p><span class = 'chat-username'> " + user +" </span>"+ 	message + "</p>")
	}
	
	// send chat posts with the send button
	$("#send-message-button").click(sendMessage)
	// send chat posts with enter key
	$("#chat-input").keypress(function (e) {
    if (e.which == 13) {
      sendMessage();
    }
  });
  
  })();

  function create_private_room()
  {
    window.location = "/create-private-room";
  }

  // virtual mouse module
var virtualMouse = {
  // moves a cursor with corresponding id to position pos
  // if cursor with that id doesn't exist we create one in position pos
  move: function (id, pos) {
    var cursor = document.getElementById('cursor-' + id);
    if (!cursor) {
      cursor = $(`<svg width="25" height="25">
      <image class="cursor-${id}-color" xlink:href="assets/pencil.svg" width="25" height="25" src=auto />
      </svg>`)[0];
      cursor.className = 'virtualMouse';
      cursor.id = 'cursor-' + id;
      cursor.style.position = 'absolute';
      cursor.style.fill = getRandomColor();
      cursor.style.stroke = getRandomColor();
      document.body.appendChild(cursor);
    }
    cursor.style.left = pos.x + 'px';
    cursor.style.top = pos.y + 'px';
  },
  // remove cursor with corresponding id
  remove: function (id) {
    var cursor = document.getElementById('cursor-' + id);
    cursor.parentNode.removeChild(cursor);
  }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}