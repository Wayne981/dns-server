const dgram = require('node:dgram');
const dnsPacket = require('dns-packet')

const server = dgram.createSocket('udp4')

const db = {
    'piyushgarg.dev': {
        type: 'A',
        data: '1.2.3.4',
    },
    'blog.piyushgarg.dev': {
        type: 'CNAME',
        data: 'hashnode.network'
    }
};


server.on('message', (msg, rinfo) => {
    const incomingReq = dnsPacket.decode(msg);
    const ipFromDb = db[incomingReq.questions[0].name];

    const answer = {
        type: ipFromDb.type, 
        class: 'IN',
        name: incomingReq.questions[0].name,
        ttl: 300,
        data: ipFromDb.data
    };

    const response = dnsPacket.encode({
        type: 'response',
        id: incomingReq.id,
        flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
        questions: incomingReq.questions,
        answers: [answer]
    });

    server.send(response, rinfo.port, rinfo.address);
});

server.bind(53, () => console.log('DNS server is running on port 53 '));

