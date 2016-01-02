/**
 * Created by shuding on 12/23/15.
 * <ds303077135@gmail.com>
 */

'use strict';

const mov = require('./core/main');

/*
mov.movieKeywords({
    movieName: '霸王别姬',
    wordCount: 10,
    dataSet: 20
}, freqDist => {
    "use strict";
    //console.log('K', freqDist);
}, freqDist => {
    "use strict";
    //console.log('Keywords: \n', freqDist);
});
*/

/*
mov.movieComments({
    movieName: '肖申克',
    wordCount: 10,
    dataSet: 20
}, freqDist => {
    "use strict";
    console.log('C', freqDist);
});
*/

let movies = ['机器人总动员',
              '盗梦空间',
              '阿凡达',
              '福尔摩斯先生',
              '肖申克的救赎',
              '教父',
              '教父2',
              '黄金三镖客',
              '低俗小说',
              '辛德勒的名单',
              '十二怒汉',
              '飞越疯人院',
              '黑暗骑士',
              '帝国反击战',
              '王者归来',
              '七武士',
              '新希望',
              '卡萨布兰卡',
              '盗亦有道',
              '搏击俱乐部',
              '上帝之城',
              '护戒使者',
              '后窗',
              '西部往事',
              '法柜奇兵',
              '玩具总动员3',
              '精神病患者',
              '非常嫌疑犯',
              '黑客帝国',
              '沉默的羔羊',
              '七宗罪',
              '记忆碎片',
              '风云人物',
              '双塔奇兵',
              '日落大道',
              '火星救援',
              '星际穿越',
              '超能陆战队',
              '疯狂的麦克斯',
              '彗星来的那一夜',
              '她',
              '黑客帝国',
              '终结者',
              '这个男人来自地球',
              '星际迷航',
              '源代码',
              '明日边缘',
              '星球大战',
              '月球',
              '人工智能',
              'X战警：逆转未来',
              '阿甘正传',
              '这个杀手不太',
              '公民凯恩',
              '现代启示录',
              '西北偏',
              '美国丽人',
              '美国X档案',
              '出租车司机',
              '审判日',
              '拯救大兵瑞恩',
              '迷魂记',
              '天使艾美丽',
              '异形',
              '阿拉伯的劳伦斯',
              '闪灵',
              '千与千寻',
              '光荣之路',
              '发条橙',
              '双重赔偿',
              '杀死一只知更鸟',
              '钢琴家',
              '窃听风暴',
              '无间行者',
              'M就是凶手',
              '城市之光',
              '美丽心灵的永恒阳光',
              '梦之安魂曲',
              '从海底出击',
              '第三个人',
              '机械姬',
              '八恶人',
              '万物理论',
              '云中行走',
              '史蒂夫',
              '星运里的错',
              '维多利亚'];

movies = ['天使爱美丽'];

movies.forEach(name => {
    mov.movieKeywords({
        movieName: name,
        wordCount: 10,
        dataSet: 20
    }, freqDist => {
        "use strict";
        console.log('C', freqDist);
    });
});
