class KeyboardControl {
  handleSend = null;
  keyboardCommandMap = null;
  currentCommand = null;

  set = (handleSend, command) => {
    this.handleSend = handleSend;
    this.keyboardCommandMap = command;
  };

  handleKeyDown = (event) => {
    if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
      event.preventDefault();
    }
    this.sendCommandToDevice(event.code);
  };

  sendCommandToDevice = async (keyCode) => {
    const command = this.getCommand(keyCode);

    if (!command || this.currentCommand == command) return;
    this.currentCommand = command;

    const controlData = {
      control: command,
    };
    console.log("command: ", JSON.stringify(controlData));

    this.handleSend(new TextEncoder().encode(JSON.stringify(controlData)));
  };

  getCommand = (keyCode) => {
    for (const key in this.keyboardCommandMap) {
      if (key === keyCode) {
        const command = this.keyboardCommandMap[key];
        return command;
      }
    }
    return "stop";
  };
}
