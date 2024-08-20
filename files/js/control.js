let controlSocket;
const keyboardControl = new KeyboardControl();
const keyboardCommandMap = {
  ArrowUp: "forward",
  ArrowDown: "backward",
  ArrowLeft: "turnleft",
  ArrowRight: "turnright",
  Space: "stop",
};
let controlInterval;

async function initializeControlWebSocket() {
  const url = `wss://${host}:${port}/pang/ws/pub?channel=${channelInput.value}&track=control&mode=single&key=${keyInput.value}`;
  controlSocket = new WebSocket(url);
  controlSocket.binaryType = "arraybuffer";

  controlSocket.onopen = () => {
    console.log(">> Open Control Websocket");
    keyboardControl.set(sendCommand, keyboardCommandMap);
    handleSend();
  };

  controlSocket.onclose = async () => {
    console.log(">> Close Control Websocket");
  };

  controlSocket.onerror = (error) => {
    console.log(">> Error Control Websocket", error);
  };
}

function handleSend() {
  if (!controlSocket) return;

  document.addEventListener("keydown", keyboardControl.handleKeyDown);
}

const sendCommand = (command) => {
  if (controlSocket.readyState === WebSocket.OPEN) {
    controlSocket.send(command);
  } else {
    console.log(">> Control Websocket 연결상태 확인 필요");
  }
};
