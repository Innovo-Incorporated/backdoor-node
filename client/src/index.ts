import {io, Socket} from "socket.io-client";

class Client {
    private readonly socket: Socket;

    constructor() {
        const socket = io("http://localhost:3000")

        this.socket = socket

        socket.on("connect", ()=>{
            this.sendMessage("hola")
        })
    }

    sendMessage(data: any){
        this.socket.emit("command", JSON.stringify(data))
    }
}

const client = new Client()
