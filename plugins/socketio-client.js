/**
 * A client side plugin implementation of socketio for use in the chat
 */
import { io } from "socket.io-client"

const chatUrl = "http://produ-publi-1umq15gpn246p-1858097073.us-east-2.elb.amazonaws.com/";
const devUrl = "http://localhost:4000";

export default (({ $ioclient }) => {

    let socket;
    let messages = [];

    $ioclient.socketConnect = (username, channel) => {
        socket = io(chatUrl, {
            auth: {
                token: "coolsecret"
            }
        });
        socket.on('connect', () => {
            socket.emit('joinRoom', username, channel);
        });
    };

    $ioclient.sendMessage = (msg) => {
        socket.emit('chatMessage', msg);
    }

    $ioclient.getMessages = (channel) => {

    }

    socket.on('chatMessage', function (msg) {
        // if (messages.length > 100) {
        //     messages.pop();
        //     messages.unshift({
        //         username: username,
        //         msg: msg,
        //         room: room,
        //     });
        // }
        // else {
        //     messages.unshift({
        //         username: username,
        //         msg: msg,
        //         room: room,
        //     });
        // }
        messages.push(msg);
    });

    $ioclient.socketDisconnect = () => {
        socket.off();
        socket.disconnect();

        messages = [];
        socket = null;
    };

})