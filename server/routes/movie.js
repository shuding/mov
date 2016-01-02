const mov = require('../../core/main');

var express = require('express');
var router  = express.Router();

/* GET users listing. */

router.get('/:name', (req, res) => {
    "use strict";
    let name = req.param('name');

    res.render('keywords', { title: name });
});

router.get('/api/:name', (req, res) => {
    "use strict";
    let name = req.param('name');

    mov.movieKeywords({
        movieName: name,
        wordCount: 10,
        dataSet: 20
    }, freqDist => {
        "use strict";
        let jsonData = {
            name,
            children: []
        };
        for (let k of freqDist) {
            jsonData.children.push({
                name: k.word,
                size: k.freq
            });
        }
        res.send(jsonData);
    });
});

module.exports = router;
