import express from "express";
import http from "http";
import socket from "socket.io";
import prompts from "prompts";



class Server {
    constructor() {
        const app = express()

        app.get('/', (req, res) => {
            res.json({
                hello: "hello hello hello robert kiyosaki here."
            })
        })

        const server = new http.Server(app)

        // @ts-ignore
        const io = socket(server)

        io.on('connection', (socket: any)=>{
            console.log("user connected.")
            this.listenCommands()

            socket.on("command", (data: any)=>{
                console.log(data)
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
               console.log(value)
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
}

const server = new Server()