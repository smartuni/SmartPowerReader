const express = require('express');
var path = require('path');

const app = express();
const bodyParser = require('body-parser');
const http = require('http');


const serverUrl = '192.168.1.236';
const port = 9901;


app.use(express.static(path.join(__dirname, 'dist/Frontend'), {
    etag: false,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.get('/sensors/:sensorId', (req, res) => {
    console.log('getSensorData...');
    const payload = {
        action: req.query.action,
        id: req.query.id,
        from: parseInt(req.query.from),
        to: parseInt(req.query.to),
        count: parseInt(req.query.count)
    };
    dispatch(payload, (data) => {
        res.end(data);
    })

});

app.get('/sensors', (req, res) => {
    console.log('Get all sensors');
    const payload = {
        action: req.query.action,
    };
    console.log('payload', payload);
    dispatch(payload, (data) => {
        res.end(data);
    })

});

app.put('/sensors', (req, res) => {
    console.log('update sensors');
    const payload = {
        action: req.query.action,
        id: req.body.id,
        name: req.body.name,
    };
    if (req.body.hasOwnProperty('data')) {
        payload['data'] = {};
        Object.keys(req.body.data).forEach(key => {
            if (key === 'PWR_PERIOD') {
                payload['data'][key] = parseInt(req.body.data[key]);
            } else {
                payload['data'][key] = req.body.data[key];
            }
        })
    }

    dispatch(payload, (data) => {
        res.end(data);
    })

});

function dispatch(payload, cb) {
    const socket = require('net').Socket();
    socket.connect(port, serverUrl, () => {
        console.log('connect');
        socket.write(JSON.stringify(payload) + '\n');
        let result = "";
        socket.on('data', (data) => {
            result += data.toString();
        });
        socket.on('error', (error) => {
            result += error.toString();
        });
        socket.on('end', () => {
            if (cb) {
                cb(result);
            }
        }, error => console.log('error dispatch', error))

    });
}

const server = http.createServer(app);
server.on('error', function (e) {
    console.log('error found', e);

});
server.listen(3000, '0.0.0.0', null, () => {
    console.log('Gateway is listening on port 3000');

});


