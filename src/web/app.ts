import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import * as vash from "vash";
import * as timeout from 'connect-timeout';

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as botController from "./controllers/bot";
import * as chatController from "./controllers/chat";
import * as pairController from "./controllers/pair";

const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(__dirname, "views"));
app.engine('html', vash.__express);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(timeout('30s'));


app.get("/", homeController.pageHome);


app.get("/bot/status", botController.status);
app.get("/bot/info", botController.info);
app.post("/bot/start", botController.start);
app.post("/bot/stop", botController.stop);


app.get("/chat/list", chatController.listUids);
app.get("/chat/list/:uid", chatController.listChats);
app.get("/chat/detail/:uid/:chatid", chatController.detail);
app.get("/chat/file/:fileid", chatController.downloadFile);
app.get("/chat/show/:uid/:chatid", chatController.pageDetail);

app.post("/bot/pair", pairController.verify);


export default app;