// Casual test. Might add actual mocha tests later.
const Pipette = require('../pipette');

const pipeName = 'pipette-test';
const pipe = Pipette.listen(pipeName);

pipe.on('stop', (evt, msg) => {
    console.log('**Received stop message. Exiting...');
    process.exit();
});

pipe.onAll((evt, msg) => {
    console.log(`Event: ${evt}, Message: ${msg}`);
});

console.log(`***Listening on pipe ${pipeName}***`);

Pipette.send(pipeName, 'foo bar');
Pipette.send(pipeName, 'stop');