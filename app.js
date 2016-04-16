
var settings = require('./settings.js'),
    request = require('superagent'),
    fs = require('fs'),
    dateformat = require('dateformat'),
    CronJob = require('cron').CronJob;

new CronJob('*/5 * * * * *', getImg, null, true, 'America/Los_Angeles');

var prevImg = null,
    prevUsrImg = null;

function getImg () {
    var now = new Date();
    var timeStamp = dateformat(now, 'yyyy-mm-dd_HH:MM:ss');
    request
       .get(settings.API_URL)
       .query({ access_token: settings.API_KEY })
       .end(function(err, res){
            if(res && res.body&& res.body.data) {
                var crrImg = res.body.data[0].images.standard_resolution.url.replace('/s640x640','').replace('/sh0.08','').replace('/e35','').split('?')[0],
                    usrImg = res.body.data[0].user.profile_picture.replace('/s150x150', ''),
                    caption = res.body.data[0].caption ? res.body.data[0].caption.text : '';
                    time = res.body.data[0].created_time;
                if (err) console.log(err);

                if(crrImg !== prevImg){
                    request.get(crrImg).end(function (err, res) {
                        fs.writeFile('./images/'+crrImg.split('/').pop(), res.body, 'binary', function(err){
                            if (err) console.log(err);
                            console.log('File saved@'+timeStamp);
                            console.log(crrImg);
                            console.log('caption: '+caption);
                        });
                    });
                } else {
                   // console.log('not updated');
                }
                if(usrImg !== prevUsrImg) {
                    request.get(usrImg).end(function (err, res) {
                        fs.writeFile('./images/prof/'+usrImg.split('/').pop(), res.body, 'binary', function(err){
                            if (err) console.log(err);
                            console.log('Profile Picture Saved'+timeStamp);
                            console.log(usrImg);
                        });
                    });
                } 
                prevImg = crrImg;
                prevUsrImg = usrImg;
            } else {
                console.log(timeStamp);
                console.log(res);
                console.log(err);
            }
       });
}