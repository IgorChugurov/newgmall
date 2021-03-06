'use strict';
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var domain = require('domain');
var ObjectID = mongoose.Types.ObjectId;

exports.get = function(req, res, next) {
    //console.log(req.params);
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
        if (!req.params.id) return next();
        req.collection.load(req.params.id, function(e, result){
            if (e) return next(e)
            if (result){
                //console.log('send result')
                return res.send(result);
            } else {
                return res.sendStatus(404)
            }
        })
    })
}
exports.list = function(req, res, next) {
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        next(error)
    });
    d.run(function () {
       // console.log('req.query-',req.query)
        var page = (req.query['page'] > 0 ? req.query['page'] : 0);
        var perPage = (req.query.perPage && parseInt(req.query.perPage)>0)?parseInt(req.query.perPage):100;
        var options = {
            perPage: perPage,
            page: page,
            criteria:null
        }
        if (req.query.query && req.query.query!='{}') {
            try {
                options.criteria=JSON.parse(req.query.query);
            } catch (err) {
                //console.log(err)
                options.criteria=req.query.query;
            }
        }
        // у чата и уведомление метка это seller
        /*if(req.collectionName=='Dialog'){
            if(!req.query.store){
                return next(new Error('не указан магазин'))
            }else{
                if(options.criteria && typeof options.criteria==='object'){
                    var keys = Object.keys(options.criteria);
                    if(keys.length==0){
                        options.criteria={store:req.query.store};
                    }else if(keys.length==1){
                        if(keys[0]=='$and'){
                            options.criteria.$and.push({store:req.query.store});
                        }else{
                            options.criteria={$and:[{store:req.query.store},options.criteria]}
                        }
                    }else{
                        options.criteria={$and:[{store:req.query.store},options.criteria]}
                    }
                }else{
                    options.criteria={store:req.query.store};
                }
            }
        }
*/
        
        //console.log('options.criteria ',options.criteria)
        //console.log('req.collectionName ',req.collectionName)
        req.collection.list(options,function(e, results){
            if (e) return next(e)
            if (page==0){
                req.collection.count(options.criteria).exec(function (err, count) {
                    if (results.length>0){
                        results.unshift({'index':count});
                    }
                    return res.json(results)
                })
            } else {
                return res.json(results)
            }
        })

    })
}
exports.save = function(req, res, next) {
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
        Promise.resolve()
            .then(function () {
                return new Promise(function(resolve,reject){
                    if (req.collection.preUpdate && typeof req.collection.preUpdate === 'function'){
                        req.collection.preUpdate(req,function(err,res){
                            if (err) return reject(err);
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                })
            })
            .then(function () {
                var stuff,upsertData;
                //console.log(req.body)
                stuff = new req.collection(req.body);
                //console.log('stuff ',stuff)
                upsertData = stuff.toObject();
                //console.log('ldlldld!')
                delete upsertData._id;
                /*if(!upsertData.store){
                 upsertData.store=req.store._id;
                 }*/
                //console.log('ldlldld!')
                //console.log('upsertData-',upsertData);
                req.collection.update({_id: stuff.id}, upsertData, {upsert: true}, function (err,result) {
                    if (err) return  next(err)
                    //если комментарий то вставляем ссылку на id thread parent-а
                    if (req.collection.postUpdate && typeof req.collection.postUpdate === 'function'){
                        req.collection.postUpdate(stuff);
                    }
                    //console.log(stuff)
                    var o={id:stuff.id};
                    if(stuff.date){o.date=stuff.date};
                    if(stuff._id){o._Id=stuff._Id};
                    res.json(o);
                })
            })
            .catch(function(err){
                next(err)
            })
    })
}
exports.update = function(req, res, next) {
    //console.log(req.body)
    var arr = req.query.update.split(' ');
    var newVal ={};
    for (var i= 0,l=arr.length;i<l;i++){
        if (req.body[arr[i]]!='undefined'){
            if(arr[i]=='name'){
                if (!req.body[arr[i]]){
                    var error = new Error('название не может быть пустым')
                    return next(error)
                }
                req.body[arr[i]]=req.body[arr[i]].substring(0,100);
            }
            if(arr[i]=='desc'){
                req.body[arr[i]]=req.body[arr[i]].substring(0,2000);
            }
            newVal[arr[i]]= req.body[arr[i]];
        } else {console.log('нет - ',arr[i])}
    }
    req.collection.update({_id:{$in:req.body._id}},{$set:newVal},{ multi: true }, function (err,result) {
        if (err) return next(err)
        res.json({id:req.body._id});
    });
}
exports.delete = function(req, res, next) {
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {

        req.collection.findById(req.params.id,function(err,result){
            function deleteItem(){
                try {
                    var id = new ObjectID(req.params.id);
                } catch (err) {
                    var error = new Error('не верный id')
                    return next(id)
                }
                req.collection.remove({_id: id}, function(e, resultDelete){
                    //console.log('!!!!',e,resultDelete)
                    if (e) return next(e)

                    if (req.collection.postDelete && typeof req.collection.postDelete === 'function'){
                        req.collection.postDelete(result,req);
                    }
                    //console.log('ggvv')
                    res.json( {msg:'success'})
                })
            }
            if (err) return next(err)
            if (req.collection.preDelete && typeof req.collection.preDelete === 'function'){
                req.collection.preDelete(req,result,function(err){
                    if (err) return next(err);
                    deleteItem();
                });
            } else {
                deleteItem();
            }









        });

    })

}
exports.deleteArray = function(req, res, next) {

    if (!req.query){res.json( {msg:'нечего удалить'})}
    var arr=[];
    for(var i in req.query){
        arr.push(req.query[i]);
    }
    var d = domain.create();
    d.on('error', function(error) {
        error.collectionName=req.collectionName;
        return next(error)
    });
    d.run(function () {
        console.log(arr);
        arr=arr.map(function(id){
            try {
                id = new ObjectID(id);
            } catch (err) {
                console.log('err-',err)
                id=id;
            }
            return id;
        })
        req.collection.remove({_id: {$in: arr}},function(err,result){
            console.log(err)
            if (err) return next(err);
            if (req.collection.postDelete && typeof req.collection.postDelete === 'function'){
                req.collection.postDelete(result,req);
            }
            res.json( {msg:'success'})
        });

    })

}