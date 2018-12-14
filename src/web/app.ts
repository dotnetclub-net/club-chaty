import * as express from "express";
import * as bodyParser from "body-parser";

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as botController from "./controllers/bot";
import * as chatController from "./controllers/chat";
import * as userController from "./controllers/user";

const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Primary app routes.
 */
app.get("/", homeController.index);

app.get("/bot/", botController.status);
app.post("/bot/start", botController.start);
app.get("/bot/scan", botController.scan);

app.get("/chat/list/:uid", chatController.listByUid);
app.get("/chat/:chatid", chatController.detail);

app.post("/user/bind", userController.bind);


export default app;