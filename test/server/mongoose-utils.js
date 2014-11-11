var expect = require('chai').expect,
    mongoose = require('../../lib/utils/mongoose-utils');

describe('mongoose.collections.mergeOptions', function () {
    it('should return merged object with good property 1', function () {

        var settings = {
            sort:{
                'dateCreate':'asc'
            },

            options:{
                sortOrder:  'desc',
                sortField:  'label',
                limit:      10,
                skip:       0
            }
        };

        mongoose.collections.mergeOptions(settings);

        expect(settings).to.have.deep.property('sort.label', 'desc');
        expect(settings).to.have.deep.property('limit', 10);
        expect(settings).to.have.deep.property('skip', 0);
    });

    it('should return merged object with good property 2', function () {

        var settings = {
            sort:{
                'dateCreate':'asc'
            },

            options:    null
        };

        mongoose.collections.mergeOptions(settings);

        expect(settings).to.have.deep.property('sort.dateCreate', 'asc');
        expect(settings.limit).to.be.undefined;
        expect(settings.skip).to.be.undefined;
    });
});

describe('mongoose.extend', function () {
    it('should return an extended object', function () {

        expect(mongoose.extend({}, {attr:'test'})).to.have.deep.property('attr', 'test');

    });
});

describe('mongoose.createModel', function () {
    it('should return an extended object', function () {

        var obj = mongoose.createModel('Test', {test:String, default:''},  {save:function(){}});

        expect(new obj({test:'tur'})).to.have.deep.property('test');
        expect(obj).itself.to.respondTo('save');
        expect(obj).itself.to.respondTo('find');

    });
});

describe('mongoose.collections', function () {

    it('should manipulate data in mongoDB', function (done) {

        var obj = mongoose.createModel('Test2', {test:String});
        var promise = mongoose.collections.save(obj, {'test': 'test OK'});
        var id = '';

        expect(promise).to.be.an.instanceof(require('promise'));

        promise
            .then(function(o){

                expect(o).to.be.ok;

                o.test = 'update OK';

                return mongoose.collections.update(obj, o);
            })

            .then(function(o){

                expect(o).to.have.deep.property('test', 'update OK');

                id = o._id;

                return mongoose.collections.list(obj, {});
            })

            .then(function(a){
                expect(a).to.be.an.instanceof(Array);

                return mongoose.collections.remove(obj, {_id:id});
            })

            .then(function(o){
                expect(o).to.be.ok;

                done();
            })

            .catch(function(er){
                expect(er).to.not.be.ok;

                done();
            });
    });

});