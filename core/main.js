/**
 * Created by shuding on 12/24/15.
 * <ds303077135@gmail.com>
 */

'use strict';

const fs = require('fs');
const path = require('path');

const api   = require('./api');
const basic = require('./basic');

const movieDict = ('' + fs.readFileSync(path.join(__dirname, 'movie.dict.utf8'))).split('\n');

let fn = {
    movieKeywords,
    movieComments
};

module.exports = fn;

/**
 * Get keywords from reviews
 *  options:
 *      movieName: name of the movie
 *      wordCount: number of keywords
 *      dataSet: number of review data
 * @param options
 * @param callback
 * @param final
 */
function movieKeywords(options, callback, final) {
    "use strict";

    let freq = {};
    let count = 0;

    api._getMovieIdFromName(options.movieName).then(api._getMovieReviewsListFromId).then(reviews => {
        count = reviews.length;
        reviews.forEach(review => {
            api._getMovieReviewContentById(review.id).then(content => {

                // Choose 5x keywords (IDF)
                let keywords = basic.keywords(content, Math.min(60, Math.max(options.wordCount, 30)));
                //let pts = Number(review.votes.split('/')[0]) || 1;

                keywords.forEach(wordScore => {
                    wordScore = wordScore.split(':');

                    // Check the tag
                    if (/x|eng|m|nr|z|r|d|a|v/.test(basic.tag(wordScore[0]))) {
                        return;
                    }

                    // Excluded words
                    if (movieDict.indexOf(wordScore[0]) !== -1) {
                        return;
                    }

                    if (!freq[wordScore[0]]) {
                        freq[wordScore[0]] = 1;
                    }
                    // By multiplying the score to sweep out the special word which only appears in one partial review
                    freq[wordScore[0]] += Math.log(parseFloat(wordScore[1]));// * pts;
                });

                let mostCommon = [];
                for (let w of Object.keys(freq)) {
                    mostCommon.push({ word: basic.tags(w)[0], freq: freq[w] });
                }
                mostCommon.sort((a, b) => b.freq - a.freq);
                let result = mostCommon.slice(0, options.wordCount);

                callback && callback(result);
                --count;
                if (count == 0) {
                    final && final(result);
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
    });
}

/*
function movieComments(options, callback) {
    "use strict";

    let freq = {};

    api._getMovieIdFromName(options.movieName).then(api._getMovieCommentsListFromId).then(comments => {
        comments.forEach(comment => {
            // Choose 5x keywords
            let keywords = basic.keywords(comment.comment, Math.min(60, Math.max(options.wordCount, 30)));
            //let pts = Number(review.votes.split('/')[0]) || 1;
            keywords.forEach(wordScore => {
                wordScore = wordScore.split(':');

                // Check the tag
                if (/x|eng|m|nr|z|r|d/.test(basic.tag(wordScore[0]))) {
                    return;
                }

                // Excluded words
                if (movieDict.indexOf(wordScore[0]) !== -1) {
                    return;
                }

                if (!freq[wordScore[0]]) {
                    freq[wordScore[0]] = 1;
                }
                // By multiplying the score to sweep out the special word which only appears in one partial review
                freq[wordScore[0]] += Math.log(parseFloat(wordScore[1]));// * pts;
            });
            let mostCommon = [];
            for (let w of Object.keys(freq)) {
                mostCommon.push({ word: basic.tags(w)[0], freq: freq[w] });
            }
            mostCommon.sort((a, b) => b.freq - a.freq );
            callback(mostCommon.slice(0, options.wordCount));
        });
    });
}
*/
