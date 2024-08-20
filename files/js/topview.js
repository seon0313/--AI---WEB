let viewMime;
let viewSocket;
const viewDecoder = new DecoderVideo();

async function initializeViewWebSocket() {
  const url = `wss://${host}:${port}/pang/ws/sub?channel=${channelInput.value}&track=video&mode=single&key=${keyInput.value}`;
  viewSocket = new WebSocket(url);
  viewSocket.binaryType = "arraybuffer";

  const mediaStreamTrack = new MediaStreamTrackGenerator({
    kind: "video",
  });
  const writer = mediaStreamTrack.writable.getWriter();
  await writer.ready;
  const mediaStream = new MediaStream([mediaStreamTrack]);
  viewVideoElement.srcObject = mediaStream;

  viewSocket.onopen = () => {
    console.log(">> Open View Websocket");
  };

  viewSocket.onmessage = (event) => {
    if (typeof event.data == "string") {
      if (viewMime != event.data) {
        viewMime = event.data;

        const handleFrame = async (frame) => {
          if (frame && mediaStreamTrack) {
            await writer.write(frame);
            frame.close();
          }
        };

        const mimeObject = mimeStringToMimeObject(viewMime);
        viewDecoder.setDecoder(mimeObject, handleFrame);
      }
    } else if (typeof event.data == "object") {
      if (viewMime.includes("jpeg")) {
        viewDecoder.decode(event.data);
      } else {
        viewDecoder.decode(processVideoData(event));
      }
    }
  };

  viewSocket.onclose = async () => {
    console.log(">> Close View Websocket");
    await viewDecoder.stop();
  };

  viewSocket.onerror = (error) => {
    console.log(">> Error View Websocket", error);
  };
}
