export enum MessageType {
    Unknown = 0,
    Attachment = 1,
    Audio = 2,
    Contact = 3,
    ChatHistory = 4,
    Emoticon = 5,
    Image = 6,
    Text = 7,
    Location = 8,
    MiniProgram = 9,
    Money = 10,
    Recalled = 11,
    Url = 12,
    Video = 13
}

export enum HistoryMessageType {
    Unknown = 0,
    Text = 1,
    
    Image = 2,
    Video = 4,
    Url = 5,
    Attachment = 8,
    
    ChatHistory = 17,

    // TinyVideo = 888,
}