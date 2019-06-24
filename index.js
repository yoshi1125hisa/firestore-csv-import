const admin = require("firebase-admin");

const serviceAccount = require("./railroadcrossing-1555889111567-firebase-adminsdk-4nx2c-cbfc49290f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://railroadcrossing-1555889111567.firebaseio.com"
});

const db = admin.firestore()
const fs = require('fs')
const csvSync = require('csv-parse/lib/sync')
const file = 'import.csv' //インポートしたいcsvファイルをindex.jsと同じ階層に入れてください
let data = fs.readFileSync(file) //csvファイルの読み込み
let responses = csvSync(data)//parse csv
let objects = [] //この配列の中にパースしたcsvの中身をkey-value形式で入れていく。

responses.forEach(function (response) {
  objects.push({
    branch: response[0],
    track_maintenance_area: response[1],
    track_maintenance_control_room: response[2],
    road_administrator: response[3],
    route: response[4],
    address: response[5],
    transportation_bureau: response[6],
    prefecture: response[7],
    railway: response[8],
    name: response[9],
    kana: response[10],
    latitude: response[11],
    longitude: response[12],
    kilometer: response[13],
    starting_station: response[14],
    ending_station: response[15],
    rc_type: response[16],
    rc_type_detail: response[17],
    lines: response[18]
  })
}, this)

objects.shift();//ヘッダもインポートされてしまうから、配列の一番最初のelementは削除します。

return db.runTransaction(function (transaction) {
  return transaction.get(db.collection('collectionName')).then(doc => {
    objects.forEach(function (object) {
      if (object["_id"] != "") {
        let id = object["_id"]
        delete object._id
        transaction.set(db.collection('collectionName').doc(id), object)
      } else {
        delete object._id
        transaction.set(db.collection('collectionName').doc(), object)
      }
    }, this)
  })
}).then(function () {
  console.log("success")
}).catch(function (error) {
  console.log('Failed', error)
})