import * as auth from "basic-auth";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { NextHandleFunction, NextFunction } from "connect";



let users = null;
const userPath = path.resolve(__dirname, '../../config', `users.json`);
if(fs.existsSync(userPath)){
    const file = fs.readFileSync(userPath, 'utf-8');
    const configuredUsers = JSON.parse(file);
    if(!!configuredUsers){
        users = configuredUsers;
    }
}


export default function(requireAuthFilter : (req: http.IncomingMessage) => boolean) : NextHandleFunction {
    return (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction) => {
        if(!users || (!!requireAuthFilter && !requireAuthFilter(req))){
            return next();
        }
    
        var reqUser = auth(req);
        if (!reqUser || !users[reqUser.name] || users[reqUser.name] !== reqUser.pass) {
          res.writeHead(401);
          return res.end();
        }
        return next();
    }
}