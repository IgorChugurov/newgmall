﻿var globalVar=require('../../public/scripts/globalVariable.js')

'use strict';
//https://gist.github.com/sgmurphy/3095196
/**
 * Create a web friendly URL slug from a string.
 *
 * Requires XRegExp (http://xregexp.com) with unicode add-ons for UTF-8 support.
 *
 * Although supported, transliteration is discouraged because
 *     1) most web browsers support UTF-8 characters in URLs
 *     2) transliteration causes a loss of information
 *
 * @author Sean Murphy <sean@iamseanmurphy.com>
 * @copyright Copyright 2012 Sean Murphy. All rights reserved.
 * @license http://creativecommons.org/publicdomain/zero/1.0/
 *
 * @param string s
 * @param object opt
 * @return string
 */
function timeoutPromise(i) {
    return new Promise(function (res,rej) {
        setTimeout(function () {
            console.log('from f ',i)
            res();
        },2000)
    })
}

function url_slug(s, opt) {
    if(!s)return'';
    s = String(s);
    opt = Object(opt);

    var defaults = {
        'delimiter': '-',
        'limit': undefined,
        'lowercase': true,
        'replacements': {},
        'transliterate': (typeof(XRegExp) === 'undefined') ? true : false
    };

    // Merge options
    for (var k in defaults) {
        if (!opt.hasOwnProperty(k)) {
            opt[k] = defaults[k];
        }
    }

    var char_map = {
        // Latin
        'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç': 'C',
        'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I',
        'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ő': 'O',
        'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ű': 'U', 'Ý': 'Y', 'Þ': 'TH',
        'ß': 'ss',
        'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c',
        'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
        'ð': 'd', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ő': 'o',
        'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th',
        'ÿ': 'y',

        // Latin symbols
        '©': '(c)',

        // Greek
        'Α': 'A', 'Β': 'B', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'H', 'Θ': '8',
        'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': '3', 'Ο': 'O', 'Π': 'P',
        'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'X', 'Ψ': 'PS', 'Ω': 'W',
        'Ά': 'A', 'Έ': 'E', 'Ί': 'I', 'Ό': 'O', 'Ύ': 'Y', 'Ή': 'H', 'Ώ': 'W', 'Ϊ': 'I',
        'Ϋ': 'Y',
        'α': 'a', 'β': 'b', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'h', 'θ': '8',
        'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': '3', 'ο': 'o', 'π': 'p',
        'ρ': 'r', 'σ': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'x', 'ψ': 'ps', 'ω': 'w',
        'ά': 'a', 'έ': 'e', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ή': 'h', 'ώ': 'w', 'ς': 's',
        'ϊ': 'i', 'ΰ': 'y', 'ϋ': 'y', 'ΐ': 'i',

        // Turkish
        'Ş': 'S', 'İ': 'I', 'Ç': 'C', 'Ü': 'U', 'Ö': 'O', 'Ğ': 'G',
        'ş': 's', 'ı': 'i', 'ç': 'c', 'ü': 'u', 'ö': 'o', 'ğ': 'g',

        // Russian
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
        'З': 'Z', 'И': 'I', 'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
        'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C',
        'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sh', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
        'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
        'ч': 'ch', 'ш': 'sh', 'щ': 'sh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya',

        // Ukrainian
        'Є': 'Ye', 'І': 'I', 'Ї': 'Yi', 'Ґ': 'G',
        'є': 'ye', 'і': 'i', 'ї': 'yi', 'ґ': 'g',

        // Czech
        'Č': 'C', 'Ď': 'D', 'Ě': 'E', 'Ň': 'N', 'Ř': 'R', 'Š': 'S', 'Ť': 'T', 'Ů': 'U',
        'Ž': 'Z',
        'č': 'c', 'ď': 'd', 'ě': 'e', 'ň': 'n', 'ř': 'r', 'š': 's', 'ť': 't', 'ů': 'u',
        'ž': 'z',

        // Polish
        'Ą': 'A', 'Ć': 'C', 'Ę': 'e', 'Ł': 'L', 'Ń': 'N', 'Ó': 'o', 'Ś': 'S', 'Ź': 'Z',
        'Ż': 'Z',
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z',
        'ż': 'z',

        // Latvian
        'Ā': 'A', 'Č': 'C', 'Ē': 'E', 'Ģ': 'G', 'Ī': 'i', 'Ķ': 'k', 'Ļ': 'L', 'Ņ': 'N',
        'Š': 'S', 'Ū': 'u', 'Ž': 'Z',
        'ā': 'a', 'č': 'c', 'ē': 'e', 'ģ': 'g', 'ī': 'i', 'ķ': 'k', 'ļ': 'l', 'ņ': 'n',
        'š': 's', 'ū': 'u', 'ž': 'z',
        // addition symbols
        /*'.':'-',
        ',':'-'*/
    };

    // Make custom replacements
    for (var k in opt.replacements) {
        s = s.replace(RegExp(k, 'g'), opt.replacements[k]);
    }

    // Transliterate characters to ASCII
    if (opt.transliterate) {
        for (var k in char_map) {
            s = s.replace(RegExp(k, 'g'), char_map[k]);
        }
    }

    // Replace non-alphanumeric characters with our delimiter
    var alnum = (typeof(XRegExp) === 'undefined') ? RegExp('[^a-z0-9]+', 'ig') : XRegExp('[^\\p{L}\\p{N}]+', 'ig');
    s = s.replace(alnum, opt.delimiter);

    // Remove duplicate delimiters
    s = s.replace(RegExp('[' + opt.delimiter + ']{2,}', 'g'), opt.delimiter);

    // Truncate slug to max. characters
    s = s.substring(0, opt.limit);

    // Remove delimiter from ends
    s = s.replace(RegExp('(^' + opt.delimiter + '|' + opt.delimiter + '$)', 'g'), '');

    return opt.lowercase ? s.toLowerCase() : s;
}
function shuffle(len) {
    var string=
        'abcdefghijklmnopqrstuvwxyzQAZWSXEDCRFVTGBYHNUJMIKOLP1234567890';
    var parts = string.split('');
    for (var i = parts.length; i > 0;) {
        var random = parseInt(Math.random() * i);
        var temp = parts[--i];
        parts[i] = parts[random];
        parts[random] = temp;
    }
    return parts.join('').substring(0,len);
}

function* getUrl(Collection,store,name,collectionName){
    if(collectionName=='Group' && globalVar.reservedFirstParams.indexOf(name)>-1){
        name+='add'
    }
    var url=url_slug(name.substring(0,100))
    let query= getQuery(url,store);





    let result=yield Collection.findOne(query);
    if(!result){
        return url;
    }
    url+=shuffle(2);
    query = getQuery(url,store);
    //console.log(url,query)
    result=yield Collection.findOne(query);
    if(!result){
        return url;
    }
    url+=shuffle(2);
    query = getQuery(url,store);
    //console.log(url,query)
    result=yield Collection.findOne(query);
    if(!result){
        return url;
    }
    url+=shuffle(2);
    query = getQuery(url,store);
    //console.log(url,query)
    result=yield Collection.findOne(query);
    if(!result){
        return url;
    }
    let error = new Error('не возможно подоброть URL. попробуйте сменть имя!');
    throw error;
    return;

    //***********************************
    function getQuery(url,store){
        return {$and:[{url:url},{store:store}]};
    }
}
async function getUrlAsync(Collection,store,name,collectionName){
    if(collectionName=='Group' && globalVar.reservedFirstParams.indexOf(name)>-1){
        name+='add'
    }
    let uniq;
    let url=url_slug(name.substring(0,100))
    while (!uniq) {

        let query= {url:url,store:store};
        //console.log('query',query)
        let result=await Collection.findOne(query).exec();
        //console.log(2)
        if(!result){
            uniq=true;
            //console.log('exit')
            return url;
        }
        //console.log('more 3')
        url+=shuffle(2);
    }
}
function getUrl1(Collection,store,name){
    var url=url_slug(name.substring(0,100))
    function getQuery(){
        return {$and:[{url:url},{store:store}]};
    }
    return new Promise(function(resolve, reject){
        Promise.resolve(getQuery())
            .then(function(query){
                return new Promise(function(resolvei,rejecti){
                    Collection.findOne(query,function(error,result){
                        console.log(query,result)
                        if (result){
                            url+=shuffle(2);
                            query = getQuery();
                            console.log(url,query)
                            resolvei(query);

                        }else{
                            resolvei(null);
                        }
                    })
                })
            })
            .then(function(query){
                return new Promise(function(resolvei,rejecti){
                    //console.log('2-',query)
                    if (query){
                        Collection.findOne(query,function(error,result){
                            console.log('result 2-',result)
                            if (result){
                                url+=shuffle(3);
                                resolvei(getQuery());
                            }else{
                                resolvei(null);
                            }
                        })
                    }else{
                        resolvei(null)
                    }
                })
            })
            .then(function(query){
                return new Promise(function(resolvei,rejecti){
                    //console.log('3-',query)
                    if (query){
                        Collection.findOne(query,function(error,result){
                            console.log('result 3-',result)
                            if (result){
                                url+=shuffle(4);
                                resolvei(getQuery());
                            }else{
                                resolvei(null);
                            }
                        })
                    }else{
                        resolvei(null)
                    }
                })
            })
            .then(function(query){
                return new Promise(function(resolvei,rejecti){
                    //console.log('4-',query)
                    if (query){
                        Collection.findOne(query,function(error,result){
                            //console.log('result 4-',result)
                            if (result){
                                var err= new Error('Страница с таким названием уже существует!');
                                reject(err);
                            }else{
                                resolve(url)
                            }
                        })
                    }else{
                        resolve(url)
                    }
                })
            })
    })
}
exports.create=getUrl;
exports.createAsync=getUrlAsync;
exports.url_slug=url_slug;
