// server.js
// where your node app starts

var firebase = require("firebase-admin");
var axios = require("axios")
var cors = require("cors")
var _ = require("underscore")
var express = require('express');
var app = express();
var request = require('request');

var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(cors());
app.use((req, res, next) => {
    res.contentType('application/json');
    next();
});
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var port = process.env.PORT || 1234


_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

function strToObj(str) {
    if (str.match('&')) {
        var keyvalue = str.split('&')
    } else keyvalue = [str]
    var obj = {}
    keyvalue.forEach(each => {
        if (each.match('=')) {
            var split = each.split('=')
            var key = split[0]
            var value = split[1]
            obj[key] = value
        }

    })
    console.log('strToObj', obj)
    return obj
}

function isObject(a) {
    return (!!a) && (a.constructor === Object);
};

function templatelize(text = 'loading...', data = {first_name: 'Thông'}) {
    var check = 0

    if (isObject(text)) {
        var string = JSON.stringify(text)
        for (var i in data) {
            if (string.match(i)) {
                check++
            }
        }

        if (check > 0) {
            var template = _.template(string, data);
            return JSON.parse(template(data));
        } else return text
    } else {
        for (var i in data) {
            if (text.match(i)) {
                check++
            }
        }

        if (check > 0) {
            var template = _.template(text, data);
            return template(data);
        } else return text
    }


}


function initDataLoad(ref, store) {
    ref.on('child_added', function (snap) {
        store[snap.key] = snap.val()
    });
    ref.on('child_changed', function (snap) {
        store[snap.key] = snap.val()
    });
    ref.on('child_removed', function (snap) {
        delete store[snap.key]
    });


}

var DATA = {}

function initData(ref) {
    if (!DATA[ref]) DATA[ref] = {}
    db.ref(ref).on('child_added', function (snap) {
        DATA[ref][snap.key] = snap.val()
    });
    db.ref(ref).on('child_changed', function (snap) {
        DATA[ref][snap.key] = snap.val()
    });
    db.ref(ref).on('child_removed', function (snap) {
        delete DATA[ref][snap.key]
    });
}

function saveData(ref, child, data) {
    return new Promise(function (resolve, reject) {
        if (!ref || !child || !data) reject({err: 'Insufficient'})

        db.ref(ref).child(child).update(data)
            .then(result => resolve(data))
            .catch(err => reject(err))
    })
}


function saveSenderData(data, senderID, page = '493938347612411') {
    return new Promise(function (resolve, reject) {
        if (senderID != page) {
            data.pageID = page
            saveData('account', senderID, data)
                .then(result => resolve(data))
                .catch(err => reject(err))
        } else reject({err: 'same'})


    })
}

var uri = 'mongodb://joboapp:joboApp.1234@ec2-54-157-20-214.compute-1.amazonaws.com:27017/joboapp';

const MongoClient = require('mongodb');

var md, dumpling_messageFactoryCol, ladiBotCol, ladiResCol, messageFactoryCol

MongoClient.connect(uri, function (err, db) {
    console.log(err);

    md = db;
    dumpling_messageFactoryCol = md.collection('dumpling_messageFactory');
    messageFactoryCol = md.collection('messageFactory');
    ladiBotCol = md.collection('ladiBot_flow')
    ladiResCol = md.collection('ladiBot_response')

    console.log("Connected correctly to server.");

});


firebase.initializeApp({
    credential: firebase.credential.cert({
        "type": "service_account",
        "project_id": "jobo-chat",
        "private_key_id": "dadaa2894385e39becf4224109fd59ba866414f4",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDZDEwnCY6YboXU\nd0fSmOAL8QuPVNj6P+fJc+sa7/HUqpcZrnubJAfPYjDCiUOf9p6mo2g5nQEZiiim\nQYiB+KMt8sHPvRtNF5tWeXN3s7quKAJcwCZC8RySeiR9EfKTniI6QrFwQt0pU1Ay\ncPg/whb1LwXoyA6C7PErOEJ+xsDQmCxEOLmGrbmDe81tBJZIBU8WupV7j9416qOs\n3iPnYIJxr6gqJWKNp6ALUM/48c1pAompn6aB7zOweyvvfC6ZKuMUfsEii5FDYR+A\n9eeeghZFXv9VLp4zpsWUZqytGEEW9xgWdC5aCbMN6PoAvhbrr+CEz2hqimMFEqyn\nfRnrDTx3AgMBAAECggEAEGqys90wMO1jJ//hqdcwUxbnVe8H/l2pDX68EKyHcRt6\nFFIzPTfLc28s2voA6G+B7n67mmf6tlDR5Elept4Ekawj5q+aCgm4ESFcj3hDrXqP\nOy65diTAkX+1lNQvseSrGBcFTsVv7vlDPp122XO3wtHMs5+2IUcEss0tkmM8IErO\nmuG1TweQccK6CU+GdvtZ0bsMv16S0fBz9hNfWQ0JRtiBSMeYJahf1wMKoLPHzdfU\nMyK39U3JPHOjaQaYkj80MAdXVOT4fjy7j//p7cLT57Exj4y8jHFpwI9XRawCyKrw\nl6yLzHpGQ4To5ERur8JUtMHF9gYctDr3XI5zZ1fZ0QKBgQDxoZQtlxWpfHBPXwB3\nwclUqfsTZHvmCBeGROX73+Hy2S84W0lrvmr3mrLMnl6syx8OS4tZdA3s8pbvj0HH\nFD8IXV2acc3Mf+OfQiawRowobSSeSPUr//vsPYfobsMtLzOjiO0n20p/nVV3gGCG\nZQyUDuHZVDvSBGz3bUXDeHiZLwKBgQDl9HuIBkW3pcpGvfBMqwOyRhLJFEXL14Nh\npwJ2nBs7eTd09S95+P14s2Y0U2AGc96FmElVrXk8teSn982pocAW3mdD6KgBpC6m\nlEGCJB9da7f27qspUpqsne1+a4GfhBrFp3IVx9HOYgDsJ/xSLnr+Ajhn5lNiJMN5\n3H3iuUSvOQKBgQDi3W4ej+gKxYc9PllWF2BMWXwe7Q1XIOnVawLzxXSDal7nbu40\ndwg/icOuUlNZsSxrY4pmZoxcmDgWnE6J9/xmgiLMS2WKR9kTQizI/LPDkRX8d0ua\nEDIb0Hm2RaiC1/qH5Jul/EKqJrKEDMiT5nQ03vQ19Nxlhzo35STHLmksiQKBgQCQ\nEES8CUHwNfutqh07yv/71g66zuqTNCdpLFpMuKwO7Hgj29+siKMz1SC4s2s7X6gP\nBkMbXBzSPhpMaOD93woayabkUoO+038ueT85KyxDONL97rRopQmmDyLUysFgkEC9\nh5PftVnp9Fgjm0Fmsxv2uqlf3lpq6CFW3R44xl0TcQKBgHC+jSs3fVr7/0uTVXIE\n89V+ypBbPfI4T2Fl9wPuizTxmLTbbnq3neIVurs6RyM5bWUSPIIoU59NajgCBATL\naE8us6ldgDneXCDGt8z1YwFtpLz5H9ItkOMFl4+Y3WLbk3mgdvpI5M8YsgcnDQ8y\nk1GnVuyRg5oTiYM6g7UTvLnx\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-h83yt@jobo-chat.iam.gserviceaccount.com",
        "client_id": "117827674445250600196",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-h83yt%40jobo-chat.iam.gserviceaccount.com"
    }),
    databaseURL: 'https://jobo-chat.firebaseio.com'
});

var db = firebase.database()
var dataUser = {}, usersRef = db.ref('user')
initDataLoad(usersRef, dataUser)
var dataAccount = {}, accountRef = db.ref('account')
initDataLoad(accountRef, dataAccount)
var facebookPage = {}, facebookPageRef = db.ref('facebookPage')
initDataLoad(facebookPageRef, facebookPage)
var dataLadiBot = {}, ladiBotRef = db.ref('ladiBot')
initDataLoad(ladiBotRef, dataLadiBot)

initData('broadcast')


const vietnameseDecode = (str) => {
    if (str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "-");
        /* tìm và thay thế các kí tự đặc biệt trong chuỗi sang kí tự - */
        str = str.replace(/-+-/g, "-"); //thay thế 2- thành 1-
        str = str.replace(/^\-+|\-+$/g, "");
        //cắt bỏ ký tự - ở đầu và cuối chuỗi
        return str;
    }

}

function viewResponse(query) {
    return new Promise(function (resolve, reject) {
        console.log('query', query)
        var dataFilter = _.filter(dataAccount, account => {

            if (
                (account.pageID == query.page || !query.page)
                && ((account.full_name && account.full_name.toLocaleLowerCase().match(query.full_name)) || !query.full_name)
                && ((account.ref && account.ref.match(query.ref)) || !query.ref)
                && ((account.gender && account.gender.match(query.gender)) || !query.gender)
                && ((account.locale && account.locale.match(query.locale)) || !query.locale)
                && ((account.createdAt && account.createdAt > new Date(query.createdAt_from).getTime()) || !query.createdAt_from)
                && ((account.createdAt && account.createdAt < new Date(query.createdAt_to).getTime()) || !query.createdAt_to)
                && ((account.lastActive && account.lastActive > new Date(query.lastActive_from).getTime()) || !query.lastActive_from)
                && ((account.lastActive && account.lastActive < new Date(query.lastActive_to).getTime()) || !query.lastActive_to)
            ) return true
            else return false

        });
        var data = _.sortBy(dataFilter, function (data) {
            if (data.lastActive) {
                return -data.lastActive
            } else return 0
        })
        var count = _.countBy(data, function (num) {
            if (num.sent_error) return 'sent_error'
        });
        count.total = data.length

        resolve({count, data})
    })
}

app.get('/viewResponse', ({query}, res) => viewResponse(query).then(result => res.send(result)).catch(err => res.status(500).json(err)))

app.get('/getchat', ({query}, res) =>
    axios.get('https://jobo-chat.herokuapp.com/getchat', {params: query})
        .then(result => res.send(result.data))
        .catch(err => res.send(err)));


function userUpdate(body) {
    return new Promise((resolve, reject) => {
        console.log('body', body)
        var user = body
        if (!user.id) res.status(500).json({err: 'no userID'})

        if (!user.createdAt) user.createdAt = Date.now()
        user.updatedAt = Date.now()

        user.pageList = user.pageList.map(page => {
            if (page['$$hashKey']) delete page['$$hashKey']
            return page
        })

        var promises = user.pageList.map(function (obj) {
            return getLongLiveToken(obj.access_token)
                .then(results => {
                    if (obj['$$hashKey']) delete obj['$$hashKey']
                    obj.access_token = results.access_token
                    return obj
                })
                .catch(err => {
                    if (obj['$$hashKey']) delete obj['$$hashKey']
                    obj.access_token = 'err'
                    return obj
                })
        });

        Promise.all(promises)
            .then(results => {
                user.pageList = results
                usersRef.child(user.id).update(user).then(result => resolve(user)).catch(err => reject(err))
            })
    })
}

app.post('/user/update', ({body}, res) => userUpdate(body).then(result => res.send(result)).catch(err => res.status(500).json(err)));

function userUpdateAll() {
    var toArray = _.toArray(dataUser)
    return new Promise((resolve, reject) => {

        var promises = toArray.map(function (body) {
            return userUpdate(body)
                .then(results => {
                    return results
                })
                .catch(err => {
                    return err
                })
        });

        Promise.all(promises)
            .then(results => {
                resolve(results)
            })


    })
}

function getLongLiveToken(shortLiveToken) {
    console.log('getLongLiveToken-ing', shortLiveToken)

    return new Promise((resolve, reject) => {
        const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=295208480879128&client_secret=4450decf6ea88c391f4100b5740792ae&fb_exchange_token=${shortLiveToken}`;
        axios.get(url)
            .then(res => {
                console.log('getLongLiveToken', res.data)
                resolve(res.data)
            })
            .catch(err => {
                reject(err.response);
            });
    });
}

app.get('/user/update/all', ({body}, res) => userUpdateAll().then(result => res.send(result)).catch(err => res.status(500).json(err)));

function sendMessageNoSave(senderID, messages, typing, pageID, metadata) {
    return new Promise(function (resolve, reject) {

        var i = -1

        function sendPer() {
            i++
            if (i < messages.length) {
                var messageData = messages[i]
                sendOne(messageData, pageID).then(result => setTimeout(() => {
                    sendPer()
                }, 100))
                    .catch(err => {
                        console.log('err', i, err)
                        reject(err)
                    })
            } else {
                console.log('done', i, messages.length)
                resolve(messages)
            }

        }

        sendPer()


    })

}

function sendOne(messageData, page) {
    return new Promise(function (resolve, reject) {
        if (facebookPage[page] && facebookPage[page].access_token) {
            request({
                uri: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token: facebookPage[page].access_token},
                method: 'POST',
                json: messageData

            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var recipientId = body.recipient_id;
                    var messageId = body.message_id;
                    if (messageId) {
                        console.log("callSendAPI_success", messageId, recipientId);
                    }
                    resolve(messageData)

                } else {
                    sendLog("callSendAPI_error " + JSON.stringify(body) + JSON.stringify(messageData))
                    reject(body)
                }
            });
        } else {
            console.error("send_error_access-token", page, messageData);
            reject({err: 'no access token'})
        }

    })
}

function callSendAPI(messageData, page = 'jobo') {
    return new Promise(function (resolve, reject) {

        if (messageData.message && messageData.message.text && messageData.message.text.length > 640) {
            console.log('messageData.message.text.length', messageData.message.text.length)
            var longtext = messageData.message.text
            var split = longtext.split('.\n')
            console.log('split', split)
            var messages = split.map(text => {
                var mess = {
                    recipient: {
                        id: messageData.recipient.id
                    },
                    message: {
                        text: text
                    }
                };
                return mess
            });
            console.log('messages', messages)

            sendMessageNoSave(messageData.recipient.id, messages, null, page)
                .then(result => resolve(result))
                .catch(err => reject(err))

        } else sendOne(messageData, page)
            .then(result => resolve(result))
            .catch(err => reject(err))
    })

}

function sendTypingOn(recipientId, page = 'jobo') {
    return new Promise(function (resolve, reject) {

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_on"
        };

        callSendAPI(messageData, page)
            .then(result => resolve(result))
            .catch(err => reject(err));
    })

}

function sendTypingOff(recipientId, page = 'jobo') {
    return new Promise(function (resolve, reject) {

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_off"
        };

        callSendAPI(messageData, page).then(result => resolve(result))
            .catch(err => reject(err));
    })
}

function sendAPI(recipientId, message, typing, page = 'jobo', meta) {
    return new Promise(function (resolve, reject) {

        if (message.text) message.text = templatelize(message.text, dataAccount[recipientId])
        else if (message.attachment && message.attachment.payload && message.attachment.payload.text) message.attachment.payload.text = templatelize(message.attachment.payload.text, dataAccount[recipientId])

        if (!typing) typing = 100

        var messageData = {
            recipient: {
                id: recipientId
            },
            message
        };

        sendTypingOn(recipientId, page)
            .then(result => setTimeout(function () {
                callSendAPI(messageData, page).then(result => {
                    sendTypingOff(recipientId, page)
                    resolve(messageData)
                }).catch(err => reject(err))
            }, typing))
            .catch(err => reject(err))

        messageData.sender = {id: page}
        messageData.type = 'sent'
        messageData.timestamp = Date.now()
        if (meta) messageData.meta = meta
        saveSenderData({lastSent: messageData}, recipientId, page)
            .then(result => messageFactoryCol.insert(messageData)
                .catch(err => reject(err)))
            .catch(err => reject(err))
    })
}

function sendMessages(senderID, messages, typing, pageID, metadata) {
    return new Promise(function (resolve, reject) {

        var i = -1

        function sendPer() {
            i++
            if (i < messages.length) {
                var messageData = messages[i]
                sendAPI(senderID, messageData, typing, pageID, metadata).then(result => setTimeout(() => {
                    sendPer()
                }, 2000))
                    .catch(err => {
                        console.log('err', i, err)
                        reject(err)
                    })
            } else {
                console.log('done', i, messages.length)
                resolve(messages)
            }

        }

        sendPer()


    })

}

function sendLog(text) {
    console.log(text)
    var page = '233214007218284'
    var messageData = {message: {text}, recipient: {id: '1980317535315791'}}
    if (facebookPage[page] && facebookPage[page].access_token) request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: facebookPage[page].access_token},
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;
            if (messageId) {
                console.log("callSendAPI_success", messageId, recipientId);
            }
        } else {
            console.log("sendLog_err", body);

        }
    });

}


function getBotfromPageID(pageID) {

    if (facebookPage[pageID].currentBot) var result = _.findWhere(dataLadiBot, {id: facebookPage[pageID].currentBot});
    else result = _.findWhere(dataLadiBot, {page: pageID});

    return result.data;
}

function buildMessage(blockName, pageID) {
    return new Promise(function (resolve, reject) {
        var flow = getBotfromPageID(pageID)
        var allMessages = []
        var questions = flow[1]

        for (var i in questions) {
            var quest = questions[i]
            if (vietnameseDecode(blockName) == vietnameseDecode(quest[1])) {
                loopMes(i, flow, pageID)
                break
            }
        }

        function loopMes(q, flow, pageID) {
            if (q < questions.length) {

                var currentQuestion = questions[q];
                console.log('current', currentQuestion);

                if (currentQuestion[4] && currentQuestion[1] && currentQuestion[1].match('locale')) {
                    var askOption = currentQuestion[4][0][1];
                    var lang = senderData.locale.substring(0, 2)
                    var choose = askOption[0]
                    for (var i in askOption) {
                        var option = askOption[i]
                        if (option[0].match(lang)) {
                            choose = option
                            break
                        }
                    }

                    var index = _.findLastIndex(questions, {
                        0: choose[2]
                    });
                    index++
                    loopMes(index, flow, pageID)

                } else if (currentQuestion[3] == 8) {
                    var goto = currentQuestion[5];

                    if (goto == '-3') {
                        resolve(allMessages)
                    }
                    else if (goto == '-2' || !goto) {

                        q++
                        loopMes(q, flow, pageID)

                    } else {
                        var index = _.findLastIndex(questions, {
                            0: goto
                        });
                        index++
                        loopMes(index, flow, pageID)
                    }

                } else {
                    var currentQuestionId = currentQuestion[0];
                    var messageSend = {
                        text: currentQuestion[1],
                    }
                    var metadata = {
                        questionId: currentQuestionId
                    }
                    var askStringStr = `0,1,7,9,10,13`;
                    var askOptionStr = `2,3,4,5`;
                    var askType = currentQuestion[3];
                    console.log('askType', askType);
                    if (currentQuestion[4]) {
                        metadata.askType = askType;
                        metadata.type = 'ask';

                        if (askOptionStr.match(askType)) {
                            var askOption = currentQuestion[4][0][1];
                            var check = askOption[0][0]
                            if (check.match('&&')) {
                                var messageSend = {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "generic",
                                            "elements": []
                                        }
                                    }
                                }
                                var generic = []

                                var map = _.map(askOption, option => {

                                    var eleArray = option[0].split('&&')
                                    var image_url = ''
                                    if (option[5] && option[5][0]) image_url = flow[20][option[5][0]]

                                    if (option[2]) metadata.goto = option[2]
                                    if (generic.length < 10) generic.push({
                                        "title": eleArray[0] || option[0],
                                        "image_url": image_url,
                                        "subtitle": eleArray[1],
                                        "buttons": [
                                            {
                                                "type": "postback",
                                                "title": eleArray[2] || 'Choose',
                                                "payload": JSON.stringify(metadata)
                                            }
                                        ]
                                    });
                                    else console.log('generic.length', generic.length)
                                });
                                messageSend.attachment.payload.elements = generic;

                                allMessages.push({text: currentQuestion[1]})
                                allMessages.push(messageSend)
                            }
                            else if (askType == 3) {
                                console.log('askOption[0][2]', askOption[0][2])
                                var array_mes = []
                                var buttons = []
                                var each = _.each(askOption, option => {
                                    metadata.text = option[0]
                                    if (option[2]) metadata.goto = option[2]
                                    if (option[4] == 1) metadata.other = option[2]

                                    var str = option[0]

                                    if (str.indexOf("[") != -1 && str.indexOf("]") != -1) {
                                        var n = str.indexOf("[") + 1;
                                        var b = str.indexOf("]");
                                        var sub = str.substr(n, b - n)
                                        var tit = str.substr(0, n - 2)
                                        var expression = "/((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[\\-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9\\.\\-]+|(?:www\\.|[\\-;:&=\\+\\$,\\w]+@)[A-Za-z0-9\\.\\-]+)((?:\\/[\\+~%\\/\\.\\w\\-_]*)?\\??(?:[\\-\\+=&;%@\\.\\w_]*)#?(?:[\\.\\!\\/\\\\\\w]*))?)/\n";
                                        var regex = 'http';
                                        if (sub.match(regex)) var button = {
                                            type: "web_url",
                                            url: sub,
                                            title: tit,
                                            messenger_extensions: false
                                        }
                                        else button = {
                                            type: "phone_number",
                                            title: tit,
                                            payload: sub
                                        }

                                    } else if (option[0]) button = {
                                        type: "postback",
                                        title: option[0],
                                        payload: JSON.stringify(metadata)
                                    }
                                    if (button) buttons.push(button)

                                });
                                console.log('buttons', buttons)
                                var length = buttons.length
                                console.log('length', length)

                                var max = 0
                                for (var i = 1; i <= length / 3; i++) {
                                    console.log('i', i, length / 3)
                                    var max = i
                                    var messageSend = {
                                        attachment: {
                                            type: "template",
                                            payload: {
                                                template_type: "button",
                                                text: '---',
                                                buttons: [buttons[3 * i - 3], buttons[3 * i - 2], buttons[3 * i - 1]]
                                            }
                                        }
                                    }
                                    if (i == 1) messageSend.attachment.payload.text = currentQuestion[1]

                                    array_mes.push(messageSend)
                                }

                                if (length % 3 != 0) {
                                    var rest = _.rest(buttons, 3 * max)

                                    console.log('rest', rest)

                                    messageSend = {
                                        attachment: {
                                            type: "template",
                                            payload: {
                                                template_type: "button",
                                                text: '---',
                                                buttons: rest
                                            }
                                        }
                                    }
                                    if (length < 3) messageSend.attachment.payload.text = currentQuestion[1]
                                    array_mes.push(messageSend)

                                }
                                console.log(array_mes)
                                allMessages = allMessages.concat(array_mes)


                            } else {
                                var quick_replies = []
                                var map = _.map(askOption, option => {
                                    metadata.text = option[0]
                                    if (option[2]) metadata.goto = option[2]
                                    if (option[4] == 1) {
                                        metadata.other = option[2]
                                        console.log('metadata', metadata)
                                    }

                                    var quick = {
                                        "content_type": "text",
                                        "title": option[0],
                                        "payload": JSON.stringify(metadata)

                                    }
                                    if (option[5] && option[5][0]) quick.image_url = flow[20][option[5][0]]

                                    if (quick_replies.length < 11) quick_replies.push(quick)
                                    else console.log('quick_replies.length', quick_replies.length)
                                });

                                messageSend.quick_replies = quick_replies
                                allMessages.push(messageSend)

                            }


                        } else if (askStringStr.match(askType)) {

                            allMessages.push(messageSend)

                        }

                        resolve(allMessages)

                    }
                    else {
                        metadata.type = 'info'

                        q++

                        if (askType == 11 && flow[20]) {
                            allMessages.push(senderID, {
                                attachment: {
                                    type: "image",
                                    payload: {
                                        url: flow[20][currentQuestion[6][0]]
                                    }
                                }
                            })
                            loopMes(q, flow, senderID, pageID)

                        }
                        else if (askType == 12 && currentQuestion[6][3]) {
                            allMessages.push({
                                text: `https://www.youtube.com/watch?v=${currentQuestion[6][3]}`
                            })
                            loopMes(q, flow, pageID)
                        }
                        else if (askType == 6) {
                            if (currentQuestion[1].match('pdf')) {
                                allMessages.push({
                                    attachment: {
                                        type: "file",
                                        payload: {
                                            url: currentQuestion[1]
                                        }
                                    }
                                });
                                loopMes(q, flow, senderID, pageID)
                            }
                            else if (currentQuestion[1].match('JSON')) {
                                var url = currentQuestion[2]
                                console.log('url ', url)
                                axios.get(url).then(result => {
                                    var messages = result.data
                                    allMessages = allMessages.concat(messages)
                                    resolve(allMessages)
                                })
                            }
                            else if (currentQuestion[2] && currentQuestion[2].toLowerCase() == 'notification') {
                                console.log('setNoti')
                                loopMes(q, flow, pageID)
                            }
                            else if (currentQuestion[2] && currentQuestion[2].match('<>')) {
                                console.log('random', currentQuestion[2])
                                var array = currentQuestion[2].split('<>');
                                array.push(currentQuestion[1]);
                                var pick = _.sample(array);
                                messageSend.text = pick
                                allMessages.push(messageSend)
                                loopMes(q, flow, pageID)

                            } else {
                                var messages = [{text: currentQuestion[1]}]
                                if (currentQuestion[2]) {
                                    messages.push({text: currentQuestion[2]})
                                }
                                allMessages = allMessages.concat(messages)
                                loopMes(q, flow, pageID)
                            }

                        }

                    }


                }


            } else resolve(allMessages)

        }


    })

}

app.get('/buildMessage', ({query: {pageID, blockName}}, res) => buildMessage(blockName, pageID).then(result => res.send(result)));

function sendBroadCast(query, blockName) {
    return new Promise(function (resolve, reject) {

        var pageID = query.page;
        var broadCast = {query, blockName, createdAt: Date.now(), id: Date.now()}
        saveData('broadcast', broadCast.id, broadCast)
        buildMessage(blockName, pageID)
            .then(messages => viewResponse(query)
                .then(result => {
                    var users = result.data
                    var i = -1
                    var success = 0
                    var log = []

                    function sendPer() {
                        i++
                        if (i < users.length) {
                            var obj = users[i]
                            sendMessages(obj.id, messages, null, pageID).then(result => setTimeout(() => {
                                success++
                                log.push({success: obj.id})
                                sendPer()
                            }, 1000))
                                .catch(err => {
                                    log.push({err})
                                    sendPer()
                                })
                        } else {
                            console.log('sendBroadCast_done', i, users.length)
                            broadCast.total = users.length
                            broadCast.sent = success
                            saveData('broadcast', broadCast.id, broadCast)
                                .then(result => resolve(broadCast))
                                .catch(err => reject(err))
                        }

                    }

                    sendPer()
                }))
    })

}

app.get('/sendBroadCast', ({query}, res) => sendBroadCast(query, query.blockName).then(result => res.send(result)).catch(err => res.status(500).json(err)))

function loadBroadCast(pageID) {
    return new Promise(function (resolve, reject) {
        var broadCast = DATA['broadcast']
        var res = _.filter(broadCast, cast => {
            if (cast.query.page == pageID) return true
        })
        console.log('broadCast', broadCast)
        resolve(res)
    })

}

app.get('/loadBroadCast', ({query}, res) => loadBroadCast(query.pageID).then(result => res.send(result)).catch(err => res.status(500).json(err)))


var listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
var circular = require('circular');

var crypto = require('crypto')
var secret = '6p6sa9oy8ayj8fn1n44kyoxzrk8g4wo0'


app.get('/paybank', ({query}, res) => {
    var order_id = encodeURI('Botform_PRO_1')
    var order_info = encodeURI('1_month')
    var amount = 350000
    if(query.type==6){
        order_id = encodeURI('Botform_PRO_6')
        order_info = encodeURI('6_months_get_1_month_free)')
        amount = 350000*6
    }
    var urlParameters = `access_key=clbgp35br12gb6j3oq6h&amount=${amount}&command=request_transaction&order_id=${order_id}&order_info=${order_info}&return_url=https://m.me/160957044542923?ref=go_buy-success`
    var signature = crypto.createHmac('sha256', secret).update(urlParameters, 'utf8').digest('hex');
    var fullurl = urlParameters + '&signature=' + signature

    axios.post('https://api.pay.truemoney.com.vn/bank-charging/service/v2?' + fullurl).then(result => res.send(result.data))
        .catch(err => res.send(JSON.stringify(err, circular())))

})

app.get('/paybankButton')

var urlParameters2 = `access_key=clbgp35br12gb6j3oq6h&amount=10000&order_id=test_50&order_info=test_order_description&return_url=https://app.botform.asia/success`
var signature2 = crypto.createHmac('sha256', secret).update(urlParameters2, 'utf8').digest('hex');
var fullurl2 = urlParameters2 + '&signature=' + signature2

