import express from "express";
import http from "http";
import socket from "socket.io";
import prompts from "prompts";

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
                const output = JSON.parse(data)

                console.log("\n " + replaceAll(output, "\n", "\n "))
            })
        })

        server.listen(3000, ()=> console.log("Server up on http://localhost:3000"))
    }

    async listenCommands(){
        while (true){
           const {value} = await this.prompt("Get started by a command")
           if (value === "quit"){
               break
           }else {
               this.sendMessage(value)
           }
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

    log(message: string){
        function customString(object: any) {
            let string = '{\n';
            Object.keys(object).forEach(key => {
                string += '  "' + key + '": "' + object[key] + '"\n';
            });
            string += '}';
            return string;
        }

        console.log(customString({value: message}))
    }
}

const server = new Server()