const { Adapter } = require('./src/adapter.js');

class Murmuration {
	adapters = []
	aliases = {} //convert to map
	#main_adapter = null
	murmuration = this
	constructor({
	}) {
		this.#main_adapter = new Adapter({
			// convert socketio to optional instead EventEmitter
			// interfaces: services,
		})
		// this.self = this.main_adapter.transmitter.connector
		// this.main_adapter.addEventListener(self_control_event_conf)
	}
	selfOn(...args) {
		this.#main_adapter.addEventListener({
			self: true,
			socketio: args,
		})
	}
	connectService(prop) {
		if (!prop.address || !prop.address.ws)
			throw new Error("Socket.io address is required for Murmuration service connection");
		const service = new Adapter({})
		service.createTransmitter({
			type: "socketio",
			io: 'o',
			address: prop.address
		});
		this.adapters.push(service);
		this.aliases[prop.alias] = service;
	}
	connectServices(services) {
		for( svc of services ) {
			this.connectService(svc)
		}
	}
	createSelfService(prop) {
		if (!prop.socketio)
			throw new Error("Socket.io is required for Murmuration self service");
		this.#main_adapter.createTransmitter({
			type: "socketio",
			io: 'i',
			address: prop.address,
			interfaces: [
				{
					// event: {
					// 	determinator: "cmd",
					// 	cb: 
					// }
				}
			],
		});
	}
}

module.exports = {
	Murmuration,
}
