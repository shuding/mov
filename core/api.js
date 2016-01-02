/**
 * Created by shuding on 12/23/15.
 * <ds303077135@gmail.com>
 */

'use strict';

const Q       = require('Q');
const level   = require('level');
const jsdom   = require('jsdom');
const request = require('request');

let db = level('./db');

//============================================ EXPORTS

let fn = {
    getIdFromUrl,
    getMovieIdFromName,
    getMovieDetailsFromId,
    getMovieCommentsListFromId,
    getMovieReviewsListFromId,
    getMovieReviewContentById
};

let ex = {};

for (let f in fn) {
    if (fn.hasOwnProperty(f)) {
        ex[f] = fn[f];
        // Functions start with a underscore will cache this request into DB
        ex['_' + f] = (f => (...a) => __(f, fn[f], ...a))(f);
    }
}

module.exports = ex;

//============================================ UTILS

// Wrapped request
function _$(api, def, callback) {
    request(api, (err, res, body) => {
        if (err || res.statusCode != 200) {
            def.reject(err || res.statusCode);
        } else {
            callback(body);
        }
    });
}

// Wrapped DB
function __(name, fn, ...args) {
    // The defer
    let def = Q.defer();
    let key = name + ':' + args.join(',');
    db.get(key, (err, value) => {
        if (err) {
            // Not cached
            fn(...args).then(val => {
                // Save val into DB
                def.resolve(val);
                db.put(key, JSON.stringify(val));
            });
        } else {
            def.resolve(JSON.parse(value));
        }
    });

    return def.promise;
}

//============================================ APIs

function getIdFromUrl(url) {
    return url.match(/subject\/(\d+)/)[1];
}

function getMovieIdFromName(name) {
    let api = `http://movie.douban.com/j/subject_suggest?q=${encodeURIComponent(name)}`;
    let def = Q.defer();

    _$(api, def, body => {
        let suggest = JSON.parse(body)[0];
        if (typeof suggest === 'undefined') {
            def.reject(new Error('Movie ' + name + ' not found.'));
        } else {
            let id = getIdFromUrl(suggest.url);
            def.resolve(id);
        }
    });

    return def.promise;
}

function getMovieDetailsFromId(id) {
    let api = `http://api.douban.com/v2/movie/subject/${id}`;
    let def = Q.defer();

    _$(api, def, body => {
        let details = JSON.parse(body);
        def.resolve(details);
    });

    return def.promise;
}

function getMovieCommentsListFromId(id, offset = 0) {
    let api = `http://movie.douban.com/subject/${id}/comments?start=${offset}&limit=20&sort=new_score`;
    let def = Q.defer();

    jsdom.env({
        url:  api,
        done: (err, window) => {
            let comments = [];
            [].forEach.call(window.document.getElementsByClassName('comment'), (el) => {
                let ratingEl = el.getElementsByClassName('rating')[0];
                comments.push({
                    votes:   Number(el.getElementsByClassName('votes')[0].innerHTML),
                    rating:  ratingEl ? Number(ratingEl.className.match(/allstar(\d+)/)[1]) : -1,
                    comment: ('' + el.getElementsByTagName('p')[0].textContent).trim()
                });
            });
            def.resolve(comments);
        }
    });

    return def.promise;
}

function getMovieReviewsListFromId(id, offset = 0) {
    let api = `http://movie.douban.com/subject/${id}/reviews?start=${offset}&limit=20&filter=`;
    let def = Q.defer();

    jsdom.env({
        url:  api,
        done: (err, window) => {
            let reviews = [];
            [].forEach.call(window.document.getElementsByClassName('review'), (el) => {
                let ratingMatch = el.getElementsByClassName('review-hd-info')[0].innerHTML.match(/allstar(\d+)/);
                reviews.push({
                    votes:  el.getElementsByClassName('review-short-ft')[0].innerHTML.match(/\>(\d+\/\d+)\</)[1],
                    rating: ratingMatch ? Number(ratingMatch[1]) : -1,
                    id:     el.getElementsByClassName('review-hd-expand')[0].id.match(/-(\d+)/)[1]
                });
            });
            def.resolve(reviews);
        }
    });

    return def.promise;
}

function getMovieReviewContentById(id) {
    let api = `http://movie.douban.com/review/${id}`;
    let def = Q.defer();

    jsdom.env({
        url:  api,
        done: (err, window) => {
            def.resolve(window.document.getElementById('link-report').textContent.trim());
        }
    });

    return def.promise;
}
