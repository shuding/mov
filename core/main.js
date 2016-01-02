/**
 * Created by shuding on 12/24/15.
 * <ds303077135@gmail.com>
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const Q    = require('q');

const api   = require('./api');
const basic = require('./basic');

const movieDict = ('' + fs.readFileSync(path.join(__dirname, 'movie.dict.utf8'))).split('\n');
const stopWords = ('' + fs.readFileSync(path.join(__dirname, 'stopwords.utf8'))).split('\n');

const TRAIN_FLAG = false;

//============================================ EXPORTS

let fn = {
    movieKeywords
};

module.exports = fn;

//============================================ PRIVATE METHODS

function __freqDistFromContent(str, count) {
    let freq = {};

    // Choose 5x keywords (TF-IDF)
    basic.keywords(str, count).forEach(wordScore => {
        wordScore = wordScore.split(':');

        // Check tags
        if (/eng|x|nr|ns|m|f/.test(basic.tag(wordScore[0]))) {
            return;
        }

        // Excluded words
        if (movieDict.indexOf(wordScore[0]) !== -1) {
            return;
        }

        // Stop words
        if (stopWords.indexOf(wordScore[0]) !== -1) {
            return;
        }

        if (!freq[wordScore[0]]) {
            freq[wordScore[0]] = 0;
        }

        // By multiplying the score to sweep out the special word which only appears in one partial review
        freq[wordScore[0]] += Math.log(parseFloat(wordScore[1]));// * pts;
    });

    return freq;
}

/**
 * Get keywords from reviews
 *  options:
 *      movieName: name of the movie
 *      wordCount: number of keywords
 *      dataSet: number of review data
 * @param options
 * @param callback
 */
function movieKeywords(options, callback) {
    "use strict";

    let freq  = {};

    api._getMovieIdFromName(options.movieName).then(api._getMovieReviewsListFromId).then(reviews => {
        Q.all(reviews.map(review => api._getMovieReviewContentById(review.id))).done(values => {
            values.forEach(content => {
                let __freq = __freqDistFromContent(content, Math.min(60, Math.max(options.wordCount, 30)));
                for (let w of Object.keys(__freq)) {
                    freq[w] = (freq[w] || 0) + __freq[w];
                }
            });

            let mostCommon = [];
            for (let w of Object.keys(freq)) {
                mostCommon.push({
                    word: basic.tags(w)[0],
                    freq: freq[w]
                });
            }
            mostCommon.sort((a, b) => b.freq - a.freq);
            let result = mostCommon.slice(0, options.wordCount);

            callback && callback(result);

            if (TRAIN_FLAG) {
                let features = result.map(word => word.word.split(':')[0]);
                api._getMovieIdFromName(options.movieName).then(api._getMovieDetailsFromId).then(details => {
                    details.casts.forEach(actor => {
                        features.push(actor.name);
                    });

                    // DEBUG
                    try {
                        console.log("Test classify: " + details.title + '\n', basic.getClassifications(features));
                    } catch (err) {
                        console.log(err);
                    }
                    // END DEBUG

                    basic.trainClassifier(features, details.genres, details);
                });
            }
        });
    });
}
