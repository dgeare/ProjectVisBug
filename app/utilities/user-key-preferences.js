class userKeySettings{
    constructor(){
        this._command_or_control = 'cmd';
        this.listenForMessage();
    }

    get cmd(){
        return this._command_or_control;
    }

    /* OS detection needs to happen in a background task. Bind an message handler */
    listenForMessage(){
        // if(chrome && chrome.runtime && chrome.runtime.onMessage){
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>{
                if(request.os){
                    this._os = request.os;
                    this.setSystemDefault();
                }
            });
        // }
    }

    setSystemDefault(){
        if(this._os == "mac"){
            this._command_or_control = 'cmd';
        }else{
            this._command_or_control = "ctrl";
        }
    }
}

export const userKeys = new userKeySettings();

