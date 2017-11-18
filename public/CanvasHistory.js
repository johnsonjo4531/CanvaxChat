class CanvasHistory {
  constructor () {
    this.commands = [];
  }

  add (command) {
    if(!command.execute){ throw new Error("History command should have an execute method")}
    this.commands.push(command);
    command.execute();
  }

  executeAll() {
    for(var command of this.commands) {
      command.execute();
    }
  }
}