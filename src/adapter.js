/* 
The each service must use murmuration
adapter. The adapter is can be client or server.
*/

const { Server } = require("socket.io");
const { io } = require("socket.io-client");

class Adapter {
	#event_list = new Map
	transmitter = null
	interfaces = []
	constructor({

	}) {
		this.transmitter = {
			acceptor: null,
			initiator: null,
			connector: null,
		}
		this._cmd = new Object()
	}
	createTransmitter(prop) {
		if (prop.type === "socketio") {
			if (prop.io == 'i') {
				this.transmitter.acceptor = {
					type: "socketio",
					connector: new Server(prop.address.port, {})
				};
				this.transmitter.connector = this.transmitter.acceptor.connector;
				this.transmitter.connector.use((socket, next) => {
					this.#event_list.forEach((val, key, map) => {
						socket.on(key, val)
					});
					next();
				})
			} else if (prop.io == 'o') {
				this.transmitter.initiator = {
					type: "socketio",
					connector: io(prop.address.ws)
				}
				this.transmitter.connector = this.transmitter.initiator.connector;
			}
		}
	}

	addInterface(iface) {
		if (iface.socketio) {
			const iface_tmp = {
				socketio: io(iface.socketio),
			}
			iface_tmp.socketio.on("disconnect", () => {
				console.log("disconnected");
			});
			this.interfaces.push(iface_tmp);
		}
	}

	on(...args) {
		// this.addEventListener({
		// 	determinator: event,
		// 	cb: cb
		// })
		// if (!this.transmitter.initiator || !this.transmitter.initiator.connector) {
		// 	throw new Error("Transmitter initiator is not defined or not connected");
		// }
		this.transmitter.connector.on(...args);
		// this.transmitter.initiator.connector.sockets.on(event_conf.determinator, event_conf.cb)

	}
	emit(...args) {
		// if (!this.transmitter.connector) {
		// 	throw new Error("Transmitter connector is not defined");
		// }
		this.transmitter.connector.emit(...args);
	}
	disconnect() {
		if (this.transmitter.connector) {
			this.transmitter.connector.disconnect();
			this.transmitter.connector = null;
		}
	}
	async addEventListener(conf) { // sockets.forEach
		const sockets = await this.transmitter.connector.fetchSockets()
		for (const socket of sockets)
			socket.on(conf.socketio[0], conf.socketio[1])
		this.#event_list.set(conf.socketio[0], conf.socketio[1])

		// if (!this.transmitter.initiator || !this.transmitter.initiator.connector) {
		// 	throw new Error("Transmitter initiator is not defined or not connected");
		// }
		// if (!event_conf || !event_conf.determinator || !event_conf.cb) {
		// 	throw new Error("Event configuration is not defined or missing determinator or callback");
		// }
		// this.transmitter.connector.on(conf.socketio[0], conf.socketio[1]);
		// this.transmitter.initiator.connector.sockets.on(event_conf.determinator, event_conf.cb)
	}
}

module.exports = {
	Adapter,
}
