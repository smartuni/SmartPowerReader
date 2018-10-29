const express = require('express')
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/sensors/:sensorId', (req, res) => {
    console.log('Incoming request...');
    const payload = {
        action: req.query.action,
        id: req.params.sensorId,
        from: parseInt(req.query.from),
        to: parseInt(req.query.to),
        count: parseInt(req.query.count)
    };

    dispatch(payload,(data)=>{
        res.end(data);
    })

});

function dispatch(payload, cb){
    const socket = require('net').Socket();
    socket.connect(9901, '0.0.0.0', () => {
        console.log('connect');
        socket.write(JSON.stringify(payload));
        let result = "";
        socket.on('data', (data) => {
            result+=data.toString();
        });
        socket.on('error', function (error) {
            result+=error.toString();
        });
        socket.on('end', function () {
            // console.log(result);
            if (cb) cb(result);
        })
    });
}

app.listen(3000, () => {
    console.log("Gateway is listening on port 3000");
});