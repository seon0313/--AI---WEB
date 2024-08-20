let yoloVideoMime;
let yoloVideoSocket;
const yoloVideoDecoder = new DecoderVideo();

async function initializeYoloVideoWebSocket() {
  const url = `wss://${host}:${port}/pang/ws/sub?channel=${channelInput.value}&track=video_y&mode=single&key=${keyInput.value}`;
  yoloVideoSocket = new WebSocket(url);
  yoloVideoSocket.binaryType = "arraybuffer";

  const mediaStreamTrack = new MediaStreamTrackGenerator({
    kind: "video",
  });
  const writer = mediaStreamTrack.writable.getWriter();
  await writer.ready;
  const mediaStream = new MediaStream([mediaStreamTrack]);
  yoloVideoElement.srcObject = mediaStream;

  yoloVideoSocket.onopen = () => {
    console.log(">> Open Yolo Video Websocket");
  };

  yoloVideoSocket.onmessage = (event) => {
    if (typeof event.data == "string") {
      if (yoloVideoMime != event.data) {
        yoloVideoMime = event.data;

        const handleFrame = async (frame) => {
          if (frame && mediaStreamTrack) {
            await writer.write(frame);
            frame.close();
          }
        };

        const mimeObject = mimeStringToMimeObject(yoloVideoMime);
        yoloVideoDecoder.setDecoder(mimeObject, handleFrame);
      }
    } else if (typeof event.data == "object") {
      if (yoloVideoMime.includes("jpeg")) {
        yoloVideoDecoder.decode(event.data);
      } else {
        yoloVideoDecoder.decode(processVideoData(event));
      }
    }
  };

  yoloVideoSocket.onclose = async () => {
    console.log(">> Close Yolo Video Websocket");
    await yoloVideoDecoder.stop();
  };

  yoloVideoSocket.onerror = (error) => {
    console.log(">> Error Yolo Video Websocket", error);
  };
}
