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

var graph = require('fbgraph');
graph.setVersion("2.12");


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(cors());

;
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var port = process.env.PORT || 1235


_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

function strToObj(str) {
    if (str.match('&')) {
        var keyvalue = str.split('&')
    } else keyvalue = [str]
    var obj = {}
    keyvalue.forEach(each => {
        if (each.match('=')
        ) {
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

function saveData(ref, child, data, type) {
    return new Promise(function (resolve, reject) {
        if (!ref || !child || !data) reject({err: 'Insufficient'})
        if (type == 'm') {
            data._id = `ObjectId(${child})`
            md.collection(ref).insertOne(data, (err, result) => {
                if (err) reject(err)
                resolve(result)
            })

        } else db.ref(ref).child(child).update(data)
            .then(result => resolve(data))
            .catch(err => reject(err))
    })
}


function saveSenderData(data, senderID, page = '493938347612411') {
    return new Promise(function (resolve, reject) {
        if (senderID != page) {
            data.pageID = page
            saveData('account', senderID, data)
                .then(result => resolve(data)
                )
                .catch(err => reject(err)
                )
        } else reject({err: 'same'})


    })
}

var uri = 'mongodb://joboapp:joboApp.1234@ec2-54-157-20-214.compute-1.amazonaws.com:27017/joboapp';

const MongoClient = require('mongodb');

var md, dumpling_messageFactoryCol, ladiBotCol, ladiResCol, messageFactoryCol, logCol

MongoClient.connect(uri, (err, db) => {
    if (err) console.log(err);

    md = db;
    dumpling_messageFactoryCol = md.collection('dumpling_messageFactory');
    messageFactoryCol = md.collection('messageFactory');
    ladiBotCol = md.collection('ladiBot_flow')
    ladiResCol = md.collection('ladiBot_response')
    logCol = md.collection('log')
    console.log("Connected correctly to server.");
})


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

var dataAccount = {}, accountRef = db.ref('account')
initDataLoad(accountRef, dataAccount)

var dataLadiBot = {}, ladiBotRef = db.ref('ladiBot')
initDataLoad(ladiBotRef, dataLadiBot)

initData('broadcast')
initData('user')
initData('removeBranding')

initData('facebookPage')


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
                && (account.role || !query.role)

            ) return true
            else return false

        })
    ;
    var data = _.sortBy(dataFilter, function (data) {
        if (data.lastActive) {
            return -data.lastActive
        } else return 0
    })
    var count = _.countBy(data, function (num) {
        if (num.sent_error) return 'sent_error'
    });
    count.total = data.length

    return {count, data}
}

app.get('/viewResponse', ({query}, res) => res.send(viewResponse(query)))

app.get('/getchat', ({query}, res) => axios.get('https://jobo-chat.herokuapp.com/getchat', {params: query})
    .then(result => res.send(result.data))
    .catch(err => res.send(err)));

function updateFbId(pageID) {
    return new Promise((resolve, reject) => {
        var array = []
        console.log('updateFbId', DATA.facebookPage[pageID].access_token);

        axiosLoop('https://graph.facebook.com/v2.12/me/conversations?fields=name,link,id,participants&limit=450&access_token=' + DATA.facebookPage[pageID].access_token)

        function axiosLoop(url) {
            axios.get(url).then((result, err) => {
                if (err) reject(err)
                var conversations = result.data
                console.log('conversations', conversations, err);
                array = array.concat(conversations.data)
                if (conversations.paging.next) axiosLoop(conversations.paging.next)
                else {
                    var users = viewResponse({page: pageID}).data
                    var users = users.map(user => {
                        console.log('user.link', user.link)
                        var data = _.findWhere(array, {link: user.link})
                        console.log('data', data)
                        if (data) {
                            user.fbId = data.participants.data[0].id
                            user.tId = data.id.slice(2)
                            var roles = DATA.facebookPage[pageID].roles.data
                            var admin = _.findWhere(roles, {id: user.fbId})
                            if (admin) {
                                saveData('account', user.id, {role: admin.role}).then(result => console.log('save', result))
                            }

                        }

                        return user
                    })
                    resolve(users)
                }


            })
        }
    })

}

app.get('/updateFbId', ({query}, res) => updateFbId(query.pageID).then(result => res.send(result)
).catch(err => res.status(500).json(err)
))


function updateFbIdAll() {
    var toArray = _.toArray(DATA.facebookPage)
    return new Promise((resolve, reject) => {

        var promises = toArray.map(function (body) {
            return updateFbId(body.id)
                .then(results => {
                        return results
                    }
                ).catch(err => {
                        return err
                    }
                )
        });

        Promise.all(promises).then(results => resolve(results)
        )

    })

}

app.get('/updateFbIdAll', ({query}, res) => updateFbIdAll().then(result => res.send(result)
).catch(err => res.status(500).json(err)
))

function userUpdate(body) {
    return new Promise((resolve, reject) => {
        var user = body
        if (!user.id) res.status(500).json({err: 'no userID'})

        if (!user.createdAt) user.createdAt = Date.now()
        user.updatedAt = Date.now()

        user.pageList = user.pageList.map(page => {
            if (page['$$hashKey']
            )
                delete page['$$hashKey']
            return page
        })

        var promises = user.pageList.map(function (obj) {
            return getLongLiveToken(obj.access_token)
                .then(results => {
                    if (obj['$$hashKey']
                    )
                        delete obj['$$hashKey']
                    obj.access_token = results.access_token
                    return obj
                })
                .catch(err => {
                    if (obj['$$hashKey']
                    )
                        delete obj['$$hashKey']
                    obj.access_token = 'err'
                    return obj
                })
        });

        Promise.all(promises)
            .then(results => {
                user.pageList = results


                saveData('user', user.id, user).then(result => resolve(user)
                ).catch(err => reject(err)
                )
            })
    })
}

app.post('/user/update', ({body}, res) => userUpdate(body).then(result => res.send(result)
).catch(err => res.status(500).json(err)
))
;

function userUpdateAll() {
    var toArray = _.toArray(DATA.user)
    return new Promise((resolve, reject) => {

        var promises = toArray.map(function (body) {
            return userUpdate(body)
                .then(results => {
                        return results
                    }
                )
                .catch(err => {
                        return err
                    }
                )
        });

        Promise.all(promises)
            .then(results => {
                    resolve(results)
                }
            )


    })
}

function getLongLiveToken(shortLiveToken) {
    console.log('getLongLiveToken-ing', shortLiveToken)

    return new Promise((resolve, reject) => {
        const url = `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=295208480879128&client_secret=4450decf6ea88c391f4100b5740792ae&fb_exchange_token=${shortLiveToken}`;
        axios.get(url)
            .then(res => resolve(res.data))
            .catch(err => reject(err.response))
        ;
    })
        ;
}

function getFullPageInfo(pageID, access_token) {
    return new Promise((resolve, reject) => {
        graph.get('/me/?fields=name,id,fan_count,roles,location&access_token=' + access_token, (err, result) => {
            if (err || result.message) reject(err)
            saveData('facebookPage', pageID, result)
                .then(result => resolve(result))
                .catch(err => reject(err))
        })
    })


}

function getFullaPageAll(pageList) {
    return new Promise((resolve, reject) => {

        var promises = pageList.map(function (body) {
            return getFullPageInfo(body.id, body.access_token)
                .then(results => {
                        return results
                    }
                )
                .catch(err => {
                        return err
                    }
                )
        });

        Promise.all(promises)
            .then(results => {
                    resolve(results)
                }
            )


    })
}

app.get('/getFullPageInfo', ({query}, res) => getFullPageInfo(query.pageID, DATA.facebookPage[query.pageID].access_token).then(result => res.send(result)
).catch(err => res.status(500).json(err)
))
;

app.get('/getFullPageAll', ({query}, res) => {
    var toArray = _.toArray(DATA.facebookPage)
    return new Promise((resolve, reject) => {

        var promises = toArray.map(function (body) {
            return getFullPageInfo(body.id, body.access_token)
                .then(results => {
                        return results
                    }
                )
                .catch(err => {
                        return err
                    }
                )
        });

        Promise.all(promises)
            .then(results => {
                res.send(results)
            })


    })

})
;


app.get('/user/update/all', ({query}, res) => userUpdateAll().then(result => res.send(result)
).catch(err => res.status(500).json(err)
))
;

function sendMessageNoSave(senderID, messages, typing, pageID, metadata) {
    return new Promise(function (resolve, reject) {

        var i = -1

        function sendPer() {
            i++
            if (i < messages.length) {
                var messageData = messages[i]
                sendOne(messageData, pageID).then(result => setTimeout(() => {
                        sendPer()
                    }, 100
                ))
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
        var tag = ["COMMUNITY_ALERT", "CONFIRMED_EVENT_REMINDER", "PAIRING_UPDATE", "APPLICATION_UPDATE", "ACCOUNT_UPDATE", "PAYMENT_UPDATE", "RESERVATION_UPDATE", "ISSUE_RESOLUTION", "FEATURE_FUNCTIONALITY_UPDATE"]
        var tag_1 = ["NON_PROMOTIONAL_SUBSCRIPTION"]

        messageData.tag = _.sample(tag_1)
        if (!DATA.facebookPage[page] || !DATA.facebookPage[page].access_token) {
            console.log("send_error_access-token", page, messageData);
            reject({err: 'no access token'})
        }


        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: DATA.facebookPage[page].access_token},
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
                sendLog("callSendAPI_error:" + JSON.stringify(body) + '\n page: ' + DATA.facebookPage[page].name + '\n Message:' + JSON.stringify(messageData))
                reject(body)
            }
        });

    })
}

function callSendAPI(messageData, page = 'jobo') {
    return new Promise(function (resolve, reject) {
        if (!messageData) reject({err: 'No Message'})
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
                })
            ;
            console.log('messages', messages)

            sendMessageNoSave(messageData.recipient.id, messages, null, page)
                .then(result => resolve(result)
                )
                .catch(err => reject(err)
                )

        } else sendOne(messageData, page)
            .then(result => resolve(result)
            )
            .catch(err => reject(err)
            )
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
            .then(result => resolve(result)
            )
            .catch(err => reject(err)
            )
        ;
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

        callSendAPI(messageData, page)
            .then(result => resolve(result)
            )
            .catch(err => reject(err)
            )
        ;
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
                        }
                    ).catch(err => reject(err)
                    )
                }, typing)
            )
            .catch(err => reject(err)
            )

        messageData.sender = {id: page}
        messageData.type = 'sent'
        messageData.timestamp = Date.now()
        if (meta) messageData.meta = meta
        saveSenderData({lastSent: messageData}, recipientId, page)
            .then(result => messageFactoryCol.insert(messageData)
                .catch(err => reject(err)
                ))
            .catch(err => reject(err)
            )
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
                    }, 2000
                ))
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
    if (DATA.facebookPage[page] && DATA.facebookPage[page].access_token) request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: DATA.facebookPage[page].access_token},
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

    if (DATA.facebookPage[pageID] && DATA.facebookPage[pageID].currentBot) var result = _.findWhere(dataLadiBot, {id: DATA.facebookPage[pageID].currentBot});
    else result = _.findWhere(dataLadiBot, {page: pageID});

    return result;
}

function buildMessage(blockName, pageID) {
    return new Promise(function (resolve, reject) {
        var flow = getBotfromPageID(pageID).data
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
                                        if (option[5] && option[5][0]
                                        )
                                            image_url = flow[20][option[5][0]]

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
                                    })
                                ;
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

                                    })
                                ;
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
                                    })
                                ;

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
                                    }
                                )
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

app.get('/buildMessage', ({
                              query: {
                                  pageID,
                                  blockName
                              }
                          }, res) => buildMessage(blockName, pageID).then(result => res.send(result)
))
;

app.get('/getTargetUser', ({query}, res) => getTargetUser(query.spreadsheetId)
    .then(result => res.send(result))
    .catch(err => res.status(500).json(err)))

function getTargetUser(spreadsheetId) {
    return new Promise(function (resolve, reject) {
        axios.get(`https://jobo-ana.herokuapp.com/getData?spreadsheetId=${spreadsheetId}&range=broadcast`)
            .then(result => resolve(result.data))
            .catch(err => {
                console.log(err)
                reject(err)
            })
    })
}

function sendBroadCast(query, blockName, users) {
    return new Promise(function (resolve, reject) {

        var pageID = query.pageID;
        var broadCast = {query, blockName, createdAt: Date.now(), id: Date.now()}
        saveData('broadcast', broadCast.id, broadCast)
        buildMessage(blockName, pageID)
            .then(messages => {
                if (!users) {
                    var result = viewResponse(query)
                    users = result.data
                }
                console.log('sendBroadCast_start', query, blockName, users.length)

                var i = -1
                var success = 0
                var log = []

                function sendPer() {
                    i++
                    if (i < users.length) {
                        var obj = users[i]
                        sendMessages(obj.id || obj.mID, messages, null, pageID).then(result => setTimeout(() => {
                                success++
                                log.push({success: obj.id})
                                sendPer()
                            }, 1000
                        ))
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
            })
    })

}

app.get('/sendBroadCast', ({query}, res) => {
    if (query.sheetId) getTargetUser(query.sheetId).then(result => sendBroadCast({pageID: query.pageID}, query.blockName, result.data)
        .then(result => res.send(result))
        .catch(err => res.status(500).json(err)))
    else sendBroadCast(query, query.blockName)
        .then(result => res.send(result))
        .catch(err => res.status(500).json(err))


})

function loadBroadCast(pageID) {
    return new Promise(function (resolve, reject) {
        var broadCast = DATA['broadcast']
        var res = _.filter(broadCast, cast => {
            if (cast.query.page == pageID
            )
                return true
        })
        console.log('broadCast', broadCast)
        resolve(res)
    })

}

app.get('/loadBroadCast', ({query}, res) => loadBroadCast(query.pageID).then(result => res.send(result)
).catch(err => res.status(500).json(err)
))


function checkSender() {
    return new Promise(function (resolve, reject) {
        var users = _.toArray(dataAccount)
        var i = -1
        var log = []
        var error = 0

        function sendPer() {
            i++
            if (i < users.length) {
                console.log(`checkSender ${i}/${users.length}`)

                var obj = users[i]
                sendTypingOn(obj.id, obj.pageID).then(result => {
                    saveSenderData({sent_error: null}, obj.id, obj.pageID
                    )
                    log.push(result)
                    sendPer()
                }).catch(err => {
                    saveSenderData({
                            sent_error: err.error.message
                        },
                        obj.id, obj.pageID
                    )
                    log.push(err)
                    error++
                    sendPer()
                })
            } else {
                console.log('checkSender_done', i, users.length)
                sendLog('checkSender_done err' + error + '/' + users.length)

                resolve(log)
            }

        }

        sendPer()


    })
}

app.get('/checkSender', (req, res) => checkSender().then(result => res.send(result)
))


var circular = require('circular');

var crypto = require('crypto')
var secret = '6p6sa9oy8ayj8fn1n44kyoxzrk8g4wo0'

function paybank(query) {
    return new Promise(function (resolve, reject) {
        var order_id = encodeURI('Botform_PRO_1')
        var order_info = encodeURI('1_month')
        var amount = 350000
        if (query.type == 6) {
            order_id = encodeURI('Botform_PRO_6')
            order_info = encodeURI('6_months_get_1_month_free)')
            amount = 350000 * 6
        }
        var urlParameters = `access_key=clbgp35br12gb6j3oq6h&amount=${amount}&command=request_transaction&order_id=${order_id}&order_info=${order_info}&return_url=https://m.me/160957044542923?ref=go_buy-success`
        var signature = crypto.createHmac('sha256', secret).update(urlParameters, 'utf8').digest('hex');
        var fullurl = urlParameters + '&signature=' + signature

        axios.post('https://api.pay.truemoney.com.vn/bank-charging/service/v2?' + fullurl)
            .then(result => resolve(result.data)
            )
            .catch(err => reject(JSON.stringify(err, circular()))
            )

    })

}

app.get('/paybank', ({query}, res) => paybank(query).then(result => res.send(result)
)
    .catch(err => res.status(500).json(err)
    ))


app.get('/paybankButton', ({query}, res) => {

    paybank(query).then(result => {
        var send = {
            "messages": [
                {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": "Thanh toán bằng thẻ ATM nội địa",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": result.pay_url,
                                    "title": "Thanh toán thẻ ATM"
                                }
                            ]
                        }
                    }
                }
            ]
        }
        res.send(send)


    }).catch(err => res.status(500).json(err)
    )
})

var urlParameters2 = `access_key=clbgp35br12gb6j3oq6h&amount=10000&order_id=test_50&order_info=test_order_description&return_url=https://app.botform.asia/success`
var signature2 = crypto.createHmac('sha256', secret).update(urlParameters2, 'utf8').digest('hex');
var fullurl2 = urlParameters2 + '&signature=' + signature2

function setDefautMenu(page = 'jobo', persistent_menu, branding = true) {
    if (!persistent_menu) {
        var form = getBotfromPageID(page)
        if (form && form.persistent_menu) persistent_menu = form.persistent_menu
        else persistent_menu = [
            {
                "call_to_actions": [],
                "locale": "default",
            }
        ]
    }

    if (branding) persistent_menu = persistent_menu.map(per => {
        per.call_to_actions.push({
            "title": "Create a bot in Botform",
            "type": "web_url",
            "url": "https://app.botform.asia/create"
        })
        return per
    })


    var menu = {persistent_menu}

    console.log("setDefautMenu-ing", page, menu);
    var pageData = _.findWhere(getAllPage(), {id: page})
    var access_token = pageData.access_token

    return new Promise(function (resolve, reject) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
            qs: {access_token: access_token},
            method: 'POST',
            json: menu

        }, function (error, response, body) {
            console.log("setDefautMenu", error, body);

            if (!error && response.statusCode == 200) {
                resolve(body)
            } else {
                reject(error)

            }
        });
    })

}

function subscribed_apps(access_token, pageID) {
    return new Promise(function (resolve, reject) {
        console.log(access_token, pageID)
        graph.post(pageID + '/subscribed_apps', {access_token}, function (err, result) {
            console.log('subscribed_apps', err, result)
            if (err) reject(err)
            resolve(result)
        })

    })
}

function removeChatfuelBranding(pageID) {
    return new Promise(function (resolve, reject) {
        var pageData = _.findWhere(getAllPage(), {id: pageID})
        var access_token = pageData.access_token

        if (!pageID || !access_token) reject({err: 'No PageID, access_token'})

        saveData('removeBranding', pageID, {createdAt: Date.now(), pageID})

        graph.get('/me/messenger_profile?fields=persistent_menu&access_token=' + access_token, (err, result) => {

            console.log('persistent_menu', err, result)
            if (result && result.data && result.data[0]) {
                var menu = result.data[0]

                menu.persistent_menu = menu.persistent_menu.map(per => {
                    var call = per.call_to_actions
                    var lastTitle = _.last(call).title.toLocaleLowerCase()
                    if (lastTitle.match('manychat') || lastTitle.match('chatfuel')
                    )
                        call = _.initial(call)
                    per.call_to_actions = call
                    return per
                })
                console.log('newmenu', JSON.stringify(menu))

                setDefautMenu(pageID, menu.persistent_menu, null)
                    .then(result => saveData('removeBranding', pageID, {status: 'success'})
                        .then(saveSuc => resolve({status: 'success', pageID})
                        )
                    )
                    .catch(err => saveData('removeBranding', pageID, {status: err}).then(saveSuc => reject(err)
                    ))
            }

        })

    })

}

app.get('/removeChatfuelBranding', ({query}, res) =>
    removeChatfuelBranding(query.pageID)
        .then(result => res.send(result)
        )
        .catch(err => res.status(500).json(err)
        ))


function removeRefresh() {
    return new Promise(function (resolve, reject) {
        var list = _.toArray(DATA.removeBranding)
        console.log('list', list)
        var promises = list.map(function (obj) {
            return removeChatfuelBranding(obj.pageID)
                .then(results => {
                        return results
                    }
                )
                .catch(err => {
                        return err
                    }
                )
        });

        Promise.all(promises)
            .then(results => {
                sendLog('removeRefreshing'
                )
                resolve(results)
            })
    })

}

function sendLog(text) {
    console.log(text)
    var page = '233214007218284'
    var messageData = {message: {text}, recipient: {id: '1980317535315791'}}
    if (DATA.facebookPage[page] && DATA.facebookPage[page].access_token) request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: DATA.facebookPage[page].access_token},
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

setInterval(function () {
    removeRefresh()
}, 1000 * 60 * 60)

app.get('/removeRefresh', (req, res) =>
    removeRefresh()
        .then(result => res.send(result)
        )
        .catch(err => res.status(500).json(err)
        ))

function getAllPage() {
    var allPage = []
    var dataUser = DATA.user
    for (var i in dataUser) {
        var user = dataUser[i]
        allPage = allPage.concat(user.pageList)
    }

    return allPage
}

app.get('/getAllPage', ({query}, res) => res.send(getAllPage())
)

/// Analytics

function analytics(pageID, day = 1, ago = 0) {
    return new Promise(function (resolve, reject) {

        var end = Date.now() - 1000 * 60 * 60 * 24 * ago
        var start = end - 1000 * 60 * 60 * 24 * day

        var query = {start, end, pageID}
        var result = {}

        var lastActive = viewResponse({page: pageID, lastActive_from: start, lastActive_to: end}).count.total

        var filter = viewResponse({page: pageID, createdAt_from: start, createdAt_to: end})

        var createAt = filter.count.total
        var send_error = filter.count.sent_error

        var ref = {}

        _.each(filter, num => {
            if (num.ref) {
                if (ref[num.ref]) ref[num.ref]++
                else ref[num.ref] = 1
            }
        })
        ;

        result = {lastActive, createAt, send_error, ref}

        var Array = [{query: {"sender.id": pageID, "timestamp": {$gte: start, $lte: end}}, type: 'sent'}, {
            query: {
                "recipient.id": pageID,
                "timestamp": {$gte: start, $lte: end}
            }, type: 'receive'
        }]


        var promises = Array.map(function (obj) {
            return queryThen(messageFactoryCol, obj.query).then(result => {
                    var res = {}
                    res[obj.type] = result.length
                    return res
                }
            )
        });

        Promise.all(promises)
            .then(results => {
                result.sent = results[0].sent
                result.receive = results[1].receive

                resolve({result, query})
            })


    })
}

function datefily(dateTime) {
    if (dateTime) {
        var date = new Date(dateTime)
        var month = date.getMonth() + 1
        return date.getHours() + 'h ' + date.getDate() + '/' + month;
    }
}

function buildReport(pageID, day = 1, ago = 0) {
    return new Promise(function (resolve, reject) {
        day = Number(day)
        ago = Number(ago)
        analytics(pageID, day, ago).then(now => {
            var past_day = day + ago
            console.log('past_day', past_day)
            analytics(pageID, day, past_day).then(past => {
                    var text = `Report ${day} day from ${datefily(now.query.start)} to ${datefily(now.query.end)} \n \n`
                    text = text + `New Users: ${now.result.createAt} (${now.result.createAt - past.result.createAt })\n`
                    text = text + `Active Users: ${now.result.lastActive} (${now.result.lastActive - past.result.lastActive})\n`
                    text = text + `Sent Messages: ${now.result.sent} (${now.result.sent - past.result.sent})\n`
                    text = text + `Received Messages: ${now.result.receive} (${now.result.receive - past.result.receive})\n`
                    text = text + `Ref: ${JSON.stringify(now.result.ref)}\n \n`

                    var advice = ["Remember, slow and steady always wins the race.", "You should make Click-to-Messenger Ads to get more leads", "Add Customer Chat Plugin to your website", "Shared content is one of the best ways for your Messenger bot to gain exposure.", "m.me Links with ref to measure your campaign"]
                    text = text + `Tips: ${_.sample(advice)}\n`
                    resolve({text})
                }
            )


        })
    })
}

app.get('/buildReport', ({query}, res) => buildReport(query.pageID, query.day, query.ago)
    .then(result => res.send(result))
    .catch(err => res.status(500).json(err)
    ))

function queryThen(col, query) {
    return new Promise(function (resolve, reject) {
        col.find(query).toArray((err, data) => {
                resolve(data)
            }
        )
    })

}

app.get('/analytics', ({query}, res) => analytics(query.pageID, query.day, query.ago)
    .then(result => res.send(result))
    .catch(err => res.status(500).json(err)
    ))


function ladiBot(query) {
    return _.where(dataLadiBot, {id: query.id})
}

app.get('/ladiBot', ({query}, res) => res.send(ladiBot(query)))


function queryPage(query) {
    var data = _.filter(DATA.facebookPage, page => {
        if (page.name && page.name.toLowerCase().match(query.toLowerCase())) return true
        else return false
    })

    var sort = _.sortBy(data, per => {
        return -per.fan_count
    })
    return sort
}

app.get('/queryPage', (req, res) => {
    var {query} = req.query
    res.send(queryPage(query))
})
app.get('/dashBoard', ({query}, res) => {
    var pageData = DATA.facebookPage[query.pageID]

    pageData.bot = getBotfromPageID(query.pageID)
    res.send(pageData)
})


app.listen(port, function () {
    console.log('Node app is running on port', port);
});
// axios.get('https://web.mastersocial.io/getInfo.php?note=&uid=100003155374518',{ headers: {
//         Cookie: "__cfduid=d249178942b1143e2dbf5124910b3facc1521567934; PHPSESSID=kkuhf1o92hp490epnuf58h5hs5; _ga=GA1.2.339640636.1521567937; _gid=GA1.2.1246170553.1521567937;"
//     }}).then(result => console.log(result.data))


app.post('/update/log', ({body}, res) => {

    var log = body.log
    saveData('log', log.id, log, 'm').then((result, err) => {
        console.log('result, err',result, err)
        if (err) res.status(500).json(err)

        res.send(result)

    })


})