let originalVideoMime;
let originalVideoSocket;
const originalVideoDecoder = new DecoderVideo();

async function initializeOriginalVideoWebSocket() {
  const url = `wss://${host}:${port}/pang/ws/sub?channel=${channelInput.value}&track=video_o&mode=single&key=${keyInput.value}`;
  originalVideoSocket = new WebSocket(url);
  originalVideoSocket.binaryType = "arraybuffer";

  const mediaStreamTrack = new MediaStreamTrackGenerator({
    kind: "video",
  });
  const writer = mediaStreamTrack.writable.getWriter();
  await writer.ready;
  const mediaStream = new MediaStream([mediaStreamTrack]);
  originalVideoElement.srcObject = mediaStream;

  originalVideoSocket.onopen = () => {
    console.log(">> Open Original Video Websocket");
  };

  originalVideoSocket.onmessage = (event) => {
    if (typeof event.data == "string") {
      if (originalVideoMime != event.data) {
        originalVideoMime = event.data;

        const handleFrame = async (frame) => {
          if (frame && mediaStreamTrack) {
            await writer.write(frame);
            frame.close();
          }
        };

        const mimeObject = mimeStringToMimeObject(originalVideoMime);
        originalVideoDecoder.setDecoder(mimeObject, handleFrame);
      }
    } else if (typeof event.data == "object") {
      if (originalVideoMime.includes("jpeg")) {
        originalVideoDecoder.decode(event.data);
      } else {
        originalVideoDecoder.decode(processVideoData(event));
      }
    }
  };

  originalVideoSocket.onclose = async () => {
    console.log(">> Close Original Video Websocket");
    await originalVideoDecoder.stop();
  };

  originalVideoSocket.onerror = (error) => {
    console.log(">> Error Original Video Websocket", error);
  };
}
