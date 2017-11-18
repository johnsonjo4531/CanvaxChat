(function() {
  
    var socket = io();
    var canvas = document.getElementsByClassName('whiteboard')[0];
    var colors = document.getElementsByClassName('color');
    var context = canvas.getContext('2d');
    var freeDraw = new FreeDraw(context, socket);
    var panTool = new PanTool(context, socket);

    // do not use this variable
    var state;
    {
      var _color = 'black';
      var _tool = null;
      state = {
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
        }
      };
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
    }
  
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
      freeDraw.drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }
  
    // make the canvas fill its parent
    function onResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  
  })();