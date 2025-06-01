# example

info: may not work. but it will be like this

## service 1

```js
class DbAPI extends Murmuration {
  client = null;
  constructor({ config }) {
    super({});
    this.client = new MongoClient(config.app.db_uri);
    this.#setupService();
    this.#crash()
  }
  async run(paramsfromcb) {
    try {
      await this.client.connect();
      const database = this.client.db('my_database');
      const users = database.collection('users');
      const user = await users.findOne({ id: '1235' });
      return user
    } finally {
      await this.client.close();
    }
  }
  #setupService() {
    this.murmuration.createSelfService({
      address: { port: 1236, host: "localhost" },
      socketio: true,
    });
    this.murmuration.selfOn("getuserfromdb", module1.anymethodinthisclassorother.bind(this)); // bind for share this.client
    this.murmuration.selfOn("getuserfromdb", this.run);
    this.murmuration.selfOn("disconnect", (socket) => {
      this.log("[Client-connection]", "socket disconnected");
    });
    this.murmuration.selfOn("connection", (socket) => {
      this.log("[Client-connection]", "socket connected");
    });

    this.murmuration.connectService({
      alias: "MyAppService",
      address: { ws: "ws://localhost:1234" },
    });
    this.murmuration.aliases["MyAppService"].on("connect", () => {
      console.log("DbAPI connected to MyAppService",);
    });
  }
  #crash() {
    setTimeout(() => {
      this.murmuration.aliases["MyAppService"].emit("crash", true);
    }, 10000);
  }
}
```

## service 2

```js
class MyAppService extends Murmuration { // For example, it could be restapi
  constructor({ config }) {
    super({});
    this.#setupService();
  }
  #setupService() {
    this.murmuration.createSelfService({
      address: { port: 1234, host: "localhost" },
      socketio: true,
    });
    this.murmuration.selfOn("disconnect", (socket) => {
      this.log("[Client-connection]", "socket disconnected");
    });
    this.murmuration.selfOn("connection", (socket) => {
      this.log("[Client-connection]", "socket connected");
    });
    this.murmuration.selfOn("getuserfromrestapiorsomeapi", ()=>{ // other service request catch in here
      this.murmuration.aliases["dbapi_service"].emit("getuserfromdb", {name: "a_murmurian_1"});
    });

    this.murmuration.connectService({
      alias: "dbapi_service",
      address: { ws: "ws://localhost:1236" },
    });
    this.murmuration.aliases["dbapi_service"].on("connect", (socket) => {
      console.log("MyAppService connected to dbapi_service", socket);
    });
    this.murmuration.aliases["dbapi_service"].on("crash", (socket) => {
      this.murmuration.aliases["other-service"].emit("crash", {name: "db"});
    });
  }
}

const dbApi = new DbAPI({ config });
const appService = new MyAppService({ config });
```
