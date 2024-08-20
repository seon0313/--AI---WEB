class DecoderVideo {
  decoder = null;
  decoderConfig = null;
  frameQueue = [];
  timeBase = 0;
  isWebCodec = true;
  handleChunk = null;
  isDecoding = false;
  isSetFocus = false;
  isFocused = true;

  async isConfigSupported(config) {
    return await VideoDecoder.isConfigSupported(config);
  }

  async setDecoder(decoderConfig, handleChunk) {
    this.handleChunk = handleChunk;
    this.decoderConfig = decoderConfig;

    if (!this.isSetFocus) {
      window.addEventListener("focus", () => {
        this.isFocused = true;
      });
      window.addEventListener("blur", () => {
        this.isFocused = false;
      });
    }

    if (decoderConfig.codec === "jpeg" || decoderConfig.codecs === "jpeg") {
      this.isWebCodec = false;
    } else {
      this.isWebCodec = true;

      if (!(await this.isConfigSupported(decoderConfig))) {
        return;
      }

      this.decoder = new VideoDecoder({
        output: async (frame) => {
          this.handleFrame(frame);
        },
        error: (error) => {
          this.isDecoding = false;
        },
      });

      this.decoder.configure(decoderConfig);
      console.log("set video decoder config", decoderConfig);
    }
  }

  async handleFrame(frame) {
    this.frameQueue.push(frame);
    if (!this.isDecoding) {
      this.isDecoding = true;
      await this.renderFrame();
    }
  }

  async renderFrame() {
    while (true) {
      if (this.frameQueue.length === 0) {
        this.isDecoding = false;
        return;
      }

      const frame = this.frameQueue.shift();
      if (frame) {
        const timeUntilNextFrame = this.calculateTimeUntilNextFrame(
          frame.timestamp
        );

        await new Promise((r) => {
          setTimeout(r, timeUntilNextFrame);
        });

        this.handleChunk(frame);

        frame.close();
      }
    }
  }

  calculateTimeUntilNextFrame(timestamp) {
    if (this.timeBase === 0) {
      this.timeBase = performance.now();
    }
    const mediaTime = performance.now() - this.timeBase;
    return Math.max(0, timestamp / 1000 - mediaTime);
  }

  async decode(encodedVideoChunk) {
    if (!this.isFocused) return;

    if (this.isWebCodec && typeof encodedVideoChunk === "object") {
      try {
        if (this.decoder.state === "closed") {
          await this.setDecoder(this.decoderConfig, this.handleChunk);
          return;
        }

        this.decoder.decode(encodedVideoChunk);
      } catch (error) {
        // console.log(error);
        await this.setDecoder(this.decoderConfig, this.handleChunk);
      }
    } else {
      const videoChunk = encodedVideoChunk;
      const blob = new Blob([videoChunk.data], { type: "image/jpeg" });

      createImageBitmap(blob)
        .then((imageBitmap) => {
          const decodedChunk = new VideoFrame(imageBitmap, {
            timestamp: videoChunk.timeStamp,
          });
          this.handleChunk(decodedChunk);
        })
        .catch((error) => {
          console.log("ImageBitmap creation error:", error);
        });
    }
  }

  async stop() {
    if (this.decoder && this.decoder.state !== "closed") {
      this.decoder.close();
      this.isDecoding = false;
    }
  }
}

const host = "cobot.center";
const port = "8287";
