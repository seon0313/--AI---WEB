const viewVideoElement = document.getElementById("viewVideoElement");
const originalVideoElement = document.getElementById("originalVideoElement");
const yoloVideoElement = document.getElementById("yoloVideoElement");
const defaultButton = document.getElementById("defaultButton");
const scenario1Button = document.getElementById("scenario1Button");
const scenario2Button = document.getElementById("scenario2Button");
const openButton = document.getElementById("openButton");
const closeButton = document.getElementById("closeButton");
const channelInput = document.getElementById("channelInput");
const keyInput = document.getElementById("keyInput");
const startButton = document.getElementById("startButton");
const emergencyElement = document.getElementById("emergencyElement");

let viewStream;
let videoStream;

document.addEventListener("DOMContentLoaded", async function () {
  defaultButton.addEventListener("click", defaultButtonClick);
  scenario1Button.addEventListener("click", scenario1ButtonClick);
  scenario2Button.addEventListener("click", scenario2ButtonClick);
  openButton.addEventListener("click", openButtonClick);
  closeButton.addEventListener("click", closeButtonClick);
  startButton.addEventListener("click", startButtonClick);
});

async function startButtonClick() {
  await initializeOriginalVideoWebSocket();
  await initializeYoloVideoWebSocket();
  await initializeViewWebSocket();
  await initializeControlWebSocket();
  await initializeEmergencyWebSocket();
}

function openButtonClick() {
  const command = {
    lift: 1,
  };

  console.log("command: ", JSON.stringify(command));
  sendCommand(new TextEncoder().encode(JSON.stringify(command)));
}

function closeButtonClick() {
  const command = {
    lift: 0,
  };

  console.log("command: ", JSON.stringify(command));
  sendCommand(new TextEncoder().encode(JSON.stringify(command)));
}

function defaultButtonClick() {
  const command = {
    scenario: "default",
  };

  console.log("command: ", JSON.stringify(command));
  sendCommand(new TextEncoder().encode(JSON.stringify(command)));
}

function scenario1ButtonClick() {
  const command = {
    scenario: "scenario1",
  };

  console.log("command: ", JSON.stringify(command));
  sendCommand(new TextEncoder().encode(JSON.stringify(command)));
}

function scenario2ButtonClick() {
  const command = {
    scenario: "scenario2",
  };

  console.log("command: ", JSON.stringify(command));
  sendCommand(new TextEncoder().encode(JSON.stringify(command)));
}

function mimeStringToMimeObject(mimeString) {
  const [mimeType, ...mimeOption] = mimeString.split(";");

  const mimeOptionObj = mimeOption.reduce((acc, option) => {
    const [key, value] = option.trim().split("=");
    acc[key] = value;
    return acc;
  }, {});

  if (mimeType === "image/jpeg") {
    mimeOptionObj.codec = "jpeg";
  } else if (mimeType === "video/vp8") {
    mimeOptionObj.codec = "vp8";
  } else if (mimeType === "video/vp9") {
    mimeOptionObj.codec = "vp09.00.31.08";
  } else if (mimeType === "video/av1") {
    mimeOptionObj.codec = "av01.0.08M.10.0.110.09";
  } else if (mimeType === "video/h264") {
    mimeOptionObj.codec = "avc1.42002A";
    mimeOptionObj.avc = { format: "annexb" };
  } else if (mimeType === "video/h265") {
    mimeOptionObj.codec = "hvc1.1.6.L123.00";
    mimeOptionObj.hevc = { format: "annexb" };
  }

  return mimeOptionObj;
}

function processVideoData(event) {
  const data = new Uint8Array(event.data);
  const encodedChunk = new EncodedVideoChunk({
    type: data.length > 100000 ? "key" : "delta",
    data: data,
    timestamp: event.timeStamp,
    duration: 0,
  });

  return encodedChunk;
}
