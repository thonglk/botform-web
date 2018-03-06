// server.js
// where your node app starts

var firebase = require("firebase-admin");
var axios = require("axios")
var cors = require("cors")
var _ = require("underscore")
var express = require('express');
var app = express();

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

app.get('/viewResponse', ({query}, res) => {
    axios.get('https://jobo-chat.herokuapp.com/viewResponse', {params: query})
        .then(result => res.send(result.data))
        .catch(err => res.status(500).json(err))
});

app.get('/getchat', ({query}, res) =>
    axios.get('https://jobo-chat.herokuapp.com/getchat', {params: query})
        .then(result => res.send(result.data))
        .catch(err => res.send(err)));

app.post('/user/update', ({body}, res) => userUpdate(body).then(result => res.send(result)).catch(err => res.status(500).json(err)));

function userUpdate(body) {
    return new Promise((resolve, reject) => {
        console.log('body', body)
        var user = body
        if (!user.id) res.status(500).json({err: 'no userID'})

        if(!user.createdAt) user.createdAt = Date.now()
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
app.get('/user/update/all', ({body}, res) => userUpdateAll().then(result => res.send(result)).catch(err => res.status(500).json(err)));

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


var listener = app.listen(port, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
app.get('/pay', (req, res) => {
    axios.post('https://api.pay.truemoney.com.vn/bank-charging', {
        access_key: 'clbgp35br12gb6j3oq6h',
        amount: 1000000,
        command: "request_transaction",
        order_id: 'test_50',
        order_info: 'test order description',
        return_url: 'https://app.botform.asia/success',
        signature: 'test_signature'
    }).then(result => res.send(result))
        .catch(err => res.status(500).json(err))

})