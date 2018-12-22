import * as fs from "fs";
import * as path from "path";

export default function() : any {
    const env : String = process.env.NODE_ENV || 'production';
    const configPath = path.resolve(__dirname, '../config', `config.json`);
    const envConfigPath = path.resolve(__dirname, '../config', `config.${env}.json`);
    
    let config = {};
    
    if(fs.existsSync(configPath)){
        const file = fs.readFileSync(configPath, 'utf-8');
        const baseConfig = JSON.parse(file);
        Object.assign(config, baseConfig);
    }

    if(fs.existsSync(envConfigPath)){
        const file = fs.readFileSync(envConfigPath, 'utf-8');
        const envConfig = JSON.parse(file);
        Object.assign(config, envConfig);
    }

    return config;
}