let emergencySocket;

async function initializeEmergencyWebSocket() {
    const url = `wss://${host}:${port}/pang/ws/sub?channel=${channelInput.value}&track=emercgency&mdoe=single&key=${keyInput.value}`;
    emergencySocket = new WebSocket(url);
    emergencySocket.binaryType = "arraybuffer";

    emergencySocket.onopen = () => {
        console.log(">> Open Emergency Websocket");
    };

    emergencySocket.onmessage = async (event) => {
        const command = JSON.parse(new TextDecoder().decode(event.data));`                    `

        if(command.emergency === 1) {
            emergencyElement.style.backgroundColor = "green";
        }else{
            emergencyElement.style.backgroundColor = "red";
        }
    }
    emergencySocket.onclose = async () => {
        console.log(">> Close Emergency Websoket");
    };

    emergencySocket.onerror = (error) => {
        console.log(">> Error Emergency Websocket",error);
    };
}