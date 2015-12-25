/**
 * Created by shuding on 12/24/15.
 * <ds303077135@gmail.com>
 */

'use strict';

const fs = require('fs');

const jieba = require('nodejieba');
const natural = require('natural');

let classifierType = natural.LogisticRegressionClassifier;

let classifier;
let classifierExtra;

if (fs.existsSync(__dirname + '/classifier.json')) {
    let str = fs.readFileSync(__dirname + '/classifier.json');
    try {
        classifier = classifierType.restore(JSON.parse(str));
        classifierExtra = JSON.parse(fs.readFileSync(__dirname + '/classifier.extra.json'));
    } catch (err) {
        classifier = new classifierType();
        classifierExtra = {};
    }
} else {
    classifier = new classifierType();
    classifierExtra = {};
}

// Save classifier before exit
process.on('exit', () => {
    fs.writeFileSync(__dirname + '/classifier.json', JSON.stringify(classifier));
    fs.writeFileSync(__dirname + '/classifier.extra.json', JSON.stringify(classifierExtra));
    process.exit();
});

//============================================ EXPORTS

let fn = {
    tag,
    tags,
    keywords,
    sentencesFromParagraph,
    sentencesWithWordFromParagraph,
    trainClassifier,
    getClassifications
};

module.exports = fn;

//============================================ APIs

function tag(word) {
    return jieba.tag(word)[0].split(':')[1];
}

function tags(sen) {
    return jieba.tag(sen);
}

function keywords(sen, count = 10) {
    return jieba.extract(sen, count);
}

function sentencesFromParagraph(par) {
    return par.split(/[,;.，。]/).filter(sen => sen.length);
}

function sentencesWithWordFromParagraph(par, word) {
    return sentencesFromParagraph(par).filter(sen => sen.indexOf(word) !== -1);
}

function trainClassifier(features, genres, details) {
    if (!classifierExtra[details.id] && genres.length) {
        genres.forEach(genre => {
            if (['恐怖',
                 '西部',
                 '传记',
                 '动画',
                 '喜剧',
                 '历史',
                 '战争',
                 '爱情',
                 '科幻',
                 '悬疑',
                 '动作',
                 '剧情',
                 '犯罪'].indexOf(genre) !== -1)
                classifier.addDocument(features, genre);
        });
        classifier.train();
        classifierExtra[details.id] = details.title;
    }
}

function getClassifications(features) {
    return classifier.getClassifications(features);
}
