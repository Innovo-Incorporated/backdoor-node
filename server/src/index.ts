import express from "express";
import http from "http";
import socket from "socket.io";
import prompts from "prompts";
import * as fs from "fs";
import path from "path";
// @ts-ignore
import ss from "socket.io-stream"

const replaceAll = (message: string, search: string, replace: string)=> {
    return message.replace(new RegExp(search, 'g'), replace)
}


class Server {
    private socket: any;
    constructor() {
        const app = express()

        const server = new http.Server(app)

        // @ts-ignore
        const io = socket(server)

        io.on('connection', (socket: any)=>{
            console.log("user connected.")
            this.socket = socket
            this.listenCommands()

            socket.on("command", (data: any)=>{
                try {
                    let output = JSON.parse(data)
                    const pos = output.lastIndexOf("\n")
                    output = `${output.substring(0, pos)}${output.substring(pos + 1)}`

                    console.log(" " + replaceAll(output, "\n", "\n "))
                }catch (e) {}

                this.listenCommands()
            })

            // @ts-ignore
            ss(socket).on("send-me-a-file", (stream: any, data: any)=>{
                const {name} = JSON.parse(data)

                stream.pipe(fs.createWriteStream(name))

                this.sendMessage("uploaded file.")
            })

            socket.on("disconnect", ()=>{
                socket.disconnect(true)
                console.log("Aww snap!")
            })
        })

        server.listen(3000, ()=> console.log("Server up on http://localhost:3000"))
    }

    async listenCommands(){
           const {value} = await this.prompt("Get started by a command")
           if (value === "quit"){
               this.sendMessage("quit")
               this.socket.disconnect()
           }
           else if (value.split(" ")[0] === "upload"){
               const array = value.split(" ")
               const fileName = array[1]

               this.sendFile(fileName)
           }
           else {
               this.sendMessage(value)
           }
    }

    async prompt(message: string){
        const response = await prompts({
            type: "text",
            name: "value",
            message: message,
            validate: value => !value ? "Please enter a value" : true
        })

        return response
    }

    sendMessage(message: any){
        this.socket.emit("command", JSON.stringify(message))
    }

    sendFile(fileName: string){
        // @ts-ignore
        const stream = ss.createStream()

        // @ts-ignore
        ss(this.socket).emit("send-me-a-file", stream,  JSON.stringify({
            name: fileName,
        }))

        fs.createReadStream(fileName).pipe(stream)
    }
}

const server = new Server()